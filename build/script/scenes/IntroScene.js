class IntroScene {
  constructor({ model, canvasSize, baseSize }) {
    this._model = model;
    this._canvasSize = canvasSize;
    this._baseSize = baseSize;
  }

	update(delta) {

	}

  render(ctx) {
		ctx.fillStyle = 'yellow';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
  }

  handleKeyDown(code) {

  }

	handleKeyUp(code) {
    if (code === 'Space') this._model.startLevel();
	}
}