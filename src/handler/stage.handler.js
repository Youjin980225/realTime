import { getStage, setStage } from '../../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const moveStageHandler = (userId, payload, io) => {
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }
  currentStages.sort((a, b) => a.id - b.id);
  const currentStageId = currentStages[currentStages.length - 1].id;

  if (currentStageId !== payload.currentStage) {
    return { status: 'fail', message: 'Current stage mismatch' };
  }

  const serverTime = Date.now();
  const elapsedTime = serverTime - currentStage.timestamp;
  if (elapsedTime < 100 || elapsedTime > 105) {
    return { status: 'fail', message: 'Invalid elapsed time' };
  }

  const { stages } = getGameAssets();
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    return { status: 'fail', message: 'Target stage does not exist.' };
  }

  //기존 장애물 생성 중단
  stopObstacleSpawn(userId);

  //새 스테이지 등록
  setStage(userId, payload.targetStage, serverTime);

  //새 스테이지 장애물 스폰 시작
  startObstacleSpawn(userId, payload.targetStage, io);

  return { status: 'success' };
};
