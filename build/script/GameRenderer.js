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
		this._drawArea();
		this._drawLevel();
		this._drawPlayer();
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

	_drawArea() {
		const { position, width, height } = this._model.getArea();
		this._ctx.fillStyle = '#000000';
		this._ctx.fillRect(position.x, position.y, width, height);
	}

	_drawLevel() {
		const level = this._model.getLevel();
		const map = level.getMap();

		map.forEach(row => {
			row.forEach(brick => {
				if (brick) brick.render(this._ctx)
			})
		})
	}

	_drawPlayer() {
		const player = this._model.getPlayer();
		player.render(this._ctx);
	}
}