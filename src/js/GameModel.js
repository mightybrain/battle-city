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
			position: {
				x: 0,
				y: 0,
			},
			width: 0,
			height: 0
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

		this._player = new Tank({
			position: { x: 0, y: 0 },
			baseSize: this._baseSize,
			levelPosition: this._area.position,
		});
	}

	update(timestamp) {

	}

	setSize(width, height) {
		this._width = width;
		this._height = height;
		this._setBaseSize();
		this._setAreaSize();
		this._setLevelSize();
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

	/*_updatePlayer() {
		const { _area, _movingUp, _movingDown, _movingRight, _movingLeft, _player } = this;
		const { position: playerPosition, width: playerWidth, height: playerHeight } = _player.getTank();

		if (_movingUp && _area.position.y < playerPosition.y) {
			_player.setPosition({
				x: playerPosition.x,
				y: playerPosition.y - 1,
			})
		} else if (_movingDown && _area.position.y + _area.height > playerPosition.y + playerHeight) {
			_player.setPosition({
				x: playerPosition.x,
				y: playerPosition.y + 1,
			})
		} else if (_movingRight && _area.position.x + _area.width > playerPosition.x + playerWidth) {
			_player.setPosition({
				x: playerPosition.x + 1,
				y: playerPosition.y,
			})
		} else if (_movingLeft && _area.position.x < playerPosition.x) {
			_player.setPosition({
				x: playerPosition.x - 1,
				y: playerPosition.y,
			})			
		}
	}

	handleKeyDown(event) {
		this._movingUp = false;
		this._movingDown = false;
		this._movingRight = false;
		this._movingLeft = false;

		switch (event.key) {
			case 'ArrowUp':
				this._movingUp = true;
				break;
			case 'ArrowDown':
				this._movingDown = true;
				break;
			case 'ArrowRight':
				this._movingRight = true;
				break;
			case 'ArrowLeft':
				this._movingLeft = true;
				break;
		}
	}

	handleKeyUp(event) {
		switch (event.key) {
			case 'ArrowUp':
				this._movingUp = false;
				break;
			case 'ArrowDown':
				this._movingDown = false;
				break;
			case 'ArrowRight':
				this._movingRight = false;
				break;
			case 'ArrowLeft':
				this._movingLeft = false;
				break;
		}
	}*/

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
