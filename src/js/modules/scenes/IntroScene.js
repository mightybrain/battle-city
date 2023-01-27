class IntroScene {
	constructor({ state, canvasSize, tileSize, sceneManager }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._sceneManager = sceneManager;
		this._state = state;

		this._label = `STAGE ${this._state.getLevelIndex()}`;

		this._fontSize = 0;
		this._setSize();
	}

	_setSize() {
		this._fontSize = this._tileSize.height * IntroScene.FONT_SIZE_SCALE_FACTOR;
	}

	resize() {
		this._setSize();
	}

	update(time) {

	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.font = `${this._fontSize}px PressStart2P`;
		const { textWidth } = calcTextMetrics(ctx, this._label);

		const position = {
			x: this._canvasSize.width / 2 - textWidth / 2,
			y: this._canvasSize.height / 2 + this._fontSize / 2,
		}
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._label, position.x, position.y);
	}

	handleKeyDown({ code }) {

	}

	handleKeyUp({ code }) {
		if (code === 'Enter') this._sceneManager.showCoreScene();
	}
}

IntroScene.FONT_SIZE_SCALE_FACTOR = 2;