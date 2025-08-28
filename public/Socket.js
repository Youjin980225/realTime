const CLIENT_VERSION = '1.0.0';
import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';

const socket = io(window.location.origin, {
  query: {
    clientVersion: CLIENT_VERSION,
  },
  auth: { token: 'my-token' },
});

let userId = null;

socket.on('response', (data) => {
  console.log('서버로부터 응답:', data);
});

socket.on('connection', (data) => {
  console.log('connection:', data);
  userId = data.uuid;
});

const sendPacket = (handlerId, payload) => {
  if (!socket.connected) {
    console.error('소켓이 연결되지 않았습니다. 패킷을 보낼 수 없습니다.');
    return;
  }
  socket.emit('packet', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendPacket };
