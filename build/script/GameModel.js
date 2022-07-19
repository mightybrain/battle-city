class GameModel {
	constructor(ctx, width, height, levels) {
		this._ctx = ctx;
		this._width = width;
		this._height = height;
		this._levels = levels;

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

		this._currentLevelIndex = 0;
		this._currentLevelMap = null;
		this._setCurrentLevelMap();
		this._setCurrentLevelMapSize();

		this._player = null;
		this._setPlayer();
		this._setPlayerSize();

		this._movingUp = false;
		this._movingDown = false;
		this._movingRight = false;
		this._movingLeft = false;
	}

	setSize(width, height) {
		this._width = width;
		this._height = height;
		this._setBaseSize();
		this._setAreaSize();
		this._setCurrentLevelMapSize();
		this._setPlayerSize();
	}

	_setBaseSize() {
		const { _width, _height, _baseSize } = this;
		let width = _width * 0.81;
		let height = width * 0.65;

		if (height + height * 0.18 > _height) {
			height = _height * 0.85;
			width = height * 1.53;
		}	

		_baseSize.width = Math.round(width / 52);
		_baseSize.height = Math.round(height / 52);
	}

	_setAreaSize() {
		const { _width, _height, _baseSize, _area } = this;
		const width = _baseSize.width * 52;
		const height = _baseSize.height * 52;

		_area.width = width;
		_area.height = height;
		_area.position.x = Math.round((_width - width) / 2 - _baseSize.width * 2);
		_area.position.y = Math.round((_height - height) / 2);
	}

	_setCurrentLevelMap() {
		const currentLevelMap = JSON.stringify(this._levels.getLevelMap(this._currentLevelIndex));
		this._currentLevelMap = JSON.parse(currentLevelMap)
			.map(row => {
				return row.map(cell => {
					return {
						key: cell,
					}
				})
			});
	}

	_setCurrentLevelMapSize() {
		const { _baseSize, _area } = this;
		this._currentLevelMap = this._currentLevelMap.map((row, y) => {
			return row.map((cell, x) => {
				return Object.assign(cell, {
					width: _baseSize.width,
					height: _baseSize.height,
					position: {
						x: _area.position.x + _baseSize.width * x,
						y: _area.position.y + _baseSize.height * y,
					}
				})
			})
		});
	}

	_setPlayer() {
		const { _area } = this;
		const position = {
			x: 0 + _area.position.x,
			y: 0 + _area.position.y,
		}
		const width = this._baseSize.width * 4;
		const height = this._baseSize.height * 4; 
		this._player = new Tank(position, width, height);
	}

	_setPlayerSize() {
		const { _area } = this;
		const position = {
			x: 0 + _area.position.x,
			y: 0 + _area.position.y,
		}
		const width = this._baseSize.width * 4;
		const height = this._baseSize.height * 4; 
		this._player.setSize(position, width, height)
	}

	update(timestamp) {
		this._updatePlayer(timestamp);
	}

	_updatePlayer() {
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
	}

	getArea() {
		return this._area;
	}

	getCurrentLevelMap() {
		return this._currentLevelMap;
	}

	getPlayer() {
		return this._player;
	}
}