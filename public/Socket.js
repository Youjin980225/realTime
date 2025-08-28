// constants.js 파일이 없으므로, CLIENT_VERSION을 임시로 정의합니다.
// 실제 프로젝트에서는 별도의 파일로 관리해야 합니다.
const CLIENT_VERSION = '1.0.0';

// 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js'에서 io를 가져옵니다.
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

const socket = io(window.location.origin, {
  query: {
    clientVersion: CLIENT_VERSION,
  },
  auth: { token: 'my-token' },
});

let userId = null;

// 'response' 이벤트는 서버에서 보낸 응답을 받습니다.
socket.on('response', (data) => {
  console.log('서버로부터 응답:', data);
});

// 'connection' 이벤트는 서버와 연결이 성공했을 때 발생합니다.
socket.on('connection', (data) => {
  console.log('connection:', data);
  userId = data.uuid;
});

// 'packet' 이벤트로 서버에 데이터를 보냅니다.
// 서버의 `onPacket` 핸들러와 일치하도록 이벤트 이름을 'packet'으로 통일합니다.
const sendPacket = (handlerId, payload) => {
  if (!socket.connected) {
    console.error('소켓이 연결되지 않았습니다. 패킷을 보낼 수 없습니다.');
    return;
  }
  socket.emit('packet', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId, // 핸들러 ID를 올바르게 전달
    payload,
  });
};

export { sendPacket };
