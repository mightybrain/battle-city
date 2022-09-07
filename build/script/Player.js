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
    this._reloadDelay = 700;

    this._personalBullets = [];
    this._maxPersonalBullets = 1;

    this._sprite = new Image();
    this._sprite.src = 'images/player-01.png';

    this._loaded = false;

    this._sprite.addEventListener('load', () => {
      this._loaded = true;
    })
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
    if (!this._loaded) return;

		//ctx.fillStyle = '#E79C21';
		//ctx.fillRect(this._position.x, this._position.y, this._width, this._height);

    let spriteOffset = 0;
    if (this._direction.x > 0) spriteOffset = this._sprite.width * .75;
    else if (this._direction.x < 0) spriteOffset = this._sprite.width * .5;
    else if (this._direction.y > 0) spriteOffset = this._sprite.width * .25;

    ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width * .25, this._sprite.height, this._position.x, this._position.y, this._width, this._height);
  }

  update(delta) {
    this._personalBullets = this._personalBullets.filter(bullet => !bullet.isDestroyed());

    if (!this._velocity.x && !this._velocity.y) return;

    let position;
    if (this._velocity.x) {
      position = {
        x: this._position.x + this._velocity.x * delta,
        y: this._roundPositionByAxis(this._position.y, 'y'),
      }
    } else {
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

    if (position.x + this._width > this._levelMapPositionX + levelMapWidth) {
      return { ...position, x: this._levelMapPositionX + levelMapWidth - this._width };
    } else if (position.x < this._levelMapPositionX) {
      return { ...position, x: this._levelMapPositionX };
    } else if (position.y + this._height > this._levelMapPositionY + levelMapHeight) {
      return { ...position, y: this._levelMapPositionY + levelMapHeight - this._height };
    } else if (position.y < this._levelMapPositionY) {
      return { ...position, y: this._levelMapPositionY };
    } else return position;
  }

  _updatePositionWithLevelBricksCollision(position) {
    let area;
    if (this._velocity.x > 0) {
      area = {
        x1: this._position.x + this._width,
        y1: this._position.y,
        x2: position.x + this._width,
        y2: position.y + this._height,
      }
    } else if (this._velocity.x < 0) {
      area = {
        x1: position.x,
        y1: position.y,
        x2: this._position.x,
        y2: this._position.y + this._height,
      }
    } else if (this._velocity.y > 0) {
      area = {
        x1: this._position.x,
        y1: this._position.y + this._height,
        x2: position.x + this._width,
        y2: position.y + this._height,
      }
    } else if (this._velocity.y < 0) {
      area = {
        x1: position.x,
        y1: position.y,
        x2: this._position.x + this._width,
        y2: this._position.y,
      }
    }

    const coords = {
      x1: Math.floor((area.x1 - this._levelMapPositionX) / this._baseWidth),
      y1: Math.floor((area.y1 - this._levelMapPositionY) / this._baseHeight),
      x2: Math.ceil((area.x2 - this._levelMapPositionX) / this._baseWidth),
      y2: Math.ceil((area.y2 - this._levelMapPositionY) / this._baseHeight),
    }

    const bricksWithCollision = this._level
      .getMap()
      .slice(coords.y1, coords.y2)
      .map(row => row.slice(coords.x1, coords.x2))
      .flat()
      .filter(brick => {
        if (!brick || !brick.getCollideWithTank()) return false;

        const brickPosition = brick.getPosition();
        const { width: brickWidth, height: brickHeight } = brick.getSize();

        return brickPosition.x + brickWidth > area.x1 &&
          brickPosition.x < area.x2 &&
          brickPosition.y + brickHeight > area.y1 &&
          brickPosition.y < area.y2;
      })
      .sort((a, b) => {
        return this._velocity.x ? 
          a.getCoords().x - b.getCoords().x : 
          a.getCoords().y - b.getCoords().y;
      })

    const closestBrickWithCollision = 
      this._velocity.x > 0 || this._velocity.y > 0 ?
        bricksWithCollision[0] : 
        bricksWithCollision[bricksWithCollision.length - 1];

    if (!closestBrickWithCollision) return position;
    else if (this._velocity.x > 0) return { ...position, x: closestBrickWithCollision.getPosition().x - this._width };
    else if (this._velocity.x < 0) return { ...position, x: closestBrickWithCollision.getPosition().x + closestBrickWithCollision.getSize().width };
    else if (this._velocity.y > 0) return { ...position, y: closestBrickWithCollision.getPosition().y - this._height };
    else if (this._velocity.y < 0) return { ...position, y: closestBrickWithCollision.getPosition().y + closestBrickWithCollision.getSize().height };
  }

  _shoot() {
    if (this._reload || this._personalBullets.length >= this._maxPersonalBullets) return;
    this._reload = true;

    const bulletWidth = this._baseWidth * this._bulletSizeScaleFactor;
    const bulletHeight = this._baseHeight * this._bulletSizeScaleFactor;
    let bulletPosition;

    if (this._direction.x) {
      bulletPosition = { 
        x: this._direction.x > 0 ? this._position.x + this._width - bulletWidth : this._position.x, 
        y: this._position.y + this._height / 2 - bulletHeight / 2,
      };
    } else {
      bulletPosition = { 
        x: this._position.x + this._width / 2 - bulletWidth / 2,
        y: this._direction.y > 0 ? this._position.y + this._height - bulletHeight : this._position.y,
      };
    }

    const bullet = new Bullet({
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
    })
    this._bulletsStore.addBullet(bullet);
    this._personalBullets.push(bullet);

    setTimeout(() => {
      this._reload = false;
    }, this._reloadDelay)
  }

	handleKeyDown(code) {
    const moveEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    const shootEvent = 'Space';

    if (code === shootEvent) this._shoot();
    else if (moveEvents.includes(code)) {
      switch (code) {
        case 'ArrowUp':
          this._velocity = {
            x: 0,
            y: -this._speedPerSecondScaleFactor * this._baseHeight,
          };
          break;
        case 'ArrowDown':
          this._velocity = {
            x: 0,
            y: this._speedPerSecondScaleFactor * this._baseHeight,
          };
          break;
        case 'ArrowRight':
          this._velocity = {
            x: this._speedPerSecondScaleFactor * this._baseWidth,
            y: 0,
          };
          break;
        case 'ArrowLeft':
          this._velocity = {
            x: -this._speedPerSecondScaleFactor * this._baseWidth,
            y: 0,
          };
          break;
      }

      this._direction = {
        x: this._velocity.x ? this._velocity.x / Math.abs(this._velocity.x) : this._velocity.x,
        y: this._velocity.y ? this._velocity.y / Math.abs(this._velocity.y) : this._velocity.y,
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