function calcTextMetrics(ctx, text) {
	const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text);
	return { textWidth: width, textHeight: actualBoundingBoxAscent + actualBoundingBoxDescent }
}

function getRandomFromRange(from, to) {
	return from === to ? from : from + Math.round(Math.random() * (to - from));
}

function twoAreasCollisioned(area1, area2) {
	return area1.x2 > area2.x1 &&
		area1.x1 < area2.x2 &&
		area1.y2 > area2.y1 &&
		area1.y1 < area2.y2;
}

function findClosestElem(elems, position, axis) {
	return elems.reduce((closest, elem) => {
		if (!closest) return elem;

		const currentDistance = Math.abs(elem.getPosition()[axis] - position[axis]);
		const prevDistance = Math.abs(closest.getPosition()[axis] - position[axis]);

		return currentDistance < prevDistance ? elem : closest;
	}, null)
}

function roundPositionByObject(position, size, velocity, objectBoundaryBox) {
	if (velocity.x > 0) return { ...position, x: objectBoundaryBox.x1 - size.width };
	else if (velocity.x < 0) return { ...position, x: objectBoundaryBox.x2 };
	else if (velocity.y > 0) return { ...position, y: objectBoundaryBox.y1 - size.height };
	else if (velocity.y < 0) return { ...position, y: objectBoundaryBox.y2 };
}

function getBoundaryBoxOfMovingElem(velocity, prevPosition, nextPosition, size) {
	if (velocity.x > 0) {
		return {
			x1: prevPosition.x,
			y1: prevPosition.y,
			x2: nextPosition.x + size.width,
			y2: nextPosition.y + size.height,
		}
	} else if (velocity.x < 0) {
		return {
			x1: nextPosition.x,
			y1: nextPosition.y,
			x2: prevPosition.x + size.width,
			y2: prevPosition.y + size.height,
		}
	} else if (velocity.y > 0) {
		return {
			x1: prevPosition.x,
			y1: prevPosition.y,
			x2: nextPosition.x + size.width,
			y2: nextPosition.y + size.height,
		}
	} else if (velocity.y < 0) {
		return {
			x1: nextPosition.x,
			y1: nextPosition.y,
			x2: prevPosition.x + size.width,
			y2: prevPosition.y + size.height,
		}
	}
}

class Assets {
	constructor() {
		this._assets = {};
		this._loaded = 0;
	}

	load() {
		return new Promise(resolve => {
			Assets.DATA.forEach(source => {
				const type = source.split('.').pop();
				if (Assets.IMAGES_TYPES.includes(type)) this._loadImage(source, resolve);
				else if (Assets.MAPS_TYPES.includes(type)) this._loadMap(source, resolve);
			})
		})
	}

	_increaseLoaded(resolve) {
		this._loaded += 1;
		if (this._loaded === Assets.DATA.length) resolve();
	}

	_loadImage(source, resolve) {
		const image = new Image();

		image.addEventListener('load', () => {
			this._assets[source] = image;
			this._increaseLoaded(resolve);
		})

		image.src = source;
	}

	_loadMap(source, resolve) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', source, true);

		xhr.addEventListener('load', () => {
			this._assets[source] = JSON.parse(xhr.responseText);
			this._increaseLoaded(resolve);
		})

		xhr.send();
	}

	get(source) {
		return this._assets[source];
	}
}

Assets.IMAGES_TYPES = ['png'];
Assets.MAPS_TYPES = ['json'];
Assets.DATA = [
	'images/title.png',
	'images/player-select.png',
	'images/player-01.png',
	'images/player-01-upgrade-01.png',
	'images/player-01-upgrade-02.png',
	'images/player-01-upgrade-03.png',
	'images/player-02.png',
	'images/player-02-upgrade-01.png',
	'images/player-02-upgrade-02.png',
	'images/player-02-upgrade-03.png',
	'images/enemy-01.png',
	'images/enemy-02.png',
	'images/enemy-03.png',
	'images/enemy-04.png',
	'images/eagle.png',
	'images/enemy-in-queue.png',
	'images/flag.png',
	'images/player-indicator.png',
	'images/enemy-type-01.png',
	'images/enemy-type-02.png',
	'images/enemy-type-03.png',
	'images/enemy-type-04.png',
	'images/small-explosion.png',
	'images/large-explosion.png',
	'images/birth.png',
	'images/bullet.png',
	'images/bricks.png',
	'images/concrete.png',
	'images/forest.png',
	'images/water.png',
	'images/shield.png',
	'images/buff-01.png',
	'images/buff-02.png',
	'images/buff-03.png',
	'images/buff-04.png',
	'images/buff-05.png',
	'images/buff-06.png',
	'json/levels.json',
];

class Sprite {
  constructor({ sprite, framesNumber, animationsNumber = 1, initialAnimationIndex = 0, fps = 8, loop = true, playing = false }) {
    this._sprite = sprite;
    this._framesNumber = framesNumber;
    this._animationsNumber = animationsNumber;
    this._fps = fps;
    this._frameDuration = 1000 / this._fps;
    this._frameSize = {
      width: this._sprite.width / this._animationsNumber,
      height: this._sprite.height / this._framesNumber,
    }

    this._frameIndex = 0;
    this._initialAnimationIndex = initialAnimationIndex;
    this._animationIndex = this._initialAnimationIndex;
    this._playing = playing;
    this._loop = loop;

    this._float = 0;
  }

  update({ prevFrameDuration }) {
    if (!this._playing) return;

    const timePassed = this._float + prevFrameDuration;
    const framesPassed = Math.floor(timePassed / this._frameDuration);
    
    this._float = timePassed % this._frameDuration;
    if (this._loop) {
      this._frameIndex = (this._frameIndex + framesPassed) % this._framesNumber;
    } else {
      this._frameIndex = Math.min(this._frameIndex + framesPassed, this._framesNumber - 1);
    }

    if (!this._loop && this._frameIndex === this._framesNumber - 1) this.stop();
  }

  render(ctx, position, size) {
    const framePosition = {
      x: this._animationIndex * this._frameSize.width,
      y: this._frameIndex * this._frameSize.height,
    }

    ctx.drawImage(this._sprite, framePosition.x, framePosition.y, this._frameSize.width, this._frameSize.height, position.x, position.y, size.width, size.height);
  }

  resetAnimation() {
    this._frameIndex = 0;
    this._animationIndex = this._initialAnimationIndex;
  }

  setAnimationIndex(index) {
    this._animationIndex = index;
  }

  play() {
    this._playing = true;
  }

  stop() {
    this._playing = false;
  }
  
  isPlaying() {
    return this._playing;
  }

  setSprite(sprite) {
    this._sprite = sprite;
  }
}

