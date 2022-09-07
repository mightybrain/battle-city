class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');

		this._canvasSize = {
			width: 0,
			height: 0,
		};
		this._baseSize = {
			width: 0,
			height: 0,
		}
		this._setSize();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
		});

		this._model = new GameModel({
			canvasSize: this._canvasSize,
			baseSize: this._baseSize,
			sceneManager: this._sceneManager,
		});

		this._renderer = new GameRenderer({
			ctx: this._ctx,
			canvasSize: this._canvasSize,
			sceneManager: this._sceneManager,
		});

		this._prevTimestamp = 0;

		this._addEventHandlers();
		//this._startGame();
	}

	_startGame() {
		this._model.showMainScene();

		requestAnimationFrame(timestamp => {
			this._gameLoop(timestamp);
		});
	}
	
	_gameLoop(timestamp) {
		requestAnimationFrame(newTimestamp => {
			this._gameLoop(newTimestamp);
		});

		if (this._prevTimestamp) {
			const delta = (timestamp - this._prevTimestamp) / 1000;
			this._sceneManager.update(delta);
		}
		this._prevTimestamp = timestamp;
		this._renderer.render();
	}

	_addEventHandlers() {
		window.addEventListener('keydown', event => {
			if (!event.repeat) this._sceneManager.handleKeyDown(event);
		})
		window.addEventListener('keyup', event => {
			this._sceneManager.handleKeyUp(event);
		})
		window.addEventListener('resize', () => {
			this._setSize();
		});
	}

	_setSize() {
		this._canvasSize.width = document.documentElement.clientWidth;
		this._canvasSize.height = document.documentElement.clientHeight;
		this._canvas.width = this._canvasSize.width;
		this._canvas.height = this._canvasSize.height;

		let baseWidth = this._canvasSize.width * 0.81;
		let baseHeight = baseWidth * 0.65;

		if (baseHeight + baseHeight * 0.18 > this._canvasSize.height) {
			baseHeight = this._canvasSize.height * 0.85;
			baseWidth = baseHeight * 1.53;
		}	

		this._baseSize.width = Math.round(baseWidth / 52);
		this._baseSize.height = Math.round(baseHeight / 52);
	}
}

new Game(document.getElementById('canvas'));