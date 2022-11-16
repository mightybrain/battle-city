class Statistics {
  constructor({ state, canvasSize, stepSize, assets }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._state = state;
    this._assets = assets;

    this._enemyType1Sprite = this._assets.get('images/enemy-type-01.png');
    this._enemyType2Sprite = this._assets.get('images/enemy-type-02.png');
    this._enemyType3Sprite = this._assets.get('images/enemy-type-03.png');
    this._enemyType4Sprite = this._assets.get('images/enemy-type-04.png');

		this._table = [
			[0, { text: '1 PLAYER', color: '#7F4040' }, 0, 0, 0, 0, { text: '2 PLAYER', color: '#7F4040' }],
			[0, { text: 0, color: '#BFA080' }, 0, 0, 0, 0, { text: 0, color: '#BFA080' }],
			[{ text: 0 }, { text: 'PTS' }, { text: 0 }, { sprite: this._enemyType1Sprite }, { text: 0 }, { text: 0 }, { text: 'PTS' }],
			[{ text: 0 }, { text: 'PTS' }, { text: 0 }, { sprite: this._enemyType2Sprite }, { text: 0 }, { text: 0 }, { text: 'PTS' }],
			[{ text: 0 }, { text: 'PTS' }, { text: 0 }, { sprite: this._enemyType3Sprite }, { text: 0 }, { text: 0 }, { text: 'PTS' }],
			[{ text: 0 }, { text: 'PTS' }, { text: 0 }, { sprite: this._enemyType4Sprite }, { text: 0 }, { text: 0 }, { text: 'PTS' }],
			[0, { text: 'TOTAL' }, { text: 0 }, 0, { text: 0 }, 0, 0],
		]

    this._fontSize = 0;
    this._tableSize = {
      width: 0,
      height: 0,
    };
    this._cellSize = {
      width: 0,
      height: 0,
    };
    this._tablePosition = {
      x: 0,
      y: 0,
    };
    this._spriteSize = {
      width: 0,
      height: 0,
    }
    this.setSize();
  }

  setSize() {
    this._fontSize = this._stepSize.height * Statistics.FONT_SIZE_SCALE_FACTOR;
    this._tableSize.width = this._stepSize.width * Statistics.WIDTH_SCALE_FACTOR;
    this._cellSize.width = this._tableSize.width / this._table[0].length;
    this._cellSize.height = this._stepSize.height * Statistics.CELL_HEIGHT_SCALE_FACTOR;
    this._tablePosition.x = (this._canvasSize.width - this._tableSize.width) / 2 - this._stepSize.width * Statistics.POSITION_X_OFFSET_SCALE_FACTOR;
    this._tablePosition.y = this._stepSize.height * Statistics.POSITION_Y_SCALE_FACTOR;
    this._spriteSize.width = this._stepSize.width * Statistics.SPRITE_WIDTH_SCALE_FACTOR;
    this._spriteSize.height = this._stepSize.height * Statistics.SPRITE_HEIGHT_SCALE_FACTOR;
  }

  render(ctx) {
    this._table.forEach((row, y) => {
      row.forEach((cell, x) => {
        
        if (!cell) return cell;
        const { text, sprite, color } = cell;

        const cellPosition = {
          x: this._tablePosition.x + x * this._cellSize.width,
          y: this._tablePosition.y + y * this._cellSize.height,
        }

        if (sprite) {
          const spritePosition = {
            x: cellPosition.x + this._cellSize.width - this._spriteSize.width + this._stepSize.width * Statistics.SPRITE_POSITION_X_OFFSET_SCALE_FACTOR,
            y: cellPosition.y - this._spriteSize.height / 4,
          }
          ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height, spritePosition.x, spritePosition.y, this._spriteSize.width, this._spriteSize.height);
        } else {
          ctx.font = `${this._fontSize}px PressStart2P`;
          const { textWidth } = calcTextMetrics(ctx, text);
          const textPosition = {
            x: cellPosition.x + this._cellSize.width - textWidth,
            y: cellPosition.y + this._fontSize,
          }
          ctx.fillStyle = color || '#FFFFFF';
          ctx.fillText(text, textPosition.x, textPosition.y);
        }

      })
    })
  }
}

Statistics.FONT_SIZE_SCALE_FACTOR = 2;
Statistics.POSITION_Y_SCALE_FACTOR = 12;
Statistics.POSITION_X_OFFSET_SCALE_FACTOR = 3;
Statistics.WIDTH_SCALE_FACTOR = 58;
Statistics.CELL_HEIGHT_SCALE_FACTOR = 5;
Statistics.SPRITE_HEIGHT_SCALE_FACTOR = 4;
Statistics.SPRITE_WIDTH_SCALE_FACTOR = 10;
Statistics.SPRITE_POSITION_X_OFFSET_SCALE_FACTOR = 3;