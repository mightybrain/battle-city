class GameRenderer {
	constructor({ ctx, model, width, height }) {
		this._ctx = ctx;
		this._model = model;
		this._width = width;
		this._height = height;
	}

	render() {
		this._clear();
		this._drawBackground();
		this._drawLevel();
		this._drawLevelBricks('bottom');
		this._drawPlayer();
		this._drawBullets();
		this._drawLevelBricks('top');
	}

	setSize(width, height) {
		this._width = width;
		this._height = height;
	}

	_clear() {
		this._ctx.clearRect(0, 0, this._width, this._height);
	}

	_drawBackground() {
		this._ctx.fillStyle = '#636363';
		this._ctx.fillRect(0, 0, this._width, this._height);
	}

	_drawLevel() {
		const level = this._model.getLevel();

		const { width: levelMapWidth, height: levelMapHeight } = level.getMapSize();
		const levelMapPosition = level.getMapPosition();

		this._ctx.fillStyle = '#000000';
		this._ctx.fillRect(levelMapPosition.x, levelMapPosition.y, levelMapWidth, levelMapHeight);

		const map = level.getMap();

		map.forEach(row => {
			row.forEach(brick => {
				if (brick) brick.render(this._ctx);
			})
		})
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
	}
}