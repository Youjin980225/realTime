import { v4 as uuidv4 } from 'uuid';
import { addUser } from '../../models/user.model.js';
import { handleConnection, handleDisconnect } from './helper.js';
import * as gameHandler from './game.handler.js';
import * as stageHandler from './stage.handler.js';

const handlerMappings = {
  0: gameHandler.gameStart,
  1: gameHandler.gameEnd,
  2: stageHandler.nextStage,
  4: gameHandler.handleItemAcquisition,
};

const onPacket = (io, socket, packet) => {
  const handler = handlerMappings[packet.handlerId];

  if (!handler) {
    console.error(`handlerId ${packet.handlerId} not found.`);
    return;
  }

  const { payload } = packet;
  const userUUID = socket.userUUID;

  try {
    handler(userUUID, payload, io);
  } catch (e) {
    console.error(e);
    socket.emit('response', { status: 'fail', message: e.message });
  }
};

const registerHandler = (io) => {
  io.on('connection', (socket) => {
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });
    socket.userUUID = userUUID;
    handleConnection(io, socket, userUUID);
    socket.on('packet', (packet) => onPacket(io, socket, packet));
    socket.on('disconnect', () => handleDisconnect(io, userUUID));
  });
};

export default registerHandler;
