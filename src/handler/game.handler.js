import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../../models/stage.model.js';
import { startObstacleSpawn, stopObstacleSpawn } from './obstacle.handler.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  setStage(uuid, stages.data[0].id, payload.timestamp);
  console.log('Stage:', getStage(uuid));

  //장애물 생성 시작
  startObstacleSpawn(uuid, stages.data[0].id, io);

  return { status: 'success' };
};

export const gameEnd = (uuid, payload) => {
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  let totalScore = 0;
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = stages[index + 1].timestamp;
    }
    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration;
  });

  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  //장애물 생성 중단
  stopObstacleSpawn(uuid);

  return { status: 'success', message: 'Game ended successfully', score };
};
