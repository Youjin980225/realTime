import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js'; // 웹소켓 초기화 함수
import { loadGameAssets } from './init/assets.js'; // 게임 assets 로드 함수

// Express 앱과 HTTP 서버를 초기화합니다.
const app = express();
const server = createServer(app);
const PORT = 3000;

// 미들웨어 설정
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 루트 경로 핸들러
app.get('/', (req, res) => {
  res.send('Hello World');
});

// 서버 시작 전, 게임 assets을 먼저 비동기적으로 로드합니다.
// 이 코드가 성공해야만 서버가 시작됩니다.
(async () => {
  try {
    const assets = await loadGameAssets();
    console.log('Assets loaded successfully');

    // assets 로드가 완료되면 웹소켓 서버를 초기화합니다.
    initSocket(server);

    // HTTP 서버를 시작합니다.
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
})();
