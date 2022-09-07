class ResultScene {
  constructor({ model, canvasSize, baseSize }) {
    this._model = model;
    this._canvasSize = canvasSize;
    this._baseSize = baseSize;
  }

	update(delta) {

	}

  render(ctx) {
		ctx.fillStyle = 'blue';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
  }

  handleKeyDown(code) {

  }

	handleKeyUp(code) {
    if (code === 'Enter') this._model.prepareToNextLevel();
	}
}