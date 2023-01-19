class Buff {
  constructor({ tileSize, gameAreaPosition, assets, coords, sprite, buffsStore }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
    this._coords = coords;
    this._assets = assets;
    this._sprite = this._assets.get(sprite);
    this._buffsStore = buffsStore;

    this._status = Buff.STATUSES[1];

    this._size = {
      width: 0,
      height: 0,
    }
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize();

    this._duration = getRandomFromRange(9000, 13000);
    this._birthTime = null;
  }

  setSize() {
    this._size.width = this._tileSize.width * Buff.SIZE_SCALE_FACTOR;
    this._size.height = this._tileSize.height * Buff.SIZE_SCALE_FACTOR;
    this._position.x = this._gameAreaPosition.x + this._coords.x * this._tileSize.width;
    this._position.y = this._gameAreaPosition.y + this._coords.y * this._tileSize.height;
  }

  update({ timestamp }) {
    if (this._birthTime === null) {
      this._birthTime = timestamp;
    } else if (timestamp > this._birthTime + this._duration) {
      this._status = Buff.STATUSES[2];
      this._buffsStore.setHasUnactiveBuffs(true);
    }
  }

  render(ctx) {
    ctx.drawImage(this._sprite, this._position.x, this._position.y, this._size.width, this._size.height);
  }

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._size.width,
			y2: this._position.y + this._size.height,
		}
	}

  isActive() {
    return this._status === Buff.STATUSES[1];
  }

  isPassed() {
    return this._status === Buff.STATUSES[2];
  }

  isApplied() {
    return this._status === Buff.STATUSES[3];
  }
}

Buff.SIZE_SCALE_FACTOR = 4;
Buff.STATUSES = {
  1: 'active',
  2: 'passed',
  3: 'applied',
}