class PlayersIndicator {
	constructor ({ tileSize, gameAreaPosition, assets, state }) {
		this._gameAreaPosition = gameAreaPosition;
		this._tileSize = tileSize;
		this._assets = assets;
    this._state = state;

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
    const playersLives = this._state.getPlayersLives();
    const playersKeys = Object.keys(playersLives);

    playersKeys.forEach((key, index) => {
      const playerLabel = `${key}P`;
      const playerLives = playersLives[key] || 0;

      const playerLabelPosition = {
        x: this._position.x,
        y: this._position.y + index * (this._playerIndicatorHeight + this._spaceBetweenPlayers) + this._fontSize,
      }

      const playerSpritePosition = {
        x: this._position.x,
        y: this._position.y + index * (this._playerIndicatorHeight + this._spaceBetweenPlayers) + this._fontSize,
      }

      const playerLivesPosition = {
        x: this._position.x + this._spriteSize.width,
        y: this._position.y + index * (this._playerIndicatorHeight + this._spaceBetweenPlayers) + this._fontSize * 2,
      }

      ctx.font = `${this._fontSize}px PressStart2P`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(playerLabel, playerLabelPosition.x, playerLabelPosition.y);

      ctx.fillText(playerLives, playerLivesPosition.x, playerLivesPosition.y);

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
class EnemiesQueue {
	constructor ({ tileSize, gameAreaPosition, assets }) {
		this._gameAreaPosition = gameAreaPosition;
		this._tileSize = tileSize;
		this._assets = assets;
		this._enemiesInQueue = 20;

		this._sprite = this._assets.get('images/enemy-in-queue.png');

		this._position = {
			x: 0,
			y: 0,
		};
		this._spriteSize = {
			width: 0,
			height: 0,
		};
		this.setSize();
	}

	render(ctx) {
		for(let i = 0; i < this._enemiesInQueue; i++) {
			const offsetX = Math.ceil(i % 2);
			const offsetY = Math.floor(i / 2);
			const position = {
				x: this._position.x + this._spriteSize.width * offsetX,
				y: this._position.y + this._spriteSize.height * offsetY,
			}
			ctx.drawImage(this._sprite, position.x, position.y, this._spriteSize.width, this._spriteSize.height);
		}
	}

	setSize() {
		this._position.x = this._gameAreaPosition.x + this._tileSize.width * EnemiesQueue.POSITION_X_SCALE_FACTOR;
		this._position.y = this._gameAreaPosition.y + this._tileSize.height * EnemiesQueue.POSITION_Y_SCALE_FACTOR;
		this._spriteSize.width = this._tileSize.width * EnemiesQueue.SPRITE_SIZE_SCALE_FACTOR;
		this._spriteSize.height = this._tileSize.height * EnemiesQueue.SPRITE_SIZE_SCALE_FACTOR;
	}

	getEnemiesInQueue() {
		return this._enemiesInQueue;
	}

	decreaseEnemiesInQueue() {
		this._enemiesInQueue -= 1;
	}
}

EnemiesQueue.POSITION_X_SCALE_FACTOR = 54;
EnemiesQueue.POSITION_Y_SCALE_FACTOR = 2;
EnemiesQueue.SPRITE_SIZE_SCALE_FACTOR = 2;
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
class Statistics {
  constructor({ state, canvasSize, tileSize, assets }) {
    this._canvasSize = canvasSize;
    this._tileSize = tileSize;
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
    this._fontSize = this._tileSize.height * Statistics.FONT_SIZE_SCALE_FACTOR;
    this._size.width = this._tileSize.width * Statistics.WIDTH_SCALE_FACTOR;
    this._position.x = (this._canvasSize.width - this._size.width) / 2 - this._tileSize.width * Statistics.POSITION_X_OFFSET_SCALE_FACTOR;
    this._position.y = this._tileSize.height * Statistics.POSITION_Y_SCALE_FACTOR;
    this._cellSize.width = this._size.width / this._table[0].length;
    this._cellSize.height = this._tileSize.height * Statistics.CELL_HEIGHT_SCALE_FACTOR;
    this._spriteSize.width = this._tileSize.width * Statistics.SPRITE_WIDTH_SCALE_FACTOR;
    this._spriteSize.height = this._tileSize.height * Statistics.SPRITE_HEIGHT_SCALE_FACTOR;
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
            x: cellPosition.x + this._cellSize.width - this._spriteSize.width + this._tileSize.width * Statistics.SPRITE_POSITION_X_OFFSET_SCALE_FACTOR,
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
Statistics.SPRITE_WIDTH_SCALE_FACTOR = 4;
Statistics.SPRITE_POSITION_X_OFFSET_SCALE_FACTOR = 0;

class Level {
	constructor({ canvasSize, tileSize, gameAreaPosition, state, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._state = state;
		this._assets = assets;
		this._levels = this._assets.get('json/levels.json');

		this._mapSize = {
			width: 0,
			height: 0,
		}
		this._setSize();

		this._map = this._setMap();
	}

	_setMap() {
		const levelIndex = this._state.getLevelIndex();

		return this._levels[levelIndex].map((row, y) => {
			return row.map((key, x) => {
				
				if (!key) return key;

				return new Brick({
					tileSize: this._tileSize,
					gameAreaPosition: this._gameAreaPosition,
					coords: { x, y },
					assets: this._assets,
					...Brick.TYPES[key],
				})
			})
		})
	}

	render(ctx, layer) {
		if (layer === 'bottom') {
			ctx.fillStyle = '#121212';
			ctx.fillRect(this._gameAreaPosition.x, this._gameAreaPosition.y, this._mapSize.width, this._mapSize.height);
		}

		this._map.forEach(row => {
			row.forEach(brick => {
				if (brick && brick.getLayer() === layer) brick.render(ctx);
			})
		})
	}

	_setSize() {
		this._mapSize.width = this._tileSize.width * Level.MAP_WIDTH_SCALE_FACTOR;
		this._mapSize.height = this._tileSize.height * Level.MAP_HEIGHT_SCALE_FACTOR;
	}

	resize() {
		this._setSize();
		this._map.forEach(row => {
			row.forEach(brick => {
				if (brick) brick.setSize();
			})
		})
	}

	destroyBricks(bricks) {
		bricks.forEach(brick => {
			const { x, y } = brick.getCoords();
			this._map[y][x] = 0;
		})
	}

	getBoundaryBox() {
		return {
			x1: this._gameAreaPosition.x,
			y1: this._gameAreaPosition.y,
			x2: this._gameAreaPosition.x + this._mapSize.width,
			y2: this._gameAreaPosition.y + this._mapSize.height,
		}
	}

	getMap() {
		return this._map;
	}

	getMapSize() {
		return this._mapSize;
	}
}

Level.MAP_WIDTH_SCALE_FACTOR = 52;
Level.MAP_HEIGHT_SCALE_FACTOR = 52;
class Brick {
	constructor({ coords, tileSize, gameAreaPosition, collideWithBullet, collideWithTank, breakByBullet, layer, assets, sprite, frameIndex, framesNumber }) {
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._assets = assets;
		this._coords = coords;

		this._position = {
			x: 0,
			y: 0,
		};
		this.setSize();

		this._layer = layer;
		this._collideWithTank = collideWithTank;
		this._collideWithBullet = collideWithBullet;
		this._breakByBullet = breakByBullet;

		this._sprite = this._assets.get(sprite);
		this._frameIndex = frameIndex;
		this._framesNumber = framesNumber;
	}

	setSize() {
		this._position.x = this._gameAreaPosition.x + this._coords.x * this._tileSize.width;
		this._position.y = this._gameAreaPosition.y + this._coords.y * this._tileSize.height;
	}

	render(ctx) {
		const spriteOffset = this._sprite.width / this._framesNumber * this._frameIndex;
		ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width / this._framesNumber, this._sprite.height, this._position.x, this._position.y, this._tileSize.width, this._tileSize.height);
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._tileSize.width,
			y2: this._position.y + this._tileSize.height,
		}
	}

	getSize() {
		return this._tileSize;
	}

	getPosition() {
		return this._position;
	}

	getCoords() {
		return this._coords;
	}

	getLayer() {
		return this._layer;
	}

	isCollideWithBullet() {
		return this._collideWithBullet;
	}

	isBreakByBullet() {
		return this._breakByBullet;
	}

	isCollideWithTank() {
		return this._collideWithTank;
	}
}

Brick.TYPES = {
	1: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: true,
		sprite: 'images/bricks.png',
		framesNumber: 2,
		frameIndex: 0,
		layer: 'bottom',
	},
	2: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: true,
		sprite: 'images/bricks.png',
		framesNumber: 2,
		frameIndex: 1,
		layer: 'bottom',
	},
	3: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 0,
		layer: 'bottom',
	},
	4: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 1,
		layer: 'bottom',
	},
	5: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 2,
		layer: 'bottom',
	},
	6: {
		collideWithTank: true,
		collideWithBullet: true,
		breakByBullet: false,
		sprite: 'images/concrete.png',
		framesNumber: 4,
		frameIndex: 3,
		layer: 'bottom',
	},
	7: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 0,
		layer: 'top',
	},
	8: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 1,
		layer: 'top',
	},
	9: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 2,
		layer: 'top',
	},
	10: {
		collideWithTank: false,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/forest.png',
		framesNumber: 4,
		frameIndex: 3,
		layer: 'top',
	},
	11: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 0,
		layer: 'bottom',
	},
	12: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 1,
		layer: 'bottom',
	},
	13: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 2,
		layer: 'bottom',
	},
	14: {
		collideWithTank: true,
		collideWithBullet: false,
		breakByBullet: false,
		sprite: 'images/water.png',
		framesNumber: 4,
		frameIndex: 3,
		layer: 'bottom',
	},
}
class Eagle {
	constructor({ tileSize, gameAreaPosition, assets, explosionsStore }) {
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._assets = assets;
		this._explosionsStore = explosionsStore;

		this._size = {
			width: 0,
			height: 0,
		}
		this._position = {
			x: 0,
			y: 0,
		}
		this.setSize();

		this._sprite = this._assets.get('images/eagle.png');

		this._status = Eagle.STATUSES[1];
	}

	render(ctx) {
		const offsetX = this.isDestroyed() ? this._sprite.width / 2 : 0; 
		
		ctx.drawImage(this._sprite, offsetX, 0, this._sprite.width / 2, this._sprite.height, this._position.x, this._position.y, this._size.width, this._size.height);
	}

	setSize() {
		this._size.width = this._tileSize.width * Eagle.SIZE_SCALE_FACTOR;
		this._size.height = this._tileSize.height * Eagle.SIZE_SCALE_FACTOR;
		this._position.x = this._gameAreaPosition.x + this._tileSize.width * Eagle.INITIAL_COORDS.x;
		this._position.y = this._gameAreaPosition.y + this._tileSize.height * Eagle.INITIAL_COORDS.y;
	}

	isDestroyed() {
		return this._status === Eagle.STATUSES[2];
	}

	destroy() {
		if (this.isDestroyed()) return;
		
		this._status = Eagle.STATUSES[2];
		this._addExplosion();
	}

	_addExplosion() {
		const explosion = new LargeExplosion({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: {
				x: this._position.x + this._size.width / 2,
				y: this._position.y + this._size.height / 2,
			},
			explosionsStore: this._explosionsStore,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	getPosition() {
		return this._position;
	}

	getRoundedBoundaryBox() {
		return {
			x1: this._gameAreaPosition.x + Eagle.INITIAL_COORDS.x * this._tileSize.width,
			y1: this._gameAreaPosition.y + Eagle.INITIAL_COORDS.y * this._tileSize.height,
			x2: this._gameAreaPosition.x + Eagle.INITIAL_COORDS.x * this._tileSize.width + this._size.width,
			y2: this._gameAreaPosition.y + Eagle.INITIAL_COORDS.y * this._tileSize.height + this._size.height,
		}
	}
}

Eagle.STATUSES = {
	1: 'active',
	2: 'destroyed',
}
Eagle.SIZE_SCALE_FACTOR = 4;
Eagle.INITIAL_COORDS = {
	x: 24,
	y: 48,
}

class Buff {
  constructor({ tileSize, gameAreaPosition, assets, coords, sprite, buffsStore }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
    this._coords = coords;
    this._assets = assets;
    this._sprite = this._assets.get(sprite);
    this._buffsStore = buffsStore;

    this._status = Buff.STATUSES[1];

    this._size = {
      width: 0,
      height: 0,
    }
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize();

    this._duration = getRandomFromRange(9000, 13000);
    this._birthTime = null;
  }

  setSize() {
    this._size.width = this._tileSize.width * Buff.SIZE_SCALE_FACTOR;
    this._size.height = this._tileSize.height * Buff.SIZE_SCALE_FACTOR;
    this._position.x = this._gameAreaPosition.x + this._coords.x * this._tileSize.width;
    this._position.y = this._gameAreaPosition.y + this._coords.y * this._tileSize.height;
  }

  update({ timestamp }) {
    if (this._birthTime === null) {
      this._birthTime = timestamp;
    } else if (timestamp > this._birthTime + this._duration) {
      this._status = Buff.STATUSES[2];
      this._buffsStore.setHasUnactiveBuffs(true);
    }
  }

  render(ctx) {
    ctx.drawImage(this._sprite, this._position.x, this._position.y, this._size.width, this._size.height);
  }

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._size.width,
			y2: this._position.y + this._size.height,
		}
	}

  isActive() {
    return this._status === Buff.STATUSES[1];
  }

  isPassed() {
    return this._status === Buff.STATUSES[2];
  }

  isApplied() {
    return this._status === Buff.STATUSES[3];
  }
}

Buff.SIZE_SCALE_FACTOR = 4;
Buff.STATUSES = {
  1: 'active',
  2: 'passed',
  3: 'applied',
}
class ShieldBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-01.png' });
  }

  apply(tank) {
    tank.enableShield();
    
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}
class TimerBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-02.png' });
  }

  apply(tank) {
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}
class EagleArmorBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-03.png' });
  }

  apply(tank) {
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}
class UpgradeBuff extends Buff {
  constructor(props) {
    const { state } = props;

    super({ ...props, sprite: 'images/buff-04.png' });

    this._state = state;
  }

  apply(tank) {
    const sign = tank.getSign();
    const currentUpgradeLevel = tank.getUpgradeLevel();
    const nextUpgradeLevel = currentUpgradeLevel + 1;
    const nextUpgrade = sign === 1 ? FirstPlayer.UPGRADES[nextUpgradeLevel] : SecondPlayer.UPGRADES[nextUpgradeLevel];
    if (nextUpgrade) {
      tank.upgrade({ upgradeLevel: nextUpgradeLevel, ...nextUpgrade });
      this._state.increasePlayerUpgradeLevel(sign);
    }

    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}
class BombBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-05.png' });

    const { state, enemiesStore } = props;
    this._state = state;
    this._enemiesStore = enemiesStore;
  }

  apply(tank) {
    const enemies = this._enemiesStore.getEnemies();

    enemies.forEach(enemy => {
      enemy.destroy();
      this._updatePlayerStatistics(enemy, tank);
    })

    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }

	_updatePlayerStatistics(enemy, player) {
		const enemySign = enemy.getSign();
		const enemyPrice = enemy.getPrice();
		const playerSign = player.getSign();
		this._state.increasePlayerStatistics(playerSign, enemySign, enemyPrice);
	}
}
class LifeBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-06.png' });

    const { state } = props;
    this._state = state;
  }

  apply(tank) {
    const playerSign = tank.getSign();
    this._state.increasePlayerLives(playerSign);
    
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}
class BuffsStore {
  constructor() {
    this._buffs = [];
    this._hasUnactiveBuffs = false;
  }

