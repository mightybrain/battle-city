class Tank {
	constructor({ tileSize, gameAreaPosition, playersStore, enemiesStore, bulletsStore, explosionsStore, level, eagle, assets, state, initialCoords,  initialDirection, sign, armor, speed, moveSprite, moveSpriteInitialAnimationIndex }) {
		this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;
		
		this._playersStore = playersStore;
		this._enemiesStore = enemiesStore;
		this._bulletsStore = bulletsStore;
		this._explosionsStore = explosionsStore;
		this._level = level;
		this._eagle = eagle;
		this._assets = assets;
		this._state = state;

		this._initialCoords = initialCoords;
		this._initialDirection = initialDirection;
		this._direction = {
			x: initialDirection.x,
			y: initialDirection.y,
		};

		this._speed = speed;

		this._size = {
			width: 0,
			height: 0,
		};
		this._position = {
			x: 0,
			y: 0,
		};
		this._velocity = {
			x: 0,
			y: 0,
		};
		this.setSize({ initial: true });

		this._sign = sign;
		this._armor = armor;
		this._ghost = true;
		this._personalBullets = [];

		this._status = Tank.STATUSES[1];
		
		this._moveSprite = new Sprite({
			sprite: this._assets.get(moveSprite),
			framesNumber: 2,
			animationsNumber: 4,
			initialAnimationIndex: moveSpriteInitialAnimationIndex,
		})

		this._birthSprite = new Sprite({
			sprite: this._assets.get('images/birth.png'),
			framesNumber: 6,
			playing: true,
			fps: 16,
		})

		this._birthStartTime = 0;
		this._startReloadingTime = 0;
	}

	setSize({ initial = false } = {}) {
		this._size.width = this._tileSize.width * Tank.SIZE_SCALE_FACTOR;
		this._size.height = this._tileSize.height * Tank.SIZE_SCALE_FACTOR;

		if (initial) {
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * this._initialCoords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * this._initialCoords.y;
		} else {
			const coords = {
				x: (this._position.x - this._prevGameAreaPositionX) / this._prevTileSizeWidth,
				y: (this._position.y - this._prevGameAreaPositionY) / this._prevTileSizeHeight,
			}
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * coords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * coords.y;

			this._speed.x = this._speed.x / this._prevTileSizeWidth * this._tileSize.width;
			this._speed.y = this._speed.y / this._prevTileSizeHeight * this._tileSize.height;

			this._velocity.x = this._velocity.x / this._prevTileSizeWidth * this._tileSize.width;
			this._velocity.y = this._velocity.y / this._prevTileSizeHeight * this._tileSize.height;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
		}
	}

	render(ctx) {
		if (this.isBirthing()) this._birthSprite.render(ctx, this._position, this._size);
		else if (this.isActive()) this._moveSprite.render(ctx, this._position, this._size);
	}

	update(time) {
		if (this.isBirthing()) this._updateBirth(time);
		else if (this.isActive()) this._updateActive(time);
	}

	_updateBirth(time) {
		if (!this._birthStartTime) this._birthStartTime = time.timestamp;
		else if (time.timestamp > this._birthStartTime + Tank.BIRTH_DURATION) this._status = Tank.STATUSES[2];
		else this._birthSprite.update(time);
	}

	_updateActive(time) {
		if (this._velocity.x || this._velocity.y) {
			const [ roundedAxis, floatAxis ] = this._velocity.x ? ['y', 'x'] : ['x', 'y'];
			let position = {
				[roundedAxis]: this._roundPositionByAxis(this._position[roundedAxis], roundedAxis),
				[floatAxis]: this._position[floatAxis] + this._velocity[floatAxis] * time.delta,
			}
	
			position = this._updatePositionWithLevelEdgesCollision(position);
			position = this._updatePositionWithLevelBricksCollision(position);
			position = this._updatePositionWithEagleCollision(position);
			position = this._updatePositionWithTanksCollision(position);
			this._position = position;
		}

		this._moveSprite.update(time);
	}

	_roundPositionByAxis(positionByAxis, axis) {
		return axis === 'x' ? 
			Math.round((positionByAxis - this._gameAreaPosition.x) / this._tileSize.width) * this._tileSize.width + this._gameAreaPosition.x :
			Math.round((positionByAxis - this._gameAreaPosition.y) / this._tileSize.height) * this._tileSize.height + this._gameAreaPosition.y;
	}

	_updatePositionWithLevelEdgesCollision(position, velocity) {
		const levelBoundaryBox = this._level.getBoundaryBox();
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(velocity || this._velocity, this._position, position, this._size);

		if (tankBoundaryBox.x2 > levelBoundaryBox.x2) return { ...position, x: levelBoundaryBox.x2 - this._size.width };
		else if (tankBoundaryBox.x1 < levelBoundaryBox.x1) return { ...position, x: levelBoundaryBox.x1 };
		else if (tankBoundaryBox.y2 > levelBoundaryBox.y2) return { ...position, y: levelBoundaryBox.y2 - this._size.height };
		else if (tankBoundaryBox.y1 < levelBoundaryBox.y1) return { ...position, y: levelBoundaryBox.y1 };
		else return position;
	}

	_updatePositionWithEagleCollision(position) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();
		const collision = twoAreasCollisioned(tankBoundaryBox, eagleBoundaryBox);

		return collision ? roundPositionByObject(position, this._size, this._velocity, eagleBoundaryBox) : position;
	}

	_updatePositionWithLevelBricksCollision(position) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);

		const coords = {
			x1: Math.floor((tankBoundaryBox.x1 - this._gameAreaPosition.x) / this._tileSize.width),
			y1: Math.floor((tankBoundaryBox.y1 - this._gameAreaPosition.y) / this._tileSize.height),
			x2: Math.ceil((tankBoundaryBox.x2 - this._gameAreaPosition.x) / this._tileSize.width),
			y2: Math.ceil((tankBoundaryBox.y2 - this._gameAreaPosition.y) / this._tileSize.height),
		}

		const bricksWithCollision = this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => {
				if (!brick || !brick.getCollideWithTank()) return false;

				const brickBoundaryBox = brick.getRoundedBoundaryBox();
				return twoAreasCollisioned(tankBoundaryBox, brickBoundaryBox)
			})

		if (!bricksWithCollision.length) return position;

		const axis = this._velocity.x ? 'x' : 'y';
		const closestBrick = findClosestElem(bricksWithCollision, this._position, axis);
		const closestBrickBoundaryBox = closestBrick.getRoundedBoundaryBox();

		return roundPositionByObject(position, this._size, this._velocity, closestBrickBoundaryBox);
	}

	_updatePositionWithTanksCollision(position) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);
		
		const enemies = this._enemiesStore.getEnemies();
		const players = this._playersStore.getPlayers();

		const itemsWithCollision = [ ...enemies, ...players ].filter(item => {
			if (item === this) return false;

			const itemBoundaryBox = item.getRoundedBoundaryBox();
			return twoAreasCollisioned(tankBoundaryBox, itemBoundaryBox);
		})

		if (!itemsWithCollision.length || !itemsWithCollision.find(item => !item.getGhost())) {	
			this._ghost = false;
			return position;
		} else if (this._ghost) {
			return position;
		};

		const axis = this._velocity.x ? 'x' : 'y';
		const closestItem = findClosestElem(itemsWithCollision.filter(item => !item.getGhost()), this._position, axis);
		const closestItemBoundaryBox = closestItem.getRoundedBoundaryBox();

		return roundPositionByObject(position, this._size, this._velocity, closestItemBoundaryBox);
	}

	_shoot(timestamp) {
		if ((this._startReloadingTime && this._startReloadingTime + Tank.RELOADING_DURATION > timestamp) || this._personalBullets.length >= Tank.MAX_PERSONAL_BULLETS) return;

		const bulletWidth = this._tileSize.width;
		const bulletHeight = this._tileSize.height;
		
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
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			level: this._level,
			position: bulletPosition,
			direction: { x: this._direction.x, y: this._direction.y },
			owner: this,
			playersStore: this._playersStore,
			enemiesStore: this._enemiesStore,
			bulletsStore: this._bulletsStore,
			explosionsStore: this._explosionsStore,
			state: this._state,
			eagle: this._eagle,
			assets: this._assets,
		})

		this._bulletsStore.addBullet(bullet);
		this._personalBullets.push(bullet);

		this._startReloadingTime = timestamp;
	}

	_move(direction) {
		this._direction.x = direction.x;
		this._direction.y = direction.y;

		this._velocity = {
			x: this._direction.x * this._speed.x,
			y: this._direction.y * this._speed.y,
		}

		switch(direction) {
			case Tank.DIRECTIONS.up:
				this._moveSprite.setAnimationIndex(0);
				break;
			case Tank.DIRECTIONS.down:
				this._moveSprite.setAnimationIndex(1);
				break;
			case Tank.DIRECTIONS.left:
				this._moveSprite.setAnimationIndex(2);
				break;
			case Tank.DIRECTIONS.right:
				this._moveSprite.setAnimationIndex(3);
				break;
		}

		this._moveSprite.play();
	}

	_stop(direction) {
		let mustStop = false;

		if (!direction) {
			mustStop = true;
		} else {
			mustStop =
				(direction === Tank.DIRECTIONS.up && this._velocity.y < 0) ||
				(direction === Tank.DIRECTIONS.down && this._velocity.y > 0) ||
				(direction === Tank.DIRECTIONS.right && this._velocity.x > 0) ||
				(direction === Tank.DIRECTIONS.left && this._velocity.x < 0);
		}

		if (mustStop) {
			this._velocity = { x: 0, y: 0 };
			this._moveSprite.stop();
		}
	}

	_addExplosion() {
		const type = Explosion.TYPES['large'];
		const centerPoint = {
			x: this._position.x + this._size.width / 2,
			y: this._position.y + this._size.height / 2,
		}
		
		const explosion = new Explosion({
			...type,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: centerPoint,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	respawn() {
		this._birthStartTime = 0;
		this._status = Tank.STATUSES[1];
		this._moveSprite.resetAnimation();

		this._position.x = this._gameAreaPosition.x + this._tileSize.width * this._initialCoords.x;
		this._position.y = this._gameAreaPosition.y + this._tileSize.height * this._initialCoords.y;
		this._direction.x = this._initialDirection.x;
		this._direction.y = this._initialDirection.y;
	}

	clearDestroyedBullets() {
		this._personalBullets = this._personalBullets.filter(bullet => !bullet.isDestroyed());
	}

	getSign() {
		return this._sign;
	}

	getRoundedBoundaryBox() {
		const coords = {
			x: (this._position.x - this._gameAreaPosition.x) / this._tileSize.width,
			y: (this._position.y - this._gameAreaPosition.y) / this._tileSize.height,
		}
		return {
			x1: this._gameAreaPosition.x + Math.floor(coords.x) * this._tileSize.width,
			y1: this._gameAreaPosition.y + Math.floor(coords.y) * this._tileSize.height,
			x2: this._gameAreaPosition.x + Math.ceil(coords.x) * this._tileSize.width + this._size.width,
			y2: this._gameAreaPosition.y + Math.ceil(coords.y) * this._tileSize.height + this._size.height,
		}
	}

	getGhost() {
		return this._ghost;
	}

	getPosition() {
		return this._position;
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._size.width,
			y2: this._position.y + this._size.height,
		}
	}

	destroy() {
		if (this._armor) {
			this._armor -= 1;
			return false;
		} else {
			this._status = Tank.STATUSES[3];
			this._stop();
			this._addExplosion();
			this._enemiesStore.clearDestroyedEnemies();
			this._playersStore.clearDestroyedPlayers();
			return true;
		}
	}

	isBirthing() {
		return this._status === Tank.STATUSES[1];
	}

	isActive() {
		return this._status === Tank.STATUSES[2];
	}

	isDestroyed() {
		return this._status === Tank.STATUSES[3];
	}
}

Tank.STATUSES = {
	1: 'birthing',
	2: 'active',
	3: 'destroyed',
}
Tank.SIZE_SCALE_FACTOR = 4;
Tank.RELOADING_DURATION = 700;
Tank.BIRTH_DURATION = 1200;
Tank.MAX_PERSONAL_BULLETS = 1;
Tank.DIRECTIONS = {
	up: {
		x: 0,
		y: -1,
	},
	down: {
		x: 0,
		y: 1,
	},
	right: {
		x: 1,
		y: 0,
	},
	left: {
		x: -1,
		y: 0,
	},
}