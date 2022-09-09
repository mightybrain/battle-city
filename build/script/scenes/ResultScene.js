class ResultScene {
  constructor({ model, canvasSize, stepSize, maxSteps, safeAreaPosition }) {
    this._model = model;
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._maxSteps = maxSteps;
    this._safeAreaPosition = safeAreaPosition;
  }

	update(delta) {

	}

  render(ctx) {
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
  }

  handleKeyDown(code) {

  }

	handleKeyUp(code) {
    if (code === 'Enter') this._model.prepareToNextLevel();
	}
}