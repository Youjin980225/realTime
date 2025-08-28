import Item from './Item.js';

export default class ItemController {
  // Constants for item generation
  ITEM_INTERVAL_MIN = 1000;
  ITEM_INTERVAL_MAX = 5000;
  nextItemInterval = null;
  items = [];

  constructor(ctx, itemImages, scaleRatio, groundSpeed) {
    this.ctx = ctx;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.groundSpeed = groundSpeed;
    this.setNextItemInterval();
  }

  setNextItemInterval() {
    // Generate a random interval for the next item
    const num = this.getRandomNumber(this.ITEM_INTERVAL_MIN, this.ITEM_INTERVAL_MAX);
    this.nextItemInterval = num * this.scaleRatio;
  }

  getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  createItem(gameSpeed) {
    // Select a random item image from the loaded images

    const index = this.getRandomNumber(0, this.itemImages.length - 1);
    const itemImage = this.itemImages[Math.floor(index)]; // Position the item off-screen to the right
    const x = this.ctx.canvas.width * 1.5; // Position the item above the ground
    const y = this.ctx.canvas.height - itemImage.height - this.groundSpeed * this.scaleRatio - 20; // Create a new Item object and add it to the items array
    const newItem = new Item(
      this.ctx,
      x,
      y,
      itemImage.width,
      itemImage.height,
      itemImage.image,
      itemImage.id,
    );

    this.items.push(newItem);
  }

  update(gameSpeed, frameTimeDelta) {
    // Decrease the interval until the next item is created

    if (this.nextItemInterval <= 0) {
      this.createItem(gameSpeed);
      this.setNextItemInterval();
    } // Adjust the interval based on game speed to increase item frequency
    this.nextItemInterval -= frameTimeDelta * gameSpeed; // Update the position of all items
    this.items.forEach((item) => {
      item.update(gameSpeed, frameTimeDelta);
    }); // Remove items that have moved off the screen to the left
    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  } // Check for collision between the player sprite and any item

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => {
      // Basic collision detection

      return (
        item.x < sprite.x + sprite.width &&
        item.x + item.width > sprite.x &&
        item.y < sprite.y + sprite.height &&
        item.y + item.height > sprite.y
      );
    }); // If a collision occurred, remove the item and return it

    if (collidedItem) {
      this.items = this.items.filter((item) => item !== collidedItem);
      return collidedItem;
    }
    return null;
  }
  reset() {
    this.items = [];
  }
}
