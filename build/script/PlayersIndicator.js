class PlayersIndicator {
	constructor ({ tileSize, gameAreaPosition, assets, state }) {
		this._gameAreaPosition = gameAreaPosition;
		this._tileSize = tileSize;
		this._assets = assets;
    this._state = state;

    this._playersLives = this._state.getPlayersLives();

    this._sprite = this._assets.get('images/player-indicator.png');

    this._fontSize = 0;
    this._position = {
      x: 0,
      y: 0,
    };
    this._spriteSize = {
      width: 0,
      height: 0,
    };
    this._playerIndicatorHeight = 0;
    this._spaceBetweenPlayers = 0;
    this.setSize();
  }

  setSize() {
    this._fontSize = this._tileSize.height * PlayersIndicator.FONT_SIZE_SCALE_FACTOR;
    this._position.x = this._gameAreaPosition.x + this._tileSize.width * PlayersIndicator.POSITION_X_SCALE_FACTOR;
    this._position.y = this._gameAreaPosition.y + this._tileSize.height * PlayersIndicator.POSITION_Y_SCALE_FACTOR;
    this._spriteSize.width = this._tileSize.width * PlayersIndicator.SPRITE_SIZE_SCALE_FACTOR;
    this._spriteSize.height = this._tileSize.height * PlayersIndicator.SPRITE_SIZE_SCALE_FACTOR;
    this._playerIndicatorHeight = this._tileSize.height * PlayersIndicator.PLAYER_INDICATOR_HEIGHT_SCALE_FACTOR;
    this._spaceBetweenPlayers = this._tileSize.height * PlayersIndicator.SPACE_BETWEEN_PLAYERS_SCALE_FACTOR;
  }

  render(ctx) {
    const playersKeys = Object.keys(this._playersLives);

    playersKeys.forEach((key, index) => {
      const playerLabel = `${key}P`;
      const playerLabelPosition = {
        x: this._position.x,
        y: this._position.y + index * (this._playerIndicatorHeight + this._spaceBetweenPlayers) + this._fontSize,
      }

      const playerSpritePosition = {
        x: this._position.x,
        y: this._position.y + index * (this._playerIndicatorHeight + this._spaceBetweenPlayers) + this._fontSize,
      }

      const playerLivesCounterPosition = {
        x: this._position.x + this._spriteSize.width,
        y: this._position.y + index * (this._playerIndicatorHeight + this._spaceBetweenPlayers) + this._fontSize * 2,
      }

      ctx.font = `${this._fontSize}px PressStart2P`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(playerLabel, playerLabelPosition.x, playerLabelPosition.y);

      ctx.fillText(this._playersLives[key], playerLivesCounterPosition.x, playerLivesCounterPosition.y);

      ctx.drawImage(this._sprite, playerSpritePosition.x, playerSpritePosition.y, this._spriteSize.width, this._spriteSize.height);
    })
  }
}

PlayersIndicator.PLAYER_INDICATOR_HEIGHT_SCALE_FACTOR = 4;
PlayersIndicator.POSITION_X_SCALE_FACTOR = 54;
PlayersIndicator.POSITION_Y_SCALE_FACTOR = 24;
PlayersIndicator.SPRITE_SIZE_SCALE_FACTOR = 2;
PlayersIndicator.FONT_SIZE_SCALE_FACTOR = 2;
PlayersIndicator.SPACE_BETWEEN_PLAYERS_SCALE_FACTOR = 2;