class PlayersIndicator {
	constructor ({ stepSize, safeAreaPosition, assets, state }) {
		this._safeAreaPosition = safeAreaPosition;
		this._stepSize = stepSize;
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
    this._fontSize = this._stepSize.height * PlayersIndicator.FONT_SIZE_SCALE_FACTOR;
    this._position.x = this._safeAreaPosition.x + this._stepSize.width * PlayersIndicator.POSITION_X_SCALE_FACTOR;
    this._position.y = this._safeAreaPosition.y + this._stepSize.height * PlayersIndicator.POSITION_Y_SCALE_FACTOR;
    this._spriteSize.width = this._stepSize.width * PlayersIndicator.SPRITE_SIZE_SCALE_FACTOR;
    this._spriteSize.height = this._stepSize.height * PlayersIndicator.SPRITE_SIZE_SCALE_FACTOR;
    this._playerIndicatorHeight = this._stepSize.height * PlayersIndicator.PLAYER_INDICATOR_HEIGHT_SCALE_FACTOR;
    this._spaceBetweenPlayers = this._stepSize.height * PlayersIndicator.SPACE_BETWEEN_PLAYERS_SCALE_FACTOR;
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
      ctx.fillStyle = '#000000';
      ctx.fillText(playerLabel, playerLabelPosition.x, playerLabelPosition.y);

      ctx.fillText(this._playersLives[key], playerLivesCounterPosition.x, playerLivesCounterPosition.y);

      ctx.drawImage(this._sprite, 0, 0, this._sprite.width, this._sprite.height, playerSpritePosition.x, playerSpritePosition.y, this._spriteSize.width, this._spriteSize.height);
    })
  }
}

PlayersIndicator.PLAYER_INDICATOR_HEIGHT_SCALE_FACTOR = 4;
PlayersIndicator.POSITION_X_SCALE_FACTOR = 54;
PlayersIndicator.POSITION_Y_SCALE_FACTOR = 24;
PlayersIndicator.SPRITE_SIZE_SCALE_FACTOR = 2;
PlayersIndicator.FONT_SIZE_SCALE_FACTOR = 2;
PlayersIndicator.SPACE_BETWEEN_PLAYERS_SCALE_FACTOR = 2;