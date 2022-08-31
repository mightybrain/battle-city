class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');

		this._canvasWidth = 0;
		this._canvasHeight = 0;
		this._baseWidth = 0;
		this._baseHeight = 0;
		this._setSize();

		this._model = new GameModel({
			width: this._canvasWidth,
			height: this._canvasHeight,
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		});

		this._renderer = new GameRenderer({
			ctx: this._ctx,
			model: this._model,
			width: this._canvasWidth,
			height: this._canvasHeight,
		});

		this._prevTimestamp = 0;

		this._addEventHandlers();
		this._startGame();
	}

	_startGame() {
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
			this._model.update(delta);
		}
		this._prevTimestamp = timestamp;
		this._renderer.render();
	}

	_addEventHandlers() {
		window.addEventListener('resize', () => {
			this._setSize();
			this._model.setSize(
				this._canvasWidth,
				this._canvasHeight,
				this._baseWidth,
				this._baseHeight,
			);
			this._renderer.setSize(
				this._canvasWidth,
				this._canvasHeight,
			);
		})
		window.addEventListener('keydown', event => {
			if (!event.repeat) this._model.handleKeyDown(event);
		})
		window.addEventListener('keyup', event => {
			this._model.handleKeyUp(event);
		})
	}

	_setSize() {
		this._canvasWidth = document.documentElement.clientWidth;
		this._canvasHeight = document.documentElement.clientHeight;
		this._canvas.width = this._canvasWidth;
		this._canvas.height = this._canvasHeight;

		let baseWidth = this._canvasWidth * 0.81;
		let baseHeight = baseWidth * 0.65;

		if (baseHeight + baseHeight * 0.18 > this._canvasHeight) {
			baseHeight = this._canvasHeight * 0.85;
			baseWidth = baseHeight * 1.53;
		}	

		this._baseWidth = Math.round(baseWidth / 52);
		this._baseHeight = Math.round(baseHeight / 52);
	}
}

new Game(document.getElementById('canvas'));