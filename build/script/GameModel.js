class GameModel {
	constructor({ width, height }) {
		this._width = width;
		this._height = height;

		this._baseSize = {
			width: 0,
			height: 0,
		};
		this._setBaseSize();

		this._area = {
			width: 0,
			height: 0,
			position: {
				x: 0,
				y: 0,
			},
		}
		this._setAreaSize();

		this._levelIndex = 1;
		this._level = new Level({
			map: Level.maps[this._levelIndex],
			width: this._area.width,
			height: this._area.height,
			position: this._area.position,
			baseSize: this._baseSize,
		});

		this._bullets = [];

		this._player = new Tank({
			bullets: this._bullets,
			position: { x: 0, y: 0 },
			baseSize: this._baseSize,
			levelPosition: this._area.position,
		});

		this._prevTimestamp = 0;
	}

	update(timestamp) {
		if (this._prevTimestamp) {
			const delta = (timestamp - this._prevTimestamp) / 1000;
			this._player.update({ delta, level: this._level });
		}
		this._prevTimestamp = timestamp;
	}

	setSize(width, height) {
		this._width = width;
		this._height = height;
		this._setBaseSize();
		this._setAreaSize();
		this._setLevelSize();
		this._setPlayerSize();
	}

	_setBaseSize() {
		let width = this._width * 0.81;
		let height = width * 0.65;

		if (height + height * 0.18 > this._height) {
			height = this._height * 0.85;
			width = height * 1.53;
		}	

		this._baseSize.width = Math.round(width / 52);
		this._baseSize.height = Math.round(height / 52);
	}

	_setAreaSize() {
		const areaWidth = this._baseSize.width * 52;
		const areaHeight = this._baseSize.height * 52;

		this._area.width = areaWidth;
		this._area.height = areaHeight;
		this._area.position.x = Math.round((this._width - areaWidth) / 2 - this._baseSize.width * 2);
		this._area.position.y = Math.round((this._height - areaHeight) / 2);
	}

	_setLevelSize() {
		this._level.setSize({
			width: this._area.width,
			height: this._area.height,
			position: this._area.position,
			baseSize: this._baseSize,
		})
	}

	_setPlayerSize() {
		this._player.setSize({
			levelPosition: this._area.position,
			baseSize: this._baseSize,
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

	getArea() {
		return this._area;
	}
}