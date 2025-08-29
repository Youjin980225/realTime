const users = [];

//서버 메모리에 유저 세션 저장
export const addUser = (user) => {
  users.push(user);
};

//세션 종료된 사용자 삭제
export const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//전체 유저 조회
export const getUsers = () => {
  return users;
};
