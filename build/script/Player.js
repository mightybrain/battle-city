class Player {
  constructor({ position, baseWidth, baseHeight, level, bulletsStore }) {
    this._level = level;
    this._levelMapPositionX = this._level.getMapPosition().x;
    this._levelMapPositionY = this._level.getMapPosition().y;

    this._bulletsStore = bulletsStore;

    this._baseWidth = baseWidth;
    this._baseHeight = baseHeight;

    this._sizeScaleFactor = 4;
    this._width = this._baseWidth * this._sizeScaleFactor;
    this._height = this._baseHeight * this._sizeScaleFactor;
    this._position = {
      x: position.x + this._levelMapPositionX,
      y: position.y + this._levelMapPositionY,
    };
    this._speedPerSecondScaleFactor = 6;
    this._velocity = {
      x: 0,
      y: 0,
    };

    this._direction = {
      x: 0,
      y: 1,
    };

    this._bulletSizeScaleFactor = 1;
    this._bulletSpeedPerSecondScaleFactor = 18;

    this._reload = false;
    this._reloadDelay = 1000;
  }

  setSize({ baseWidth, baseHeight }) {
    const coords = {
      x: (this._position.x - this._levelMapPositionX) / this._baseWidth,
      y: (this._position.y - this._levelMapPositionY) / this._baseHeight,
    }

    this._levelMapPositionX = this._level.getMapPosition().x;
    this._levelMapPositionY = this._level.getMapPosition().y;
    this._baseWidth = baseWidth;
    this._baseHeight = baseHeight;
    this._position = {
      x: coords.x * this._baseWidth + this._levelMapPositionX,
      y: coords.y * this._baseHeight + this._levelMapPositionY,
    }
    this._width = this._baseWidth * this._sizeScaleFactor;
    this._height = this._baseHeight * this._sizeScaleFactor;
  }

  render(ctx) {
		ctx.fillStyle = '#E79C21';
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }

  update(delta) {
    if (this._velocity.x === 0 && this._velocity.y === 0) return;

    let position = {
      x: this._position.x + this._velocity.x * delta,
      y: this._roundPositionByAxis(this._position.y, 'y'),
    }
    if (this._velocity.y !== 0) {
      position = {
        x: this._roundPositionByAxis(this._position.x, 'x'),
        y: this._position.y + this._velocity.y * delta,
      }
    }
    position = this._updatePositionWithLevelEdgesCollision(position);
    position = this._updatePositionWithLevelBricksCollision(position);
    this._position = position;
  }

  _roundPositionByAxis(positionByAxis, axis) {
    return axis === 'x' ? 
      Math.round((positionByAxis - this._levelMapPositionX) / this._baseWidth) * this._baseWidth + this._levelMapPositionX :
      Math.round((positionByAxis - this._levelMapPositionY) / this._baseHeight) * this._baseHeight + this._levelMapPositionY;
  }

  _updatePositionWithLevelEdgesCollision(position) {
    const { width: levelMapWidth, height: levelMapHeight } = this._level.getMapSize();

    if (this._velocity.x > 0 && position.x + this._width > this._levelMapPositionX + levelMapWidth) {
      return { ...position, x: this._levelMapPositionX + levelMapWidth - this._width };
    } else if (this._velocity.x < 0 && position.x < this._levelMapPositionX) {
      return { ...position, x: this._levelMapPositionX };
    } else if (this._velocity.y > 0 && position.y + this._height > this._levelMapPositionY + levelMapHeight) {
      return { ...position, y: this._levelMapPositionY + levelMapHeight - this._height };
    } else if (this._velocity.y < 0 && position.y < this._levelMapPositionY) {
      return { ...position, y: this._levelMapPositionY };
    } else {
      return position;
    }
  }

  _updatePositionWithLevelBricksCollision(position) {
    const levelMap = this._level.getMap();
    
    const coords = {
      x: (this._position.x - this._levelMapPositionX) / this._baseWidth,
      y: (this._position.y - this._levelMapPositionY) / this._baseHeight,
    }

    const corners = {
      x1: Math.floor(coords.x),
      y1: Math.floor(coords.y),
      x2: Math.ceil(coords.x + this._sizeScaleFactor),
      y2: Math.ceil(coords.y + this._sizeScaleFactor),
    }

    const bricks = levelMap
      .slice(corners.y1, corners.y2)
      .map(row => row.slice(corners.x1, corners.x2))
      .flat()

    for (let i = 0; i < bricks.length; i++) {
      if (!bricks[i]) continue;

      const brickPosition = bricks[i].getPosition();
      const { width: brickWidth, height: brickHeight } = bricks[i].getSize();

      const hasCollision = 
        position.x + this._width > brickPosition.x && 
        position.x < brickPosition.x + brickWidth &&
        position.y + this._height > brickPosition.y &&
        position.y < brickPosition.y + brickHeight;
      
      if (!hasCollision) continue;

      let actualCollision = 
        this._velocity.x > 0 && bricks[i].getPosition().x > this._position.x ||
        this._velocity.x < 0 && bricks[i].getPosition().x < this._position.x ||
        this._velocity.y > 0 && bricks[i].getPosition().y > this._position.y ||
        this._velocity.y < 0 && bricks[i].getPosition().y < this._position.y;

      if (!actualCollision) continue;
      else if (this._velocity.x > 0) return { ...position, x: brickPosition.x - this._width };
      else if (this._velocity.x < 0) return { ...position, x: brickPosition.x + brickWidth };
      else if (this._velocity.y > 0) return { ...position, y: brickPosition.y - this._height };
      else if (this._velocity.y < 0) return { ...position, y: brickPosition.y + brickHeight };
    }

    return position;
  }

	handleKeyDown(code) {
    const moveEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    const shootEvent = 'Space';

    if (code === shootEvent && !this._reload) {
      this._reload = true;

      let bulletPosition = {
        x: 0,
        y: 0,
      }

      if (this._direction.x > 0) {
        bulletPosition = { 
          x: this._position.x + this._width - this._baseWidth * this._bulletSizeScaleFactor, 
          y: this._position.y + this._height / 2 - this._baseHeight * this._bulletSizeScaleFactor / 2,
        };
      } else if (this._direction.x < 0) {
        bulletPosition = { 
          x: this._position.x,
          y: this._position.y + this._height / 2 - this._baseHeight * this._bulletSizeScaleFactor / 2,
        };
      } else if (this._direction.y > 0) {
        bulletPosition = { 
          x: this._position.x + this._width / 2 - this._baseWidth * this._bulletSizeScaleFactor / 2,
          y: this._position.y + this._height - this._baseHeight * this._bulletSizeScaleFactor,
        };
      } else if (this._direction.y < 0) {
        bulletPosition = { 
          x: this._position.x + this._width / 2 - this._baseWidth * this._bulletSizeScaleFactor / 2,
          y: this._position.y,
        };
      }

      this._bulletsStore.addBullet(new Bullet({
        position: bulletPosition,
        baseWidth: this._baseWidth,
        baseHeight: this._baseHeight,
        level: this._level,
        direction: {
          x: this._direction.x,
          y: this._direction.y,
        },
        bulletSizeScaleFactor: this._bulletSizeScaleFactor,
        bulletSpeedPerSecondScaleFactor: this._bulletSpeedPerSecondScaleFactor,
      }))

      setTimeout(() => {
        this._reload = false;
      }, this._reloadDelay)
    }
    
    if (moveEvents.includes(code)) {
      switch (code) {
        case 'ArrowUp':
          this._velocity = {
            x: 0,
            y: -this._speedPerSecondScaleFactor * this._baseHeight,
          };

          this._direction = {
            x: 0,
            y: -1,
          };
          break;
        case 'ArrowDown':
          this._velocity = {
            x: 0,
            y: this._speedPerSecondScaleFactor * this._baseHeight,
          };

          this._direction = {
            x: 0,
            y: 1,
          };
          break;
        case 'ArrowRight':
          this._velocity = {
            x: this._speedPerSecondScaleFactor * this._baseWidth,
            y: 0,
          };

          this._direction = {
            x: 1,
            y: 0,
          };
          break;
        case 'ArrowLeft':
          this._velocity = {
            x: -this._speedPerSecondScaleFactor * this._baseWidth,
            y: 0,
          };

          this._direction = {
            x: -1,
            y: 0,
          };
          break;
      }
    }
	}

	handleKeyUp(code) {
    const moveEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    if (moveEvents.includes(code)) {
      const mustStop = 
        (code === 'ArrowUp' && this._velocity.y < 0) ||
        (code === 'ArrowDown' && this._velocity.y > 0) ||
        (code === 'ArrowRight' && this._velocity.x > 0) ||
        (code === 'ArrowLeft' && this._velocity.x < 0);
      if (mustStop) this._velocity = { x: 0, y: 0 }
    };
	}
}