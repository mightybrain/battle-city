class IntroScene {
	constructor({ state, canvasSize, stepSize, sceneManager }) {
		this._state = state;
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._sceneManager = sceneManager;

		this._label = `STAGE ${this._state.getLevelIndex()}`;

		this._fontSize = 0;
		this.setSize();
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
		const { textWidth, textHeight } = calcTextMetrics(ctx, this._label);

		const labelPosition = {
			x: (this._canvasSize.width - textWidth) / 2,
			y: (this._canvasSize.height - textHeight) / 2,
		}
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._label, labelPosition.x, labelPosition.y);
	}

	handleKeyDown(code) {

	}

	handleKeyUp(code) {
		if (code === 'Enter') this._sceneManager.showCoreScene();
	}
}

IntroScene.FONT_SIZE_SCALE_FACTOR = 2;