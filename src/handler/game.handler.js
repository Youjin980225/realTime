import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../../models/stage.model.js';
import { getScore, increaseScore } from '../../models/score.model.js';
import { startObstacleSpawn, stopObstacleSpawn } from './obstacle.handler.js';

export const gameStart = (uuid, payload, io) => {
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

// 아이템 획득 시 점수를 올림
export const handleItemAcquisition = (userUUID, payload, io) => {
  const { items } = getGameAssets();
  const itemId = payload.itemId;
  const acquiredItem = items.data.find((item) => item.id === Number(itemId));

  if (!acquiredItem) {
    io.to(userUUID).emit('response', { status: 'fail', message: 'Item not found.' });
    return;
  }

  const newScore = increaseScore(userUUID, acquiredItem.score);

  console.log(`User ${userUUID} acquired item ${itemId}. New score: ${newScore}`);

  io.to(userUUID).emit('response', {
    status: 'success',
    newScore: newScore,
    message: `Acquired item ${itemId}`,
  });
};

export const nextStage = (userUUID) => {
  const currentStage = getStage(userUUID);
  const { stage } = getGameAssets();

  if (!currentStage) {
    return { status: 'fail', message: 'Current stage not found.' };
  }

  const currentStageIndex = stage.data.findIndex((s) => s.id === currentStage.id);

  if (currentStageIndex === -1 || currentStageIndex === stage.data.length - 1) {
    return { status: 'success', message: 'All stages cleared!' };
  }

  const nextStageId = stage.data[currentStageIndex + 1].id;

  setStage(userUUID, nextStageId);
  console.log(`User ${userUUID} advanced to the next stage: ${nextStageId}`);

  return { status: 'success', stageId: nextStageId };
};
