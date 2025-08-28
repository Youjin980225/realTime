const stages = {};

export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, id, timestamp) => {
  if (!stages[uuid]) {
    stages[uuid] = [];
  }
  return stages[uuid].push({ id, timestamp });
};
