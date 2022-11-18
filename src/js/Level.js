class Level {
	constructor({ canvasSize, stepSize, safeAreaPosition, state, assets }) {
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._state = state;
		this._assets = assets;
		this._levels = this._assets.get('json/levels.json');
		this._levelIndex = this._state.getLevelIndex();

		this._mapSize = {
			width: 0,
			height: 0,
		}
		this._map = this._setMap(this._levels[this._levelIndex]);
		this.setSize();
	}

	_setMap(map) {
		return map.map((row, y) => {
			return row.map((key, x) => {
				
				if (!key) return key;

				return new Brick({
					...Brick.TYPES[key],
					coords: { x, y },
					stepSize: this._stepSize,
					safeAreaPosition: this._safeAreaPosition,
					assets: this._assets,
				})
			})
		})
	}

	render(ctx, layer) {
		if (layer === 'bottom') {
			ctx.fillStyle = '#000000';
			ctx.fillRect(this._safeAreaPosition.x, this._safeAreaPosition.y, this._mapSize.width, this._mapSize.height);
		}

		this._map.forEach(row => {
			row.forEach(brick => {
				if (brick && brick.getLayer() === layer) brick.render(ctx);
			})
		})
	}

	setSize() {
		this._mapSize.width = this._stepSize.width * Level.MAP_WIDTH_SCALE_FACTOR;
		this._mapSize.height = this._stepSize.height * Level.MAP_HEIGHT_SCALE_FACTOR;

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
			x1: this._safeAreaPosition.x,
			y1: this._safeAreaPosition.y,
			x2: this._safeAreaPosition.x + this._mapSize.width,
			y2: this._safeAreaPosition.y + this._mapSize.height,
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