class Eagle {
	constructor({ stepSize, safeAreaPosition, assets, explosionsStore }) {
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._assets = assets;
		this._explosionsStore = explosionsStore;

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
		const offsetX = this._destroyed ? this._sprite.width / 2 : 0; 
		
		ctx.drawImage(this._sprite, offsetX, 0, this._sprite.width / 2, this._sprite.height, this._position.x, this._position.y, this._size.width, this._size.height);
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
		this._addExplosion();
	}

	_addExplosion() {
		const type = Explosion.TYPES['large'];
		const centerPoint = {
			x: this._position.x + this._size.width / 2,
			y: this._position.y + this._size.height / 2,
		}
		
		const explosion = new Explosion({
			...type,
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
			centerPoint: centerPoint,
		});

		this._explosionsStore.addExplosion(explosion);
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