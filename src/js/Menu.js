class Menu {
  constructor({ canvasSize, stepSize, assets }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._assets = assets;

    this._sprite = this._assets.get('images/player-select.png');

		this._labels = ['1 PLAYER', '2 PLAYERS'];
    this._active = this._labels[0];

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
		this._fontSize = this._stepSize.height * Menu.FONT_SIZE_SCALE_FACTOR;
		this._position.y = this._stepSize.height * Menu.POSITION_Y_SCALE_FACTOR;
		this._spriteSize.width = this._stepSize.width * Menu.SPRITE_SIZE_SCALE_FACTOR;
		this._spriteSize.height = this._stepSize.height * Menu.SPRITE_SIZE_SCALE_FACTOR;
		this._spaceBetweenSpriteAndLabel = this._stepSize.width * Menu.SPACE_BETWEEN_SPRITE_AND_LABEL_SCALE_FACTOR;
	}

	render(ctx) {
		ctx.font = `${this._fontSize}px PressStart2P`;

		const longestLabel = this._labels
			.map(label => calcTextMetrics(ctx, label).textWidth)
			.reduce((total, width) => width > total ? width : total, 0)
			
		this._position.x = (this._canvasSize.width - this._spriteSize.width - this._spaceBetweenSpriteAndLabel - longestLabel) / 2;

		this._labels.forEach((label, index) => {
			const labelPosition = {
				x: this._position.x + this._spriteSize.width + this._spaceBetweenSpriteAndLabel,
				y: this._position.y + index * this._spriteSize.height + this._spriteSize.height / 2 + this._fontSize / 2,
			}
			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(label, labelPosition.x, labelPosition.y);

			if (label === this._active) {
				const spritePosition = {
					x: this._position.x,
					y: this._position.y + index * this._spriteSize.height,
				}
				ctx.drawImage(this._sprite, spritePosition.x, spritePosition.y, this._spriteSize.width, this._spriteSize.height);
			}
		})
	}

	changeActiveMenuItem(code) {
		const activeIndex = this._labels.findIndex(label => label === this._active);
		const newActiveIndex = code === 'ArrowDown' ? activeIndex + 1 : activeIndex - 1;
		if (this._labels[newActiveIndex]) this._active = this._labels[newActiveIndex];
	}
}

Menu.POSITION_Y_SCALE_FACTOR = 30;
Menu.FONT_SIZE_SCALE_FACTOR = 2;
Menu.SPRITE_SIZE_SCALE_FACTOR = 4;
Menu.SPACE_BETWEEN_SPRITE_AND_LABEL_SCALE_FACTOR = 3;