	update(time) {
		this._buffs.forEach(buff => buff.update(time));

    if (this._hasUnactiveBuffs) {
      this.clearUnactiveBuffs();
      this.setHasUnactiveBuffs(false);
    }
	}

	clearUnactiveBuffs() {
		this._buffs = this._buffs.filter(buff => buff.isActive());
	}

	render(ctx) {
		this._buffs.forEach(buff => buff.render(ctx));
	}

  setSize() {
    this._buffs.forEach(buff => buff.setSize());
  }

  addBuff(buff) {
    this._buffs.push(buff);
  }

  getBuffs() {
    return this._buffs;
  }

  setHasUnactiveBuffs(payload) {
    this._hasUnactiveBuffs = payload;
  }
}
class BuffsSpawner {
  constructor({ tileSize, gameAreaPosition, state, assets, enemiesStore, buffsStore }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
		this._state = state;
    this._assets = assets;
		this._enemiesStore = enemiesStore;
    this._buffsStore = buffsStore;
  }

	spawnRandomBuff() {
		const randomBuffClassIndex = getRandomFromRange(0, BuffsSpawner.BUFFS_CLASSES.length - 1);

		const buff = new BuffsSpawner.BUFFS_CLASSES[randomBuffClassIndex]({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesStore: this._enemiesStore,
			buffsStore: this._buffsStore,
			coords: {
        x: getRandomFromRange(0, Level.MAP_WIDTH_SCALE_FACTOR - Buff.SIZE_SCALE_FACTOR),
        y: getRandomFromRange(0, Level.MAP_HEIGHT_SCALE_FACTOR - Buff.SIZE_SCALE_FACTOR),
      },
		})

		this._buffsStore.addBuff(buff);
	}
}

BuffsSpawner.BUFFS_CLASSES = [ShieldBuff, UpgradeBuff, BombBuff, LifeBuff]; // TimerBuff, EagleArmorBuff,

class Tank {
	constructor({ tileSize, gameAreaPosition, playersStore, enemiesStore, bulletsStore, explosionsStore, level, eagle, assets, state, buffsStore, buffsSpawner, initialCoords, initialDirection, spawnBuffOnHit, sign, armor, speed, reloadDuration, maxPersonalBulletsNumber, upgradeLevel, moveSprite, moveSpriteInitialAnimationIndex, allowToBuffs, price }) {
		this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;
		
		this._playersStore = playersStore;
		this._enemiesStore = enemiesStore;
		this._bulletsStore = bulletsStore;
		this._explosionsStore = explosionsStore;
		this._buffsStore = buffsStore;
		this._buffsSpawner = buffsSpawner;
		this._level = level;
		this._eagle = eagle;
		this._assets = assets;
		this._state = state;

		this._initialCoords = initialCoords;
		this._initialDirection = initialDirection;
		this._direction = {
			x: initialDirection.x,
			y: initialDirection.y,
		};

		this._speed = speed;
		this._size = {
			width: 0,
			height: 0,
		};
		this._position = {
			x: 0,
			y: 0,
		};
		this._velocity = {
			x: 0,
			y: 0,
		};
		this.setSize({ initial: true });

		this._sign = sign;
		this._armor = armor;
		this._reloadDuration = reloadDuration;
		this._maxPersonalBulletsNumber = maxPersonalBulletsNumber;
		this._personalBullets = [];
		this._shield = false;
		this._shieldDuration = 15000;
		this._spawnBuffOnHit = spawnBuffOnHit;
		this._price = price;
		this._allowToBuffs = allowToBuffs;
		this._collideWithOtherTanks = false;
		this._upgradeLevel = upgradeLevel;

		this._status = Tank.STATUSES[1];
		
		this._moveSprite = new Sprite({
			sprite: this._assets.get(moveSprite),
			framesNumber: 2,
			animationsNumber: 4,
			initialAnimationIndex: moveSpriteInitialAnimationIndex,
		})

		this._birthSprite = new Sprite({
			sprite: this._assets.get('images/birth.png'),
			framesNumber: 6,
			playing: true,
			fps: 16,
		})

		this._shieldSprite = new Sprite({
			sprite: this._assets.get('images/shield.png'),
			framesNumber: 2,
			playing: true,
			fps: 16,
		})

		this._birthStartTime = null;
		this._reloadingStartTime = null;
		this._shieldStartTime = null;
	}

	setSize({ initial = false } = {}) {
		this._size.width = this._tileSize.width * Tank.SIZE_SCALE_FACTOR;
		this._size.height = this._tileSize.height * Tank.SIZE_SCALE_FACTOR;

		if (initial) {
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * this._initialCoords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * this._initialCoords.y;
		} else {
			const coords = {
				x: (this._position.x - this._prevGameAreaPositionX) / this._prevTileSizeWidth,
				y: (this._position.y - this._prevGameAreaPositionY) / this._prevTileSizeHeight,
			}
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * coords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * coords.y;

			this._speed.x = this._speed.x / this._prevTileSizeWidth * this._tileSize.width;
			this._speed.y = this._speed.y / this._prevTileSizeHeight * this._tileSize.height;

			this._velocity.x = this._velocity.x / this._prevTileSizeWidth * this._tileSize.width;
			this._velocity.y = this._velocity.y / this._prevTileSizeHeight * this._tileSize.height;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
		}
	}

	render(ctx) {
		if (this.isBirthing()) this._birthSprite.render(ctx, this._position, this._size);
		else if (this.isActive()) this._moveSprite.render(ctx, this._position, this._size);

		if (this.isActive() && this._shield) this._shieldSprite.render(ctx, this._position, this._size);
	}

	update(time) {
		if (this.isBirthing()) this._updateBirth(time);
		else if (this.isActive()) this._updateActive(time);

		if (this.isActive() && this._shield) this._updateShield(time);
	}

	_updateShield(time) {
		const { timestamp } = time;

		if (this._shieldStartTime === null) {
			this._shieldStartTime = timestamp;
		} else if (this._shieldStartTime + this._shieldDuration > timestamp) {
			this._shieldSprite.update(time);
		} else {
			this._shield = false;
			this._shieldStartTime = null;
		}
	}

	_updateBirth(time) {
		if (this._birthStartTime === null) this._birthStartTime = time.timestamp;
		else if (time.timestamp > this._birthStartTime + Tank.BIRTH_DURATION) this._status = Tank.STATUSES[2];
		else this._birthSprite.update(time);
	}

	_updateActive(time) {
		if (this._velocity.x || this._velocity.y) {
			const [ roundedAxis, floatAxis ] = this._velocity.x ? ['y', 'x'] : ['x', 'y'];
			let position = {
				[roundedAxis]: this._roundPositionByAxis(this._position[roundedAxis], roundedAxis),
				[floatAxis]: this._position[floatAxis] + this._velocity[floatAxis] * time.delta,
			}
	
			position = this._updatePositionWithLevelEdgesCollision(position);
			position = this._updatePositionWithLevelBricksCollision(position);
			position = this._updatePositionWithEagleCollision(position);
			if (this._collideWithOtherTanks) position = this._updatePositionWithTanksCollision(position);
			else this._tryToEnableCollisionsWithOtherTanks(position);

			if (this._allowToBuffs) this._checkAndHandleBuffsCollision(position);

			this._position = position;
		}

		this._moveSprite.update(time);
	}

	_roundPositionByAxis(positionByAxis, axis) {
		return axis === 'x' ? 
			Math.round((positionByAxis - this._gameAreaPosition.x) / this._tileSize.width) * this._tileSize.width + this._gameAreaPosition.x :
			Math.round((positionByAxis - this._gameAreaPosition.y) / this._tileSize.height) * this._tileSize.height + this._gameAreaPosition.y;
	}

