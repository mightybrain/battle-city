class MainScene {
	constructor({ state, canvasSize, tileSize, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._sceneManager = sceneManager;
		this._state = state;
		this._assets = assets;

		this._sprite = this._assets.get('images/title.png');
		this._spriteSize = {
			width: 0,
			height: 0,
		}
		this._spritePosition = {
			x: 0,
			y: 0,
		}
		this._setSize();

		this._menu = new Menu({
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			assets: this._assets,
		});
	}

	_setSize() {
		this._spriteSize.width = this._tileSize.width * MainScene.SPRITE_WIDTH_SCALE_FACTOR;
		this._spriteSize.height = this._tileSize.height * MainScene.SPRITE_HEIGHT_SCALE_FACTOR;
		this._spritePosition.x = (this._canvasSize.width - this._spriteSize.width) / 2;
		this._spritePosition.y = this._tileSize.height * MainScene.SPRITE_POSITION_Y_SCALE_FACTOR;
	}

	resize() {
		this._setSize();
		this._menu.setSize();
	}

	update(time) {

	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.drawImage(this._sprite, this._spritePosition.x, this._spritePosition.y, this._spriteSize.width, this._spriteSize.height);

		this._menu.render(ctx);
	}

	_start() {
		this._state.setPlayerLives(1, 2);
		if (this._menu.isMultiplayerGame()) this._state.setPlayerLives(2, 2);
		this._sceneManager.showIntroScene();
	}

	handleKeyDown({ code }) {
		if (code === 'ArrowDown' || code === 'ArrowUp') this._menu.changeSelectedMenuItem(code);
	}

	handleKeyUp({ code }) {
		if (code === 'Enter') this._start();
	}
}

MainScene.SPRITE_WIDTH_SCALE_FACTOR = 28;
MainScene.SPRITE_HEIGHT_SCALE_FACTOR = 16;
MainScene.SPRITE_POSITION_Y_SCALE_FACTOR = 10;