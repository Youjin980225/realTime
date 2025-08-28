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

  update(gameSpeed, deltaTime) {
    this.score += deltaTime * 0.001 * gameSpeed;
  }

  updateScore(newScore) {
    this.score = newScore;
  }

  getItem(itemId) {
    if (this.itemUnlockData && this.itemUnlockData.data) {
      const item = this.itemUnlockData.data.find((i) => i.id === itemId);
      if (item) {
        this.score += item.score;
        console.log(`획득한 아이템 ${item.id} (점수: ${item.score})`);
        if (this.socket) {
          this.socket.emit('packet', {
            handlerId: 4,
            payload: {
              itemId: itemId,
              score: this.score,
            },
          });
          console.log(`클라이언트가 아이템 ${itemId} 획득을 서버에 알립니다.`);
        }
      } else {
        console.log(`ID ${itemId}에 해당하는 아이템을 찾을 수 없습니다.`);
      }
    } else {
      console.error('아이템 데이터가 로드되지 않았거나 형식이 올바르지 않습니다.');
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
