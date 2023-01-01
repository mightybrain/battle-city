class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');

		this._canvasSize = {
			width: 0,
			height: 0,
		};
		this._tileSize = {
			width: 0,
			height: 0,
		};
		this._gameAreaPosition = {
			x: 0,
			y: 0,
		};
		this._setSize();

		this._assets = new Assets();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
		});

		this._renderer = new Renderer({
			ctx: this._ctx,
			canvasSize: this._canvasSize,
			sceneManager: this._sceneManager,
		});

		this._pause = false;
		this._pauseStartTime = 0;
		this._pauseTotalDuration = 0;

		this._prevTimestamp = 0;

		this._addEventHandlers();
		this._startGame();
	}

	async _startGame() {
		await this._assets.load();
		this._sceneManager.showMainScene();

		requestAnimationFrame(timestamp => {
			this._gameLoop(timestamp - this._pauseTotalDuration);
		});
	}
	
	_gameLoop(timestamp) {
		requestAnimationFrame(nextTimestamp => {
			this._gameLoop(nextTimestamp - this._pauseTotalDuration);
		});

		this._renderer.render();

		if (this._pause) return;

		const prevTimestamp = this._prevTimestamp || timestamp;
		const prevFrameDuration = timestamp - prevTimestamp;
		const delta = prevFrameDuration / 1000;
		this._sceneManager.update({ delta, prevFrameDuration, timestamp });
		this._prevTimestamp = timestamp;
	}

	_addEventHandlers() {
		window.addEventListener('blur', () => {
			this._pauseStartTime = Date.now();
			this._pause = true;
		})
		window.addEventListener('focus', () => {
			this._pauseTotalDuration += Date.now() - this._pauseStartTime;
			this._pause = false;
		})
		window.addEventListener('keydown', event => {
			if (!event.repeat) this._sceneManager.handleKeyDown(event);
		})
		window.addEventListener('keyup', event => {
			this._sceneManager.handleKeyUp(event);
		})
		window.addEventListener('resize', () => {
			this._setSize();
			this._sceneManager.resize();
		});
	}

	_setSize() {
		this._canvasSize.width = document.documentElement.clientWidth;
		this._canvasSize.height = document.documentElement.clientHeight;
		this._canvas.width = this._canvasSize.width;
		this._canvas.height = this._canvasSize.height;

		let approximateGameAreaWidth = this._canvasSize.width - 40;
		let approximateGameAreaHeight = approximateGameAreaWidth * 0.65;

		if (approximateGameAreaHeight + 40 > this._canvasSize.height) {
			approximateGameAreaHeight = this._canvasSize.height - 40;
			approximateGameAreaWidth = approximateGameAreaHeight * 1.54;
		}	

		this._tileSize.width = Math.round(approximateGameAreaWidth / Game.TILES_NUM.x);
		this._tileSize.height = Math.round(approximateGameAreaHeight / Game.TILES_NUM.y);

		this._gameAreaPosition.x = Math.round(this._canvasSize.width / 2 - this._tileSize.width * Game.TILES_NUM.x / 2);
		this._gameAreaPosition.y = Math.round(this._canvasSize.height / 2 - this._tileSize.height * Game.TILES_NUM.y / 2);
	}
}

addEventListener('DOMContentLoaded', () => {
	new Game(document.getElementById('battle-city'));
})

Game.TILES_NUM = {
	x: 60,
	y: 52,
}