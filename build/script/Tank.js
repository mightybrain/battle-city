class Tank {
	constructor({ stepSize, safeAreaPosition, level, bulletsStore, initialCoords, enemiesStore, eagle, playersStore, explosionsStore, assets, initialDirection, sprite, spriteInitialAnimationIndex, armor, speed, sign, state }) {
		this._stepSize = stepSize;
		this._prevStepSizeWidth = this._stepSize.width;
		this._prevStepSizeHeight = this._stepSize.height;
		this._safeAreaPosition = safeAreaPosition;
		this._prevSafeAreaPositionX = this._safeAreaPosition.x;
		this._prevSafeAreaPositionY = this._safeAreaPosition.y;
		
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
		this._ghost = true;
		this._armor = armor;
		this._speed = speed;
		this._reload = false;
		this._personalBullets = [];
		this._destroyed = false;
		this._birth = true;
		this._birthStartTimestamp = 0;
		
		this._spriteInitialAnimationIndex = spriteInitialAnimationIndex;
		this._sprite = new Sprite({
			sprite: sprite,
			framesNumber: 2,
			animationsNumber: 4,
			initialAnimationIndex: this._spriteInitialAnimationIndex,
		})

		this._birthSprite = new Sprite({
			sprite: this._assets.get('images/birth.png'),
			framesNumber: 6,
			playing: true,
			fps: 16,
		})
	}

	setSize({ initial = false } = {}) {
		this._size.width = this._stepSize.width * Tank.SIZE_SCALE_FACTOR;
		this._size.height = this._stepSize.height * Tank.SIZE_SCALE_FACTOR;

		if (initial) {
			this._position.x = this._safeAreaPosition.x + this._stepSize.width * this._initialCoords.x;
			this._position.y = this._safeAreaPosition.y + this._stepSize.height * this._initialCoords.y;
		} else {
			const coords = {
				x: (this._position.x - this._prevSafeAreaPositionX) / this._prevStepSizeWidth,
				y: (this._position.y - this._prevSafeAreaPositionY) / this._prevStepSizeHeight,
			}
			this._position.x = this._safeAreaPosition.x + this._stepSize.width * coords.x;
			this._position.y = this._safeAreaPosition.y + this._stepSize.height * coords.y;

			this._speed.x = this._speed.x / this._prevStepSizeWidth * this._stepSize.width;
			this._speed.y = this._speed.y / this._prevStepSizeHeight * this._stepSize.height;

			this._velocity.x = this._velocity.x / this._prevStepSizeWidth * this._stepSize.width;
			this._velocity.y = this._velocity.y / this._prevStepSizeHeight * this._stepSize.height;

			this._prevStepSizeWidth = this._stepSize.width;
			this._prevStepSizeHeight = this._stepSize.height;
			this._prevSafeAreaPositionX = this._safeAreaPosition.x;
			this._prevSafeAreaPositionY = this._safeAreaPosition.y;
		}
	}

	render(ctx) {
		if (this._birth) this._birthSprite.render(ctx, this._position, this._size);
		else this._sprite.render(ctx, this._position, this._size);
	}

	update(time) {
		if (!this._birthStartTimestamp) this._birthStartTimestamp = time.timestamp;
		if (this._birth && time.timestamp > this._birthStartTimestamp + Tank.BIRTH_DURATION) this._birth = false;

		if (this._birth) this._birthSprite.update(time);
		else this._sprite.update(time);

		if (this._velocity.x || this._velocity.y) {

			const [ roundedAxis, floatAxis ] = this._velocity.x ? ['y', 'x'] : ['x', 'y'];
			let position = {
				[roundedAxis]: this._roundPositionByAxis(this._position[roundedAxis], roundedAxis),
				[floatAxis]: this._position[floatAxis] + this._velocity[floatAxis] * time.delta,
			}
	
			position = this._updatePositionWithLevelEdgesCollision(position);
			position = this._updatePositionWithLevelBricksCollision(position);
			position = this._updatePositionWithEagleCollision(position);
			position = this._updatePositionWithPlayersAndEnemiesCollision(position);
			this._position = position;

		}
	}

	_roundPositionByAxis(positionByAxis, axis) {
		return axis === 'x' ? 
			Math.round((positionByAxis - this._safeAreaPosition.x) / this._stepSize.width) * this._stepSize.width + this._safeAreaPosition.x :
			Math.round((positionByAxis - this._safeAreaPosition.y) / this._stepSize.height) * this._stepSize.height + this._safeAreaPosition.y;
	}

	_updatePositionWithLevelEdgesCollision(position) {
		const levelBoundaryBox = this._level.getBoundaryBox();
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);

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
			x1: Math.floor((tankBoundaryBox.x1 - this._safeAreaPosition.x) / this._stepSize.width),
			y1: Math.floor((tankBoundaryBox.y1 - this._safeAreaPosition.y) / this._stepSize.height),
			x2: Math.ceil((tankBoundaryBox.x2 - this._safeAreaPosition.x) / this._stepSize.width),
			y2: Math.ceil((tankBoundaryBox.y2 - this._safeAreaPosition.y) / this._stepSize.height),
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

	_updatePositionWithPlayersAndEnemiesCollision(position) {
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

	_shoot() {
		if (this._reload || this._personalBullets.length >= Tank.MAX_PERSONAL_BULLETS) return;
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

		setTimeout(() => {
			this._reload = false;
		}, Tank.RELOAD_DURATION)
	}

	_move(direction) {
		if (this._destroyed) return;

		this._direction.x = direction.x;
		this._direction.y = direction.y;

		this._velocity = {
			x: this._direction.x * this._speed.x,
			y: this._direction.y * this._speed.y,
		}

		switch(direction) {
			case Tank.DIRECTIONS.up:
				this._sprite.setAnimationIndex(0);
				break;
			case Tank.DIRECTIONS.down:
				this._sprite.setAnimationIndex(1);
				break;
			case Tank.DIRECTIONS.left:
				this._sprite.setAnimationIndex(2);
				break;
			case Tank.DIRECTIONS.right:
				this._sprite.setAnimationIndex(3);
				break;
		}

		this._sprite.play();
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
			this._sprite.stop();
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
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
			centerPoint: centerPoint,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	respawn() {
		this._birthStartTimestamp = 0;
		this._birth = true;
		this._sprite.setAnimationIndex(this._spriteInitialAnimationIndex);
		this._position.x = this._safeAreaPosition.x + this._stepSize.width * this._initialCoords.x;
		this._position.y = this._safeAreaPosition.y + this._stepSize.height * this._initialCoords.y;
		this._direction.x = this._initialDirection.x;
		this._direction.y = this._initialDirection.y;
		this._destroyed = false;
	}

	clearDestroyedBullets() {
		this._personalBullets = this._personalBullets.filter(bullet => !bullet.getDestroyed());
	}

	setSprite(sprite) {
		this._sprite = sprite;
	}

	getSign() {
		return this._sign;
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

	getBirth() {
		return this._birth;
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
			this._destroyed = true;
			this._stop();
			this._addExplosion();

			this._enemiesStore.clearDestroyedEnemies();
			this._playersStore.clearDestroyedPlayers();
			return true;
		}
	}

	getDestroyed() {
		return this._destroyed;
	}
}

Tank.SIZE_SCALE_FACTOR = 4;
Tank.RELOAD_DURATION = 700;
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