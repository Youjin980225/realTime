import { removeUser } from '../../models/user.model.js';
import { getGameAssets } from '../init/assets.js';

/**
 * 클라이언트 연결을 처리하는 함수입니다.
 * @param {object} io - Socket.IO 서버 인스턴스
 * @param {object} socket - 현재 연결된 클라이언트 소켓
 * @param {string} userUUID - 유저 UUID
 */
export const handleConnection = (io, socket, userUUID) => {
  console.log(`클라이언트가 연결되었습니다. UUID: ${userUUID}, Socket ID: ${socket.id}`);
  socket.userUUID = userUUID; // 소켓에 사용자 UUID를 할당합니다.

  // getGameAssets()가 유효한 객체를 반환하는지 확인합니다.
  const assets = getGameAssets();
  const users = assets?.users; // 옵셔널 체이닝으로 안전하게 접근

  // users가 유효하지 않으면 메시지를 출력하고 함수를 종료합니다.
  if (!users) {
    console.warn(
      '경고: users 객체를 찾을 수 없습니다. game assets이 올바르게 초기화되지 않았을 수 있습니다.',
    );
    return;
  }

  console.log('현재 연결된 유저 수:', Object.keys(users).length);
};

/**
 * 클라이언트 연결 끊김을 처리하는 함수입니다.
 * @param {object} io - Socket.IO 서버 인스턴스
 * @param {string} userUUID - 유저 UUID
 */
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
