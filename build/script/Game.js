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
		};
		this._safeAreaPosition = {
			x: 0,
			y: 0,
		};
		this._setSize();

		this._assets = new Assets();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
		});

		this._renderer = new Renderer({
			ctx: this._ctx,
			canvasSize: this._canvasSize,
			sceneManager: this._sceneManager,
		});

		this._prevTimestamp = 0;

		this._addEventHandlers();
		this._startGame();
		window.addEventListener('blur', () => {
			this._prevTimestamp = 0;
		})
	}

	async _startGame() {
		await this._assets.load();
		this._sceneManager.showMainScene();

		requestAnimationFrame(timestamp => {
			this._gameLoop(timestamp);
		});
	}
	
	_gameLoop(timestamp) {
		requestAnimationFrame(newTimestamp => {
			this._gameLoop(newTimestamp);
		});

		if (this._prevTimestamp) {
			const prevFrameDuration = timestamp - this._prevTimestamp;
			const delta = prevFrameDuration / 1000;
			this._sceneManager.update({ delta, prevFrameDuration, timestamp });
			this._renderer.render();
		}

		this._prevTimestamp = timestamp;
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
			this._sceneManager.setSize();
		});
	}

	_setSize() {
		this._canvasSize.width = document.documentElement.clientWidth;
		this._canvasSize.height = document.documentElement.clientHeight;
		this._canvas.width = this._canvasSize.width;
		this._canvas.height = this._canvasSize.height;

		let safeAreaWidth = this._canvasSize.width - 40;
		let safeAreaHeight = safeAreaWidth * 0.65;

		if (safeAreaHeight + 40 > this._canvasSize.height) {
			safeAreaHeight = this._canvasSize.height - 40;
			safeAreaWidth = safeAreaHeight * 1.53;
		}	

		this._stepSize.width = Math.round(safeAreaWidth / Game.MAX_STEPS.x);
		this._stepSize.height = Math.round(safeAreaHeight / Game.MAX_STEPS.y);

		this._safeAreaPosition.x = Math.round((this._canvasSize.width - this._stepSize.width * Game.MAX_STEPS.x) / 2);
		this._safeAreaPosition.y = Math.round((this._canvasSize.height - this._stepSize.height * Game.MAX_STEPS.y) / 2);
	}
}

addEventListener('DOMContentLoaded', () => {
	new Game(document.getElementById('battle-city'));
})

Game.MAX_STEPS = {
	x: 60,
	y: 52,
}