	_checkAndHandleBuffsCollision(position) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);

		this._buffsStore
			.getBuffs()
			.forEach(buff => {
				const buffBoundaryBox = buff.getBoundaryBox();
				const collision = twoAreasCollisioned(tankBoundaryBox, buffBoundaryBox);

				if (collision) buff.apply(this);
			})
	}

	_updatePositionWithLevelEdgesCollision(position, velocity = this._velocity) {
		const levelBoundaryBox = this._level.getBoundaryBox();
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(velocity, this._position, position, this._size);

		if (tankBoundaryBox.x2 > levelBoundaryBox.x2) return { ...position, x: levelBoundaryBox.x2 - this._size.width };
		else if (tankBoundaryBox.x1 < levelBoundaryBox.x1) return { ...position, x: levelBoundaryBox.x1 };
		else if (tankBoundaryBox.y2 > levelBoundaryBox.y2) return { ...position, y: levelBoundaryBox.y2 - this._size.height };
		else if (tankBoundaryBox.y1 < levelBoundaryBox.y1) return { ...position, y: levelBoundaryBox.y1 };
		else return position;
	}

	_updatePositionWithEagleCollision(position) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._size);
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();
		const collision = twoAreasCollisioned(tankBoundaryBox, eagleBoundaryBox);

		return collision ? roundPositionByObject(position, this._size, this._velocity, eagleBoundaryBox) : position;
	}

	_updatePositionWithLevelBricksCollision(position, velocity = this._velocity) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(velocity, this._position, position, this._size);

		const coords = {
			x1: Math.floor((tankBoundaryBox.x1 - this._gameAreaPosition.x) / this._tileSize.width),
			y1: Math.floor((tankBoundaryBox.y1 - this._gameAreaPosition.y) / this._tileSize.height),
			x2: Math.ceil((tankBoundaryBox.x2 - this._gameAreaPosition.x) / this._tileSize.width),
			y2: Math.ceil((tankBoundaryBox.y2 - this._gameAreaPosition.y) / this._tileSize.height),
		}

		const bricksWithCollision = this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => {
				if (!brick || !brick.isCollideWithTank()) return false;

				const brickBoundaryBox = brick.getBoundaryBox();
				return twoAreasCollisioned(tankBoundaryBox, brickBoundaryBox)
			})

		if (!bricksWithCollision.length) return position;

		const axis = velocity.x ? 'x' : 'y';
		const closestBrick = findClosestElem(bricksWithCollision, position, axis);
		const closestBrickBoundaryBox = closestBrick.getBoundaryBox();

		return roundPositionByObject(position, this._size, velocity, closestBrickBoundaryBox);
	}

	_getTanksWithCollision(position, velocity = this._velocity) {
		const tankBoundaryBox = getBoundaryBoxOfMovingElem(velocity, this._position, position, this._size);

		const enemies = this._enemiesStore.getEnemies();
		const players = this._playersStore.getPlayers();

		return [...enemies, ...players].filter(item => {
			if (item === this) return false;
			if (!item.canCollideWithOtherTanks()) return false;

			const itemBoundaryBox = item.getRoundedBoundaryBox();
			return twoAreasCollisioned(tankBoundaryBox, itemBoundaryBox);
		})
	}

	_updatePositionWithTanksCollision(position, velocity = this._velocity) {
		const itemsWithCollision = this._getTanksWithCollision(position, velocity);

		if (!itemsWithCollision.length) return position;

		const axis = velocity.x ? 'x' : 'y';
		const closestItem = findClosestElem(itemsWithCollision, position, axis);
		const closestItemBoundaryBox = closestItem.getRoundedBoundaryBox();

		return roundPositionByObject(position, this._size, velocity, closestItemBoundaryBox);
	}

	_tryToEnableCollisionsWithOtherTanks(position) {
		const itemsWithCollision = this._getTanksWithCollision(position);
		
		if (!itemsWithCollision.length) this._collideWithOtherTanks = true;
	}

	_canShoot(timestamp) {
		return this._reloadingStartTime === null || (this._reloadingStartTime + this._reloadDuration < timestamp && this._personalBullets.length < this._maxPersonalBulletsNumber);
	}

	_shoot(timestamp) {
		if (!this._canShoot(timestamp)) return;

		const bulletWidth = this._tileSize.width;
		const bulletHeight = this._tileSize.height;
		
		let bulletPosition;
		if (this._direction.x) {
			bulletPosition = { 
				x: this._direction.x > 0 ? this._position.x + this._size.width - bulletWidth : this._position.x, 
				y: this._position.y + this._size.height / 2 - bulletHeight / 2,
			};
		} else {
			bulletPosition = { 
				x: this._position.x + this._size.width / 2 - bulletWidth / 2,
				y: this._direction.y > 0 ? this._position.y + this._size.height - bulletHeight : this._position.y,
			};
		}

		const bullet = new Bullet({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			level: this._level,
			position: bulletPosition,
			direction: { x: this._direction.x, y: this._direction.y },
			owner: this,
			playersStore: this._playersStore,
			enemiesStore: this._enemiesStore,
			bulletsStore: this._bulletsStore,
			explosionsStore: this._explosionsStore,
			state: this._state,
			eagle: this._eagle,
			assets: this._assets,
		})

		this._bulletsStore.addBullet(bullet);
		this._personalBullets.push(bullet);

		this._reloadingStartTime = timestamp;
	}

	_move(direction) {
		this._direction.x = direction.x;
		this._direction.y = direction.y;

		this._velocity = {
			x: this._direction.x * this._speed.x,
			y: this._direction.y * this._speed.y,
		}

		switch(direction) {
			case Tank.DIRECTIONS.up:
				this._moveSprite.setAnimationIndex(0);
				break;
			case Tank.DIRECTIONS.down:
				this._moveSprite.setAnimationIndex(1);
				break;
			case Tank.DIRECTIONS.left:
				this._moveSprite.setAnimationIndex(2);
				break;
			case Tank.DIRECTIONS.right:
				this._moveSprite.setAnimationIndex(3);
				break;
		}

		this._moveSprite.play();
	}

	_stop(direction) {
		let mustStop = true;

		if (direction) {
			mustStop =
				(direction === Tank.DIRECTIONS.up && this._velocity.y < 0) ||
				(direction === Tank.DIRECTIONS.down && this._velocity.y > 0) ||
				(direction === Tank.DIRECTIONS.right && this._velocity.x > 0) ||
				(direction === Tank.DIRECTIONS.left && this._velocity.x < 0);
		}

		if (mustStop) {
			this._velocity = { x: 0, y: 0 };
			this._moveSprite.stop();
		}
	}

	_addExplosion() {
		const explosion = new LargeExplosion({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: {
				x: this._position.x + this._size.width / 2,
				y: this._position.y + this._size.height / 2,
			},
			explosionsStore: this._explosionsStore,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	upgrade({ upgradeLevel, moveSprite, maxPersonalBulletsNumber, reloadDuration }) {
		this._upgradeLevel = upgradeLevel;
		this._maxPersonalBulletsNumber = maxPersonalBulletsNumber;
		this._reloadDuration = reloadDuration;
		this._moveSprite.setSprite(this._assets.get(moveSprite));
	}

	clearDestroyedBullets() {
		this._personalBullets = this._personalBullets.filter(bullet => !bullet.isDestroyed());
	}

	handleHit() {
		if (!this._shield) {
			if (this._spawnBuffOnHit) {
				this._buffsSpawner.spawnRandomBuff();
				this._spawnBuffOnHit = false;
			}
	
			if (this._armor) this._armor -= 1;
			else this.destroy();
		}

		return this.isDestroyed();
	}

	destroy() {
		this._status = Tank.STATUSES[3];
		this._stop();
		this._addExplosion();
		if (this instanceof Enemy) this._enemiesStore.setHasDestroyedEnemies(true);
		else this._playersStore.setHasDestroyedPlayers(true);
	}

	respawn() {
		this._birthStartTime = null;
		this._reloadingStartTime = null;
		this._status = Tank.STATUSES[1];
		this._moveSprite.resetAnimation();

		this._position.x = this._gameAreaPosition.x + this._tileSize.width * this._initialCoords.x;
		this._position.y = this._gameAreaPosition.y + this._tileSize.height * this._initialCoords.y;
		this._direction.x = this._initialDirection.x;
		this._direction.y = this._initialDirection.y;
	}

	enableShield() {
		this._shield = true;
	}

	getSign() {
		return this._sign;
	}

	getPrice() {
		return this._price;
	}

	getPosition() {
		return this._position;
	}

	getUpgradeLevel() {
		return this._upgradeLevel;
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._size.width,
			y2: this._position.y + this._size.height,
		}
	}

	getRoundedBoundaryBox() {
		const coords = {
			x: (this._position.x - this._gameAreaPosition.x) / this._tileSize.width,
			y: (this._position.y - this._gameAreaPosition.y) / this._tileSize.height,
		}
		return {
			x1: this._gameAreaPosition.x + Math.floor(coords.x) * this._tileSize.width,
			y1: this._gameAreaPosition.y + Math.floor(coords.y) * this._tileSize.height,
			x2: this._gameAreaPosition.x + Math.ceil(coords.x) * this._tileSize.width + this._size.width,
			y2: this._gameAreaPosition.y + Math.ceil(coords.y) * this._tileSize.height + this._size.height,
		}
	}

	hasShield() {
		return this._shield;
	}

	canCollideWithOtherTanks() {
		return this._collideWithOtherTanks;
	}

	isBirthing() {
		return this._status === Tank.STATUSES[1];
	}

	isActive() {
		return this._status === Tank.STATUSES[2];
	}

	isDestroyed() {
		return this._status === Tank.STATUSES[3];
	}
}

Tank.SIZE_SCALE_FACTOR = 4;
Tank.BIRTH_DURATION = 1200;
Tank.STATUSES = {
	1: 'birthing',
	2: 'active',
	3: 'destroyed',
}
Tank.DIRECTIONS = {
	up: {
		x: 0,
		y: -1,
	},
	down: {
		x: 0,
		y: 1,
	},
	right: {
		x: 1,
		y: 0,
	},
	left: {
		x: -1,
		y: 0,
	},
}
class Player extends Tank {
	constructor(props) {
		const { tileSize, moveEvents, shootEvent } = props;

		super({
			...props,
			speed: { 
				x: tileSize.width * Player.SPEED_PER_SECOND_SCALE_FACTOR,
				y: tileSize.height * Player.SPEED_PER_SECOND_SCALE_FACTOR,
			},
			moveSpriteInitialAnimationIndex: 0,
			initialDirection: { x: 0, y: -1 },
			armor: 0,
			spawnBuffOnHit: false,
			allowToBuffs: true,
		});

		this._moveEvents = moveEvents;
		this._shootEvent = shootEvent;
	}

	_getDirectionKeyFromEventCode(code) {
		let key = code.replace(/(ArrowUp|KeyW)/gi, 'up');
		key = key.replace(/(ArrowDown|KeyS)/gi, 'down');
		key = key.replace(/(ArrowRight|KeyD)/gi, 'right');
		key = key.replace(/(ArrowLeft|KeyA)/gi, 'left');
		return key;
	}

	handleKeyDown({ code, timeStamp: timestamp }) {
		if (!this.isActive()) return;

		if (code === this._shootEvent) this._shoot(timestamp);

		if (this._moveEvents.includes(code)) {
			const key = this._getDirectionKeyFromEventCode(code);
			this._move(Tank.DIRECTIONS[key]);
		}
	}

	handleKeyUp({ code }) {
		if (!this.isActive()) return;

		if (this._moveEvents.includes(code)) {
			const key = this._getDirectionKeyFromEventCode(code);
			this._stop(Tank.DIRECTIONS[key]);
		}
	}
}

Player.SPEED_PER_SECOND_SCALE_FACTOR = 6;
class FirstPlayer extends Player {
	constructor(props) {
		super({
			...props,
			sign: 1,
			initialCoords: { x: 18, y: 48 },
			moveEvents: ['KeyW', 'KeyS', 'KeyD', 'KeyA'],
			shootEvent: 'Space',
		});
	}
}

FirstPlayer.UPGRADES = {
	0: {
		moveSprite: 'images/player-01.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 700,
	},
	1: {
		moveSprite: 'images/player-01-upgrade-01.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 500,
	},
	2: {
		moveSprite: 'images/player-01-upgrade-02.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 300,
	},
	3: {
		moveSprite: 'images/player-01-upgrade-03.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 100,
	},
}
class SecondPlayer extends Player {
	constructor(props) {
		super({
			...props,
			sign: 2,
			initialCoords: { x: 30, y: 48 },
			moveEvents: ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'],
			shootEvent: 'Enter',
		});
	}
}

SecondPlayer.UPGRADES = {
	0: {
		moveSprite: 'images/player-02.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 700,
	},
	1: {
		moveSprite: 'images/player-02-upgrade-01.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 500,
	},
	2: {
		moveSprite: 'images/player-02-upgrade-02.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 300,
	},
	3: {
		moveSprite: 'images/player-02-upgrade-03.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 100,
	},
}
class PlayersStore {
	constructor({ state }) {
		this._state = state;
		this._players = [];
		this._hasDestroyedPlayers = false;
	}

	update(time) {
		this._players.forEach(player => player.update(time));

		if (this._hasDestroyedPlayers) {
			this.clearDestroyedPlayers();
			this.setHasDestroyedPlayers(false);
		}
	}

	clearDestroyedPlayers() {
		this._players = this._players.filter(player => !player.isDestroyed() || this._tryToRespawnPlayer(player));
	}

	_tryToRespawnPlayer(player) {
		const sign = player.getSign();
		const playersLives = this._state.getPlayersLives();

		if (playersLives[sign] > 0) {
			this._state.setPlayerLives(sign, playersLives[sign] - 1);
			this._resetPlayerUpgradeLievel(player, sign);
			player.respawn();
		} else {
			this._state.setPlayerLives(sign, null);
		}

		return !player.isDestroyed();
	}

	_resetPlayerUpgradeLievel(player, sign) {
		const upgradeLevel = 0;
		const upgrade = sign === 1 ? FirstPlayer.UPGRADES[upgradeLevel] : SecondPlayer.UPGRADES[upgradeLevel];
		player.upgrade({ upgradeLevel, ...upgrade });
		this._state.resetPlayerUpgradeLevel(sign);
	}

	render(ctx) {
		this._players.forEach(player => player.render(ctx));
	}

	setSize() {
		this._players.forEach(player => player.setSize());
	}

	addPlayer(player) {
		this._players.push(player);
	}

	getPlayers() {
		return this._players;
	}

	setHasDestroyedPlayers(payload) {
		this._hasDestroyedPlayers = payload;
	}

	handleKeyDown(event) {
		this._players.forEach(player => player.handleKeyDown(event));
	}

	handleKeyUp(event) {
		this._players.forEach(player => player.handleKeyUp(event));
	}
}
class PlayersSpawner {
  constructor({ tileSize, gameAreaPosition, assets, enemiesQueue, enemiesStore, level, playersStore, bulletsStore, explosionsStore, buffsStore, buffsSpawner, eagle, state }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
		this._state = state;
    this._assets = assets;
    this._enemiesQueue = enemiesQueue;
    this._enemiesStore = enemiesStore;
		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._explosionsStore = explosionsStore;
    this._buffsStore = buffsStore;
		this._buffsSpawner = buffsSpawner;
		this._level = level;
		this._eagle = eagle;
  }

  spawnPlayers() {
    const playersLives = this._state.getPlayersLives();
    const playersUpgradeLevels = this._state.getPlayersUpgradeLevels();

		if (playersLives[1] !== null) {
			const firstPlayer = new FirstPlayer({
				...this._getPlayersCommonProps(),
				upgradeLevel: playersUpgradeLevels[1],
				...FirstPlayer.UPGRADES[playersUpgradeLevels[1]],
			});

			this._playersStore.addPlayer(firstPlayer);
		}

		if (playersLives[2] !== null) {
			const secondPlayer = new SecondPlayer({
				...this._getPlayersCommonProps(),
				upgradeLevel: playersUpgradeLevels[2],
				...SecondPlayer.UPGRADES[playersUpgradeLevels[2]],
			});
	
			this._playersStore.addPlayer(secondPlayer);
		}
  }

  _getPlayersCommonProps() {
    return {
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			level: this._level,
			bulletsStore: this._bulletsStore,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			buffsStore: this._buffsStore,
			explosionsStore: this._explosionsStore,
			eagle: this._eagle,
			assets: this._assets,
			state: this._state,
    }
  }
}
class Enemy extends Tank {
	constructor(props) {
		super({
			...props,
			upgradeLevel: 0,
			allowToBuffs: false,
		});

		this._prevChangeDirectionTime = null;
		this._nextChangeDirectionTime = null;
		this._prevShootTime = null;
		this._nextShootTime = null;
	}

	update(time) {
		if (this.isActive()) {
			this._updateDirectionAndStartOrContinueMoving(time);
			this._updateShooting(time);
		};

		super.update(time);
	}

	_updateDirectionAndStartOrContinueMoving({ timestamp, delta }) {
		if (this._prevChangeDirectionTime === null || timestamp > this._nextChangeDirectionTime) {
			this._prevChangeDirectionTime = timestamp;
			this._nextChangeDirectionTime = this._prevChangeDirectionTime + getRandomFromRange(500, 4000);
			const direction = this._getDirection(delta);
			this._move(direction);
		}
	}

	_getDirection(delta) {
		const ignoreSmartDirectionsKeys = Math.random() > 0.75;
		const smartDirectionsKeys = ignoreSmartDirectionsKeys ? [] : this._getSmartDirectionsKeys().filter(key => this._directionIsFree(Tank.DIRECTIONS[key], delta));
		const directionsToMoveKeys = smartDirectionsKeys.length ? smartDirectionsKeys : Object.keys(Tank.DIRECTIONS);

		const index = getRandomFromRange(0, directionsToMoveKeys.length - 1);
		const key = directionsToMoveKeys[index];

		return Tank.DIRECTIONS[key];
	}

	_getSmartDirectionsKeys() {
		const eaglePosition = this._eagle.getPosition();

		if (eaglePosition.x < this._position.x) return ['down', 'left'];
		else if (eaglePosition.x > this._position.x) return ['down', 'right'];
		else return ['down'];
	}

	_directionIsFree(direction, delta) {
		const velocity = {
			x: direction.x * this._speed.x,
			y: direction.y * this._speed.y,
		}

		const [ roundedAxis, floatAxis ] = velocity.x ? ['y', 'x'] : ['x', 'y'];
		const supposedPosition = {
			[roundedAxis]: this._roundPositionByAxis(this._position[roundedAxis], roundedAxis),
			[floatAxis]: this._position[floatAxis] + velocity[floatAxis] * delta,
		}

		let actualPosition = this._updatePositionWithLevelEdgesCollision(supposedPosition, velocity);
		actualPosition = this._updatePositionWithTanksCollision(actualPosition, velocity);
		actualPosition = this._updatePositionWithLevelBricksCollision(actualPosition, velocity);

		return supposedPosition === actualPosition;
	}

	_updateShooting({ timestamp }) {
		if (this._prevShootTime && timestamp > this._nextShootTime) this._shoot(timestamp);

		if (!this._prevShootTime || timestamp > this._nextShootTime) {
			this._prevShootTime = timestamp;
			this._nextShootTime = this._prevShootTime + getRandomFromRange(500, 3000);
		}
	}
}

Enemy.INITIAL_COORDS = [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 48, y: 0 }];
class DefaultEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * DefaultEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * DefaultEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-01.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 0,
      price: 100,
      sign: 1,
      reloadDuration: 700,
      maxPersonalBulletsNumber: 1,
    });
  }
}

DefaultEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 6;
class ShooterEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * ShooterEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * ShooterEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-03.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 0,
      price: 300,
      sign: 3,
      reloadDuration: 400,
      maxPersonalBulletsNumber: 2,
    });
  }
}

ShooterEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 6;
class FastEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * FastEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * FastEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-02.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 0,
      price: 200,
      sign: 2,
      reloadDuration: 700,
      maxPersonalBulletsNumber: 1,
    });
  }
}

FastEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 12;
class ArmoredEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * ArmoredEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * ArmoredEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-04.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 3,
      price: 400,
      sign: 4,
      reloadDuration: 700,
      maxPersonalBulletsNumber: 1,
    });
  }
}

ArmoredEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 4;
class EnemiesStore {
	constructor() {
		this._enemies = [];
		this._hasDestroyedEnemies = false;
	}

	update(time) {
		this._enemies.forEach(enemy => enemy.update(time));

		if (this._hasDestroyedEnemies) {
			this.clearDestroyedEnemies();
			this.setHasDestroyedEnemies(false);
		}
	}

	clearDestroyedEnemies() {
		this._enemies = this._enemies.filter(enemy => !enemy.isDestroyed());
	}

	render(ctx) {
		this._enemies.forEach(enemy => enemy.render(ctx));
	}

	setSize() {
		this._enemies.forEach(enemy => enemy.setSize());
	}

	addEnemy(enemy) {
		this._enemies.push(enemy);
	}

	getEnemies() {
		return this._enemies;
	}

	setHasDestroyedEnemies(payload) {
		this._hasDestroyedEnemies = payload;
	}
}

EnemiesStore.MAX_ENEMIES_COUNTER = 7;
class EnemiesSpawner {
  constructor({ tileSize, gameAreaPosition, assets, enemiesQueue, enemiesStore, level, playersStore, buffsStore, bulletsStore, explosionsStore, buffsSpawner, eagle, state }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
		this._state = state;
    this._assets = assets;
    this._enemiesQueue = enemiesQueue;
    this._enemiesStore = enemiesStore;
		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._explosionsStore = explosionsStore;
		this._buffsStore = buffsStore;
		this._buffsSpawner = buffsSpawner;
		this._level = level;
		this._eagle = eagle;

		this._prevEnemiesSpawnTime = null;
		this._nextEnemiesSpawnTime = null;
  }

  checkAndSpawnRandomEnemy({ timestamp }) {
    if (this._prevEnemiesSpawnTime !== null && timestamp < this._nextEnemiesSpawnTime) return;

    this._prevEnemiesSpawnTime = timestamp;
    this._nextEnemiesSpawnTime = this._prevEnemiesSpawnTime + getRandomFromRange(10000, 15000);

		let spawnCounter = Math.min(this._enemiesQueue.getEnemiesInQueue(), Enemy.INITIAL_COORDS.length);
		if (spawnCounter) spawnCounter = Math.min(EnemiesStore.MAX_ENEMIES_COUNTER - this._enemiesStore.getEnemies().length, spawnCounter);

		Enemy.INITIAL_COORDS.slice(0, spawnCounter).forEach(coords => {
			const randomEnemyClassIndex = getRandomFromRange(0, EnemiesSpawner.ENEMIES_CLASSES.length - 1);

			const enemy = new EnemiesSpawner.ENEMIES_CLASSES[randomEnemyClassIndex]({
				tileSize: this._tileSize,
				gameAreaPosition: this._gameAreaPosition,
				level: this._level,
				playersStore: this._playersStore,
				bulletsStore: this._bulletsStore,
				enemiesStore: this._enemiesStore,
				explosionsStore: this._explosionsStore,
				buffsStore: this._buffsStore,
				buffsSpawner: this._buffsSpawner,
				initialCoords: coords,
				eagle: this._eagle,
				assets: this._assets,
				state: this._state,
				spawnBuffOnHit: Math.random() <= 0.2,
			});

			this._enemiesStore.addEnemy(enemy);
			this._enemiesQueue.decreaseEnemiesInQueue();
		})
  }
}

EnemiesSpawner.ENEMIES_CLASSES = [DefaultEnemy, ShooterEnemy, FastEnemy, ArmoredEnemy];

class Explosion {
  constructor({ tileSize, gameAreaPosition, centerPoint, assets, explosionsStore, size, sprite, spriteFramesNumber, spriteFps }) {
    this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;
    this._centerPoint = centerPoint;
    this._assets = assets;
    this._explosionsStore = explosionsStore;
    
    this._size = {
      width: size.width,
      height: size.height,
    }
    this._position = {
      x: 0,
      y: 0,
    }
    this.setSize({ initial: true });

    this._sprite = new Sprite({
			sprite: this._assets.get(sprite),
			framesNumber: spriteFramesNumber,
      loop: false,
      playing: true,
      fps: spriteFps,
    });

    this._finished = false;
  }

  setSize({ initial = false } = {}) {
		if (initial) {
      this._position.x = this._centerPoint.x - this._size.width / 2;
      this._position.y = this._centerPoint.y - this._size.height / 2;
		} else {
			const coords = {
				x: (this._position.x - this._prevGameAreaPositionX) / this._prevTileSizeWidth,
				y: (this._position.y - this._prevGameAreaPositionY) / this._prevTileSizeHeight,
			}
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * coords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * coords.y;

      this._size.width = this._size.width / this._prevTileSizeWidth * this._tileSize.width;
      this._size.height = this._size.height / this._prevTileSizeHeight * this._tileSize.height;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
    }
  }

  update(time) {
    this._sprite.update(time);

    if (!this._sprite.isPlaying()) {
      this._finished = true;
      this._explosionsStore.setHasFinishedExplosions(true);
    }
  }

