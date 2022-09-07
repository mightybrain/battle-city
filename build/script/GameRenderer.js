class GameRenderer {
	constructor({ ctx, canvasSize, sceneManager }) {
		this._ctx = ctx;
		this._canvasSize = canvasSize;
		this._sceneManager = sceneManager;
	}

	render() {
		this._clear();
		this._renderBackground();
		this._renderScene();
		/*this._drawLevel();
		this._drawLevelBricks('bottom');
		this._drawPlayer();
		this._drawBullets();
		this._drawLevelBricks('top');*/
	}

	_clear() {
		this._ctx.clearRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_renderBackground() {
		this._ctx.fillStyle = '#000000';
		this._ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_renderScene() {
		this._sceneManager.render(this._ctx);
	}

	/*_drawLevel() {
		const level = this._model.getLevel();

		const { width: levelMapWidth, height: levelMapHeight } = level.getMapSize();
		const levelMapPosition = level.getMapPosition();

		this._ctx.fillStyle = '#000000';
		this._ctx.fillRect(levelMapPosition.x, levelMapPosition.y, levelMapWidth, levelMapHeight);
	}

	_drawLevelBricks(layer) {
		const level = this._model.getLevel();
		const map = level.getMap();

		map.forEach(row => {
			row.forEach(brick => {
				if (brick && brick.getLayer() === layer) brick.render(this._ctx);
			})
		})
	}

	_drawPlayer() {
		const player = this._model.getPlayer();
		player.render(this._ctx);
	}

	_drawBullets() {
		const bulletsStore = this._model.getBulletsStore();
		const bullets = bulletsStore.getBullets();
		bullets.forEach(bullet => bullet.render(this._ctx));
	}*/
}