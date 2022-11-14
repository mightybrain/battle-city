class ResultScene {
	constructor({ state, canvasSize, stepSize, safeAreaPosition,sceneManager, assets }) {
		this._state = state;
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._sceneManager = sceneManager;
		this._assets = assets;

		this._fontSize = 0;
		this.setSize();

		this._levelIndex = `STAGE ${this._state.getLevelIndex()}`;
	}

	update(time) {

	}

	setSize() {
		this._fontSize = this._stepSize.height * ResultScene.FONT_SIZE_SCALE_FACTOR;
	}

	render(ctx) {
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	handleKeyDown(code) {

	}

	handleKeyUp(code) {
		if (code === 'Enter') this._sceneManager.showIntroScene();
	}
}

ResultScene.FONT_SIZE_SCALE_FACTOR = 2;
ResultScene.HIGHT_SCORE_POSITION_Y_SCALE_FACTOR = 4;
ResultScene.LEVEL_LABEL_POSITION_Y_SCALE_FACTOR = 8;
ResultScene.PLAYER_LABEL_POSITION_Y_SCALE_FACTOR = 12;
ResultScene.PLAYER_TOTAL_SCORE_POSITION_Y_SCALE_FACTOR = 16;
ResultScene.PLAYER_DETAILS_POSITION_Y_SCALE_FACTOR = 20;
ResultScene.PLAYER_DETAILS_ITEM_HEIGHT_SCALE_FACTOR = 4;
ResultScene.SPACE_BETWEEN_PLAYER_DETAILS_ITEM_SCALE_FACTOR = 2;
ResultScene.SPRITE_SIZE_SCALE_FACTOR = 4;