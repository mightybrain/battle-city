class IntroScene {
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

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${this._stepSize.height * 3}px PressStart2P`;

    const text = `Stage ${this._model.getLevelNum()}`;
    const { width: textWidth, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text);
		
		ctx.fillText(text, (this._canvasSize.width - textWidth) / 2, (this._canvasSize.height - actualBoundingBoxAscent + actualBoundingBoxDescent) / 2);
  }

  handleKeyDown(code) {

  }

	handleKeyUp(code) {
    if (code === 'Space') this._model.startLevel();
	}
}