class Brick {
	constructor({ coords, tileSize, gameAreaPosition, collideWithBullet, collideWithTank, breakByBullet, breakBySuperBullet, color, layer, assets, sprite, spriteOffset, framesCounter }) {
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._coords = {
			x: coords.x,
			y: coords.y,
		};
		this._position = {
			x: 0,
			y: 0,
		};
		this.setSize();

		this._collideWithBullet = collideWithBullet;
		this._collideWithTank = collideWithTank;
		this._breakByBullet = breakByBullet;
		this._breakBySuperBullet = breakBySuperBullet;
		this._color = color;
		this._layer = layer;
		this._assets = assets;

		this._sprite = this._assets.get(sprite);
		this._spriteOffset = spriteOffset;
		this._framesCounter = framesCounter;
	}

	setSize() {
		this._position.x = this._gameAreaPosition.x + this._coords.x * this._tileSize.width;
		this._position.y = this._gameAreaPosition.y + this._coords.y * this._tileSize.height;
	}

	render(ctx) {
		const spriteOffset = this._sprite.width * this._spriteOffset;
		ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width / this._framesCounter, this._sprite.height, this._position.x, this._position.y, this._tileSize.width, this._tileSize.height);
	}

	getRoundedBoundaryBox() {
		return {
			x1: this._gameAreaPosition.x + this._coords.x * this._tileSize.width,
			y1: this._gameAreaPosition.y + this._coords.y * this._tileSize.height,
			x2: this._gameAreaPosition.x + this._coords.x * this._tileSize.width + this._tileSize.width,
			y2: this._gameAreaPosition.y + this._coords.y * this._tileSize.height + this._tileSize.height,
		}
	}

	getSize() {
		return this._tileSize;
	}

	getPosition() {
		return this._position;
	}

	getCoords() {
		return this._coords;
	}

	getBreakByBullet() {
		return this._breakByBullet;
	}

	getCollideWithTank() {
		return this._collideWithTank;
	}

	getCollideWithBullet() {
		return this._collideWithBullet;
	}

	getLayer() {
		return this._layer;
	}
}

Brick.TYPES = {
	1: {
		collideWithBullet: true,
		collideWithTank: true,
		breakByBullet: true,
		breakBySuperBullet: true,
		color: '#9C4A00',
		sprite: 'images/bricks.png',
		spriteOffset: 0,
		framesCounter: 2,
		layer: 'bottom',
	},
	2: {
		collideWithBullet: true,
		collideWithTank: true,
		breakByBullet: true,
		breakBySuperBullet: true,
		color: '#9C4A00',
		sprite: 'images/bricks.png',
		spriteOffset: 0.5,
		framesCounter: 2,
		layer: 'bottom',
	},
	3: {
		collideWithBullet: true,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: true,
		color: '#ffffff',
		sprite: 'images/concrete.png',
		spriteOffset: 0,
		framesCounter: 4,
		layer: 'bottom',
	},
	4: {
		collideWithBullet: true,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: true,
		color: '#ffffff',
		sprite: 'images/concrete.png',
		spriteOffset: 0.25,
		framesCounter: 4,
		layer: 'bottom',
	},
	5: {
		collideWithBullet: true,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: true,
		color: '#ffffff',
		sprite: 'images/concrete.png',
		spriteOffset: 0.5,
		framesCounter: 4,
		layer: 'bottom',
	},
	6: {
		collideWithBullet: true,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: true,
		color: '#ffffff',
		sprite: 'images/concrete.png',
		spriteOffset: 0.75,
		framesCounter: 4,
		layer: 'bottom',
	},
	7: {
		collideWithBullet: false,
		collideWithTank: false,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#70b022',
		sprite: 'images/forest.png',
		spriteOffset: 0,
		framesCounter: 4,
		layer: 'top',
	},
	8: {
		collideWithBullet: false,
		collideWithTank: false,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#70b022',
		sprite: 'images/forest.png',
		spriteOffset: 0.25,
		framesCounter: 4,
		layer: 'top',
	},
	9: {
		collideWithBullet: false,
		collideWithTank: false,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#70b022',
		sprite: 'images/forest.png',
		spriteOffset: 0.5,
		framesCounter: 4,
		layer: 'top',
	},
	10: {
		collideWithBullet: false,
		collideWithTank: false,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#70b022',
		sprite: 'images/forest.png',
		spriteOffset: 0.75,
		framesCounter: 4,
		layer: 'top',
	},
	11: {
		collideWithBullet: false,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#4e4ce3',
		sprite: 'images/water.png',
		spriteOffset: 0,
		framesCounter: 4,
		layer: 'bottom',
	},
	12: {
		collideWithBullet: false,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#4e4ce3',
		sprite: 'images/water.png',
		spriteOffset: 0.25,
		framesCounter: 4,
		layer: 'bottom',
	},
	13: {
		collideWithBullet: false,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#4e4ce3',
		sprite: 'images/water.png',
		spriteOffset: 0.5,
		framesCounter: 4,
		layer: 'bottom',
	},
	14: {
		collideWithBullet: false,
		collideWithTank: true,
		breakByBullet: false,
		breakBySuperBullet: false,
		color: '#4e4ce3',
		sprite: 'images/water.png',
		spriteOffset: 0.75,
		framesCounter: 4,		
		layer: 'bottom',
	},
}