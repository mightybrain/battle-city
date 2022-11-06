class Eagle {
  constructor({ stepSize, safeAreaPosition }) {
    this._stepSize = stepSize;
    this._safeAreaPosition = safeAreaPosition;

    this._size = {
      width: 0,
      height: 0,
    }
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize();

    this._destroyed = false;
  }

  render(ctx) {
    ctx.fillStyle = '#636363';
    ctx.fillRect(this._position.x, this._position.y, this._size.width, this._size.height);
  }

  setSize() {
    this._size.width = this._stepSize.width * Eagle.SIZE_SCALE_FACTOR;
    this._size.height = this._stepSize.height * Eagle.SIZE_SCALE_FACTOR;
    this._position.x = this._safeAreaPosition.x + this._stepSize.width * Eagle.INITIAL_COORDS.x;
    this._position.y = this._safeAreaPosition.y + this._stepSize.height * Eagle.INITIAL_COORDS.y;
  }

  getDestroyed() {
    return this._destroyed;
  }

  destroy() {
    this._destroyed = true;
  }
}

Eagle.SIZE_SCALE_FACTOR = 4;
Eagle.INITIAL_COORDS = {
  x: 24,
  y: 48,
}