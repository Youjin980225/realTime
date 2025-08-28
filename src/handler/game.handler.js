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

// 아이템 획득 시 점수를 올리는 함수
// io 인자를 추가하여 클라이언트에게 직접 응답을 보낼 수 있게 합니다.
export const handleItemAcquisition = (userUUID, payload, io) => {
  // game.handler.js에서 assets.js의 아이템 데이터를 가져옵니다.
  const { items } = getGameAssets();

  const itemId = payload.itemId;

  // items.data 배열에서 itemId와 일치하는 아이템을 찾습니다.
  const acquiredItem = items.data.find((item) => item.id === Number(itemId));

  // 아이템이 존재하지 않으면 실패 응답을 반환합니다.
  if (!acquiredItem) {
    // 클라이언트에 실패 응답을 보냅니다.
    io.to(userUUID).emit('response', { status: 'fail', message: 'Item not found.' });
    return;
  }

  // 아이템의 점수를 가져와서 사용자의 점수에 더합니다.
  const newScore = increaseScore(userUUID, acquiredItem.score);

  console.log(`User ${userUUID} acquired item ${itemId}. New score: ${newScore}`);

  // 성공 응답과 함께 새로운 점수를 클라이언트에 보냅니다.
  io.to(userUUID).emit('response', {
    status: 'success',
    newScore: newScore,
    message: `Acquired item ${itemId}`,
  });
};

export const nextStage = (userUUID) => {
  // 1. 현재 스테이지 정보 가져오기
  const currentStage = getStage(userUUID);
  const { stage } = getGameAssets();

  // 2. 현재 스테이지가 유효한지 확인하고, 다음 스테이지 ID를 찾습니다.
  if (!currentStage) {
    return { status: 'fail', message: 'Current stage not found.' };
  }

  const currentStageIndex = stage.data.findIndex((s) => s.id === currentStage.id);

  // 3. 다음 스테이지가 있는지 확인하고 없으면 게임 클리어!
  if (currentStageIndex === -1 || currentStageIndex === stage.data.length - 1) {
    return { status: 'success', message: 'All stages cleared!' };
  }

  const nextStageId = stage.data[currentStageIndex + 1].id;

  // 4. 다음 스테이지로 업데이트
  setStage(userUUID, nextStageId);
  console.log(`User ${userUUID} advanced to the next stage: ${nextStageId}`);

  // 5. 다음 스테이지 정보 반환 (클라이언트로 보낼 데이터)
  return { status: 'success', stageId: nextStageId };
};
