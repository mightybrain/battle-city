class Statistics {
  constructor({ state, canvasSize, stepSize, assets }) {
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._state = state;
    this._assets = assets;

    this._statistics = this._state.getPlayersStatisticsByEnemiesTypes();

    this._player1Total = Object.values(this._statistics[1])
      .reduce((total, item) => {
        return { 
          counter: total.counter + item.counter,
          points: total.points + item.points,
        }
      }, { counter: 0, points: 0 })

      this._player2Total = Object.values(this._statistics[2])
      .reduce((total, item) => {
        return { 
          counter: total.counter + item.counter,
          points: total.points + item.points,
        }
      }, { counter: 0, points: 0 })

    this._enemyType1Sprite = this._assets.get('images/enemy-type-01.png');
    this._enemyType2Sprite = this._assets.get('images/enemy-type-02.png');
    this._enemyType3Sprite = this._assets.get('images/enemy-type-03.png');
    this._enemyType4Sprite = this._assets.get('images/enemy-type-04.png');

		this._table = [
			[0, { text: '1 PLAYER', color: '#7F4040' }, 0, 0, 0, 0, { text: '2 PLAYER', color: '#7F4040' }],
			[0, { text: this._player1Total.points, color: '#BFA080' }, 0, 0, 0, 0, { text: this._player2Total.points, color: '#BFA080' }],
			[{ text: this._statistics[1][1].points }, { text: 'PTS' }, { text: this._statistics[1][1].counter }, { sprite: this._enemyType1Sprite }, { text: this._statistics[2][1].counter }, { text: this._statistics[2][1].points }, { text: 'PTS' }],
			[{ text: this._statistics[1][2].points }, { text: 'PTS' }, { text: this._statistics[1][2].counter }, { sprite: this._enemyType2Sprite }, { text: this._statistics[2][2].counter }, { text: this._statistics[2][2].points }, { text: 'PTS' }],
			[{ text: this._statistics[1][3].points }, { text: 'PTS' }, { text: this._statistics[1][3].counter }, { sprite: this._enemyType3Sprite }, { text: this._statistics[2][3].counter }, { text: this._statistics[2][3].points }, { text: 'PTS' }],
			[{ text: this._statistics[1][4].points }, { text: 'PTS' }, { text: this._statistics[1][4].counter }, { sprite: this._enemyType4Sprite }, { text: this._statistics[2][4].counter }, { text: this._statistics[2][4].points }, { text: 'PTS' }],
			[0, { text: 'TOTAL' }, { text: this._player1Total.counter }, 0, { text: this._player2Total.counter }, 0, 0],
		]

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
        
        if (!cell) return cell;
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