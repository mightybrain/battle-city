class Bullet {
	constructor({ tileSize, gameAreaPosition, level, position, direction, bulletsStore, enemiesStore, explosionsStore, assets, owner, eagle, playersStore, state }) {
		this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;

		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._enemiesStore = enemiesStore;
		this._explosionsStore = explosionsStore;
		this._assets = assets;
		this._state = state;
		this._owner = owner;
		this._sprite = this._assets.get('images/bullet.png')

		this._level = level;
		this._eagle = eagle;

		this._direction = {
			x: direction.x,
			y: direction.y,
		};
		this._velocity = {
			x: 0,
			y: 0,
		};
		this._position = {
			x: position.x,
			y: position.y,
		};
		this.setSize({ initial: true });

		this._status = Bullet.STATUSES[1];
	}

	setSize({ initial = false } = {}) {
		this._velocity.x = this._direction.x * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._tileSize.width;
		this._velocity.y = this._direction.y * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._tileSize.height;

		if (!initial) {
			const coords = {
				x: (this._position.x - this._prevGameAreaPositionX) / this._prevTileSizeWidth,
				y: (this._position.y - this._prevGameAreaPositionY) / this._prevTileSizeHeight,
			}
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * coords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * coords.y;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
		}
	}

	render(ctx) {
		let spriteOffset = 0;
		if (this._direction.x > 0) spriteOffset = this._sprite.width * .75;
		else if (this._direction.x < 0) spriteOffset = this._sprite.width * .5;
		else if (this._direction.y > 0) spriteOffset = this._sprite.width * .25;

		ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width * .25, this._sprite.height, this._position.x, this._position.y, this._tileSize.width, this._tileSize.height);
	}

	update({ delta }) {
		let position = {
			x: this._position.x + this._velocity.x * delta,
			y: this._position.y + this._velocity.y * delta,
		}

		const positionWithLevelEdgesCollision = this._updatePositionWithLevelEdgesCollision(position);
		if (positionWithLevelEdgesCollision !== position) {
			position = positionWithLevelEdgesCollision;
			this._addExplosion(position);
			this.destroy();
			return;
		}

		const { position: positionWithLevelBricksCollision, bricksForDestroy } = this._updatePositionWithLevelBricksCollision(position);
		if (positionWithLevelBricksCollision !== position) {
			position = positionWithLevelBricksCollision;
			this._level.destroyBricks(bricksForDestroy);
			this._addExplosion(position);
			this.destroy();
			return;
		}

		const { position: positionWithBulletsCollision, bulletForDestroy } = this._updatePositionWithBulletsCollision(position);
		if (positionWithBulletsCollision !== position) {
			position = positionWithBulletsCollision;
			bulletForDestroy.destroy();
			this.destroy();
			return;
		}

		const { position: positionWithTanksCollision, tankForDestroy } = this._updatePositionWithTanksCollision(position);
		if (positionWithTanksCollision !== position) {
			position = positionWithTanksCollision;
			const destroyed = tankForDestroy.destroy();
			if (!destroyed) this._addExplosion(position);
			if (this._owner instanceof Player && tankForDestroy instanceof Enemy && tankForDestroy.isDestroyed()) this._updatePlayerStatistics(tankForDestroy);
			this.destroy();
			return;
		}

		const positionWithEagleCollision = this._updatePositionWithEagleCollision(position);
		if (positionWithEagleCollision !== position) {
			position = positionWithEagleCollision;
			this._eagle.destroy();
			this.destroy();
			return;
		}

		this._position = position;
	}

	_getTouchPoint(position) {
		if (this._velocity.x > 0) return { x: position.x + this._tileSize.width, y: position.y + this._tileSize.height / 2 };
		else if (this._velocity.x < 0) return { x: position.x, y: position.y + this._tileSize.height / 2 };
		else if (this._velocity.y > 0) return { x: position.x + this._tileSize.width / 2, y: position.y + this._tileSize.height };
		else if (this._velocity.y < 0) return { x: position.x + this._tileSize.width / 2, y: position.y }
	}

	_addExplosion(position) {
		const type = Explosion.TYPES['small'];
		const touchPoint = this._getTouchPoint(position);
		
		const explosion = new Explosion({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: touchPoint,
			...type,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	_updatePlayerStatistics(enemy) {
		const enemySign = enemy.getSign();
		const enemyPrice = enemy.getPrice();
		const playerSign = this._owner.getSign();
		this._state.increasePlayerStatistics(playerSign, enemySign, enemyPrice);
	}

	_updatePositionWithEagleCollision(position) {		
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();
		const collision = twoAreasCollisioned(bulletBoundaryBox, eagleBoundaryBox);

		return collision ? roundPositionByObject(position, this._tileSize, this._velocity, eagleBoundaryBox) : position;
	}

	_updatePositionWithBulletsCollision(position) {
		const elemBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const bulletsWithCollision = this._bulletsStore
			.getBullets()
			.filter(bullet => {
				if (bullet === this) return false;
				if (bullet.getOwner() instanceof Enemy && this._owner instanceof Enemy) return false;

				const bulletBoundaryBox = bullet.getBoundaryBox();
				return twoAreasCollisioned(elemBoundaryBox, bulletBoundaryBox);
			})

		if (!bulletsWithCollision.length) return { position };

		const axis = this._velocity.x ? 'x' : 'y';
		const closestBullet = findClosestElem(bulletsWithCollision, this._position, axis);
		const closestBulletBoundaryBox = closestBullet.getBoundaryBox();

		return {
			position: roundPositionByObject(position, this._tileSize, this._velocity, closestBulletBoundaryBox),
			bulletForDestroy: closestBullet,
		}
	}

	_updatePositionWithTanksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const players = this._playersStore.getPlayers();
		const enemies = this._enemiesStore.getEnemies()

		const tanksWithCollision = [ ...players, ...enemies ].filter(tank => {
			if (this._owner === tank) return false;
			if (tank.isBirthing()) return false;
			if (this._owner instanceof Enemy && tank instanceof Enemy) return false;

			const tankBoundaryBox = tank.getBoundaryBox();
			return twoAreasCollisioned(bulletBoundaryBox, tankBoundaryBox);
		})

		if (!tanksWithCollision.length) return { position };

		const axis = this._velocity.x ? 'x' : 'y';
		const closestTank = findClosestElem(tanksWithCollision, this._position, axis);
		const closestTankBoundaryBox = closestTank.getBoundaryBox();

		return {
			position: roundPositionByObject(position, this._tileSize, this._velocity, closestTankBoundaryBox),
			tankForDestroy: closestTank,
		}
	}

	_updatePositionWithLevelEdgesCollision(position) {
		const levelBoundaryBox = this._level.getBoundaryBox();
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		if (bulletBoundaryBox.x2 > levelBoundaryBox.x2) return { ...position, x: levelBoundaryBox.x2 - this._tileSize.width };
		else if (bulletBoundaryBox.x1 < levelBoundaryBox.x1) return { ...position, x: levelBoundaryBox.x1 };
		else if (bulletBoundaryBox.y2 > levelBoundaryBox.y2) return { ...position, y: levelBoundaryBox.y2 - this._tileSize.height };
		else if (bulletBoundaryBox.y1 < levelBoundaryBox.y1) return { ...position, y: levelBoundaryBox.y1 };
		else return position;
	}

	_updatePositionWithLevelBricksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const coords = {
			x1: Math.floor((bulletBoundaryBox.x1 - this._gameAreaPosition.x) / this._tileSize.width),
			y1: Math.floor((bulletBoundaryBox.y1 - this._gameAreaPosition.y) / this._tileSize.height),
			x2: Math.ceil((bulletBoundaryBox.x2 - this._gameAreaPosition.x) / this._tileSize.width),
			y2: Math.ceil((bulletBoundaryBox.y2 - this._gameAreaPosition.y) / this._tileSize.height),
		}

		const bricksWithCollision = this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => {
				if (!brick || !brick.getCollideWithBullet()) return false;

				const brickBoundaryBox = brick.getRoundedBoundaryBox();
				return twoAreasCollisioned(bulletBoundaryBox, brickBoundaryBox)
			})

		if (!bricksWithCollision.length) return { position };

		const bricksForDestroy = this._findBricksForDestroy(bricksWithCollision);
		const brickBoundaryBox = bricksForDestroy[0].getRoundedBoundaryBox();

		return {
			position: roundPositionByObject(position, this._tileSize, this._velocity, brickBoundaryBox),
			bricksForDestroy,
		}
	}

	_findBricksForDestroy(bricks) {
		const axis = this._velocity.x ? 'x' : 'y';
		const closestBrick = findClosestElem(bricks, this._position, axis);
		const closestBrickCoordByAxix = closestBrick.getCoords()[axis];
		const bricksForDestroy = bricks.filter(brick => brick.getCoords()[axis] === closestBrickCoordByAxix);
		const additionalBricksForDestroy = this._findAdditionalBricksForDestroy(bricksForDestroy);
		return [ ...bricksForDestroy, ...additionalBricksForDestroy ];
	}

	_findAdditionalBricksForDestroy(bricks) {    
		const levelMap = this._level.getMap();

		return bricks.reduce((total, brick) => {
			if (!brick.getBreakByBullet()) return total;

			const coords = brick.getCoords();

			let prevBrick;
			let nextBrick;

			if (this._velocity.x) {
				prevBrick = levelMap[coords.y - 1]?.[coords.x];
				nextBrick = levelMap[coords.y + 1]?.[coords.x];
			} else {
				prevBrick = levelMap[coords.y][coords.x - 1];
				nextBrick = levelMap[coords.y][coords.x + 1];
			}

			if (prevBrick && !bricks.includes(prevBrick) && !total.includes(prevBrick)) total.push(prevBrick);
			if (nextBrick && !bricks.includes(nextBrick) && !total.includes(nextBrick)) total.push(nextBrick);

			return total;
		}, [])
	}

	isActive() {
		return this._status === Bullet.STATUSES[1];
	}

	isDestroyed() {
		return this._status === Bullet.STATUSES[2];
	}

	destroy() {
		this._status = Bullet.STATUSES[2];
		this._owner.clearDestroyedBullets();
		this._bulletsStore.clearDestroyedBullets();
	}

	getSize() {
		return this._tileSize;
	}

	getPosition() {
		return this._position;
	}

	getOwner() {
		return this._owner;
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._tileSize.width,
			y2: this._position.y + this._tileSize.height,
		}
	}
}

Bullet.SPEED_PER_SECOND_SCALE_FACTOR = 18;
Bullet.STATUSES = {
	1: 'active',
	2: 'destroyed',
}