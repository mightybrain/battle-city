class Menu {
  constructor({ canvasSize, stepSize, assets }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._assets = assets;

    this._sprite = this._assets.get('images/player-select.png');

		this._menu = [ '1 PLAYER', /*'2 PLAYERS'*/ ];
    this._activeMenuItem = this._menu[0];

    this._fontSize = 0;
		this._spaceBetweenSpriteAndLabel = 0;
		this._spriteSize = {
			width: 0,
			height: 0,
		}
		this._menuPosition = {
			x: 0,
			y: 0,
		}
    this.setSize();
  }

	setSize() {
		this._fontSize = this._stepSize.height * Menu.FONT_SIZE_SCALE_FACTOR;

		this._spriteSize.width = this._stepSize.width * Menu.SPRITE_SIZE_SCALE_FACTOR;
		this._spriteSize.height = this._stepSize.height * Menu.SPRITE_SIZE_SCALE_FACTOR;

		this._spaceBetweenSpriteAndLabel = this._stepSize.width * Menu.SPACE_BETWEEN_SPRITE_AND_LABEL_SCALE_FACTOR;
		this._menuPosition.y = this._stepSize.height * Menu.POSITION_Y_SCALE_FACTOR
	}

	render(ctx) {
		ctx.font = `${this._fontSize}px PressStart2P`;
		const menuWithSizes = this._menu.map(label => {
			const { textWidth, textHeight } = calcTextMetrics(ctx, label);
			return { label, textWidth, textHeight }
		})
		const maxMenuSize = menuWithSizes.reduce((total, item) => item.textWidth > total ? item.textWidth : total, 0);
		const menuWidth = this._spriteSize.width + this._spaceBetweenSpriteAndLabel + maxMenuSize;
		const menuPositionX = (this._canvasSize.width - menuWidth) / 2;

		menuWithSizes.forEach((item, index) => {
			const itemPositionY = this._menuPosition.y + (index * this._spriteSize.height)
			const itemLabelPositionX = menuPositionX + this._spriteSize.width + this._spaceBetweenSpriteAndLabel;
			const itemLabelPositionY = itemPositionY + item.textHeight + (this._spriteSize.height - item.textHeight) / 2;
			
			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(item.label, itemLabelPositionX, itemLabelPositionY);

			if (item.label === this._activeMenuItem) ctx.drawImage(this._sprite, menuPositionX, itemPositionY, this._spriteSize.width, this._spriteSize.height);
		})
	}

	changeActiveMenuItem(code) {
		const activeIndex = this._menu.findIndex(item => item === this._activeMenuItem);
		const newActiveIndex = code === 'ArrowDown' ? activeIndex + 1 : activeIndex - 1;
		if (this._menu[newActiveIndex]) this._activeMenuItem = this._menu[newActiveIndex];
	}
}

Menu.POSITION_Y_SCALE_FACTOR = 30;
Menu.FONT_SIZE_SCALE_FACTOR = 2;
Menu.SPRITE_SIZE_SCALE_FACTOR = 4;
Menu.SPACE_BETWEEN_SPRITE_AND_LABEL_SCALE_FACTOR = 3;