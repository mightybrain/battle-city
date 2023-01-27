class Eagle {
	constructor({ tileSize, gameAreaPosition, assets, explosionsStore }) {
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
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

		this._status = Eagle.STATUSES[1];
	}

	render(ctx) {
		const offsetX = this.isDestroyed() ? this._sprite.width / 2 : 0; 
		
		ctx.drawImage(this._sprite, offsetX, 0, this._sprite.width / 2, this._sprite.height, this._position.x, this._position.y, this._size.width, this._size.height);
	}

	setSize() {
		this._size.width = this._tileSize.width * Eagle.SIZE_SCALE_FACTOR;
		this._size.height = this._tileSize.height * Eagle.SIZE_SCALE_FACTOR;
		this._position.x = this._gameAreaPosition.x + this._tileSize.width * Eagle.INITIAL_COORDS.x;
		this._position.y = this._gameAreaPosition.y + this._tileSize.height * Eagle.INITIAL_COORDS.y;
	}

	isDestroyed() {
		return this._status === Eagle.STATUSES[2];
	}

	destroy() {
		if (this.isDestroyed()) return;
		
		this._status = Eagle.STATUSES[2];
		this._addExplosion();
	}

	_addExplosion() {
		const explosion = new LargeExplosion({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: {
				x: this._position.x + this._size.width / 2,
				y: this._position.y + this._size.height / 2,
			},
			explosionsStore: this._explosionsStore,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	getPosition() {
		return this._position;
	}

	getRoundedBoundaryBox() {
		return {
			x1: this._gameAreaPosition.x + Eagle.INITIAL_COORDS.x * this._tileSize.width,
			y1: this._gameAreaPosition.y + Eagle.INITIAL_COORDS.y * this._tileSize.height,
			x2: this._gameAreaPosition.x + Eagle.INITIAL_COORDS.x * this._tileSize.width + this._size.width,
			y2: this._gameAreaPosition.y + Eagle.INITIAL_COORDS.y * this._tileSize.height + this._size.height,
		}
	}
}

Eagle.STATUSES = {
	1: 'active',
	2: 'destroyed',
}
Eagle.SIZE_SCALE_FACTOR = 4;
Eagle.INITIAL_COORDS = {
	x: 24,
	y: 48,
}