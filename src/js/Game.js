class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');

		this._canvasSize = {
			width: 0,
			height: 0,
		};
		this._stepSize = {
			width: 0,
			height: 0,
		}
		this._maxSteps = {
			x: 56,
			y: 52,
		}
		this._safeAreaPosition = {
			x: 0,
			y: 0,
		}
		this._setSizeAndSafeAreaPosition();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
		});

		this._model = new GameModel({
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			maxSteps: this._maxSteps,
			safeAreaPosition: this._safeAreaPosition,
			sceneManager: this._sceneManager,
		});

		this._renderer = new GameRenderer({
			ctx: this._ctx,
			canvasSize: this._canvasSize,
			sceneManager: this._sceneManager,
		});

		this._prevTimestamp = 0;

		this._addEventHandlers();
		this._startGame();
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
			this._setSizeAndSafeAreaPosition();
		});
	}

	_setSizeAndSafeAreaPosition() {
		this._canvasSize.width = document.documentElement.clientWidth;
		this._canvasSize.height = document.documentElement.clientHeight;
		this._canvas.width = this._canvasSize.width;
		this._canvas.height = this._canvasSize.height;

		let safeAreaWidth = this._canvasSize.width * 0.81;
		let safeAreaHeight = safeAreaWidth * 0.65;

		if (safeAreaHeight + safeAreaHeight * 0.18 > this._canvasSize.height) {
			safeAreaHeight = this._canvasSize.height * 0.85;
			safeAreaWidth = safeAreaHeight * 1.53;
		}	

		this._stepSize.width = Math.round(safeAreaWidth / this._maxSteps.x);
		this._stepSize.height = Math.round(safeAreaHeight / this._maxSteps.y);

		this._safeAreaPosition.x = (this._canvasSize.width - this._stepSize.width * this._maxSteps.x) / 2;
		this._safeAreaPosition.y = (this._canvasSize.height - this._stepSize.height * this._maxSteps.y) / 2;
	}
}

new Game(document.getElementById('canvas'));