  render(ctx) {
    this._sprite.render(ctx, this._position, this._size);
  }

  isFinished() {
    return this._finished;
  }
}
class SmallExplosion extends Explosion {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      size: {
        width: tileSize.width * SmallExplosion.SIZE_SCALE_FACTOR,
        height: tileSize.height * SmallExplosion.SIZE_SCALE_FACTOR,
      },
      sprite: 'images/small-explosion.png',
      spriteFramesNumber: 3,
      spriteFps: 16,
    });
  }
}

SmallExplosion.SIZE_SCALE_FACTOR = 4;
class LargeExplosion extends Explosion {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      size: {
        width: tileSize.width * LargeExplosion.SIZE_SCALE_FACTOR,
        height: tileSize.height * LargeExplosion.SIZE_SCALE_FACTOR,
      },
      sprite: 'images/large-explosion.png',
      spriteFramesNumber: 5,
      spriteFps: 8,
    });
  }
}

LargeExplosion.SIZE_SCALE_FACTOR = 8;
class ExplosionsStore {
	constructor() {
		this._explosions = [];
		this._hasFinishedExplosions = false;
	}

	update(time) {
		this._explosions.forEach(explosion => explosion.update(time));

		if (this._hasFinishedExplosions) {
			this.clearFinishedExplosions();
			this.setHasFinishedExplosions(false);
		}
	}

	clearFinishedExplosions() {
		this._explosions = this._explosions.filter(explosion => !explosion.isFinished());
	}

	render(ctx) {
		this._explosions.forEach(explosion => explosion.render(ctx));
	}

	setSize() {
		this._explosions.forEach(explosion => explosion.setSize());
	}

	addExplosion(explosion) {
		this._explosions.push(explosion);
	}

	setHasFinishedExplosions(payload) {
		this._hasFinishedExplosions = payload;
	}
}

class Bullet {
	constructor({ tileSize, gameAreaPosition, level, position, direction, bulletsStore, enemiesStore, explosionsStore, assets, owner, eagle, playersStore, state }) {
		this._tileSize = tileSize;
		this._prevTileSizeWidth = this._tileSize.width;
		this._prevTileSizeHeight = this._tileSize.height;
		this._gameAreaPosition = gameAreaPosition;
		this._prevGameAreaPositionX = this._gameAreaPosition.x;
		this._prevGameAreaPositionY = this._gameAreaPosition.y;

		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._enemiesStore = enemiesStore;
		this._explosionsStore = explosionsStore;
		this._assets = assets;
		this._state = state;
		this._owner = owner;
		this._sprite = this._assets.get('images/bullet.png')

		this._level = level;
		this._eagle = eagle;

		this._direction = {
			x: direction.x,
			y: direction.y,
		};
		this._velocity = {
			x: 0,
			y: 0,
		};
		this._position = {
			x: position.x,
			y: position.y,
		};
		this.setSize({ initial: true });

		this._status = Bullet.STATUSES[1];
	}

	setSize({ initial = false } = {}) {
		this._velocity.x = this._direction.x * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._tileSize.width;
		this._velocity.y = this._direction.y * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._tileSize.height;

		if (!initial) {
			const coords = {
				x: (this._position.x - this._prevGameAreaPositionX) / this._prevTileSizeWidth,
				y: (this._position.y - this._prevGameAreaPositionY) / this._prevTileSizeHeight,
			}
			this._position.x = this._gameAreaPosition.x + this._tileSize.width * coords.x;
			this._position.y = this._gameAreaPosition.y + this._tileSize.height * coords.y;

			this._prevTileSizeWidth = this._tileSize.width;
			this._prevTileSizeHeight = this._tileSize.height;
			this._prevGameAreaPositionX = this._gameAreaPosition.x;
			this._prevGameAreaPositionY = this._gameAreaPosition.y;
		}
	}

	render(ctx) {
		let spriteOffset = 0;
		if (this._direction.x > 0) spriteOffset = this._sprite.width * .75;
		else if (this._direction.x < 0) spriteOffset = this._sprite.width * .5;
		else if (this._direction.y > 0) spriteOffset = this._sprite.width * .25;

		ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width * .25, this._sprite.height, this._position.x, this._position.y, this._tileSize.width, this._tileSize.height);
	}

	update({ delta }) {
		let position = {
			x: this._position.x + this._velocity.x * delta,
			y: this._position.y + this._velocity.y * delta,
		}

		this._checkAndHandleCollisions(position);

		if (!this.isDestroyed()) this._position = position;
	}

	_getTouchPoint(position) {
		if (this._velocity.x > 0) return { x: position.x + this._tileSize.width, y: position.y + this._tileSize.height / 2 };
		else if (this._velocity.x < 0) return { x: position.x, y: position.y + this._tileSize.height / 2 };
		else if (this._velocity.y > 0) return { x: position.x + this._tileSize.width / 2, y: position.y + this._tileSize.height };
		else if (this._velocity.y < 0) return { x: position.x + this._tileSize.width / 2, y: position.y }
	}

	_addExplosion(position) {
		const explosion = new SmallExplosion({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			centerPoint: this._getTouchPoint(position),
			explosionsStore: this._explosionsStore,
		});

		this._explosionsStore.addExplosion(explosion);
	}

	_updatePlayerStatistics(enemy) {
		const enemySign = enemy.getSign();
		const enemyPrice = enemy.getPrice();
		const playerSign = this._owner.getSign();
		this._state.increasePlayerStatistics(playerSign, enemySign, enemyPrice);
	}

	_checkAndHandleCollisions(position) {
		const bulletsWithCollision = this._findBulletsCollision(position);
		const tanksWithCollision = this._findTanksCollision(position);
		const eagleWithCollision = this._findEagleCollision(position);
		const levelBricksCollision = this._findLevelBricksCollision(position);

		if (bulletsWithCollision.length || tanksWithCollision.length || eagleWithCollision.length || levelBricksCollision.length) {
			this._handleObjectsCollision(position, bulletsWithCollision, tanksWithCollision, eagleWithCollision, levelBricksCollision);
		} else {
			this._checkAndHandleLevelEdgesCollision(position);
		}
	}

	_findBulletsCollision(position) {
		const elemBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		return this._bulletsStore
			.getBullets()
			.filter(bullet => {
				if (bullet === this) return false;
				if (bullet.getOwner() instanceof Enemy && this._owner instanceof Enemy) return false;

				const bulletBoundaryBox = bullet.getBoundaryBox();
				return twoAreasCollisioned(elemBoundaryBox, bulletBoundaryBox);
			})
	}

	_findTanksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const players = this._playersStore.getPlayers();
		const enemies = this._enemiesStore.getEnemies()

		return [ ...players, ...enemies ].filter(tank => {
			if (tank === this._owner) return false;
			if (tank.isBirthing()) return false;
			if (this._owner instanceof Enemy && tank instanceof Enemy) return false;

			const tankBoundaryBox = tank.getBoundaryBox();
			return twoAreasCollisioned(bulletBoundaryBox, tankBoundaryBox);
		})
	}

	_findEagleCollision(position) {		
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);
		const eagleBoundaryBox = this._eagle.getRoundedBoundaryBox();
		const collision = twoAreasCollisioned(bulletBoundaryBox, eagleBoundaryBox);

		return collision ? [this._eagle] : [];
	}

	_findLevelBricksCollision(position) {
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		const coords = {
			x1: Math.floor((bulletBoundaryBox.x1 - this._gameAreaPosition.x) / this._tileSize.width),
			y1: Math.floor((bulletBoundaryBox.y1 - this._gameAreaPosition.y) / this._tileSize.height),
			x2: Math.ceil((bulletBoundaryBox.x2 - this._gameAreaPosition.x) / this._tileSize.width),
			y2: Math.ceil((bulletBoundaryBox.y2 - this._gameAreaPosition.y) / this._tileSize.height),
		}

		return this._level
			.getMap()
			.slice(coords.y1, coords.y2)
			.map(row => row.slice(coords.x1, coords.x2))
			.flat()
			.filter(brick => {
				if (!brick || !brick.isCollideWithBullet()) return false;

				const brickBoundaryBox = brick.getBoundaryBox();
				return twoAreasCollisioned(bulletBoundaryBox, brickBoundaryBox)
			})
	}

	_checkAndHandleLevelEdgesCollision(position) {
		const levelBoundaryBox = this._level.getBoundaryBox();
		const bulletBoundaryBox = getBoundaryBoxOfMovingElem(this._velocity, this._position, position, this._tileSize);

		let positionWithCollision = null;

		if (bulletBoundaryBox.x2 > levelBoundaryBox.x2) positionWithCollision = { ...position, x: levelBoundaryBox.x2 - this._tileSize.width };
		else if (bulletBoundaryBox.x1 < levelBoundaryBox.x1) positionWithCollision = { ...position, x: levelBoundaryBox.x1 };
		else if (bulletBoundaryBox.y2 > levelBoundaryBox.y2) positionWithCollision = { ...position, y: levelBoundaryBox.y2 - this._tileSize.height };
		else if (bulletBoundaryBox.y1 < levelBoundaryBox.y1) positionWithCollision = { ...position, y: levelBoundaryBox.y1 };

		if (positionWithCollision) {
			this._position = positionWithCollision;
			this._addExplosion(positionWithCollision);
			this.destroy();
		}
	}

	_handleObjectsCollision(position, bullets, tanks, eagle, levelBricks) {
		const objectsWithCollisions = [...bullets, ...tanks, ...eagle, ...levelBricks];

		const axis = this._velocity.x ? 'x' : 'y';
		const closestObject = findClosestElem(objectsWithCollisions, this._position, axis);

		if (closestObject instanceof Bullet) this._handleBulletCollision(position, closestObject);
		else if (closestObject instanceof Tank) this._handleTanksCollision(position, closestObject);
		else if (closestObject instanceof Brick) this._handleLevelBricksCollision(position, levelBricks);
		else this._handleEagleCollision(position, closestObject);
	}

	_handleEagleCollision(position, eagle) {
		const eagleBoundaryBox = eagle.getRoundedBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, eagleBoundaryBox);
		this._eagle.destroy();
		this.destroy();
	}

	_handleBulletCollision(position, bullet) {
		const bulletBoundaryBox = bullet.getBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, bulletBoundaryBox);
		bullet.destroy();
		this.destroy();
	}

	_handleTanksCollision(position, tank) {
		const tankBoundaryBox = tank.getBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, tankBoundaryBox);
		
		const destroyed = tank.handleHit();
		if (!destroyed) this._addExplosion(position);
		else if (this._owner instanceof Player) this._updatePlayerStatistics(tank);
		this.destroy();
	}

	_handleLevelBricksCollision(position, bricks) {
		const bricksForDestroy = this._findBricksForDestroy(bricks);
		const brickBoundaryBox = bricksForDestroy[0].getBoundaryBox();
		this._position = roundPositionByObject(position, this._tileSize, this._velocity, brickBoundaryBox);
		this._level.destroyBricks(bricksForDestroy.filter(brick => brick.isBreakByBullet()));
		this._addExplosion(position);
		this.destroy();
	}

	_findBricksForDestroy(bricks) {
		const axis = this._velocity.x ? 'x' : 'y';
		const closestBrick = findClosestElem(bricks, this._position, axis);
		const closestBrickCoordByAxis = closestBrick.getCoords()[axis];
		const bricksForDestroy = bricks.filter(brick => brick.getCoords()[axis] === closestBrickCoordByAxis);
		const additionalBricksForDestroy = this._findAdditionalBricksForDestroy(bricksForDestroy);
		return [...bricksForDestroy, ...additionalBricksForDestroy];
	}

	_findAdditionalBricksForDestroy(bricks) {    
		const levelMap = this._level.getMap();

		return bricks.reduce((total, brick) => {
			if (!brick.isBreakByBullet()) return total;

			const coords = brick.getCoords();

			let prevBrick;
			let nextBrick;

			if (this._velocity.x) {
				prevBrick = levelMap[coords.y - 1]?.[coords.x];
				nextBrick = levelMap[coords.y + 1]?.[coords.x];
			} else {
				prevBrick = levelMap[coords.y][coords.x - 1];
				nextBrick = levelMap[coords.y][coords.x + 1];
			}

			if (prevBrick && !bricks.includes(prevBrick) && !total.includes(prevBrick)) total.push(prevBrick);
			if (nextBrick && !bricks.includes(nextBrick) && !total.includes(nextBrick)) total.push(nextBrick);

			return total;
		}, [])
	}

	isActive() {
		return this._status === Bullet.STATUSES[1];
	}

	isDestroyed() {
		return this._status === Bullet.STATUSES[2];
	}

	destroy() {
		this._status = Bullet.STATUSES[2];
		this._owner.clearDestroyedBullets();
		this._bulletsStore.setHasDestroyedBullets(true);
	}

	getSize() {
		return this._tileSize;
	}

	getPosition() {
		return this._position;
	}

	getOwner() {
		return this._owner;
	}

	getBoundaryBox() {
		return {
			x1: this._position.x,
			y1: this._position.y,
			x2: this._position.x + this._tileSize.width,
			y2: this._position.y + this._tileSize.height,
		}
	}
}

