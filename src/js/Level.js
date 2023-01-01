class Level {
	constructor({ canvasSize, tileSize, gameAreaPosition, state, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._state = state;
		this._assets = assets;
		this._levels = this._assets.get('json/levels.json');
		this._levelIndex = this._state.getLevelIndex();

		this._mapSize = {
			width: 0,
			height: 0,
		}
		this._setSize();

		this._map = this._setMap(this._levels[this._levelIndex]);
	}

	_setMap(map) {
		return map.map((row, y) => {
			return row.map((key, x) => {
				
				if (!key) return key;

				return new Brick({
					...Brick.TYPES[key],
					coords: { x, y },
					tileSize: this._tileSize,
					gameAreaPosition: this._gameAreaPosition,
					assets: this._assets,
				})
			})
		})
	}

	render(ctx, layer) {
		if (layer === 'bottom') {
			ctx.fillStyle = '#121212';
			ctx.fillRect(this._gameAreaPosition.x, this._gameAreaPosition.y, this._mapSize.width, this._mapSize.height);
		}

		this._map.forEach(row => {
			row.forEach(brick => {
				if (brick && brick.getLayer() === layer) brick.render(ctx);
			})
		})
	}

	_setSize() {
		this._mapSize.width = this._tileSize.width * Level.MAP_WIDTH_SCALE_FACTOR;
		this._mapSize.height = this._tileSize.height * Level.MAP_HEIGHT_SCALE_FACTOR;
	}

	resize() {
		this._setSize();
		this._map.forEach(row => {
			row.forEach(brick => {
				if (brick) brick.setSize();
			})
		})
	}

	destroyBricks(bricks) {
		bricks.forEach(brick => {
			if (brick.getBreakByBullet()) {
				const { x, y } = brick.getCoords();
				this._map[y][x] = 0;
			}
		})
	}

	getBoundaryBox() {
		return {
			x1: this._gameAreaPosition.x,
			y1: this._gameAreaPosition.y,
			x2: this._gameAreaPosition.x + this._mapSize.width,
			y2: this._gameAreaPosition.y + this._mapSize.height,
		}
	}

	getMap() {
		return this._map;
	}

	getMapSize() {
		return this._mapSize;
	}
}

Level.MAP_WIDTH_SCALE_FACTOR = 52;
Level.MAP_HEIGHT_SCALE_FACTOR = 52;