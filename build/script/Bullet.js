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

      const { bricksForDestroying, collisionPosition } = levelBricksCollision;
      this._level.destroyBricks(bricksForDestroying);
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

    const bricksForDestroying = [];
    let collisionPosition = null;

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
      else {
        if (!bricksForDestroying.length) {
          if (this._velocity.x > 0) collisionPosition = { ...position, x: brickPosition.x - this._width };
          else if (this._velocity.x < 0) collisionPosition = { ...position, x: brickPosition.x + brickWidth };
          else if (this._velocity.y > 0) collisionPosition = { ...position, y: brickPosition.y - this._height };
          else if (this._velocity.y < 0) collisionPosition = { ...position, y: brickPosition.y + brickHeight };
        }
        bricksForDestroying.push(bricks[i]);
      }

    }

    return !bricksForDestroying.length ? false : { bricksForDestroying, collisionPosition };
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