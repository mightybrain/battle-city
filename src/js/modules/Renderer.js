class Renderer {
	constructor({ ctx, canvasSize, sceneManager }) {
		this._ctx = ctx;
		this._canvasSize = canvasSize;
		this._sceneManager = sceneManager;
	}

	render() {
		this._clear();
		this._renderBackground();
		this._renderScene();
	}

	_clear() {
		this._ctx.clearRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_renderBackground() {
		this._ctx.fillStyle = '#121212';
		this._ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_renderScene() {
		this._sceneManager.render(this._ctx);
	}
}