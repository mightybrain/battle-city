class CoreScene {
  constructor({ model, canvasSize, baseSize }) {
    this._model = model;
    this._canvasSize = canvasSize;
    this._baseSize = baseSize;
  }

	update(delta) {

	}

  render(ctx) {
    ctx.fillStyle = '#636363';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
  }

  handleKeyDown(code) {

  }

	handleKeyUp(code) {
    if (code === 'ArrowUp') this._model.endLevel();
	}
}