import { removeUser } from '../../models/user.model.js';
import { getGameAssets } from '../init/assets.js';

export const handleConnection = (io, socket, userUUID) => {
  console.log(`클라이언트가 연결되었습니다. UUID: ${userUUID}, Socket ID: ${socket.id}`);
  socket.userUUID = userUUID;

  const assets = getGameAssets();
  const users = assets?.users;

  if (!users) {
    console.warn(
      '경고: users 객체를 찾을 수 없습니다. game assets이 올바르게 초기화되지 않았을 수 있습니다.',
    );
    return;
  }

  console.log('현재 연결된 유저 수:', Object.keys(users).length);
};

export const handleDisconnect = (io, userUUID) => {
  removeUser(userUUID);
  console.log(`클라이언트의 연결이 끊어졌습니다. UUID: ${userUUID}`);

  const assets = getGameAssets();
  const users = assets?.users;

  if (!users) {
    console.warn(
      '경고: users 객체를 찾을 수 없습니다. game assets이 올바르게 초기화되지 않았을 수 있습니다.',
    );
    return;
  }

  console.log('현재 연결된 유저 수:', Object.keys(users).length);
};
