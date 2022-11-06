class Brick {
  constructor({ coords, stepSize, safeAreaPosition, collideWithBullet, collideWithTank, breakByBullet, breakBySuperBullet, color, layer }) {
    this._stepSize = stepSize;
    this._safeAreaPosition = safeAreaPosition;
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
  }

  setSize() {
    this._position.x = this._safeAreaPosition.x + this._coords.x * this._stepSize.width;
    this._position.y = this._safeAreaPosition.y + this._coords.y * this._stepSize.height;
  }

  render(ctx) {
    ctx.fillStyle = this._color;
    ctx.fillRect(this._position.x, this._position.y, this._stepSize.width, this._stepSize.height);
  }

  getSize() {
    return this._stepSize;
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
    layer: 'bottom',
  },
  2: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: true,
    breakBySuperBullet: true,
    color: '#9C4A00',
    layer: 'bottom',
  },
  3: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
  },
  4: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
  },
  5: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
  },
  6: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
  },
  7: {
    collideWithBullet: false,
    collideWithTank: false,
    breakByBullet: false,
    breakBySuperBullet: false,
    color: '#70b022',
    layer: 'top',
  },
  8: {
    collideWithBullet: false,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: false,
    color: '#4e4ce3',
    layer: 'bottom',
  },
}