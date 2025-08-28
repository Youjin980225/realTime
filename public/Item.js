export default class Item {
  constructor(ctx, id, x, y, width, height, image) {
    this.ctx = ctx;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }

  draw() {
    if (this.image) {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  collideWith(player) {
    const isCollision =
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;
    return isCollision;
  }
}
