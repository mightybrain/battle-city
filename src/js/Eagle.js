class Eagle {
	constructor({ stepSize, safeAreaPosition, assets }) {
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._assets = assets;

		this._size = {
			width: 0,
			height: 0,
		}
		this._position = {
			x: 0,
			y: 0,
		}
		this.setSize();

		this._sprite = this._assets.get('images/eagle.png');

		this._destroyed = false;
	}

	render(ctx) {
		ctx.drawImage(this._sprite, 0, 0, this._sprite.width, this._sprite.height, this._position.x, this._position.y, this._size.width, this._size.height);
	}

	setSize() {
		this._size.width = this._stepSize.width * Eagle.SIZE_SCALE_FACTOR;
		this._size.height = this._stepSize.height * Eagle.SIZE_SCALE_FACTOR;
		this._position.x = this._safeAreaPosition.x + this._stepSize.width * Eagle.INITIAL_COORDS.x;
		this._position.y = this._safeAreaPosition.y + this._stepSize.height * Eagle.INITIAL_COORDS.y;
	}

	getDestroyed() {
		return this._destroyed;
	}

	destroy() {
		this._destroyed = true;
	}

	getRoundedBoundaryBox() {
		return {
			x1: this._safeAreaPosition.x + Eagle.INITIAL_COORDS.x * this._stepSize.width,
			y1: this._safeAreaPosition.y + Eagle.INITIAL_COORDS.y * this._stepSize.height,
			x2: this._safeAreaPosition.x + Eagle.INITIAL_COORDS.x * this._stepSize.width + this._size.width,
			y2: this._safeAreaPosition.y + Eagle.INITIAL_COORDS.y * this._stepSize.height + this._size.height,
		}
	}
}

Eagle.SIZE_SCALE_FACTOR = 4;
Eagle.INITIAL_COORDS = {
	x: 24,
	y: 48,
}