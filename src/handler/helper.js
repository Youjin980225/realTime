import { CLIENT_VERSION } from '../constants.js';
import { removeUser, getUsers } from '../../models/user.model.js';
import { getGameAssets } from '../init/assets.js';
import handlerMappings from './handlerMapping.js';

//유저 소켓 연결
export const handleConnection = (socket, userUUID) => {
  console.log(`New user connected: ${userUUID} with socket ID ${socket.id}`);
  console.log('Current users:', getUsers());
  socket.userUUID = userUUID;
  const assets = getGameAssets();
  const users = assets?.users;
};

//클라이언트 연결 끊어졌을 경우
export const handleDisconnect = (socket, userUUID) => {
  //소켓 ID 기반으로 사용자 목록에서 해당 사용자 제거
  removeUser(socket.id);
  console.log(`클라이언트의 연결이 끊어졌습니다. ${socket.id}`);
  console.log('현재 유저:', getUsers());

  const assets = getGameAssets();
  const users = assets?.users;

  if (!users) {
    console.log('users 객체를 찾을 수 없습니다.');
    return;
  }

  console.log('현재 연결된 유저 수:', Object.keys(users).length);
};

//클라이언트로부터 받은 이벤트 처리
export const handleEvent = (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  //handlerId에 해당하는 핸들러 함수를 handlerMapping에서 찾음
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  // 적절한 핸들러에 userID 와 payload를 전달하고 결과를 받음
  const response = handler(data.userId, data.payload);
  // 만약 결과에 broadcast (모든 유저에게 전달)이 있다면 broadcast
  if (response.broadcast) {
    io.emit('response', 'broadcast');
    return;
  }
  // 해당 유저에게 적절한 response를 전달
  socket.emit('response', response);
};
