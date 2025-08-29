const stages = {};

export const createStage = (uuid) => {
  //초기 스테이지 배열 생성
  stages[uuid] = [];
};

//유저 스테이지 정보 가져오기
export const getStage = (uuid) => {
  return stages[uuid];
};

//새 스테이지 정보 추가
export const setStage = (uuid, id, timestamp) => {
  if (!stages[uuid]) {
    stages[uuid] = [];
  }
  return stages[uuid].push({ id, timestamp });
};
