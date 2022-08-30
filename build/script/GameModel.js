class GameModel {
	constructor({ width, height, baseWidth, baseHeight }) {
		this._width = width;
		this._height = height;
		this._baseWidth = baseWidth;
		this._baseHeight = baseHeight;

		this._levelIndex = 1;
		this._level = new Level({
			levelIndex: this._levelIndex,
			width: this._width,
			height: this._height,
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		});

		this._bulletsStore = new BulletsStore();

		this._player = new Player({
			position: { x: 0, y: 0 },
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
			level: this._level,
			bulletsStore: this._bulletsStore,
		});

		this._prevTimestamp = 0;
	}

	update(timestamp) {
		if (this._prevTimestamp) {
			const delta = (timestamp - this._prevTimestamp) / 1000;
			this._player.update(delta);
			this._bulletsStore.update(delta);
		}
		this._prevTimestamp = timestamp;
	}

	setSize(width, height, baseWidth, baseHeight) {
		this._width = width;
		this._height = height;
		this._baseWidth = baseWidth;
		this._baseHeight = baseHeight;
		this._setLevelSize();
		this._setPlayerSize();
		this._setBulletsSize();
	}

	_setLevelSize() {
		this._level.setSize({
			width: this._width,
			height: this._height,
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		})
	}

	_setPlayerSize() {
		this._player.setSize({
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		})
	}

	_setBulletsSize() {
		this._bulletsStore.setBulletsSize({
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		})
	}

	handleKeyDown(event) {
		const playerEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Space'];
		if (playerEvents.includes(event.code)) this._player.handleKeyDown(event.code);
	}

	handleKeyUp(event) {
		const playerEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
		if (playerEvents.includes(event.code)) this._player.handleKeyUp(event.code);
	}

	getPlayer() {
		return this._player;
	}

	getLevel() {
		return this._level;
	}

	getBulletsStore() {
		return this._bulletsStore;
	}
}