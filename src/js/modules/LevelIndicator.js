class LevelIndicator {
	constructor ({ tileSize, gameAreaPosition, assets, state }) {
		this._gameAreaPosition = gameAreaPosition;
		this._tileSize = tileSize;
		this._assets = assets;
    this._state = state;

		this._levelIndex = this._state.getLevelIndex();

    this._sprite = this._assets.get('images/flag.png');

    this._position = {
      x: 0,
      y: 0,
    };
    this._spriteSize = {
      width: 0,
      height: 0,
    };
    this._fontSize = 0;
    this._levelIndexPosition = {
      x: 0,
      y: 0,
    };
    this.setSize();
  }

  setSize() {
    this._position.x = this._gameAreaPosition.x + this._tileSize.width * LevelIndicator.POSITION_X_SCALE_FACTOR;
    this._position.y = this._gameAreaPosition.y + this._tileSize.height * LevelIndicator.POSITION_Y_SCALE_FACTOR;
    this._spriteSize.width = this._tileSize.width * LevelIndicator.SPRITE_SIZE_SCALE_FACTOR;
    this._spriteSize.height = this._tileSize.height * LevelIndicator.SPRITE_SIZE_SCALE_FACTOR;
    this._fontSize = this._tileSize.height * LevelIndicator.FONT_SIZE_SCALE_FACTOR;
    this._levelIndexPosition.x = this._position.x;
    this._levelIndexPosition.y = this._position.y + this._spriteSize.height + this._fontSize;
  }

  render(ctx) {
    ctx.drawImage(this._sprite, this._position.x, this._position.y, this._spriteSize.width, this._spriteSize.height);

    ctx.font = `${this._fontSize}px PressStart2P`;
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._levelIndex, this._levelIndexPosition.x, this._levelIndexPosition.y);
  }
}

LevelIndicator.POSITION_X_SCALE_FACTOR = 54;
LevelIndicator.POSITION_Y_SCALE_FACTOR = 36;
LevelIndicator.SPRITE_SIZE_SCALE_FACTOR = 4;
LevelIndicator.FONT_SIZE_SCALE_FACTOR = 2;