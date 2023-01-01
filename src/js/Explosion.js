class Explosion {
  constructor({ tileSize, gameAreaPosition, centerPoint, assets, sizeScaleFactor, sprite, spriteFramesNumber, fps }) {
    this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;
    this._sizeScaleFactor = sizeScaleFactor;
    this._centerPoint = centerPoint;
    this._assets = assets;
    
    this._size = {
      width: 0,
      height: 0,
    }
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize({ initial: true });

    this._sprite = new Sprite({
			sprite: this._assets.get(sprite),
			framesNumber: spriteFramesNumber,
      loop: false,
      playing: true,
      fps: fps,
    });

    this._done = false;
  }

  setSize({ initial = false } = {}) {
    this._size.width = this._sizeScaleFactor * this._tileSize.width;
    this._size.height = this._sizeScaleFactor * this._tileSize.height;

		if (initial) {
      this._position.x = this._centerPoint.x - this._size.width / 2;
      this._position.y = this._centerPoint.y - this._size.height / 2;
		} else {
			const coords = {
				x: (this._position.x - this._prevGameAreaPositionX) / this._prevTileSizeWidth,
				y: (this._position.y - this._prevGameAreaPositionY) / this._prevTileSizeHeight,
			}
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * coords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * coords.y;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
    }
  }

  update(time) {
    this._sprite.update(time);

    if (!this._sprite.getPlaying()) this._done = true;
  }

  render(ctx) {
    this._sprite.render(ctx, this._position, this._size);
  }

  getDone() {
    return this._done;
  }
}

Explosion.TYPES = {
  small: {
    sizeScaleFactor: 4,
    sprite: 'images/small-explosion.png',
    spriteFramesNumber: 3,
    fps: 16,
  },
  large: {
    sizeScaleFactor: 8,
    sprite: 'images/large-explosion.png',
    spriteFramesNumber: 5,
    fps: 8,
  }
}