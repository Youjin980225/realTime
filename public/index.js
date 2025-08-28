import Player from './Player.js';
import Ground from './Ground.js';
import CactiController from './CactiController.js';
import Score from './Score.js';
import ItemController from './ItemController.js';
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js'; // 소켓 라이브러리 추가

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;

// 게임 크기
const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;

// 플레이어

const PLAYER_WIDTH = 88 / 1.5; // 58
const PLAYER_HEIGHT = 94 / 1.5; // 62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;

// 땅

const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_SPEED = 0.5;

// 선인장

const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: 'images/cactus_1.png' },
  { width: 98 / 1.5, height: 100 / 1.5, image: 'images/cactus_2.png' },
  { width: 68 / 1.5, height: 70 / 1.5, image: 'images/cactus_3.png' },
];

// 아이템

const ITEM_CONFIG = [
  { width: 50 / 1.5, height: 50 / 1.5, id: 1, image: 'images/items/pokeball_red.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 2, image: 'images/items/pokeball_yellow.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 3, image: 'images/items/pokeball_purple.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 4, image: 'images/items/pokeball_cyan.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 5, image: 'images/items/pokeball_pink.png' },
  { width: 50 / 1.5, height: 50 / 1.5, id: 6, image: 'images/items/pokeball_orange.png' },
];

// 게임 요소들

let player = null;
let ground = null;
let cactiController = null;
let itemController = null;
let score = null;
let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameover = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;
let socket = null; // 소켓 인스턴스를 저장할 변수 추가

// 서버 연결
function initSocket() {
  socket = io('http://localhost:3000', {
    auth: { token: 'my-token' },
  });
  console.log('클라이언트 소켓 연결 시도...');
  socket.on('connect', () => {
    console.log('클라이언트 소켓 연결 성공!');
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 소켓 연결 해제');
  });
}

initSocket();

function createSprites() {
  // 비율에 맞는 크기
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;
  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio,
  );

  ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_SPEED, scaleRatio);

  const cactiImages = CACTI_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_SPEED);

  const itemImages = ITEM_CONFIG.map((item) => {
    const image = new Image();
    image.src = item.image;
    return {
      image,
      id: item.id,
      width: item.width * scaleRatio,
      height: item.height * scaleRatio,
    };
  });

  itemController = new ItemController(ctx, itemImages, scaleRatio, GROUND_SPEED); // Score 클래스에 소켓 인스턴스(socket)를 전달합니다.
  score = new Score(ctx, scaleRatio, socket); // score 객체가 생성된 후 소켓 리스너를 등록합니다.
  socket.on('response', (data) => {
    // 서버 응답이 도착했는지 확인하기 위한 로그
    console.log('서버로부터 응답 받음:', data);
    if (data.newScore) {
      score.updateScore(data.newScore); // 점수 업데이트 성공 로그
      console.log('점수 업데이트 성공! 새로운 점수:', data.newScore);
    }
  });
}

function getScaleRatio() {
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
  const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

async function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio; // 이미지 로딩을 위한 Promise.all
  const imagePromises = [
    ...CACTI_CONFIG.map(
      (config) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(`Failed to load ${config.image}`);
          img.src = config.image;
        }),
    ),

    ...ITEM_CONFIG.map(
      (config) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(`Failed to load ${config.image}`);
          img.src = config.image;
        }),
    ),
  ];

  try {
    await Promise.all(imagePromises);
    createSprites();
  } catch (error) {
    console.error(error);
  }
}

setScreen();
window.addEventListener('resize', setScreen);
if (screen.orientation) {
  screen.orientation.addEventListener('change', setScreen);
}
function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText('GAME OVER', x, y);
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = 'grey';
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText('Tap Screen or Press Space To Start', x, y);
}

function updateGameSpeed(deltaTime) {
  gameSpeed += deltaTime * GAME_SPEED_INCREMENT;
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameover = false;
  waitingToStart = false;
  ground.reset();
  if (cactiController) cactiController.reset();
  if (score) score.reset();
  if (itemController) itemController.reset();
  gameSpeed = GAME_SPEED_START;
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;
    setTimeout(() => {
      window.addEventListener('keyup', reset, { once: true });
    }, 1000);
  }
}

function clearScreen() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;
  clearScreen();

  if (!gameover && !waitingToStart) {
    if (ground) ground.update(gameSpeed, deltaTime);
    if (cactiController) cactiController.update(gameSpeed, deltaTime);
    if (itemController) itemController.update(gameSpeed, deltaTime);
    if (player) player.update(gameSpeed, deltaTime);
    if (score) score.update(gameSpeed, deltaTime);
    updateGameSpeed(deltaTime);
  }

  if (cactiController && !gameover && cactiController.collideWith(player)) {
    gameover = true;
    if (score) score.setHighScore();
    setupGameReset();
  }

  if (itemController && player) {
    const collideWithItem = itemController.collideWith(player);
    if (collideWithItem && collideWithItem.itemId) {
      if (score) score.getItem(collideWithItem.itemId);
    }
  }

  if (player) player.draw();
  if (cactiController) cactiController.draw();
  if (ground) ground.draw();
  if (score) score.draw();
  if (itemController) itemController.draw();
  if (gameover) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
window.addEventListener('keyup', reset, { once: true });
