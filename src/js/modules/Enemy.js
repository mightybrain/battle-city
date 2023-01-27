class Enemy extends Tank {
	constructor(props) {
		super({
			...props,
			upgradeLevel: 0,
			allowToBuffs: false,
		});

		this._prevChangeDirectionTime = null;
		this._nextChangeDirectionTime = null;
		this._prevShootTime = null;
		this._nextShootTime = null;
	}

	update(time) {
		if (this.isActive()) {
			this._updateDirectionAndStartOrContinueMoving(time);
			this._updateShooting(time);
		};

		super.update(time);
	}

	_updateDirectionAndStartOrContinueMoving({ timestamp, delta }) {
		if (this._prevChangeDirectionTime === null || timestamp > this._nextChangeDirectionTime) {
			this._prevChangeDirectionTime = timestamp;
			this._nextChangeDirectionTime = this._prevChangeDirectionTime + getRandomFromRange(500, 4000);
			const direction = this._getDirection(delta);
			this._move(direction);
		}
	}

	_getDirection(delta) {
		const ignoreSmartDirectionsKeys = Math.random() > 0.75;
		const smartDirectionsKeys = ignoreSmartDirectionsKeys ? [] : this._getSmartDirectionsKeys().filter(key => this._directionIsFree(Tank.DIRECTIONS[key], delta));
		const directionsToMoveKeys = smartDirectionsKeys.length ? smartDirectionsKeys : Object.keys(Tank.DIRECTIONS);

		const index = getRandomFromRange(0, directionsToMoveKeys.length - 1);
		const key = directionsToMoveKeys[index];

		return Tank.DIRECTIONS[key];
	}

	_getSmartDirectionsKeys() {
		const eaglePosition = this._eagle.getPosition();

		if (eaglePosition.x < this._position.x) return ['down', 'left'];
		else if (eaglePosition.x > this._position.x) return ['down', 'right'];
		else return ['down'];
	}

	_directionIsFree(direction, delta) {
		const velocity = {
			x: direction.x * this._speed.x,
			y: direction.y * this._speed.y,
		}

		const [ roundedAxis, floatAxis ] = velocity.x ? ['y', 'x'] : ['x', 'y'];
		const supposedPosition = {
			[roundedAxis]: this._roundPositionByAxis(this._position[roundedAxis], roundedAxis),
			[floatAxis]: this._position[floatAxis] + velocity[floatAxis] * delta,
		}

		let actualPosition = this._updatePositionWithLevelEdgesCollision(supposedPosition, velocity);
		actualPosition = this._updatePositionWithTanksCollision(actualPosition, velocity);
		actualPosition = this._updatePositionWithLevelBricksCollision(actualPosition, velocity);

		return supposedPosition === actualPosition;
	}

	_updateShooting({ timestamp }) {
		if (this._prevShootTime && timestamp > this._nextShootTime) this._shoot(timestamp);

		if (!this._prevShootTime || timestamp > this._nextShootTime) {
			this._prevShootTime = timestamp;
			this._nextShootTime = this._prevShootTime + getRandomFromRange(500, 3000);
		}
	}
}

Enemy.INITIAL_COORDS = [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 48, y: 0 }];