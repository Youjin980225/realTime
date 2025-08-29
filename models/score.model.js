const userScores = {};

//유저 점수 증가
export const increaseScore = (userUUID, scoreToAdd) => {
  if (!userScores[userUUID]) {
    userScores[userUUID] = 0;
  }
  userScores[userUUID] += scoreToAdd;
  return userScores[userUUID];
};

//특정 유저 점수 반환
export const getScore = (userUUID) => {
  return userScores[userUUID] || 0;
};

//특정 유저 점수 리셋
export const resetScore = (userUUID) => {
  userScores[userUUID] = 0;
};
