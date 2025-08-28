import * as gameHandler from './game.handler.js';
import * as stageHandler from './stage.handler.js';

// 핸들러 매핑
const handlerMappings = {
  0: gameHandler.gameStart,
  1: gameHandler.gameEnd,
  2: stageHandler.nextStage,
  4: gameHandler.handleItemAcquisition,
};

export const onPacket = (io, socket) => {
  socket.on('packet', (packet) => {
    const handler = handlerMappings[packet.handlerId];

    if (!handler) {
      console.error(`handlerId ${packet.handlerId} not found.`);
      return;
    }

    const { payload } = packet;
    const userUUID = socket.uuid;

    try {
      handler(userUUID, payload, io);
    } catch (e) {
      console.error(e);
      socket.emit('response', { status: 'fail', message: e.message });
    }
  });
};

export default handlerMappings;
