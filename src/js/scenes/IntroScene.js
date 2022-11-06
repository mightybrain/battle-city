class IntroScene {
  constructor({ state, canvasSize, stepSize, safeAreaPosition, sceneManager }) {
    this._state = state;
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._safeAreaPosition = safeAreaPosition;
    this._sceneManager = sceneManager;

    this._fontSize = 0;
    this.setSize();

    this._stageLabel = `STAGE ${this._state.getLevelIndex()}`;
  }

  setSize() {
    this._fontSize = this._stepSize.height * IntroScene.FONT_SIZE_SCALE_FACTOR;
  }

	update(time) {

	}

  render(ctx) {
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

    ctx.font = `${this._fontSize}px PressStart2P`;
    const { textWidth, textHeight } = calcTextMetrics(ctx, this._stageLabel);

    const stageLabelPositionX = (this._canvasSize.width - textWidth) / 2;
    const stageLabelPositionY = (this._canvasSize.height - textHeight) / 2;
		
    ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._stageLabel, stageLabelPositionX, stageLabelPositionY);
  }

  handleKeyDown(code) {

  }

	handleKeyUp(code) {
    if (code === 'Enter') this._sceneManager.showCoreScene();
	}
}

IntroScene.FONT_SIZE_SCALE_FACTOR = 2;