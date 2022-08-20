class Tank {
  constructor({ position, baseSize, levelPosition }) {
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
    this._width = baseSize.width * 4;
    this._height = baseSize.height * 4;
    this._speedPerSecond = 100;
    this._velocity = {
      x: 0,
      y: 0,
    };
  }

  render(ctx) {
		ctx.fillStyle = '#E79C21';
		ctx.fillRect(this._position.x, this._position.y, this._width, this._height);
  }

  update({ delta, level }) {
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
    position = this._updatePositionWithLevelEdgesCollision(position, this._velocity, level);
    position = this._updatePositionWithLevelBricksCollision(position, this._velocity, level);
    this._position = position;
  }

  _roundPositionByAxis(positionByAxis, axis) {
    return axis === 'x' ? 
      Math.round((positionByAxis - this._levelPosition.x) / this._baseSize.width) * this._baseSize.width + this._levelPosition.x :
      Math.round((positionByAxis - this._levelPosition.y) / this._baseSize.height) * this._baseSize.height + this._levelPosition.y;
  }

  _updatePositionWithLevelEdgesCollision(position, direction, level) {
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
      return position;
    }
  }

  _updatePositionWithLevelBricksCollision(position, direction, level) {
    const bricks = level.getBricks();
    
    for (let i = 0; i < bricks.length; i++) {
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

    return position;
  }

	handleKeyDown(key) {
    const moveEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    
    if (moveEvents.includes(key)) {
      switch (key) {
        case 'ArrowUp':
          this._velocity = {
            x: 0,
            y: -this._speedPerSecond,
          };
          break;
        case 'ArrowDown':
          this._velocity = {
            x: 0,
            y: this._speedPerSecond,
          };
          break;
        case 'ArrowRight':
          this._velocity = {
            x: this._speedPerSecond,
            y: 0,
          };
          break;
        case 'ArrowLeft':
          this._velocity = {
            x: -this._speedPerSecond,
            y: 0,
          };
          break;
      }
    }
	}

	handleKeyUp(key) {
    const moveEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    if (moveEvents.includes(key)) {
      const mustStop = 
        (key === 'ArrowUp' && this._velocity.y < 0) ||
        (key === 'ArrowDown' && this._velocity.y > 0) ||
        (key === 'ArrowRight' && this._velocity.x > 0) ||
        (key === 'ArrowLeft' && this._velocity.x < 0);
      if (mustStop) this._velocity = { x: 0, y: 0 }
    };
	}
}