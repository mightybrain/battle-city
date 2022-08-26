class Bullet {
  constructor({ position, baseSize, levelPosition, direction }) {
    this._id = Math.random().toString();

    this._size = 2;
    this._position = {
      x: position.x + levelPosition.x,
      y: position.y + levelPosition.y,
    };
    this._levelPosition = {
      x: levelPosition.x,
      y: levelPosition.y,
    };
    this._baseSize = {
      width: baseSize.width,
      height: baseSize.height,
    };
    this._width = baseSize.width * this._size;
    this._height = baseSize.height * this._size;
    this._speedPerSecond = 300;
    this._velocity = {
      x: direction.x * this._speedPerSecond,
      y: direction.x * this._speedPerSecond,
    };
  }

  render(ctx) {
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }

  update({ delta, level }) {
    let position = {
      x: this._position.x + this._velocity.x * delta,
      y: this._position.y + this._velocity.y * delta,
    }

    const levelEdgesCollision = this._checkLevelEdgesCollision(position, this._velocity, level);
    if (levelEdgesCollision) {
      this._destroyBullet();
      return;
    }

    const levelBricksCollision = this._checkLevelBricksCollision(position, this._velocity, level);
    if (levelBricksCollision) {
      this._destroyBullet();
      return;
    }

    this._position = position;
  }

  _checkLevelEdgesCollision(position, direction, level) {
    const levelPosition = level.getPosition();
    const { width: levelWidth, height: levelHeight } = level.getSize();

    if (direction.x > 0 && position.x + this._width > levelPosition.x + levelWidth) {
      return { ...position, x: levelPosition.x + levelWidth - this._width };
    } else if (direction.x < 0 && position.x < levelPosition.x) {
      return { ...position, x: levelPosition.x };
    } else if (direction.y > 0 && position.y + this._height > levelPosition.y + levelHeight) {
      return { ...position, y: levelPosition.y + levelHeight - this._height };
    } else if (direction.y < 0 && position.y < levelPosition.y) {
      return { ...position, y: levelPosition.y };
    } else {
      return false;
    }
  }

  _checkLevelBricksCollision(position, direction, level) {
    const levelMap = level.getMap();
    
    const coords = {
      x: (this._position.x - this._levelPosition.x) / this._baseSize.width,
      y: (this._position.y - this._levelPosition.y) / this._baseSize.height,
    }

    const corners = {
      x1: Math.floor(coords.x),
      y1: Math.floor(coords.y),
      x2: Math.ceil(coords.x + this._size),
      y2: Math.ceil(coords.y + this._size),
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
      else if (direction.x > 0) return { ...position, x: brickPosition.x - this._width };
      else if (direction.x < 0) return { ...position, x: brickPosition.x + brickWidth };
      else if (direction.y > 0) return { ...position, y: brickPosition.y - this._height };
      else if (direction.y < 0) return { ...position, y: brickPosition.y + brickHeight };
    }

    return false;
  }

  getId() {
    return this._id;
  }

  _destroyBullet() {

  }
}