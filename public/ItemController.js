import Item from './Item.js';

export default class ItemController {
  ITEM_INTERVAL_MIN = 1000;
  ITEM_INTERVAL_MAX = 5000;
  nextItemInterval = null;
  items = [];
  itemUnlockData = null;

  constructor(ctx, itemImages, scaleRatio, itemUnlockData) {
    this.ctx = ctx;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.itemUnlockData = itemUnlockData;
    this.setNextItemInterval();
  }

  setNextItemInterval() {
    const num = this.getRandomNumber(this.ITEM_INTERVAL_MIN, this.ITEM_INTERVAL_MAX);
    this.nextItemInterval = num * this.scaleRatio;
  }

  getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  createItem(currentStageId) {
    const unlockedItemsForStage = this.itemUnlockData.data.find(
      (stage) => stage.stageId === currentStageId,
    );

    if (!unlockedItemsForStage) {
      console.warn(
        `Warning: No item data found for stageId ${currentStageId}. No item will be created.`,
      );
      return;
    }

    const unlockedItemIds = unlockedItemsForStage.items;
    const availableItems = this.itemImages.filter((itemImage) =>
      unlockedItemIds.includes(itemImage.id),
    );

    if (availableItems.length === 0) {
      console.warn(`Warning: No available items to create for stageId ${currentStageId}.`);
      return;
    }

    const index = Math.floor(this.getRandomNumber(0, availableItems.length));
    const itemImage = availableItems[index];

    const x = this.ctx.canvas.width * 0.8;
    const y = this.ctx.canvas.height - itemImage.height - 20;

    const newItem = new Item(
      this.ctx,
      itemImage.id,
      x,
      y,
      itemImage.width,
      itemImage.height,
      itemImage.image,
    );

    this.items.push(newItem);
  }

  update(gameSpeed, frameTimeDelta, currentStageId) {
    if (this.nextItemInterval <= 0) {
      this.createItem(currentStageId);
      this.setNextItemInterval();
    }
    this.nextItemInterval -= frameTimeDelta * gameSpeed;

    this.items.forEach((item) => {
      item.x -= gameSpeed * frameTimeDelta;
    });
    this.items = this.items.filter((item) => item.x + item.width > 0);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(sprite) {
    const collidedItem = this.items.find((item) => {
      return (
        item.x < sprite.x + sprite.width &&
        item.x + item.width > sprite.x &&
        item.y < sprite.y + sprite.height &&
        item.y + sprite.height > sprite.y
      );
    });

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
