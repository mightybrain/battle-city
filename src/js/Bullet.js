class Bullet {
	constructor({ stepSize, safeAreaPosition, level, position, direction, bulletsStore, enemiesStore, assets, owner, eagle, playersStore }) {
		this._stepSize = stepSize;
		this._prevStepSizeWidth = this._stepSize.width;
		this._prevStepSizeHeight = this._stepSize.height;
		this._safeAreaPosition = safeAreaPosition;
		this._prevSafeAreaPositionX = this._safeAreaPosition.x;
		this._prevSafeAreaPositionY = this._safeAreaPosition.y;

		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._enemiesStore = enemiesStore;
		this._assets = assets;
		this._owner = owner;

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

		this._destroyed = false;
	}

	setSize({ initial = false } = {}) {
		this._velocity.x = this._direction.x * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.width;
		this._velocity.y = this._direction.y * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.height;

		if (!initial) {
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
		}
	}

	render(ctx) {
		ctx.fillStyle = 'white';
		ctx.fillRect(this._position.x, this._position.y, this._stepSize.width, this._stepSize.height);
	}

	update({ delta }) {
		let position = {
			x: this._position.x + this._velocity.x * delta,
			y: this._position.y + this._velocity.y * delta,
		}

		const positionWithLevelEdgesCollision = this._updatePositionWithLevelEdgesCollision(position);
		if (positionWithLevelEdgesCollision !== position) {
			position = positionWithLevelEdgesCollision;
			this.destroy();
			return;
		}

		const { position: positionWithLevelBricksCollision, bricksForDestroy } = this._updatePositionWithLevelBricksCollision(position);
		if (positionWithLevelBricksCollision !== position) {
			position = positionWithLevelBricksCollision;
			this.destroy();
			this._level.destroyBricks(bricksForDestroy);
			return;
		}

		const { position: positionWithBulletsCollision, bulletForDestroy } = this._updatePositionWithBulletsCollision(position);
		if (positionWithBulletsCollision !== position) {
			position = positionWithBulletsCollision;
			this.destroy();
			bulletForDestroy.destroy();
			return;
		}

		const { position: positionWithEnemiesCollision, enemyForDestroy } = this._updatePositionWithEnemiesCollision(position);
		if (positionWithEnemiesCollision !== position) {
			position = positionWithEnemiesCollision;
			this.destroy();
			enemyForDestroy.destroy();
			return;
		}

		const { position: positionWithPlayersCollision, playerForDestroy } = this._updatePositionWithPlayersCollision(position);
		if (positionWithPlayersCollision !== position) {
			position = positionWithPlayersCollision;
			this.destroy();
			playerForDestroy.destroy();
			return;
		}

		const positionWithEagleCollision = this._updatePositionWithEagleCollision(position);
		if (positionWithEagleCollision !== position) {
			position = positionWithEagleCollision;
			this.destroy();
			this._eagle.destroy();
			return;
		}

		this._position = position;
	}

	_updatePositionWithEagleCollision(position) {
		if (this._eagle.getDestroyed()) return position;
		
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._stepSize);
		
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();

		const collision = twoAreasCollisioned(bulletBoundaryBox, eagleBoundaryBox);

		if (!collision) return position;
		if (this._velocity.x > 0) return { ...position, x: eagleBoundaryBox.x1 - this._stepSize.width };
		else if (this._velocity.x < 0) return { ...position, x: eagleBoundaryBox.x2 };
		else if (this._velocity.y > 0) return { ...position, y: eagleBoundaryBox.y1 - this._stepSize.height };
		else if (this._velocity.y < 0) return { ...position, y: eagleBoundaryBox.y2 };
	}

	_updatePositionWithPlayersCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._stepSize);

		const players = this._playersStore.getPlayers();

		const playersWithCollision = players.filter(player => {
			if (this._owner === player) return false;

			const playerBoundaryBox = player.getBoundaryBox();
			return twoAreasCollisioned(bulletBoundaryBox, playerBoundaryBox);
		})

		if (!playersWithCollision.length) return { position };

		const axis = this._velocity.x ? 'x' : 'y';
		const closestPlayer = findClosestElem(playersWithCollision, position, axis);
		const closestPlayerBoundaryBox = closestPlayer.getBoundaryBox();

		if (this._velocity.x > 0) {
			return { 
				position: { ...position, x: closestPlayerBoundaryBox.x1 - this._stepSize.width },
				playerForDestroy: closestPlayer,
			}
		} else if (this._velocity.x < 0) {
			return { 
				position: { ...position, x: closestPlayerBoundaryBox.x2 },
				playerForDestroy: closestPlayer,
			}
		} else if (this._velocity.y > 0) {
			return {
				position: { ...position, y: closestPlayerBoundaryBox.y1 - this._stepSize.height },
				playerForDestroy: closestPlayer,
			}
		} else if (this._velocity.y < 0) {
			return {
				position: { ...position, y: closestPlayerBoundaryBox.y2 },
				playerForDestroy: closestPlayer,
			}
		};
	}

	_updatePositionWithBulletsCollision(position) {
		const elemBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._stepSize);

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
		const closestBullet = findClosestElem(bulletsWithCollision, position, axis);
		const closestBulletBoundaryBox = closestBullet.getBoundaryBox();

		if (this._velocity.x > 0) {
			return { 
				position: { ...position, x: closestBulletBoundaryBox.x1 - this._stepSize.width },
				bulletForDestroy: closestBullet,
			}
		} else if (this._velocity.x < 0) {
			return {
				position: { ...position, x: closestBulletBoundaryBox.x2 },
				bulletForDestroy: closestBullet,
			}
		} else if (this._velocity.y > 0) {
			return {
				position: { ...position, y: closestBulletBoundaryBox.y1 - this._stepSize.height },
				bulletForDestroy: closestBullet,
			}
		} else if (this._velocity.y < 0) {
			return {
				position: { ...position, y: closestBulletBoundaryBox.y2 },
				bulletForDestroy: closestBullet,
			}
		}
	}

	_updatePositionWithEnemiesCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._stepSize);

		const enemiesWithCollision = this._enemiesStore
			.getEnemies()
			.filter(enemy => {
				if (this._owner instanceof Enemy) return false;

				const enemyBoundaryBox = enemy.getBoundaryBox();

				return twoAreasCollisioned(bulletBoundaryBox, enemyBoundaryBox)
			})

		if (!enemiesWithCollision.length) return { position };

		const axis = this._velocity.x ? 'x' : 'y';
		const closestEnemy = findClosestElem(enemiesWithCollision, position, axis);
		const closestEnemyBoundaryBox = closestEnemy.getBoundaryBox();

		if (this._velocity.x > 0) {
			return { 
				position: { ...position, x: closestEnemyBoundaryBox.x1 - this._stepSize.width },
				enemyForDestroy: closestEnemy,
			}
		} else if (this._velocity.x < 0) {
			return {
				position: { ...position, x: closestEnemyBoundaryBox.x2 },
				enemyForDestroy: closestEnemy,
			}
		} else if (this._velocity.y > 0) {
			return {
				position: { ...position, y: closestEnemyBoundaryBox.y1 - this._stepSize.height },
				enemyForDestroy: closestEnemy,
			}
		} else if (this._velocity.y < 0) {
			return {
				position: { ...position, y: closestEnemyBoundaryBox.y2 },
				enemyForDestroy: closestEnemy,
			}
		}
	}

	_updatePositionWithLevelEdgesCollision(position) {
		const { width: levelWidth, height: levelHeight } = this._level.getMapSize();

		if (position.x + this._stepSize.width > this._safeAreaPosition.x + levelWidth) {
			return { ...position, x: this._safeAreaPosition.x + levelWidth - this._stepSize.width };
		} else if (position.x < this._safeAreaPosition.x) {
			return { ...position, x: this._safeAreaPosition.x };
		} else if (position.y + this._stepSize.height > this._safeAreaPosition.y + levelHeight) {
			return { ...position, y: this._safeAreaPosition.y + levelHeight - this._stepSize.height };
		} else if (position.y < this._safeAreaPosition.y) {
			return { ...position, y: this._safeAreaPosition.y };
		} else return position;
	}

	_updatePositionWithLevelBricksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._stepSize);

		const coords = {
			x1: Math.floor((bulletBoundaryBox.x1 - this._safeAreaPosition.x) / this._stepSize.width),
			y1: Math.floor((bulletBoundaryBox.y1 - this._safeAreaPosition.y) / this._stepSize.height),
			x2: Math.ceil((bulletBoundaryBox.x2 - this._safeAreaPosition.x) / this._stepSize.width),
			y2: Math.ceil((bulletBoundaryBox.y2 - this._safeAreaPosition.y) / this._stepSize.height),
		}

		const bricksWithCollision = this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => !brick || !brick.getCollideWithBullet() ? false : twoAreasCollisioned(bulletBoundaryBox, brick.getRoundedBoundaryBox()))
			.sort((a, b) => {
				return this._velocity.x ? 
					a.getCoords().x - b.getCoords().x : 
					a.getCoords().y - b.getCoords().y;
			})

		const bricksForDestroy = this._findBricksForDestroy(bricksWithCollision);

		if (!bricksForDestroy) return { position };
		else if (this._velocity.x > 0) {
			return { 
				position: { ...position, x: bricksForDestroy[0].getPosition().x - this._stepSize.width },
				bricksForDestroy,
			}
		} else if (this._velocity.x < 0) {
			return {
				position: { ...position, x: bricksForDestroy[0].getPosition().x + bricksForDestroy[0].getSize().width },
				bricksForDestroy,
			}
		} else if (this._velocity.y > 0) {
			return {
				position: { ...position, y: bricksForDestroy[0].getPosition().y - this._stepSize.height },
				bricksForDestroy,
			}
		} else if (this._velocity.y < 0) {
			return {
				position: { ...position, y: bricksForDestroy[0].getPosition().y + bricksForDestroy[0].getSize().height },
				bricksForDestroy,
			}
		}
	}

	_findBricksForDestroy(bricks) {
		if (!bricks.length) return null;

		const axis = this._velocity.x ? 'x' : 'y';
		const closestBrickCoord = this._velocity[axis] > 0 ? bricks[0].getCoords()[axis] : bricks[bricks.length - 1].getCoords()[axis];
		const bricksForDestroy = bricks.filter(brick => brick.getCoords()[axis] === closestBrickCoord);
		const additionalBricksForDestroy = this._findAdditionalBricksForDestroy(bricksForDestroy);
		return [ ...bricksForDestroy, ...additionalBricksForDestroy ];
	}

	_findAdditionalBricksForDestroy(bricks) {    
		const levelMap = this._level.getMap();

		return bricks.reduce((total, brick) => {
			const coords = brick.getCoords();

			if (!brick.getBreakByBullet()) return total;

			let prevBrick;
			let nextBrick;

			if (this._velocity.x) {
				prevBrick = levelMap[Math.max(coords.y - 1, 0)][coords.x];
				nextBrick = levelMap[Math.min(coords.y + 1, levelMap.length)][coords.x];
			} else {
				prevBrick = levelMap[coords.y][Math.max(coords.x - 1, 0)];
				nextBrick = levelMap[coords.y][Math.min(coords.x + 1, levelMap.length)];
			}

			if (prevBrick && !bricks.includes(prevBrick) && !total.includes(prevBrick)) total.push(prevBrick);
			if (nextBrick && !bricks.includes(nextBrick) && !total.includes(nextBrick)) total.push(nextBrick);

			return total;
		}, [])
	}

	destroy() {
		this._destroyed = true;
	}

	getDestroyed() {
		return this._destroyed;
	}

	getSize() {
		return this._stepSize;
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
			x2: this._position.x + this._stepSize.width,
			y2: this._position.y + this._stepSize.height,
		}
	}
}

Bullet.SPEED_PER_SECOND_SCALE_FACTOR = 18;