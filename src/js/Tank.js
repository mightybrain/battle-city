class Tank {
  constructor(position, width, height) {
    this._position = position;
    this._width = width;
    this._height = height;
  }

  setSize(position, width, height) {
    this._width = width;
    this._height = height;
    this.setPosition(position);
  }

  setPosition(position) {
    this._position = position;
  }

  getTank() {
    return {
      position: this._position,
      width: this._width,
      height: this._height,
    }
  }
}