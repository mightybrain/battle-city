class Brick {
  constructor({ coords, baseSize, levelPosition, collideWithBullet, collideWithTank, breakByBullet, breakBySuperBullet, color, layer }) {
    this._width = baseSize.width;
    this._height = baseSize.height;
    this._coords = {
      x: coords.x,
      y: coords.y,
    };
    this._position = {
      x: this._coords.x * this._width + levelPosition.x,
      y: this._coords.y * this._height + levelPosition.y,
    };
    this._collideWithBullet = collideWithBullet;
    this._collideWithTank = collideWithTank;
    this._breakByBullet = breakByBullet;
    this._breakBySuperBullet = breakBySuperBullet;
    this._color = color;
    this._layer = layer;
  }

  setSize({ baseSize, levelPosition }) {
    this._width = baseSize.width;
    this._height = baseSize.height;
    this._position.x = this._coords.x * baseSize.width + levelPosition.x;
    this._position.y = this._coords.y * baseSize.height + levelPosition.y;
  }

  render(ctx) {
		ctx.fillStyle = this._color;
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }
}

Brick.types = {
  1: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: true,
    breakBySuperBullet: true,
    color: '#9C4A00',
    layer: 2,
  },
  2: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 2,
  },
  3: {
    collideWithBullet: false,
    collideWithTank: false,
    breakByBullet: false,
    breakBySuperBullet: false,
    color: '#85db1a',
    layer: 3,
  },
  4: {
    collideWithBullet: false,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: false,
    color: '#423fff',
    layer: 1,
  },
}