class MainScene {
  constructor({ state, canvasSize, stepSize, sceneManager }) {
    this._state = state;
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._sceneManager = sceneManager;

    this._fontSize = 0;

    this._loaded = false;
    this._loadedSpritesCounter = 0;

    this._titleSprite = new Image();
    this._selectorSprite = new Image();
    this._sprites = [
      this._titleSprite,
      this._selectorSprite,
    ];
    this._sprites.forEach(item => {
      item.addEventListener('load', () => {
        this._loadedSpritesCounter += 1;
        if (this._loadedSpritesCounter === this._sprites.length) this._loaded = true;
      })
    })

    this._titleSprite.src = 'images/title.png';
    this._titleSpriteSize = {
      width: 0,
      height: 0,
    }
    this._titleSpritePosition = {
      x: 0,
      y: 0,
    }

    this._selectorSprite.src = 'images/player-select.png';
    this._selectorSpriteSize = {
      width: 0,
      height: 0,
    }

    this._spaceBetweenSelectorAndLabel = 0;

    this._menu = [
      {
        label: '1 PLAYER',
        selected: true,
      },
      {
        label: '2 PLAYERS',
        selected: false,
      },
    ]

    this._menuItemHeight = 0;

    this._menuPosition = {
      x: 0,
      y: 0,
    }
    this.setSize();
  }

  setSize() {
    this._fontSize = this._stepSize.height * MainScene.FONT_SIZE_SCALE_FACTOR;

    this._titleSpriteSize.width = this._stepSize.width * MainScene.TITLE_SPRITE_WIDTH_SCALE_FACTOR;
    this._titleSpriteSize.height = this._stepSize.height * MainScene.TITLE_SPRITE_HEIGHT_SCALE_FACTOR;
    this._titleSpritePosition.y = this._stepSize.height * MainScene.TITLE_SPRITE_POSITION_Y_SCALE_FACTOR;
    this._titleSpritePosition.x = (this._canvasSize.width - this._titleSpriteSize.width) / 2;

    this._selectorSpriteSize.width = this._stepSize.width * MainScene.SELECTOR_WIDTH_SCALE_FACTOR;
    this._selectorSpriteSize.height = this._stepSize.height * MainScene.MENU_ITEM_HEIGHT_SCALE_FACTOR;

    this._spaceBetweenSelectorAndLabel = this._stepSize.width * MainScene.SPACE_BETWEEN_SELECTOR_AND_LABEL_SCALE_FACTOR;
    
    this._menuItemHeight = this._stepSize.height * MainScene.MENU_ITEM_HEIGHT_SCALE_FACTOR;
    this._menuPosition.y = this._stepSize.height * MainScene.MENU_POSITION_Y_SCALE_FACTOR
  }

	update(time) {

	}

  render(ctx) {
    if (!this._loaded) return;

		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

    ctx.drawImage(this._titleSprite, this._titleSpritePosition.x, this._titleSpritePosition.y, this._titleSpriteSize.width, this._titleSpriteSize.height);

    ctx.font = `${this._fontSize}px PressStart2P`;
    const menuWithSizes = this._menu.map(item => {
      return {
        ...item,
        ...calcTextMetrics(ctx, item.label),
      }
    })
    const maxMenuLabelSize = menuWithSizes.reduce((total, item) => item.textWidth > total ? item.textWidth : total, 0);
    const menuWidth = this._selectorSpriteSize.width + this._spaceBetweenSelectorAndLabel + maxMenuLabelSize;
    const menuPositionX = (this._canvasSize.width - menuWidth) / 2;

    menuWithSizes.forEach((item, index) => {
      const itemPositionY = this._menuPosition.y + (index * this._menuItemHeight)

      if (item.selected) ctx.drawImage(this._selectorSprite, menuPositionX, itemPositionY, this._selectorSpriteSize.width, this._selectorSpriteSize.height);

      const itemLabelPositionX = menuPositionX + this._selectorSpriteSize.width + this._spaceBetweenSelectorAndLabel;
      const itemLabelPositionY = itemPositionY + item.textHeight + (this._menuItemHeight - item.textHeight) / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.label, itemLabelPositionX, itemLabelPositionY);
    })
  }

  _changeSelectedMenuItem(code) {
    const selectedIndex = this._menu.findIndex(item => item.selected);
    const newSelectedIndex = code === 'ArrowDown' ? selectedIndex + 1 : selectedIndex - 1;
    if (this._menu[newSelectedIndex]) {
      this._menu[selectedIndex].selected = false;
      this._menu[newSelectedIndex].selected = true;
    }
  }

  handleKeyDown(code) {
    if (code === 'ArrowDown' || code === 'ArrowUp') this._changeSelectedMenuItem(code);
  }

	handleKeyUp(code) {
    if (code === 'Enter') this._sceneManager.showIntroScene();
	}
}

MainScene.TITLE_SPRITE_WIDTH_SCALE_FACTOR = 28;
MainScene.TITLE_SPRITE_HEIGHT_SCALE_FACTOR = 16;
MainScene.TITLE_SPRITE_POSITION_Y_SCALE_FACTOR = 10;
MainScene.MENU_POSITION_Y_SCALE_FACTOR = 30;
MainScene.MENU_ITEM_HEIGHT_SCALE_FACTOR = 4;
MainScene.FONT_SIZE_SCALE_FACTOR = 2;
MainScene.SELECTOR_WIDTH_SCALE_FACTOR = 4;
MainScene.SPACE_BETWEEN_SELECTOR_AND_LABEL_SCALE_FACTOR = 3;