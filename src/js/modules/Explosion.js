class Explosion {
  constructor({ tileSize, gameAreaPosition, centerPoint, assets, explosionsStore, size, sprite, spriteFramesNumber, spriteFps }) {
    this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;
    this._centerPoint = centerPoint;
    this._assets = assets;
    this._explosionsStore = explosionsStore;
    
    this._size = {
      width: size.width,
      height: size.height,
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
      fps: spriteFps,
    });

    this._finished = false;
  }

  setSize({ initial = false } = {}) {
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

      this._size.width = this._size.width / this._prevTileSizeWidth * this._tileSize.width;
      this._size.height = this._size.height / this._prevTileSizeHeight * this._tileSize.height;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
    }
  }

  update(time) {
    this._sprite.update(time);

    if (!this._sprite.isPlaying()) {
      this._finished = true;
      this._explosionsStore.setHasFinishedExplosions(true);
    }
  }

  render(ctx) {
    this._sprite.render(ctx, this._position, this._size);
  }

  isFinished() {
    return this._finished;
  }
}