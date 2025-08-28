export default class Item {
  constructor(ctx, id, x, y, width, height, image) {
    this.ctx = ctx;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image; // 로드된 Image 객체
  }

  // 아이템의 위치를 업데이트하는 메서드 (왼쪽으로 이동)
  update(speed, gameSpeed, deltaTime) {
    this.x -= (speed * gameSpeed * deltaTime) / 1000; // deltaTime을 초 단위로 변환하여 속도를 일정하게 유지
  }

  // 아이템을 캔버스에 그리는 메서드
  draw() {
    // 이미지 객체가 유효한지 확인 후 그립니다.
    if (this.image) {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  // 플레이어와의 충돌을 확인하는 메서드
  collideWith(player) {
    const isCollision =
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;
    return isCollision;
  }
}
