class Menu {
  constructor({ canvasSize, tileSize, assets }) {
    this._canvasSize = canvasSize;
    this._tileSize = tileSize;
    this._assets = assets;

    this._sprite = this._assets.get('images/player-select.png');

    this._selectedItemIndex = 0;

    this._fontSize = 0;
		this._position = {
			x: 0,
			y: 0,
		}
		this._spriteSize = {
			width: 0,
			height: 0,
		}
		this._spaceBetweenSpriteAndLabel = 0;
    this.setSize();
  }

	setSize() {
		this._fontSize = this._tileSize.height * Menu.FONT_SIZE_SCALE_FACTOR;
		this._position.y = this._tileSize.height * Menu.POSITION_Y_SCALE_FACTOR;
		this._spriteSize.width = this._tileSize.width * Menu.SPRITE_SIZE_SCALE_FACTOR;
		this._spriteSize.height = this._tileSize.height * Menu.SPRITE_SIZE_SCALE_FACTOR;
		this._spaceBetweenSpriteAndLabel = this._tileSize.width * Menu.SPACE_BETWEEN_SPRITE_AND_LABEL_SCALE_FACTOR;
	}

	render(ctx) {
		ctx.font = `${this._fontSize}px PressStart2P`;

		const longestItem = Menu.ITEMS
			.map(item => calcTextMetrics(ctx, item).textWidth)
			.reduce((total, width) => width > total ? width : total, 0)
			
		this._position.x = (this._canvasSize.width - this._spriteSize.width - this._spaceBetweenSpriteAndLabel - longestItem) / 2;

		Menu.ITEMS.forEach((item, index) => {
			const itemPosition = {
				x: this._position.x + this._spriteSize.width + this._spaceBetweenSpriteAndLabel,
				y: this._position.y + index * this._spriteSize.height + this._spriteSize.height / 2 + this._fontSize / 2,
			}
			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(item, itemPosition.x, itemPosition.y);

			if (index === this._selectedItemIndex) {
				const spritePosition = {
					x: this._position.x,
					y: this._position.y + index * this._spriteSize.height,
				}
				ctx.drawImage(this._sprite, spritePosition.x, spritePosition.y, this._spriteSize.width, this._spriteSize.height);
			}
		})
	}

	changeSelectedMenuItem(code) {
		this._selectedItemIndex = code === 'ArrowDown' ? 
			Math.min(this._selectedItemIndex + 1, Menu.ITEMS.length - 1) : 
			Math.max(this._selectedItemIndex - 1, 0);
	}

	isMultiplayerGame() {
		return this._selectedItemIndex === 1;
	}
}

Menu.ITEMS = ['1 PLAYER', '2 PLAYERS'];
Menu.POSITION_Y_SCALE_FACTOR = 30;
Menu.FONT_SIZE_SCALE_FACTOR = 2;
Menu.SPRITE_SIZE_SCALE_FACTOR = 4;
Menu.SPACE_BETWEEN_SPRITE_AND_LABEL_SCALE_FACTOR = 3;