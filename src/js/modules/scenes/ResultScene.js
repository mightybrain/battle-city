class ResultScene {
	constructor({ state, canvasSize, tileSize, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._sceneManager = sceneManager;
		this._state = state;
		this._assets = assets;
		this._levels = this._assets.get('json/levels.json');

		this._levelIndex = this._state.getLevelIndex();
		this._label = `STAGE ${this._levelIndex}`;

		this._fontSize = 0;
		this._labelPosition = {
			x: 0,
			y: 0,
		}
		this._setSize();

		this._statistics = new Statistics({
			state: this._state,
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			assets: this._assets,
		});
	}

	update(time) {

	}

	_setSize() {
		this._fontSize = this._tileSize.height * ResultScene.FONT_SIZE_SCALE_FACTOR;
		this._labelPosition.y = this._tileSize.height * ResultScene.LABEL_POSITION_Y_SCALE_FACTOR + this._fontSize;
	}

	resize() {
		this._setSize();
		this._statistics.setSize();
	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.font = `${this._fontSize}px PressStart2P`;
		const { textWidth } = calcTextMetrics(ctx, this._label);
		this._labelPosition.x = (this._canvasSize.width - textWidth) / 2;
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._label, this._labelPosition.x, this._labelPosition.y);

		this._statistics.render(ctx);
	}

	_showNextScene() {
		if (this._state.getGameOver()) {
			this._state.reset();
			this._sceneManager.showMainScene();
		} else {
			let nextLevelIndex = this._levelIndex + 1;
			if (!this._levels[nextLevelIndex]) nextLevelIndex = 1;
			this._state.setLevelIndex(nextLevelIndex);
			this._state.resetPlayersStatisticsByEnemiesTypes();
			this._sceneManager.showIntroScene();
		}
	}

	handleKeyDown({ code }) {

	}

	handleKeyUp({ code }) {
		if (code === 'Enter') this._showNextScene();
	}
}

ResultScene.FONT_SIZE_SCALE_FACTOR = 2;
ResultScene.LABEL_POSITION_Y_SCALE_FACTOR = 8;