Bullet.SPEED_PER_SECOND_SCALE_FACTOR = 18;
Bullet.STATUSES = {
	1: 'active',
	2: 'destroyed',
}
class BulletsStore {
	constructor() {
		this._bullets = [];
		this._hasDestroyedBullets = false;
	}

	update(time) {
		this._bullets.forEach(bullet => bullet.update(time));

		if (this._hasDestroyedBullets) {
			this.clearDestroyedBullets();
			this.setHasDestroyedBullets(false);
		}
	}

	clearDestroyedBullets() {
		this._bullets = this._bullets.filter(bullet => !bullet.isDestroyed());
	}

	render(ctx) {
		this._bullets.forEach(bullet => bullet.render(ctx));
	}

	setSize() {
		this._bullets.forEach(bullet => bullet.setSize());
	}

	addBullet(bullet) {
		this._bullets.push(bullet);
	}

	getBullets() {
		return this._bullets;
	}

	setHasDestroyedBullets(payload) {
		this._hasDestroyedBullets = payload;
	}
}

class GameOverAndLevelCompleteHandler {
  constructor({ state, sceneManager, eagle, playersStore, enemiesStore, enemiesQueue }) {
    this._state = state;
    this._sceneManager = sceneManager;
    this._eagle = eagle;
    this._playersStore = playersStore;
    this._enemiesStore = enemiesStore;
    this._enemiesQueue = enemiesQueue;

    this._gameOverOrLevelCompleteTime = null;
  }

  checkAndHandle({timestamp}) {
    if (this._gameOverOrLevelCompleteTime !== null) {
      this._checkAndHandleSceneOut(timestamp);
    } else {
      this._checkAndHandleGameOver(timestamp);
      this._checkAndHandleLevelComplete(timestamp);
    }
  }

  _checkAndHandleSceneOut(timestamp) {
    if (timestamp > this._gameOverOrLevelCompleteTime + GameOverAndLevelCompleteHandler.DELAY_BEFORE_SCENE_OUT) this._sceneManager.showResultScene();
  }

	_checkAndHandleGameOver(timestamp) {
		const eagleDestroyed = this._eagle.isDestroyed();
		const playersInStore = this._playersStore.getPlayers();

		if (eagleDestroyed || !playersInStore.length) {
      this._gameOverOrLevelCompleteTime = timestamp;
			this._state.setGameOver(true);
    };
	}

	_checkAndHandleLevelComplete(timestamp) {
		const enemiesInQueue = this._enemiesQueue.getEnemiesInQueue();
		const enemiesInStore = this._enemiesStore.getEnemies();

		if (!enemiesInQueue && !enemiesInStore.length) this._gameOverOrLevelCompleteTime = timestamp;
	}
}

GameOverAndLevelCompleteHandler.DELAY_BEFORE_SCENE_OUT = 5000;

class MainScene {
	constructor({ state, canvasSize, tileSize, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._sceneManager = sceneManager;
		this._state = state;
		this._assets = assets;

		this._sprite = this._assets.get('images/title.png');
		this._spriteSize = {
			width: 0,
			height: 0,
		}
		this._spritePosition = {
			x: 0,
			y: 0,
		}
		this._setSize();

		this._menu = new Menu({
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			assets: this._assets,
		});
	}

	_setSize() {
		this._spriteSize.width = this._tileSize.width * MainScene.SPRITE_WIDTH_SCALE_FACTOR;
		this._spriteSize.height = this._tileSize.height * MainScene.SPRITE_HEIGHT_SCALE_FACTOR;
		this._spritePosition.x = (this._canvasSize.width - this._spriteSize.width) / 2;
		this._spritePosition.y = this._tileSize.height * MainScene.SPRITE_POSITION_Y_SCALE_FACTOR;
	}

	resize() {
		this._setSize();
		this._menu.setSize();
	}

	update(time) {

	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.drawImage(this._sprite, this._spritePosition.x, this._spritePosition.y, this._spriteSize.width, this._spriteSize.height);

		this._menu.render(ctx);
	}

	_start() {
		this._state.setPlayerLives(1, 2);
		if (this._menu.isMultiplayerGame()) this._state.setPlayerLives(2, 2);
		this._sceneManager.showIntroScene();
	}

	handleKeyDown({ code }) {
		if (code === 'ArrowDown' || code === 'ArrowUp') this._menu.changeSelectedMenuItem(code);
	}

	handleKeyUp({ code }) {
		if (code === 'Enter') this._start();
	}
}

MainScene.SPRITE_WIDTH_SCALE_FACTOR = 28;
MainScene.SPRITE_HEIGHT_SCALE_FACTOR = 16;
MainScene.SPRITE_POSITION_Y_SCALE_FACTOR = 10;
class IntroScene {
	constructor({ state, canvasSize, tileSize, sceneManager }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._sceneManager = sceneManager;
		this._state = state;

		this._label = `STAGE ${this._state.getLevelIndex()}`;

		this._fontSize = 0;
		this._setSize();
	}

	_setSize() {
		this._fontSize = this._tileSize.height * IntroScene.FONT_SIZE_SCALE_FACTOR;
	}

	resize() {
		this._setSize();
	}

	update(time) {

	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.font = `${this._fontSize}px PressStart2P`;
		const { textWidth } = calcTextMetrics(ctx, this._label);

		const position = {
			x: this._canvasSize.width / 2 - textWidth / 2,
			y: this._canvasSize.height / 2 + this._fontSize / 2,
		}
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._label, position.x, position.y);
	}

	handleKeyDown({ code }) {

	}

	handleKeyUp({ code }) {
		if (code === 'Enter') this._sceneManager.showCoreScene();
	}
}

IntroScene.FONT_SIZE_SCALE_FACTOR = 2;
class CoreScene {
	constructor({ state, canvasSize, tileSize, gameAreaPosition, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._sceneManager = sceneManager;
		this._state = state;
		this._assets = assets;

		this._level = new Level({
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
		});

		this._levelIndicator = new LevelIndicator({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
		});
		
		this._enemiesQueue = new EnemiesQueue({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
		});

		this._playersIndicator = new PlayersIndicator({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
		});

		this._explosionsStore = new ExplosionsStore();
		this._buffsStore = new BuffsStore();
		this._enemiesStore = new EnemiesStore();
		this._bulletsStore = new BulletsStore();
		this._playersStore = new PlayersStore({
			state: this._state,
		});

		this._eagle = new Eagle({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			explosionsStore: this._explosionsStore,
		})

		this._buffsSpawner = new BuffsSpawner({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesStore: this._enemiesStore,
			buffsStore: this._buffsStore,
		});

		this._enemiesSpawner = new EnemiesSpawner({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesQueue: this._enemiesQueue,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			bulletsStore: this._bulletsStore,
			buffsStore: this._buffsStore,
			explosionsStore: this._explosionsStore,
			buffsSpawner: this._buffsSpawner,
			level: this._level,
			eagle: this._eagle,
		});

		this._playersSpawner = new PlayersSpawner({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesQueue: this._enemiesQueue,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			bulletsStore: this._bulletsStore,
			explosionsStore: this._explosionsStore,
			buffsStore: this._buffsStore,
			buffsSpawner: this._buffsSpawner,
			level: this._level,
			eagle: this._eagle,
		})

		this._playersSpawner.spawnPlayers();

		this._gameOverOrLevelCompleteHandler = new GameOverAndLevelCompleteHandler({
			sceneManager: this._sceneManager,
			state: this._state,
			eagle: this._eagle,
			playersStore: this._playersStore,
			enemiesStore: this._enemiesStore,
			enemiesQueue: this._enemiesQueue,
		});
	}

	update(time) {
		this._enemiesSpawner.checkAndSpawnRandomEnemy(time);
		this._playersStore.update(time);
		this._enemiesStore.update(time);
		this._bulletsStore.update(time);
		this._explosionsStore.update(time);
		this._buffsStore.update(time);
		this._gameOverOrLevelCompleteHandler.checkAndHandle(time);
	}

	resize() {
		this._level.resize();
		this._eagle.setSize();
		this._playersStore.setSize();
		this._enemiesStore.setSize();
		this._bulletsStore.setSize();
		this._enemiesQueue.setSize();
		this._explosionsStore.setSize();
		this._buffsStore.setSize();
		this._playersIndicator.setSize();
		this._levelIndicator.setSize();
	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		this._level.render(ctx, 'bottom');
		this._eagle.render(ctx);
		this._playersStore.render(ctx);
		this._enemiesStore.render(ctx);
		this._bulletsStore.render(ctx);
		this._explosionsStore.render(ctx);
		this._level.render(ctx, 'top');
		this._buffsStore.render(ctx);
		this._enemiesQueue.render(ctx);
		this._playersIndicator.render(ctx);
		this._levelIndicator.render(ctx);
	}

	handleKeyDown(event) {
		this._playersStore.handleKeyDown(event);
	}

	handleKeyUp(event) {
		this._playersStore.handleKeyUp(event);
	}
}
class ResultScene {
	constructor({ state, canvasSize, tileSize, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._sceneManager = sceneManager;
		this._state = state;
		this._assets = assets;
		this._levels = this._assets.get('json/levels.json');

		this._levelIndex = this._state.getLevelIndex();
		this._label = `STAGE ${this._levelIndex}`;

		this._fontSize = 0;
		this._labelPosition = {
			x: 0,
			y: 0,
		}
		this._setSize();

		this._statistics = new Statistics({
			state: this._state,
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			assets: this._assets,
		});
	}

	update(time) {

	}

	_setSize() {
		this._fontSize = this._tileSize.height * ResultScene.FONT_SIZE_SCALE_FACTOR;
		this._labelPosition.y = this._tileSize.height * ResultScene.LABEL_POSITION_Y_SCALE_FACTOR + this._fontSize;
	}

	resize() {
		this._setSize();
		this._statistics.setSize();
	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.font = `${this._fontSize}px PressStart2P`;
		const { textWidth } = calcTextMetrics(ctx, this._label);
		this._labelPosition.x = (this._canvasSize.width - textWidth) / 2;
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._label, this._labelPosition.x, this._labelPosition.y);

		this._statistics.render(ctx);
	}

