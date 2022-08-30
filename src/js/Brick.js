class Brick {
  constructor({ coords, baseWidth, baseHeight, levelMapPosition, collideWithBullet, collideWithTank, breakByBullet, breakBySuperBullet, color, layer }) {
    this._width = baseWidth;
    this._height = baseHeight;
    this._coords = {
      x: coords.x,
      y: coords.y,
    };
    this._position = {
      x: this._coords.x * this._width + levelMapPosition.x,
      y: this._coords.y * this._height + levelMapPosition.y,
    };
    this._collideWithBullet = collideWithBullet;
    this._collideWithTank = collideWithTank;
    this._breakByBullet = breakByBullet;
    this._breakBySuperBullet = breakBySuperBullet;
    this._color = color;
    this._layer = layer;
  }

  setSize({ baseWidth, baseHeight, levelMapPosition }) {
    this._width = baseWidth;
    this._height = baseHeight;
    this._position.x = this._coords.x * this._width + levelMapPosition.x;
    this._position.y = this._coords.y * this._height + levelMapPosition.y;
  }

  render(ctx) {
		ctx.fillStyle = this._color;
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }

  getSize() {
    return {
      width: this._width,
      height: this._height,
    }
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