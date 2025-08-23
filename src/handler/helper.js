import { getUsers, removeUser } from '../../models/user.model.js';
import { CLIENT_VERSION } from '../constants.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id);
  console.log(`User disconnected : ${socket.id}`);
  console.log('Current users:', getUsers());
};

export const handleConnection = (socket, userUUID) => {
  console.log(`New user connected: ${userUUID} with socket id ${socket.id}`);
  console.log('Current users:', getUsers());

  const { stages } = getGameAssets();
  setStage(userUUID, stages.data[0].id);
  console.log('Stage:', getStage(userUUID));
  socket.emit('connection', { uuid: userUUID });
};

export const handleEvent = (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  const response = handler(data.userId, data.payload);
  if (response.broadcast) {
    io.emit('response', 'broadcast');
    return;
  }
  socket.emit('response', response);
};
