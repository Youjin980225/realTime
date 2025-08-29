import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets');

let gameAssets = {};

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

//게임에 필요한 에셋 불러오기
export const loadGameAssets = async () => {
  try {
    const [stage, items, itemUnlocks] = await Promise.all([
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
    ]);
    //불러온 데이터는 gameAssets객체에 할당
    gameAssets = { stage, items, itemUnlocks };
    return gameAssets;
  } catch (error) {
    throw new Error('Failed to load game assets:' + error.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
