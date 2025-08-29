import * as gameHandler from './game.handler.js';
import * as stageHandler from './stage.handler.js';

// 핸들러 매핑
const handlerMappings = {
  0: gameHandler.gameStart,
  1: gameHandler.gameEnd,
  2: stageHandler.nextStage,
  4: gameHandler.handleItemGet,
};

export default handlerMappings;
