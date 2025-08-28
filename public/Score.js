// Score.js
class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';

  constructor(ctx, scaleRatio, socket, itemUnlockData) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.socket = socket;
    this.itemUnlockData = itemUnlockData;

    this.highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY)) || 0;
  }

  // 이 함수는 게임이 진행될 때마다 점수를 업데이트합니다.
  update(gameSpeed, deltaTime) {
    // 게임 속도에 비례하여 점수가 자동으로 증가합니다.
    this.score += deltaTime * 0.001 * gameSpeed;
  }

  // 서버에서 점수를 받았을 때 호출됩니다.
  updateScore(newScore) {
    this.score = newScore;
  }

  // 아이템을 획득했을 때 서버로 데이터를 보내고, 클라이언트에서 점수를 업데이트합니다.
  getItem(itemId) {
    const item = this.itemUnlockData.data.find((i) => i.id === itemId);
    if (item) {
      // 아이템의 점수 값을 현재 점수에 더합니다.
      this.score += item.score;
      console.log(`획득한 아이템 ${item.id} (점수: ${item.score})`);

      // 아이템 획득 정보를 서버로 보냅니다.
      this.socket.emit('packet', {
        handlerId: 4,
        payload: {
          itemId: itemId,
          // 점수 업데이트는 클라이언트에서 바로 처리
          score: this.score,
        },
      });
      console.log(`클라이언트가 아이템 ${itemId} 획득을 서버에 알립니다.`);
    }
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem(this.HIGH_SCORE_KEY, this.highScore);
    }
  }

  draw() {
    const y = 20 * this.scaleRatio;
    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, '0');
    const highScorePadded = this.highScore.toString().padStart(6, '0');

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
