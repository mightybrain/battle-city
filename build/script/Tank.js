class Tank {
  constructor({ position, baseSize, levelPosition }) {
    this._position = {
      x: position.x + levelPosition.x,
      y: position.y + levelPosition.y,
    };
    this._width = baseSize.width * 4;
    this._height = baseSize.height * 4;
  }

  render(ctx) {
		ctx.fillStyle = '#E79C21';
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }
}