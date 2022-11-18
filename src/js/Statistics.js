class Statistics {
  constructor({ state, canvasSize, stepSize, assets }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._state = state;
    this._assets = assets;

    this._table = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ]
    this._fillTable();

    this._fontSize = 0;
    this._size = {
      width: 0,
      height: 0,
    };
    this._position = {
      x: 0,
      y: 0,
    };
    this._cellSize = {
      width: 0,
      height: 0,
    };
    this._spriteSize = {
      width: 0,
      height: 0,
    }
    this.setSize();
  }

  _fillTable() {
    const statistics = this._state.getPlayersStatisticsByEnemiesTypes();
    const player1Total = this._state.getPlayerTotal(1);
    const player2Total = this._state.getPlayerTotal(2);

    this._table[2][1] = this._table[3][1] = this._table[4][1] = this._table[5][1] = this._table[2][6] = this._table[3][6] = this._table[4][6] = this._table[5][6] = { text: 'PTS' };
    this._table[6][2] = { text: 'TOTAL' };
    this._table[0][1] = { text: '1 PLAYER', color: '#7F4040' };
    this._table[0][6] = { text: '2 PLAYER', color: '#7F4040' };

    this._table[2][0] = { text: statistics[1][1].points };
    this._table[3][0] = { text: statistics[1][2].points };
    this._table[4][0] = { text: statistics[1][3].points };
    this._table[5][0] = { text: statistics[1][4].points };
    this._table[2][5] = { text: statistics[2][1].points };
    this._table[3][5] = { text: statistics[2][2].points };
    this._table[4][5] = { text: statistics[2][3].points };
    this._table[5][5] = { text: statistics[2][4].points };

    this._table[2][2] = { text: statistics[1][1].counter };
    this._table[3][2] = { text: statistics[1][2].counter };
    this._table[4][2] = { text: statistics[1][3].counter };
    this._table[5][2] = { text: statistics[1][4].counter };
    this._table[2][4] = { text: statistics[2][1].counter };
    this._table[3][4] = { text: statistics[2][2].counter };
    this._table[4][4] = { text: statistics[2][3].counter };
    this._table[5][4] = { text: statistics[2][4].counter };

    this._table[2][3] = { sprite: this._assets.get('images/enemy-type-01.png') };
    this._table[3][3] = { sprite: this._assets.get('images/enemy-type-02.png') };
    this._table[4][3] = { sprite: this._assets.get('images/enemy-type-03.png') };
    this._table[5][3] = { sprite: this._assets.get('images/enemy-type-04.png') };

    this._table[1][1] = { text: player1Total.points, color: '#BFA080' };
    this._table[1][6] = { text: player2Total.points, color: '#BFA080' };

    this._table[6][2] = { text: player1Total.counter };
    this._table[6][4] = { text: player2Total.counter };
  }

  setSize() {
    this._fontSize = this._stepSize.height * Statistics.FONT_SIZE_SCALE_FACTOR;
    this._size.width = this._stepSize.width * Statistics.WIDTH_SCALE_FACTOR;
    this._position.x = (this._canvasSize.width - this._size.width) / 2 - this._stepSize.width * Statistics.POSITION_X_OFFSET_SCALE_FACTOR;
    this._position.y = this._stepSize.height * Statistics.POSITION_Y_SCALE_FACTOR;
    this._cellSize.width = this._size.width / this._table[0].length;
    this._cellSize.height = this._stepSize.height * Statistics.CELL_HEIGHT_SCALE_FACTOR;
    this._spriteSize.width = this._stepSize.width * Statistics.SPRITE_WIDTH_SCALE_FACTOR;
    this._spriteSize.height = this._stepSize.height * Statistics.SPRITE_HEIGHT_SCALE_FACTOR;
  }

  render(ctx) {
    this._table.forEach((row, y) => {
      row.forEach((cell, x) => {
        
        if (!cell) return;
        const { text, sprite, color } = cell;

        const cellPosition = {
          x: this._position.x + x * this._cellSize.width,
          y: this._position.y + y * this._cellSize.height,
        }

        if (sprite) {
          const spritePosition = {
            x: cellPosition.x + this._cellSize.width - this._spriteSize.width + this._stepSize.width * Statistics.SPRITE_POSITION_X_OFFSET_SCALE_FACTOR,
            y: cellPosition.y - this._spriteSize.height / 4,
          }
          ctx.drawImage(sprite, spritePosition.x, spritePosition.y, this._spriteSize.width, this._spriteSize.height);
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
Statistics.POSITION_X_OFFSET_SCALE_FACTOR = 2;
Statistics.WIDTH_SCALE_FACTOR = 54;
Statistics.CELL_HEIGHT_SCALE_FACTOR = 5;
Statistics.SPRITE_HEIGHT_SCALE_FACTOR = 4;
Statistics.SPRITE_WIDTH_SCALE_FACTOR = 10;
Statistics.SPRITE_POSITION_X_OFFSET_SCALE_FACTOR = 3;