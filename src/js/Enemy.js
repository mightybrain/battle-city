class Enemy extends Tank {
	constructor(props) {
		super(props);

		const { price } = props;
		this._price = price;

		this._prevChangeDirectionTime = 0;
		this._nextChangeDirectionTime = 0;
		this._prevShootTime = 0;
		this._nextShootTime = 0;
	}

	getPrice() {
		return this._price;
	}

	update(time) {
		if (this.isActive()) {
			this._updateDirection(time);
			this._updateShooting(time);
		};

		super.update(time);
	}

	_updateDirection(time) {
		const { timestamp } = time;

		if (!this._prevChangeDirectionTime || timestamp > this._nextChangeDirectionTime) {
			this._prevChangeDirectionTime = timestamp;
			this._nextChangeDirectionTime = this._prevChangeDirectionTime + getRandomFromRange(500, 5000);
			this._moveSmartDirection(time);
		}
	}

	_updateShooting(time) {
		const { timestamp } = time;

		if (!this._prevShootTime) {
			this._prevShootTime = timestamp;
			this._nextShootTime = this._prevShootTime + getRandomFromRange(500, 5000);
		} else if (timestamp > this._nextShootTime) {
			this._prevShootTime = timestamp;
			this._nextShootTime = this._prevShootTime + getRandomFromRange(500, 5000);
			this._shoot(timestamp);
		}
	}

	_moveSmartDirection({ delta }) {
		const directionsKeys = Object.keys(Tank.DIRECTIONS).filter(key => {

			const direction = Tank.DIRECTIONS[key];

			const velocity = {
				x: direction.x * this._speed.x,
				y: direction.y * this._speed.y,
			}

			const [ roundedAxis, floatAxis ] = velocity.x ? ['y', 'x'] : ['x', 'y'];
			const supposedPosition = {
				[roundedAxis]: this._roundPositionByAxis(this._position[roundedAxis], roundedAxis),
				[floatAxis]: this._position[floatAxis] + velocity[floatAxis] * delta,
			}
	
			const actualPosition = this._updatePositionWithLevelEdgesCollision(supposedPosition, velocity);

			return supposedPosition === actualPosition;
		})

		const index = getRandomFromRange(0, directionsKeys.length - 1);
		const directionKey = directionsKeys[index];

		this._move(Tank.DIRECTIONS[directionKey]);
	}

	/*_moveRandomDirection() {
		const directionsKeys = Object.keys(Tank.DIRECTIONS);
		const index = getRandomFromRange(0, directionsKeys.length - 1);
		const directionKey = directionsKeys[index];

		this._move(Tank.DIRECTIONS[directionKey]);
	}*/
}

Enemy.INITIAL_COORDS = [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 48, y: 0 }];
Enemy.TYPES = [
	{
		speedPerSecondScaleFactor: 6,
		armor: 0,
		sprite: 'images/enemy-01.png',
		price: 100,
		sign: 1,
	},
	{
		speedPerSecondScaleFactor: 12,
		armor: 0,
		sprite: 'images/enemy-02.png',
		price: 200,
		sign: 2,
	},
	{
		speedPerSecondScaleFactor: 6,
		armor: 0,
		sprite: 'images/enemy-03.png',
		price: 100,
		sign: 3,
	},
	{
		speedPerSecondScaleFactor: 4,
		armor: 3,
		sprite: 'images/enemy-04.png',
		price: 400,
		sign: 4,
	},
]