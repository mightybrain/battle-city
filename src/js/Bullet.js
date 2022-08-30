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

    this._speedPerSecondScaleFactor = bulletSpeedPerSecondScaleFactor;
    this._velocity = {
      x: direction.x * this._speedPerSecondScaleFactor * this._baseWidth,
      y: direction.y * this._speedPerSecondScaleFactor * this._baseHeight,
    };

    this._id = Math.random().toString();
    this._destroyed = false;
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
      this._destroyBullet();
      return;
    }

    const levelBricksCollision = this._checkLevelBricksCollision(position);
    if (levelBricksCollision) {
      this._destroyBullet();
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
    const levelMap = this._level.getMap();

    let deep = Math.floor(Math.abs(position.x - this._position.x) / this._baseWidth) + 1;
    if (this._velocity.y !== 0) {
      deep = Math.floor(Math.abs(position.y - this._position.y) / this._baseHeight) + 1;
    }

    let coords = {
      x: (this._position.x - this._levelMapPositionX) / this._baseWidth,
      y: (this._position.y - this._levelMapPositionY) / this._baseHeight,
    }
    if (this._velocity.y > 0) {
      coords = {
        x: (this._position.x - this._levelMapPositionX) / this._baseWidth,
        y: (this._position.y + this._height - this._levelMapPositionY) / this._baseHeight,
      }
    } else if (this._velocity.x > 0) {
      coords = {
        x: (this._position.x + this._width - this._levelMapPositionX) / this._baseWidth,
        y: (this._position.y - this._levelMapPositionY) / this._baseHeight,
      }
    }

    let corners = {
      x1: Math.floor(coords.x),
      y1: Math.floor(coords.y),
      x2: Math.ceil(coords.x + deep),
      y2: Math.ceil(coords.y + this._sizeScaleFactor),
    }
    if (this._velocity.x < 0) {
      corners = {
        x1: Math.floor(coords.x - deep),
        y1: Math.floor(coords.y),
        x2: Math.ceil(coords.x),
        y2: Math.ceil(coords.y + this._sizeScaleFactor),
      }
    } else if (this._velocity.y > 0) {
      corners = {
        x1: Math.floor(coords.x),
        y1: Math.floor(coords.y),
        x2: Math.ceil(coords.x + this._sizeScaleFactor),
        y2: Math.ceil(coords.y + deep),
      }
    } else if (this._velocity.y < 0) {
      corners = {
        x1: Math.floor(coords.x),
        y1: Math.floor(coords.y - deep),
        x2: Math.ceil(coords.x + this._sizeScaleFactor),
        y2: Math.ceil(coords.y),
      }
    }

    let bricks = levelMap
      .slice(corners.y1, corners.y2)
      .map(row => row.slice(corners.x1, corners.x2))
      .flat()
      .filter(brick => {
        if (!brick || !brick.getCollideWithBullet()) return false;

        const brickPosition = brick.getPosition();
        const { width: brickWidth, height: brickHeight } = brick.getSize();

        let hasCollision = 
          position.x + this._width > brickPosition.x &&
          this._position.x < brickPosition.x + brickWidth &&
          position.y + this._height > brickPosition.y &&
          this._position.y < brickPosition.y + brickHeight;

        if (this._velocity.x < 0 || this._velocity.y < 0) {
          hasCollision = 
            this._position.x + this._width > brickPosition.x &&
            position.x < brickPosition.x + brickWidth &&
            this._position.y + this._height > brickPosition.y &&
            position.y < brickPosition.y + brickHeight;
        }

        return hasCollision;
      })

    return bricks.length ? this._findClosestBricksWithCollision(bricks) : null;
  }

  _findClosestBricksWithCollision(bricks) {
    if (this._velocity.x > 0) {
      const closestBrickXCoord = bricks.sort((a, b) => a.getCoords().x - b.getCoords().x)[0].getCoords().x;
      return bricks.filter(brick => brick.getCoords().x === closestBrickXCoord);
    } else if (this._velocity.x < 0) {
      const closestBrickXCoord = bricks.sort((a, b) => b.getCoords().x - a.getCoords().x)[0].getCoords().x;
      return bricks.filter(brick => brick.getCoords().x === closestBrickXCoord);
    } else if (this._velocity.y > 0) {
      const closestBrickYCoord = bricks.sort((a, b) => a.getCoords().y - b.getCoords().y)[0].getCoords().y;
      return bricks.filter(brick => brick.getCoords().y === closestBrickYCoord);
    } else if (this._velocity.y < 0) {
      const closestBrickYCoord = bricks.sort((a, b) => b.getCoords().y - a.getCoords().y)[0].getCoords().y;
      return bricks.filter(brick => brick.getCoords().y === closestBrickYCoord);
    }
  }

  getId() {
    return this._id;
  }

  _destroyBullet() {
    this._destroyed = true;
  }

  isDestroyed() {
    return this._destroyed;
  }
}