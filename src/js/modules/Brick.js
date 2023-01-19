class Brick {
	constructor({ coords, tileSize, gameAreaPosition, collideWithBullet, collideWithTank, breakByBullet, layer, assets, sprite, frameIndex, framesNumber }) {
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._assets = assets;
		this._coords = coords;

		this._position = {
			x: 0,
			y: 0,
		};
		this.setSize();

		this._layer = layer;
		this._collideWithTank = collideWithTank;
		this._collideWithBullet = collideWithBullet;
		this._breakByBullet = breakByBullet;

		this._sprite = this._assets.get(sprite);
		this._frameIndex = frameIndex;
		this._framesNumber = framesNumber;
	}

	setSize() {
		this._position.x = this._gameAreaPosition.x + this._coords.x * this._tileSize.width;
		this._position.y = this._gameAreaPosition.y + this._coords.y * this._tileSize.height;
	}

	render(ctx) {
		const spriteOffset = this._sprite.width / this._framesNumber * this._frameIndex;
		ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width / this._framesNumber, this._sprite.height, this._position.x, this._position.y, this._tileSize.width, this._tileSize.height);
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._tileSize.width,
			y2: this._position.y + this._tileSize.height,
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

	getLayer() {
		return this._layer;
	}

	isCollideWithBullet() {
		return this._collideWithBullet;
	}

	isBreakByBullet() {
		return this._breakByBullet;
	}

	isCollideWithTank() {
		return this._collideWithTank;
	}
}

Brick.TYPES = {
	1: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: true,
		sprite: 'images/bricks.png',
		framesNumber: 2,
		frameIndex: 0,
		layer: 'bottom',
	},
	2: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: true,
		sprite: 'images/bricks.png',
		framesNumber: 2,
		frameIndex: 1,
		layer: 'bottom',
	},
	3: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 0,
		layer: 'bottom',
	},
	4: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 1,
		layer: 'bottom',
	},
	5: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 2,
		layer: 'bottom',
	},
	6: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 3,
		layer: 'bottom',
	},
	7: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 0,
		layer: 'top',
	},
	8: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 1,
		layer: 'top',
	},
	9: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 2,
		layer: 'top',
	},
	10: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 3,
		layer: 'top',
	},
	11: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 0,
		layer: 'bottom',
	},
	12: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 1,
		layer: 'bottom',
	},
	13: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 2,
		layer: 'bottom',
	},
	14: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 3,
		layer: 'bottom',
	},
}