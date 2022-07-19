class GameRenderer {
	constructor(ctx, model, width, height) {
		this._ctx = ctx;
		this._model = model;
		this._width = width;
		this._height = height;
	}

	setSize(width, height) {
		this._width = width;
		this._height = height;
	}

	render() {
		this._clear();
		this._drawBackground();
		this._drawArea();
		this._drawLevelMap();
		this._drawPlayer();
	}

	_clear() {
		const { _ctx, _width, _height } = this;
		_ctx.clearRect(0, 0, _width, _height);
	}

	_drawBackground() {
		const { _ctx, _width, _height } = this;
		_ctx.fillStyle = '#636363';
		this._drawRect(0, 0, _width, _height);
	}

	_drawArea() {
		const { position, width, height } = this._model.getArea();
		this._ctx.fillStyle = '#000000';
		this._drawRect(position.x, position.y, width, height);
	}

	_drawLevelMap() {
		const { _ctx } = this;
		const levelMap = this._model.getCurrentLevelMap();
		levelMap.forEach((row, y) => {
			row.forEach((cell, x) => {
				const { key, width, height, position } = cell;

				if (!key) return;
				else if (key === 1) _ctx.fillStyle = '#9C4A00';
				else if (key === 2) _ctx.fillStyle = '#FFFFFF';

				this._drawRect(position.x, position.y, width, height);
			})
		})
	}

	_drawPlayer() {
		const { _ctx } = this;
		const { _position, _width, _height } = this._model.getPlayer();
		_ctx.fillStyle = '#E79C21';
		this._drawRect(_position.x, _position.y, _width, _height);
	}

	_drawRect(x, y, width, height) {
		this._ctx.fillRect(x, y, width, height);
	}
}