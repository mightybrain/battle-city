class Brick {
  constructor({ coords, baseWidth, baseHeight, levelMapPosition, collideWithBullet, collideWithTank, breakByBullet, breakBySuperBullet, color, sprite, layer }) {
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
    this._sprite = new Image();
    this._sprite.src = sprite;
    this._layer = layer;

    this._loaded = false;

    this._sprite.addEventListener('load', () => {
      this._loaded = true;
    })
  }

  setSize({ baseWidth, baseHeight, levelMapPosition }) {
    this._width = baseWidth;
    this._height = baseHeight;
    this._position.x = this._coords.x * this._width + levelMapPosition.x;
    this._position.y = this._coords.y * this._height + levelMapPosition.y;
  }

  render(ctx) {
    if (!this._loaded) return;
		//ctx.fillStyle = this._color;
		//ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
    ctx.drawImage(this._sprite, this._position.x, this._position.y, this._width, this._height);
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

Brick.types = {
  1: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: true,
    breakBySuperBullet: true,
    color: '#9C4A00',
    layer: 'bottom',
    sprite: 'images/brick-01.jpg',
  },
  2: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: true,
    breakBySuperBullet: true,
    color: '#9C4A00',
    layer: 'bottom',
    sprite: 'images/brick-02.jpg',
  },
  3: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
    sprite: 'images/concrete-01.jpg',
  },
  4: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
    sprite: 'images/concrete-02.jpg',
  },
  5: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
    sprite: 'images/concrete-03.jpg',
  },
  6: {
    collideWithBullet: true,
    collideWithTank: true,
    breakByBullet: false,
    breakBySuperBullet: true,
    color: '#ffffff',
    layer: 'bottom',
    sprite: 'images/concrete-04.jpg',
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