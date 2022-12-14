class Explosion {
  constructor({ stepSize, safeAreaPosition, centerPoint, assets, sizeScaleFactor, sprite, spriteFramesNumber, fps }) {
    this._stepSize = stepSize;
		this._prevStepSizeWidth = this._stepSize.width;
		this._prevStepSizeHeight = this._stepSize.height;
		this._safeAreaPosition = safeAreaPosition;
		this._prevSafeAreaPositionX = this._safeAreaPosition.x;
		this._prevSafeAreaPositionY = this._safeAreaPosition.y;
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
    this._size.width = this._sizeScaleFactor * this._stepSize.width;
    this._size.height = this._sizeScaleFactor * this._stepSize.height;

		if (initial) {
      this._position.x = this._centerPoint.x - this._size.width / 2;
      this._position.y = this._centerPoint.y - this._size.height / 2;
		} else {
			const coords = {
				x: (this._position.x - this._prevSafeAreaPositionX) / this._prevStepSizeWidth,
				y: (this._position.y - this._prevSafeAreaPositionY) / this._prevStepSizeHeight,
			}
			this._position.x = this._safeAreaPosition.x + this._stepSize.width * coords.x;
			this._position.y = this._safeAreaPosition.y + this._stepSize.height * coords.y;

			this._prevStepSizeWidth = this._stepSize.width;
			this._prevStepSizeHeight = this._stepSize.height;
			this._prevSafeAreaPositionX = this._safeAreaPosition.x;
			this._prevSafeAreaPositionY = this._safeAreaPosition.y;
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