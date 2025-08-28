import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handler/register.handler.js';

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  //이벤트 처리 핸들러
  registerHandler(io);
};

export default initSocket;
