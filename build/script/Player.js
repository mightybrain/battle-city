class Player {
	constructor({ stepSize, safeAreaPosition, level, bulletsStore, enemiesStore, eagle, playersStore, assets }) {
		this._stepSize = stepSize;
		this._prevStepSizeWidth = this._stepSize.width;
		this._prevStepSizeHeight = this._stepSize.height;
		this._safeAreaPosition = safeAreaPosition;
		this._prevSafeAreaPositionX = this._safeAreaPosition.x;
		this._prevSafeAreaPositionY = this._safeAreaPosition.y;

		this._assets = assets;
		this._level = level;
		this._bulletsStore = bulletsStore;
		this._enemiesStore = enemiesStore;
		this._playersStore = playersStore;
		this._eagle = eagle;

		this._size = {
			width: 0,
			height: 0,
		};
		this._position = {
			x: 0,
			y: 0,
		};
		this.setSize({ initial: true });

		this._velocity = {
			x: 0,
			y: 0,
		};
		this._direction = {
			x: 0,
			y: -1,
		};

		this._reload = false;
		this._personalBullets = [];

		this._sprite = this._assets.get('images/player-01.png');

		this._destroyed = false;
	}

	respawn() {
		this._direction.x = 0;
		this._direction.y = -1;
		this._velocity.x = 0;
		this._velocity.y = 0;
		this._position.x = this._safeAreaPosition.x + this._stepSize.width * Player.INITIAL_COORDS.x;
		this._position.y = this._safeAreaPosition.y + this._stepSize.height * Player.INITIAL_COORDS.y;
		this._destroyed = false;
	}

	setSize({ initial = false } = {}) {
		this._size.width = this._stepSize.width * Player.SIZE_SCALE_FACTOR;
		this._size.height = this._stepSize.height * Player.SIZE_SCALE_FACTOR;

		if (initial) {
			this._position.x = this._safeAreaPosition.x + this._stepSize.width * Player.INITIAL_COORDS.x;
			this._position.y = this._safeAreaPosition.y + this._stepSize.height * Player.INITIAL_COORDS.y;
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

			if (this._velocity.x) this._velocity.x = this._direction.x * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.width;
			if (this._velocity.y) this._velocity.y = this._direction.y * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.height;
		}
	}

	render(ctx) {
		let spriteOffset = 0;
		if (this._direction.x > 0) spriteOffset = this._sprite.width * .75;
		else if (this._direction.x < 0) spriteOffset = this._sprite.width * .5;
		else if (this._direction.y > 0) spriteOffset = this._sprite.width * .25;

		ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width * .25, this._sprite.height, this._position.x, this._position.y, this._size.width, this._size.height);
	}

	update({ delta }) {
		this._personalBullets = this._personalBullets.filter(bullet => !bullet.getDestroyed());

		if (!this._velocity.x && !this._velocity.y) return;

		let position;
		if (this._velocity.x) {
			position = {
				x: this._position.x + this._velocity.x * delta,
				y: this._roundPositionByAxis(this._position.y, 'y'),
			}
		} else {
			position = {
				x: this._roundPositionByAxis(this._position.x, 'x'),
				y: this._position.y + this._velocity.y * delta,
			}
		}
		position = this._updatePositionWithLevelEdgesCollision(position);
		position = this._updatePositionWithPlayersCollision(position);
		position = this._updatePositionWithEnemiesCollision(position);
		position = this._updatePositionWithLevelBricksCollision(position);
		position = this._updatePositionWithEagleCollision(position);
		this._position = position;
	}

	_roundPositionByAxis(positionByAxis, axis) {
		return axis === 'x' ? 
			Math.round((positionByAxis - this._safeAreaPosition.x) / this._stepSize.width) * this._stepSize.width + this._safeAreaPosition.x :
			Math.round((positionByAxis - this._safeAreaPosition.y) / this._stepSize.height) * this._stepSize.height + this._safeAreaPosition.y;
	}

	_updatePositionWithPlayersCollision(position) {
		const elemBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);

		const players = this._playersStore.getPlayers();

		const playersWithCollision = players.filter(player => {
			if (player === this) return false;
			const playerBoundaryBox = player.getRoundedBoundaryBox();
			return twoAreasCollisioned(elemBoundaryBox, playerBoundaryBox);
		})
		
		if (!playersWithCollision.length) return position;

		const axis = this._velocity.x ? 'x' : 'y';
		const closestPlayer = findClosestElem(playersWithCollision, position, axis);
		const closestPlayerBoundaryBox = closestPlayer.getRoundedBoundaryBox();


		if (!collision) return position;
		else if (this._velocity.x > 0) return { ...position, x: closestPlayerBoundaryBox.x1 - this._size.width };
		else if (this._velocity.x < 0) return { ...position, x: closestPlayerBoundaryBox.x2 };
		else if (this._velocity.y > 0) return { ...position, y: closestPlayerBoundaryBox.y1 - this._size.height };
		else if (this._velocity.y < 0) return { ...position, y: closestPlayerBoundaryBox.y2 };
	}

	_updatePositionWithEagleCollision(position) {
		const playerBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);
		
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();

		const collision = twoAreasCollisioned(playerBoundaryBox, eagleBoundaryBox);

		if (!collision) return position;
		if (this._velocity.x > 0) return { ...position, x: eagleBoundaryBox.x1 - this._size.width };
		else if (this._velocity.x < 0) return { ...position, x: eagleBoundaryBox.x2 };
		else if (this._velocity.y > 0) return { ...position, y: eagleBoundaryBox.y1 - this._size.height };
		else if (this._velocity.y < 0) return { ...position, y: eagleBoundaryBox.y2 };
	}

	_updatePositionWithEnemiesCollision(position) {
		const enemies = this._enemiesStore.getEnemies();
		
		const playerBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);

		const enemiesWithCollision = enemies.filter(enemy => {
			const enemyBoundaryBox = enemy.getRoundedBoundaryBox();
			return twoAreasCollisioned(playerBoundaryBox, enemyBoundaryBox);
		})

		if (!enemiesWithCollision.length) return position;

		const axis = this._velocity.x ? 'x' : 'y';
		const closestEnemy = findClosestElem(enemiesWithCollision, position, axis);
		const closestEnemyBoundaryBox = closestEnemy.getRoundedBoundaryBox();

		if (this._velocity.x > 0) return { ...position, x: closestEnemyBoundaryBox.x1 - this._size.width };
		else if (this._velocity.x < 0) return { ...position, x: closestEnemyBoundaryBox.x2 };
		else if (this._velocity.y > 0) return { ...position, y: closestEnemyBoundaryBox.y1 - this._size.height };
		else if (this._velocity.y < 0) return { ...position, y: closestEnemyBoundaryBox.y2 };
	}

	_updatePositionWithLevelEdgesCollision(position) {
		const { width: levelWidth, height: levelHeight } = this._level.getMapSize();

		if (position.x + this._size.width > this._safeAreaPosition.x + levelWidth) {
			return { ...position, x: this._safeAreaPosition.x + levelWidth - this._size.width };
		} else if (position.x < this._safeAreaPosition.x) {
			return { ...position, x: this._safeAreaPosition.x };
		} else if (position.y + this._size.height > this._safeAreaPosition.y + levelHeight) {
			return { ...position, y: this._safeAreaPosition.y + levelHeight - this._size.height };
		} else if (position.y < this._safeAreaPosition.y) {
			return { ...position, y: this._safeAreaPosition.y };
		} else return position;
	}

	_updatePositionWithLevelBricksCollision(position) {
		const playerBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);

		const coords = {
			x1: Math.floor((playerBoundaryBox.x1 - this._safeAreaPosition.x) / this._stepSize.width),
			y1: Math.floor((playerBoundaryBox.y1 - this._safeAreaPosition.y) / this._stepSize.height),
			x2: Math.ceil((playerBoundaryBox.x2 - this._safeAreaPosition.x) / this._stepSize.width),
			y2: Math.ceil((playerBoundaryBox.y2 - this._safeAreaPosition.y) / this._stepSize.height),
		}

		const bricksWithCollision = this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => !brick || !brick.getCollideWithTank() ? false : twoAreasCollisioned(playerBoundaryBox, brick.getRoundedBoundaryBox()))

		if (!bricksWithCollision.length) return position;

		const axis = this._velocity.x ? 'x' : 'y';
		const closestBrick = findClosestElem(bricksWithCollision, position, axis);
		const closestBrickBoundaryBox = closestBrick.getRoundedBoundaryBox();

		if (this._velocity.x > 0) return { ...position, x: closestBrickBoundaryBox.x1 - this._size.width };
		else if (this._velocity.x < 0) return { ...position, x: closestBrickBoundaryBox.x2 };
		else if (this._velocity.y > 0) return { ...position, y: closestBrickBoundaryBox.y1 - this._size.height };
		else if (this._velocity.y < 0) return { ...position, y: closestBrickBoundaryBox.y2 };
	}

	_shoot() {
		if (this._reload || this._personalBullets.length >= Player.MAX_PERSONAL_BULLETS) return;
		this._reload = true;

		const bulletWidth = this._stepSize.width;
		const bulletHeight = this._stepSize.height;
		
		let bulletPosition; 
		if (this._direction.x) {
			bulletPosition = { 
				x: this._direction.x > 0 ? this._position.x + this._size.width - bulletWidth : this._position.x, 
				y: this._position.y + this._size.height / 2 - bulletHeight / 2,
			};
		} else {
			bulletPosition = { 
				x: this._position.x + this._size.width / 2 - bulletWidth / 2,
				y: this._direction.y > 0 ? this._position.y + this._size.height - bulletHeight : this._position.y,
			};
		}

		const bullet = new Bullet({
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			level: this._level,
			position: bulletPosition,
			direction: {
				x: this._direction.x,
				y: this._direction.y,
			},
			owner: this,
			playersStore: this._playersStore,
			enemiesStore: this._enemiesStore,
			bulletsStore: this._bulletsStore,
			eagle: this._eagle,
			assets: this._assets,
		})
		this._bulletsStore.addBullet(bullet);
		this._personalBullets.push(bullet);

		setTimeout(() => {
			this._reload = false;
		}, Player.RELOAD_DELAY)
	}

	getSizeAndPosition() {
		return {
			size: this._size,
			position: this._position,
		}
	}

	getPosition() {
		return this._position;
	}

	getSize() {
		return this._size;
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._size.width,
			y2: this._position.y + this._size.height,
		}
	}

	getRoundedBoundaryBox() {
		const coords = {
			x: (this._position.x - this._safeAreaPosition.x) / this._stepSize.width,
			y: (this._position.y - this._safeAreaPosition.y) / this._stepSize.height,
		}
		return {
			x1: this._safeAreaPosition.x + Math.floor(coords.x) * this._stepSize.width,
			y1: this._safeAreaPosition.y + Math.floor(coords.y) * this._stepSize.height,
			x2: this._safeAreaPosition.x + Math.ceil(coords.x) * this._stepSize.width + this._size.width,
			y2: this._safeAreaPosition.y + Math.ceil(coords.y) * this._stepSize.height + this._size.height,
		}
	}

	getDestroyed() {
		return this._destroyed;
	}

	destroy() {
		this._destroyed = true;
	}

	handleKeyDown(code) {
		if (this._destroyed) return;

		if (code === Player.SHOOT_EVENT) this._shoot();

		if (Player.MOVE_EVENTS.includes(code)) {
			switch (code) {
				case 'ArrowUp':
					this._direction.x = 0;
					this._direction.y = -1;
					break;
				case 'ArrowDown':
					this._direction.x = 0;
					this._direction.y = 1;
					break;
				case 'ArrowRight':
					this._direction.x = 1;
					this._direction.y = 0;
					break;
				case 'ArrowLeft':
					this._direction.x = -1;
					this._direction.y = 0;
					break;
			}

			this._velocity = {
				x: this._direction.x * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.width,
				y: this._direction.y * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.height,
			}
		}
	}

	handleKeyUp(code) {    
		if (this._destroyed) return;

		if (Player.MOVE_EVENTS.includes(code)) {
			const mustStop = 
				(code === 'ArrowUp' && this._velocity.y < 0) ||
				(code === 'ArrowDown' && this._velocity.y > 0) ||
				(code === 'ArrowRight' && this._velocity.x > 0) ||
				(code === 'ArrowLeft' && this._velocity.x < 0);
			if (mustStop) this._velocity = { x: 0, y: 0 }
		};
	}
}

Player.SIZE_SCALE_FACTOR = 4;
Player.INITIAL_COORDS = {
	x: 18,
	y: 48,
}
Player.SPEED_PER_SECOND_SCALE_FACTOR = 6;
Player.RELOAD_DELAY = 700;
Player.MAX_PERSONAL_BULLETS = 1;
Player.MOVE_EVENTS = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
Player.SHOOT_EVENT = 'Space';