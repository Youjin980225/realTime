import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../../models/stage.model.js';
import { getScore, increaseScore } from '../../models/score.model.js';
import { startObstacleSpawn, stopObstacleSpawn } from './obstacle.handler.js';

//게임 시작
export const gameStart = (uuid, payload, io) => {
  //게임 에셋 스테이지 데이터 가져오기
  const { stages } = getGameAssets();
  setStage(uuid, stages.data[0].id, payload.timestamp);
  console.log('Stage:', getStage(uuid));

  //장애물 생성 시작
  startObstacleSpawn(uuid, stages.data[0].id, io);

  return { status: 'success' };
};

//게임 종료
export const gameEnd = (uuid, payload) => {
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  //스테이지 기록이 없을 경우 실패
  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  let totalScore = 0;
  //플레이 시간을 계산하여 총점 산출
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
export const handleItemGet = (userUUID, payload, io) => {
  const { items } = getGameAssets();
  const itemId = payload.itemId;
  //획득 아이템 ID에 해당하는 데이터를 에셋에서 찾음
  const getItem = items.data.find((item) => item.id === Number(itemId));
  if (!getItem) {
    io.to(userUUID).emit('response', { status: 'fail', message: 'Item not found.' });
    return;
  }

  //아이템 점수만큼 사용자 점수 증가
  const newScore = increaseScore(userUUID, getItem.score);

  console.log(`User ${userUUID} get item ${itemId}. New score: ${newScore}`);

  //점수 갱신 결과를 클라이언트에 전송
  io.to(userUUID).emit('response', {
    status: 'success',
    newScore: newScore,
    message: `get item ${itemId}`,
  });
};

//다음 스테이지로 이동
export const nextStage = (userUUID) => {
  const currentStage = getStage(userUUID);
  const { stage } = getGameAssets();

  //현재 스테이지 정보가 없으면 실패 반환
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
