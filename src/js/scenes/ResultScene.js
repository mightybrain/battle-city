class ResultScene {
	constructor({ state, canvasSize, stepSize, safeAreaPosition,sceneManager }) {
		this._state = state;
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._sceneManager = sceneManager
	}

	update(time) {

	}

	setSize() {
		
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