	_showNextScene() {
		if (this._state.getGameOver()) {
			this._state.reset();
			this._sceneManager.showMainScene();
		} else {
			let nextLevelIndex = this._levelIndex + 1;
			if (!this._levels[nextLevelIndex]) nextLevelIndex = 1;
			this._state.setLevelIndex(nextLevelIndex);
			this._state.resetPlayersStatisticsByEnemiesTypes();
			this._sceneManager.showIntroScene();
		}
	}

	handleKeyDown({ code }) {

	}

	handleKeyUp({ code }) {
		if (code === 'Enter') this._showNextScene();
	}
}

ResultScene.FONT_SIZE_SCALE_FACTOR = 2;
ResultScene.LABEL_POSITION_Y_SCALE_FACTOR = 8;
class SceneManager {
	constructor({ canvasSize, tileSize, gameAreaPosition, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._assets = assets;

		this._state = new State();

		this._currentScene = null;
		this._futureScene = null;
		this._transitionOverlayOpacity = 0;
	}

	resize() {
		if (this._currentScene) this._currentScene.resize();
		if (this._futureScene) this._futureScene.resize();
	}

	update(time) {
		if (this._currentScene) this._currentScene.update(time);

		if (this._futureScene) this._updateSceneOut(time);
		else if (this._transitionOverlayOpacity) this._updateSceneIn(time);
	}

	_updateSceneOut({ prevFrameDuration }) {
		if (!this._currentScene || this._transitionOverlayOpacity === 1) {
			this._currentScene = this._futureScene;
			this._futureScene = null;
		} else  {
			this._transitionOverlayOpacity = Math.min(this._transitionOverlayOpacity + prevFrameDuration / SceneManager.FADE_DURATION, 1);
		}
	}

	_updateSceneIn({ prevFrameDuration }) {
		this._transitionOverlayOpacity = Math.max(this._transitionOverlayOpacity - prevFrameDuration / SceneManager.FADE_DURATION, 0);
	}

	render(ctx) {
		if (this._currentScene) this._currentScene.render(ctx);
		if (this._transitionOverlayOpacity) this._renderTransitionOverlay(ctx);
	}

	_renderTransitionOverlay(ctx) {
		ctx.globalAlpha = this._transitionOverlayOpacity;
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
		ctx.globalAlpha = 1;
	}

	_getScenesCommonProps() {
		return {
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			state: this._state,
			sceneManager: this,
		}
	}

	showMainScene() {
		this._futureScene = new MainScene(this._getScenesCommonProps());
	}

	showIntroScene() {
		this._futureScene = new IntroScene(this._getScenesCommonProps());
	}

	showCoreScene() {
		this._futureScene = new CoreScene(this._getScenesCommonProps());
	}

	showResultScene() {
		this._futureScene = new ResultScene(this._getScenesCommonProps());
	}

	handleKeyDown(event) {
		if (this._futureScene || this._transitionOverlayOpacity) return;

		if (this._currentScene) this._currentScene.handleKeyDown(event);
	}

	handleKeyUp(event) {
		if (this._futureScene || this._transitionOverlayOpacity) return;

		if (this._currentScene) this._currentScene.handleKeyUp(event);
	}
}

SceneManager.FADE_DURATION = 500;

class State {
	constructor() {
		this._gameOver = false;
		this._levelIndex = 1;

		this._playersLives = {
			1: null,
			2: null,
		}

		this._playersUpgradeLevels = {
			1: 0,
			2: 0,
		}

		this._playersPoints = {
			1: 0,
			2: 0,
		}

		this._playersStatisticsByEnemiesTypes = {};
		this.resetPlayersStatisticsByEnemiesTypes();
	}

	getGameOver() {
		return this._gameOver;
	}

	setGameOver(value) {
		this._gameOver = value;
	}
	
	getLevelIndex() {
		return this._levelIndex;
	}

	setLevelIndex(index) {
		this._levelIndex = index;
	}

	getPlayersLives() {
		return this._playersLives;
	}

	setPlayerLives(sign, lives) {
		this._playersLives[sign] = lives;
	}

	increasePlayerLives(sign) {
		this._playersLives[sign] += 1;
	}

	getPlayersUpgradeLevels() {
		return this._playersUpgradeLevels;
	}

	increasePlayerUpgradeLevel(sign) {
		this._playersUpgradeLevels[sign] += 1;
	}

	resetPlayerUpgradeLevel(sign) {
		this._playersUpgradeLevels[sign] = 0;
	}

	getPlayersStatisticsByEnemiesTypes() {
		return this._playersStatisticsByEnemiesTypes;
	}

	getPlayerTotal(sign) {
    return Object.values(this._playersStatisticsByEnemiesTypes[sign])
      .reduce((total, item) => {
        return { 
          counter: total.counter + item.counter,
          points: total.points + item.points,
        }
      }, { counter: 0, points: 0 })
	}

	increasePlayerStatistics(playerSign, enemySign, enemyPrice) {
		const statistics = this._playersStatisticsByEnemiesTypes[playerSign][enemySign];
		statistics.counter += 1;
		statistics.points += enemyPrice;
		this._playersPoints[playerSign] += enemyPrice;
	}

	resetPlayersStatisticsByEnemiesTypes() {
		this._playersStatisticsByEnemiesTypes = {
			1: {
				1: { counter: 0, points: 0 },
				2: { counter: 0, points: 0 },
				3: { counter: 0, points: 0 },
				4: { counter: 0, points: 0 },
			},
			2: {
				1: { counter: 0, points: 0 },
				2: { counter: 0, points: 0 },
				3: { counter: 0, points: 0 },
				4: { counter: 0, points: 0 },
			}
		}
	}

	reset() {
		this._gameOver = false;
		this._levelIndex = 1;
		this._playersLives = {
			1: null,
			2: null,
		}
		this._playersUpgradeLevels = {
			1: 0,
			2: 0,
		}
		this._playersPoints = {
			1: 0,
			2: 0,
		}
		this.resetPlayersStatisticsByEnemiesTypes();
	}
}
class Renderer {
	constructor({ ctx, canvasSize, sceneManager }) {
		this._ctx = ctx;
		this._canvasSize = canvasSize;
		this._sceneManager = sceneManager;
	}

	render() {
		this._clear();
		this._renderBackground();
		this._renderScene();
	}

	_clear() {
		this._ctx.clearRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_renderBackground() {
		this._ctx.fillStyle = '#121212';
		this._ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
	}

	_renderScene() {
		this._sceneManager.render(this._ctx);
	}
}
class Game {
	constructor(canvas) {
		this._canvas = canvas;
		this._ctx = canvas.getContext('2d');

		this._canvasSize = {
			width: 0,
			height: 0,
		};
		this._tileSize = {
			width: 0,
			height: 0,
		};
		this._gameAreaPosition = {
			x: 0,
			y: 0,
		};
		this._setSize();

		this._assets = new Assets();

		this._sceneManager = new SceneManager({
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
		});

		this._renderer = new Renderer({
			ctx: this._ctx,
			canvasSize: this._canvasSize,
			sceneManager: this._sceneManager,
		});

		this._pause = false;
		this._pauseStartTime = null;
		this._pauseTotalDuration = 0;

		this._prevTimestamp = null;

		this._addEventHandlers();
		this._startGame();
	}

	async _startGame() {
		await this._assets.load();
		this._sceneManager.showMainScene();

		requestAnimationFrame(timestamp => {
			this._gameLoop(timestamp - this._pauseTotalDuration);
		});
	}
	
	_gameLoop(timestamp) {
		requestAnimationFrame(nextTimestamp => {
			this._gameLoop(nextTimestamp - this._pauseTotalDuration);
		});

		if (!this._pause) {
			const prevTimestamp = this._prevTimestamp || timestamp;
			const prevFrameDuration = timestamp - prevTimestamp;
			const delta = prevFrameDuration / 1000;
			this._sceneManager.update({ delta, prevFrameDuration, timestamp });
			this._prevTimestamp = timestamp;
		};

		this._renderer.render();
	}

	_addEventHandlers() {
		window.addEventListener('blur', () => {
			this._pauseStartTime = Date.now();
			this._pause = true;
		})
		window.addEventListener('focus', () => {
			this._pauseTotalDuration += Date.now() - this._pauseStartTime;
			this._pause = false;
		})
		window.addEventListener('keydown', event => {
			if (!event.repeat) this._sceneManager.handleKeyDown(event);
		})
		window.addEventListener('keyup', event => {
			this._sceneManager.handleKeyUp(event);
		})
		window.addEventListener('resize', () => {
			this._resize();
		});
	}

	_resize() {
		this._setSize();
		this._sceneManager.resize();
	}

	_setSize() {
		this._canvasSize.width = document.documentElement.clientWidth;
		this._canvasSize.height = document.documentElement.clientHeight;
		this._canvas.width = this._canvasSize.width;
		this._canvas.height = this._canvasSize.height;

		let approximateGameAreaWidth = this._canvasSize.width - Game.PADDINGS * 2;
		let approximateGameAreaHeight = approximateGameAreaWidth * 0.65;

		if (approximateGameAreaHeight + Game.PADDINGS * 2 > this._canvasSize.height) {
			approximateGameAreaHeight = this._canvasSize.height - Game.PADDINGS * 2;
			approximateGameAreaWidth = approximateGameAreaHeight * 1.54;
		}	

		this._tileSize.width = Math.round(approximateGameAreaWidth / Game.TILES_NUM.x);
		this._tileSize.height = Math.round(approximateGameAreaHeight / Game.TILES_NUM.y);

		this._gameAreaPosition.x = Math.round(this._canvasSize.width / 2 - this._tileSize.width * Game.TILES_NUM.x / 2);
		this._gameAreaPosition.y = Math.round(this._canvasSize.height / 2 - this._tileSize.height * Game.TILES_NUM.y / 2);
	}
}

Game.TILES_NUM = {
	x: 60,
	y: 52,
}
Game.PADDINGS = 20;

addEventListener('DOMContentLoaded', () => {
	new Game(document.getElementById('battle-city'));
})