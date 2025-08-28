import { v4 as uuidv4 } from 'uuid';
import { addUser } from '../../models/user.model.js';
// handleConnection과 handleDisconnect 함수는 helper.js에서 가져옵니다.
import { handleConnection, handleDisconnect } from './helper.js';

// 핸들러 매핑을 이 파일 내부에 정의합니다.
import * as gameHandler from './game.handler.js';
import * as stageHandler from './stage.handler.js';

const handlerMappings = {
  0: gameHandler.gameStart,
  1: gameHandler.gameEnd,
  2: stageHandler.nextStage,
  4: gameHandler.handleItemAcquisition,
};

// 'packet' 이벤트를 처리하는 onPacket 함수를 이 파일 내부에 정의합니다.
const onPacket = (io, socket, packet) => {
  // 패킷의 핸들러 ID를 확인하여 적절한 함수를 호출합니다.
  const handler = handlerMappings[packet.handlerId];

  if (!handler) {
    console.error(`handlerId ${packet.handlerId} not found.`);
    return;
  }

  const { payload } = packet;
  const userUUID = socket.userUUID;

  try {
    // payload와 함께 io 객체를 핸들러에 전달합니다.
    handler(userUUID, payload, io);
  } catch (e) {
    console.error(e);
    // 에러 발생 시 클라이언트에게 실패 응답을 보냅니다.
    socket.emit('response', { status: 'fail', message: e.message });
  }
};

const registerHandler = (io) => {
  // 클라이언트가 연결되면 실행됩니다.
  io.on('connection', (socket) => {
    // 새로운 사용자 UUID를 생성하고 유저 모델에 추가합니다.
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });

    // 소켓에 UUID를 할당합니다.
    socket.userUUID = userUUID;

    // 연결 처리를 담당하는 함수를 호출합니다.
    handleConnection(io, socket, userUUID);

    // 클라이언트로부터 'packet' 이벤트가 오면 onPacket 함수를 호출합니다.
    socket.on('packet', (packet) => onPacket(io, socket, packet));

    // 클라이언트의 연결이 끊어지면 handleDisconnect 함수를 호출합니다.
    socket.on('disconnect', () => handleDisconnect(io, userUUID));
  });
};

export default registerHandler;
