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

		this._checkAndHandleCollisions(position);

		if (!this.isDestroyed()) this._position = position;
	}

	_getTouchPoint(position) {
		if (this._velocity.x > 0) return { x: position.x + this._tileSize.width, y: position.y + this._tileSize.height / 2 };
		else if (this._velocity.x < 0) return { x: position.x, y: position.y + this._tileSize.height / 2 };
		else if (this._velocity.y > 0) return { x: position.x + this._tileSize.width / 2, y: position.y + this._tileSize.height };
		else if (this._velocity.y < 0) return { x: position.x + this._tileSize.width / 2, y: position.y }
	}

	_addExplosion(position) {
		const explosion = new SmallExplosion({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: this._getTouchPoint(position),
			explosionsStore: this._explosionsStore,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	_updatePlayerStatistics(enemy) {
		const enemySign = enemy.getSign();
		const enemyPrice = enemy.getPrice();
		const playerSign = this._owner.getSign();
		this._state.increasePlayerStatistics(playerSign, enemySign, enemyPrice);
	}

	_checkAndHandleCollisions(position) {
		const bulletsWithCollision = this._findBulletsCollision(position);
		const tanksWithCollision = this._findTanksCollision(position);
		const eagleWithCollision = this._findEagleCollision(position);
		const levelBricksCollision = this._findLevelBricksCollision(position);

		if (bulletsWithCollision.length || tanksWithCollision.length || eagleWithCollision.length || levelBricksCollision.length) {
			this._handleObjectsCollision(position, bulletsWithCollision, tanksWithCollision, eagleWithCollision, levelBricksCollision);
		} else {
			this._checkAndHandleLevelEdgesCollision(position);
		}
	}

	_findBulletsCollision(position) {
		const elemBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		return this._bulletsStore
			.getBullets()
			.filter(bullet => {
				if (bullet === this) return false;
				if (bullet.getOwner() instanceof Enemy && this._owner instanceof Enemy) return false;

				const bulletBoundaryBox = bullet.getBoundaryBox();
				return twoAreasCollisioned(elemBoundaryBox, bulletBoundaryBox);
			})
	}

	_findTanksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const players = this._playersStore.getPlayers();
		const enemies = this._enemiesStore.getEnemies()

		return [ ...players, ...enemies ].filter(tank => {
			if (tank === this._owner) return false;
			if (tank.isBirthing()) return false;
			if (this._owner instanceof Enemy && tank instanceof Enemy) return false;

			const tankBoundaryBox = tank.getBoundaryBox();
			return twoAreasCollisioned(bulletBoundaryBox, tankBoundaryBox);
		})
	}

	_findEagleCollision(position) {		
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();
		const collision = twoAreasCollisioned(bulletBoundaryBox, eagleBoundaryBox);

		return collision ? [this._eagle] : [];
	}

	_findLevelBricksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const coords = {
			x1: Math.floor((bulletBoundaryBox.x1 - this._gameAreaPosition.x) / this._tileSize.width),
			y1: Math.floor((bulletBoundaryBox.y1 - this._gameAreaPosition.y) / this._tileSize.height),
			x2: Math.ceil((bulletBoundaryBox.x2 - this._gameAreaPosition.x) / this._tileSize.width),
			y2: Math.ceil((bulletBoundaryBox.y2 - this._gameAreaPosition.y) / this._tileSize.height),
		}

		return this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => {
				if (!brick || !brick.isCollideWithBullet()) return false;

				const brickBoundaryBox = brick.getBoundaryBox();
				return twoAreasCollisioned(bulletBoundaryBox, brickBoundaryBox)
			})
	}

	_checkAndHandleLevelEdgesCollision(position) {
		const levelBoundaryBox = this._level.getBoundaryBox();
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		let positionWithCollision = null;

		if (bulletBoundaryBox.x2 > levelBoundaryBox.x2) positionWithCollision = { ...position, x: levelBoundaryBox.x2 - this._tileSize.width };
		else if (bulletBoundaryBox.x1 < levelBoundaryBox.x1) positionWithCollision = { ...position, x: levelBoundaryBox.x1 };
		else if (bulletBoundaryBox.y2 > levelBoundaryBox.y2) positionWithCollision = { ...position, y: levelBoundaryBox.y2 - this._tileSize.height };
		else if (bulletBoundaryBox.y1 < levelBoundaryBox.y1) positionWithCollision = { ...position, y: levelBoundaryBox.y1 };

		if (positionWithCollision) {
			this._position = positionWithCollision;
			this._addExplosion(positionWithCollision);
			this.destroy();
		}
	}

	_handleObjectsCollision(position, bullets, tanks, eagle, levelBricks) {
		const objectsWithCollisions = [...bullets, ...tanks, ...eagle, ...levelBricks];

		const axis = this._velocity.x ? 'x' : 'y';
		const closestObject = findClosestElem(objectsWithCollisions, this._position, axis);

		if (closestObject instanceof Bullet) this._handleBulletCollision(position, closestObject);
		else if (closestObject instanceof Tank) this._handleTanksCollision(position, closestObject);
		else if (closestObject instanceof Brick) this._handleLevelBricksCollision(position, levelBricks);
		else this._handleEagleCollision(position, closestObject);
	}

	_handleEagleCollision(position, eagle) {
		const eagleBoundaryBox = eagle.getRoundedBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, eagleBoundaryBox);
		this._eagle.destroy();
		this.destroy();
	}

	_handleBulletCollision(position, bullet) {
		const bulletBoundaryBox = bullet.getBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, bulletBoundaryBox);
		bullet.destroy();
		this.destroy();
	}

	_handleTanksCollision(position, tank) {
		const tankBoundaryBox = tank.getBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, tankBoundaryBox);
		
		const destroyed = tank.handleHit();
		if (!destroyed) this._addExplosion(position);
		else if (this._owner instanceof Player) this._updatePlayerStatistics(tank);
		this.destroy();
	}

	_handleLevelBricksCollision(position, bricks) {
		const bricksForDestroy = this._findBricksForDestroy(bricks);
		const brickBoundaryBox = bricksForDestroy[0].getBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, brickBoundaryBox);
		this._level.destroyBricks(bricksForDestroy.filter(brick => brick.isBreakByBullet()));
		this._addExplosion(position);
		this.destroy();
	}

	_findBricksForDestroy(bricks) {
		const axis = this._velocity.x ? 'x' : 'y';
		const closestBrick = findClosestElem(bricks, this._position, axis);
		const closestBrickCoordByAxis = closestBrick.getCoords()[axis];
		const bricksForDestroy = bricks.filter(brick => brick.getCoords()[axis] === closestBrickCoordByAxis);
		const additionalBricksForDestroy = this._findAdditionalBricksForDestroy(bricksForDestroy);
		return [...bricksForDestroy, ...additionalBricksForDestroy];
	}

	_findAdditionalBricksForDestroy(bricks) {    
		const levelMap = this._level.getMap();

		return bricks.reduce((total, brick) => {
			if (!brick.isBreakByBullet()) return total;

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
		this._bulletsStore.setHasDestroyedBullets(true);
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