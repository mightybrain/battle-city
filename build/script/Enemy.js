class Enemy {
  constructor({ stepSize, safeAreaPosition, level, bulletsStore, initialCoords, player, enemiesStore }) {
    this._stepSize = stepSize;
    this._prevStepSizeWidth = this._stepSize.width;
    this._prevStepSizeHeight = this._stepSize.height;
    this._safeAreaPosition = safeAreaPosition;
    this._prevSafeAreaPositionX = this._safeAreaPosition.x;
    this._prevSafeAreaPositionY = this._safeAreaPosition.y;
    this._initialCoords = initialCoords;
    this._player = player;
    this._enemiesStore = enemiesStore;

    this._level = level;
    this._bulletsStore = bulletsStore;

    this._size = {
      width: 0,
      height: 0,
    };
    this._position = {
      x: 0,
      y: 0,
    };
    this._direction = {
      x: 0,
      y: 1,
    };
    this._velocity = {
      x: 0,
      y: 0,
    };
    this.setSize({ initial: true });

    this._reload = false;
    this._personalBullets = [];

    this._loaded = false;

    this._sprite = new Image();
    this._sprite.addEventListener('load', () => {
      this._loaded = true;
    })
    this._sprite.src = 'images/enemy-01.png';

    this._prevChangeDirectionTime = 0;
    this._nextChangeDirectionTime = 0;
    this._prevShootTime = 0;
    this._nextShootTime = 0;

    this._destroyed = false;
  }

  setSize({ initial = false } = {}) {
    this._size.width = this._stepSize.width * Enemy.SIZE_SCALE_FACTOR;
    this._size.height = this._stepSize.height * Enemy.SIZE_SCALE_FACTOR;

    this._velocity.x = this._direction.x * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.width;
    this._velocity.y = this._direction.y * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.height;

    if (initial) {
      this._position.x = this._safeAreaPosition.x + this._stepSize.width * this._initialCoords.x;
      this._position.y = this._safeAreaPosition.y + this._stepSize.height * this._initialCoords.y;
    } else {
      const coords = {
        x: (this._position.x - this._prevSafeAreaPositionX) / this._prevStepSizeWidth,
        y: (this._position.y - this._prevSafeAreaPositionY) / this._prevStepSizeHeight,
      }
      this._position.x = this._safeAreaPosition.x + this._stepSize.width * coords.x;
      this._position.y = this._safeAreaPosition.y + this._stepSize.height * coords.y;

      this._prevStepSizeWidth = this._stepSize.width;
      this._prevStepSizeHeight = this._stepSize.height;
      this._prevSafeAreaPositionX = this._safeAreaPosition.x;
      this._prevSafeAreaPositionY = this._safeAreaPosition.y;
    }
  }

  render(ctx) {
    if (!this._loaded) return;

    let spriteOffset = 0;
    if (this._direction.x > 0) spriteOffset = this._sprite.width * .75;
    else if (this._direction.x < 0) spriteOffset = this._sprite.width * .5;
    else if (this._direction.y > 0) spriteOffset = this._sprite.width * .25;

    ctx.drawImage(this._sprite, spriteOffset, 0, this._sprite.width * .25, this._sprite.height, this._position.x, this._position.y, this._size.width, this._size.height);
  }

  update({ delta, timestamp }) {
    this._personalBullets = this._personalBullets.filter(bullet => !bullet.getDestroyed());

    if (!this._prevShootTime) {
      this._prevShootTime = timestamp;
      this._nextShootTime = this._prevShootTime + getRandomFromRange(500, 5000);
    } else if (timestamp > this._nextShootTime) {
      this._prevShootTime = timestamp;
      this._nextShootTime = this._prevShootTime + getRandomFromRange(500, 5000);
      this._shoot();
    }

    if (!this._prevChangeDirectionTime) {
      this._prevChangeDirectionTime = timestamp;
      this._nextChangeDirectionTime = this._prevChangeDirectionTime + getRandomFromRange(500, 5000);
    } else if (timestamp > this._nextChangeDirectionTime) {
      this._prevChangeDirectionTime = timestamp;
      this._nextChangeDirectionTime = this._prevChangeDirectionTime + getRandomFromRange(500, 5000);
      this._setRandomDirection();
    }

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
    position = this._updatePositionWithPlayerCollision(position);
    position = this._updatePositionWithEnemiesCollision(position);
    position = this._updatePositionWithLevelBricksCollision(position);
    this._position = position;
  }

  _roundPositionByAxis(positionByAxis, axis) {
    return axis === 'x' ? 
      Math.round((positionByAxis - this._safeAreaPosition.x) / this._stepSize.width) * this._stepSize.width + this._safeAreaPosition.x :
      Math.round((positionByAxis - this._safeAreaPosition.y) / this._stepSize.height) * this._stepSize.height + this._safeAreaPosition.y;
  }

  _updatePositionWithPlayerCollision(position) {
    const playerBoundaryBox = this._player.getRoundedBoundaryBox();

    const collision = 
      position.x + this._size.width > playerBoundaryBox.x1 &&
      position.x < playerBoundaryBox.x2 &&
      position.y + this._size.height > playerBoundaryBox.y1 &&
      position.y < playerBoundaryBox.y2;

    if (!collision) return position;
    else if (this._velocity.x > 0) return { ...position, x: playerBoundaryBox.x1 - this._size.width };
    else if (this._velocity.x < 0) return { ...position, x: playerBoundaryBox.x2 };
    else if (this._velocity.y > 0) return { ...position, y: playerBoundaryBox.y1 - this._size.height };
    else if (this._velocity.y < 0) return { ...position, y: playerBoundaryBox.y2 };
  }

  _updatePositionWithEnemiesCollision(position) {
    const enemies = this._enemiesStore.getEnemies();

    const enemiesWithCollision = enemies.filter(enemy => {
      if (enemy === this) return false;
      
      const enemyBoundaryBox = enemy.getRoundedBoundaryBox();

      return position.x + this._size.width > enemyBoundaryBox.x1 &&
        position.x < enemyBoundaryBox.x2 &&
        position.y + this._size.height > enemyBoundaryBox.y1 &&
        position.y < enemyBoundaryBox.y2;
    })

    const closestEnemy = this._findClosestEnemy(enemiesWithCollision, position);

    if (!closestEnemy) return position;

    const closestEnemyBoundaryBox = closestEnemy.getRoundedBoundaryBox();

    if (this._velocity.x > 0) return { ...position, x: closestEnemyBoundaryBox.x1 - this._size.width };
    else if (this._velocity.x < 0) return { ...position, x: closestEnemyBoundaryBox.x2 };
    else if (this._velocity.y > 0) return { ...position, y: closestEnemyBoundaryBox.y1 - this._size.height };
    else if (this._velocity.y < 0) return { ...position, y: closestEnemyBoundaryBox.y2 };
  }

  _findClosestEnemy(enemies) {
    if (!enemies.length) return null;

    const axis = this._velocity.x ? 'x' : 'y';

    return enemies.reduce((total, enemy) => {
      if (!total) return enemy;

      const currentDistance = Math.abs(enemy.getPosition()[axis] - this._position[axis]);
      const prevDistance = Math.abs(total.getPosition()[axis] - this._position[axis])

      return currentDistance < prevDistance ? enemy : total;
    }, null)
  }

  _updatePositionWithLevelEdgesCollision(position) {
    const { width: levelWidth, height: levelHeight } = this._level.getMapSize();

    if (position.x + this._size.width > this._safeAreaPosition.x + levelWidth) {
      return { ...position, x: this._safeAreaPosition.x + levelWidth - this._size.width };
    } else if (position.x < this._safeAreaPosition.x) {
      return { ...position, x: this._safeAreaPosition.x };
    } else if (position.y + this._size.height > this._safeAreaPosition.y + levelHeight) {
      return { ...position, y: this._safeAreaPosition.y + levelHeight - this._size.height };
    } else if (position.y < this._safeAreaPosition.y) {
      return { ...position, y: this._safeAreaPosition.y };
    } else return position;
  }

  _updatePositionWithLevelBricksCollision(position) {
    let area;
    if (this._velocity.x > 0) {
      area = {
        x1: this._position.x + this._size.width,
        y1: this._position.y,
        x2: position.x + this._size.width,
        y2: position.y + this._size.height,
      }
    } else if (this._velocity.x < 0) {
      area = {
        x1: position.x,
        y1: position.y,
        x2: this._position.x,
        y2: this._position.y + this._size.height,
      }
    } else if (this._velocity.y > 0) {
      area = {
        x1: this._position.x,
        y1: this._position.y + this._size.height,
        x2: position.x + this._size.width,
        y2: position.y + this._size.height,
      }
    } else if (this._velocity.y < 0) {
      area = {
        x1: position.x,
        y1: position.y,
        x2: this._position.x + this._size.width,
        y2: this._position.y,
      }
    }

    const coords = {
      x1: Math.floor((area.x1 - this._safeAreaPosition.x) / this._stepSize.width),
      y1: Math.floor((area.y1 - this._safeAreaPosition.y) / this._stepSize.height),
      x2: Math.ceil((area.x2 - this._safeAreaPosition.x) / this._stepSize.width),
      y2: Math.ceil((area.y2 - this._safeAreaPosition.y) / this._stepSize.height),
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
    else if (this._velocity.x > 0) return { ...position, x: closestBrickWithCollision.getPosition().x - this._size.width };
    else if (this._velocity.x < 0) return { ...position, x: closestBrickWithCollision.getPosition().x + closestBrickWithCollision.getSize().width };
    else if (this._velocity.y > 0) return { ...position, y: closestBrickWithCollision.getPosition().y - this._size.height };
    else if (this._velocity.y < 0) return { ...position, y: closestBrickWithCollision.getPosition().y + closestBrickWithCollision.getSize().height };
  }

  _shoot() {
    if (this._reload || this._personalBullets.length >= Player.MAX_PERSONAL_BULLETS) return;
    this._reload = true;

    const bulletWidth = this._stepSize.width;
    const bulletHeight = this._stepSize.height;
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
      stepSize: this._stepSize,
      safeAreaPosition: this._safeAreaPosition,
      level: this._level,
      position: bulletPosition,
      direction: {
        x: this._direction.x,
        y: this._direction.y,
      },
      owner: this,
      player: this._player,
      enemiesStore: this._enemiesStore,
      bulletsStore: this._bulletsStore,
    })
    this._bulletsStore.addBullet(bullet);
    this._personalBullets.push(bullet);

    setTimeout(() => {
      this._reload = false;
    }, Enemy.RELOAD_DELAY)
  }

  getPosition() {
    return this._position;
  }

  getSize() {
    return this._size;
  }

  getSizeAndPosition() {
    return {
      size: this._size,
      position: this._position,
    }
  }

  getRoundedBoundaryBox() {
    const coords = {
      x: (this._position.x - this._safeAreaPosition.x) / this._stepSize.width,
      y: (this._position.y - this._safeAreaPosition.y) / this._stepSize.height,
    }
    return {
      x1: this._safeAreaPosition.x + Math.floor(coords.x) * this._stepSize.width,
      y1: this._safeAreaPosition.y + Math.floor(coords.y) * this._stepSize.height,
      x2: this._safeAreaPosition.x + Math.ceil(coords.x) * this._stepSize.width + this._size.width,
      y2: this._safeAreaPosition.y + Math.ceil(coords.y) * this._stepSize.height + this._size.height,
    }
  }

  getBoundaryBox() {
    return {
      x1: this._position.x,
      y1: this._position.y,
      x2: this._position.x + this._size.width,
      y2: this._position.y + this._size.height,
    }
  }

  destroy() {
    this._destroyed = true;
  }

  getDestroyed() {
    return this._destroyed;
  }

	_setRandomDirection() {
    const direction = getRandomFromRange(1, 4);

    switch (direction) {
      case 1:
        this._direction.x = 0;
        this._direction.y = -1;
        break;
      case 2:
        this._direction.x = 0;
        this._direction.y = 1;
        break;
      case 3:
        this._direction.x = 1;
        this._direction.y = 0;
        break;
      case 4:
        this._direction.x = -1;
        this._direction.y = 0;
        break;
    }

    this._velocity.x = this._direction.x * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.width;
    this._velocity.y = this._direction.y * Player.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.height;
	}
}

Enemy.SIZE_SCALE_FACTOR = 4;
Enemy.SPEED_PER_SECOND_SCALE_FACTOR = 5;
Enemy.RELOAD_DELAY = 700;
Enemy.MAX_PERSONAL_BULLETS = 1;