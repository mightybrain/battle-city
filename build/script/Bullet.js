class Bullet {
  constructor({ position, baseWidth, baseHeight, level, direction, bulletSizeScaleFactor, bulletSpeedPerSecondScaleFactor }) {
    this._level = level;
    this._levelMapPositionX = this._level.getMapPosition().x;
    this._levelMapPositionY = this._level.getMapPosition().y;

    this._baseWidth = baseWidth;
    this._baseHeight = baseHeight;

    this._sizeScaleFactor = bulletSizeScaleFactor;
    this._width = this._baseWidth * this._sizeScaleFactor;
    this._height = this._baseHeight * this._sizeScaleFactor;

    this._position = {
      x: position.x,
      y: position.y,
    };

    this._direction = {
      x: direction.x,
      y: direction.y,
    };

    this._speedPerSecondScaleFactor = bulletSpeedPerSecondScaleFactor;
    this._velocity = {
      x: this._direction.x * this._speedPerSecondScaleFactor * this._baseWidth,
      y: this._direction.y * this._speedPerSecondScaleFactor * this._baseHeight,
    };

    this._destroyed = false;
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
    this._velocity = {
      x: this._direction.x * this._speedPerSecondScaleFactor * this._baseWidth,
      y: this._direction.y * this._speedPerSecondScaleFactor * this._baseHeight,
    };
  }

  render(ctx) {
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }

  update(delta) {
    let position = {
      x: this._position.x + this._velocity.x * delta,
      y: this._position.y + this._velocity.y * delta,
    }

    const levelEdgesCollision = this._checkLevelEdgesCollision(position);
    if (levelEdgesCollision) {
      this._destroy();
      return;
    }

    const levelBricksCollision = this._checkLevelBricksCollision(position);
    if (levelBricksCollision) {
      this._destroy();
      this._level.destroyBricks(levelBricksCollision);
      return;
    }

    this._position = position;
  }

  _checkLevelEdgesCollision(position) {
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
      return false;
    }
  }

  _checkLevelBricksCollision(position) {
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

    let bricksWithCollision = this._level
      .getMap()
      .slice(coords.y1, coords.y2)
      .map(row => row.slice(coords.x1, coords.x2))
      .flat()
      .filter(brick => {
        if (!brick || !brick.getCollideWithBullet()) return false;

        const brickPosition = brick.getPosition();
        const { width: brickWidth, height: brickHeight } = brick.getSize();

        return brickPosition.x + brickWidth > area.x1 &&
          brickPosition.x < area.x2 &&
          brickPosition.y + brickHeight > area.y1 &&
          brickPosition.y < area.y2;
      })

    return this._findClosestBricksWithCollision(bricksWithCollision);
  }

  _findClosestBricksWithCollision(bricks) {
    if (!bricks.length) return null;
    else if (this._velocity.x) bricks.sort((a, b) => a.getCoords().x - b.getCoords().x)
    else bricks.sort((a, b) => a.getCoords().y - b.getCoords().y)

    if (this._velocity.x) {
      const closestBrickXCoord = this._velocity.x > 0 ? bricks[0].getCoords().x : bricks[bricks.length - 1].getCoords().x;
      return bricks.filter(brick => brick.getCoords().x === closestBrickXCoord);
    } else {
      const closestBrickYCoord = this._velocity.y > 0 ? bricks[0].getCoords().y : bricks[bricks.length - 1].getCoords().y;
      return bricks.filter(brick => brick.getCoords().y === closestBrickYCoord);
    }
  }

  _destroy() {
    this._destroyed = true;
  }

  isDestroyed() {
    return this._destroyed;
  }
}