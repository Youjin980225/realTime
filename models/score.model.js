// 사용자별 점수를 저장하는 객체
const userScores = {};

// 점수 업데이트 로직
export const increaseScore = (userUUID, scoreToAdd) => {
  // 사용자의 기존 점수가 없다면 0으로 초기화
  if (!userScores[userUUID]) {
    userScores[userUUID] = 0;
  }
  // 점수를 더하고 반환
  userScores[userUUID] += scoreToAdd;
  return userScores[userUUID];
};

// 특정 사용자의 현재 점수 가져오기
export const getScore = (userUUID) => {
  return userScores[userUUID] || 0; // 점수가 없으면 0을 반환
};

// 점수 초기화
export const resetScore = (userUUID) => {
  userScores[userUUID] = 0;
};
