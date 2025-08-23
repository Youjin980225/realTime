import { getGameAssets } from '../init/assets.js';

const obstacleTimers = new Map();

//랜덤 시간 생성
const getRandomDelay = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

//장애물 생성 시작
export const startObstacleSpawn = (uuid, stageId, io) => {
  const { stages, obstacles } = getGameAssets();

  const stage = stages.data.find((s) => s.id === stageId);
  if (!stage) return;

  const [minDelay, maxDelay] = stage.obstacleSpawnMs;

  const spawn = () => {
    //랜덤 장애물 하나 선택
    const randomObstacle = obstacles.data[Math.floor(Math.random() * obstacles.data.length)];

    //클라에게 이벤트 송신
    io.to(uuid).emit('spawnObstacle', {
      stageId,
      obstacle: randomObstacle,
      timestamp: Date.now(),
    });

    //다음 생성 예약
    const delay = getRandomDelay(minDelay, maxDelay);
    const timer = setTimeout(spawn, delay);
    obstacleTimers.set(uuid, timer);
  };

  //첫 번째 생성 예약
  const delay = getRandomDely(minDelay, maxDelay);
  const timer = setTimeout(spawn, delay);
  obstacleTimers.set(uuid, timer);
};

//장애물 생성 중단
export const stopObstacleSpawn = (uuid) => {
  if (obstacleTimers.has(uuid)) {
    clearTimeout(obstacleTimers.get(uuid));
    obstacleTimers.delete(uuid);
  }
};
