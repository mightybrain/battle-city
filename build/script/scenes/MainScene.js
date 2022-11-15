class MainScene {
	constructor({ canvasSize, stepSize, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._sceneManager = sceneManager;
		this._assets = assets;

		this._menu = new Menu({
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			assets: this._assets,
		});

		this._sprite = this._assets.get('images/title.png');
		this._spriteSize = {
			width: 0,
			height: 0,
		}
		this._spritePosition = {
			x: 0,
			y: 0,
		}
		this.setSize();
	}

	setSize() {
		this._spriteSize.width = this._stepSize.width * MainScene.SPRITE_WIDTH_SCALE_FACTOR;
		this._spriteSize.height = this._stepSize.height * MainScene.SPRITE_HEIGHT_SCALE_FACTOR;
		this._spritePosition.y = this._stepSize.height * MainScene.SPRITE_POSITION_Y_SCALE_FACTOR;
		this._spritePosition.x = (this._canvasSize.width - this._spriteSize.width) / 2;
		
		this._menu.setSize();
	}

	update(time) {

	}

	render(ctx) {
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.drawImage(this._sprite, this._spritePosition.x, this._spritePosition.y, this._spriteSize.width, this._spriteSize.height);

		this._menu.render(ctx);
	}

	handleKeyDown(code) {
		if (code === 'ArrowDown' || code === 'ArrowUp') this._menu.changeActiveMenuItem(code);
	}

	handleKeyUp(code) {
		if (code === 'Enter') this._sceneManager.showIntroScene();
	}
}

MainScene.SPRITE_WIDTH_SCALE_FACTOR = 28;
MainScene.SPRITE_HEIGHT_SCALE_FACTOR = 16;
MainScene.SPRITE_POSITION_Y_SCALE_FACTOR = 10;