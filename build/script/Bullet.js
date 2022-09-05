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

    const positionWithLevelEdgesCollision = this._updatePositionWithLevelEdgesCollision(position);
    if (positionWithLevelEdgesCollision !== position) {
      position = positionWithLevelEdgesCollision;
      this._destroy();
      return;
    }

    const { position: positionWithLevelBricksCollision, bricksForDestroy } = this._updatePositionWithLevelBricksCollision(position);
    if (positionWithLevelBricksCollision !== position) {
      position = positionWithLevelBricksCollision;
      this._destroy();
      this._level.destroyBricks(bricksForDestroy);
      return;
    }

    this._position = position;
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
        if (!brick || !brick.getCollideWithBullet()) return false;

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

    const bricksForDestroy = this._findBricksForDestroy(bricksWithCollision);

    if (!bricksForDestroy) return { position };
    else if (this._velocity.x > 0) {
      return { 
        position: { ...position, x: bricksForDestroy[0].getPosition().x - this._width },
        bricksForDestroy,
      }
    } else if (this._velocity.x < 0) {
      return {
        position: { ...position, x: bricksForDestroy[0].getPosition().x + bricksForDestroy[0].getSize().width },
        bricksForDestroy,
      }
    } else if (this._velocity.y > 0) {
      return {
        position: { ...position, y: bricksForDestroy[0].getPosition().y - this._height },
        bricksForDestroy,
      }
    } else if (this._velocity.y < 0) {
      return {
        position: { ...position, y: bricksForDestroy[0].getPosition().y + bricksForDestroy[0].getSize().height },
        bricksForDestroy,
      }
    }
  }

  _findBricksForDestroy(bricks) {
    if (!bricks.length) return null;

    const axis = this._velocity.x ? 'x' : 'y';
    const closestBrickCoord = this._velocity[axis] > 0 ? bricks[0].getCoords()[axis] : bricks[bricks.length - 1].getCoords()[axis];
    const bricksForDestroy = bricks.filter(brick => brick.getCoords()[axis] === closestBrickCoord);
    const additionalBricksForDestroy = this._findAdditionalBricksForDestroy(bricksForDestroy);
    return [ ...bricksForDestroy, ...additionalBricksForDestroy ];
  }

  _findAdditionalBricksForDestroy(bricks) {    
    const levelMap = this._level.getMap();

    return bricks.reduce((total, brick) => {
      const coords = brick.getCoords();

      if (!brick.getBreakByBullet()) return total;

      let prevBrick;
      let nextBrick;

      if (this._velocity.x) {
        prevBrick = levelMap[Math.max(coords.y - 1, 0)][coords.x];
        nextBrick = levelMap[Math.min(coords.y + 1, levelMap.length)][coords.x];
      } else {
        prevBrick = levelMap[coords.y][Math.max(coords.x - 1, 0)];
        nextBrick = levelMap[coords.y][Math.min(coords.x + 1, levelMap.length)];
      }

      if (prevBrick && !bricks.includes(prevBrick) && !total.includes(prevBrick)) total.push(prevBrick);
      if (nextBrick && !bricks.includes(nextBrick) && !total.includes(nextBrick)) total.push(nextBrick);

      return total;
    }, [])
  }

  _destroy() {
    this._destroyed = true;
  }

  isDestroyed() {
    return this._destroyed;
  }
}