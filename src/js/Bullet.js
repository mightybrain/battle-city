class Bullet {
  constructor({ stepSize, safeAreaPosition, level, position, direction, bulletsStore, enemiesStore, player, owner }) {
    this._stepSize = stepSize;
    this._prevStepSizeWidth = this._stepSize.width;
    this._prevStepSizeHeight = this._stepSize.height;
    this._safeAreaPosition = safeAreaPosition;
    this._prevSafeAreaPositionX = this._safeAreaPosition.x;
    this._prevSafeAreaPositionY = this._safeAreaPosition.y;

    this._bulletsStore = bulletsStore;
    this._enemiesStore = enemiesStore;
    this._player = player;
    this._owner = owner;

    this._level = level;

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

    this._destroyed = false;
  }

  setSize({ initial = false } = {}) {
    this._velocity.x = this._direction.x * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.width;
    this._velocity.y = this._direction.y * Bullet.SPEED_PER_SECOND_SCALE_FACTOR * this._stepSize.height;

    if (!initial) {
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
    ctx.fillStyle = 'white';
    ctx.fillRect(this._position.x, this._position.y, this._stepSize.width, this._stepSize.height);
  }

  update({ delta }) {
    let position = {
      x: this._position.x + this._velocity.x * delta,
      y: this._position.y + this._velocity.y * delta,
    }

    const positionWithLevelEdgesCollision = this._updatePositionWithLevelEdgesCollision(position);
    if (positionWithLevelEdgesCollision !== position) {
      position = positionWithLevelEdgesCollision;
      this.destroy();
      return;
    }

    const { position: positionWithLevelBricksCollision, bricksForDestroy } = this._updatePositionWithLevelBricksCollision(position);
    if (positionWithLevelBricksCollision !== position) {
      position = positionWithLevelBricksCollision;
      this.destroy();
      this._level.destroyBricks(bricksForDestroy);
      return;
    }

    const { position: positionWithBulletsCollision, bulletsForDestroy } = this._updatePositionWithBulletsCollision(position);
    if (positionWithBulletsCollision !== position) {
      position = positionWithBulletsCollision;
      this.destroy();
      bulletsForDestroy.forEach(item => item.destroy());
      return;
    }

    const { position: positionWithEnemiesCollision, enemiesForDestroy } = this._updatePositionWithEnemiesCollision(position);
    if (positionWithEnemiesCollision !== position) {
      position = positionWithEnemiesCollision;
      this.destroy();
      enemiesForDestroy.forEach(item => item.destroy());
      return;
    }

    const positionWithPlayerCollision = this._updatePositionWithPlayerCollision(position);
    if (positionWithPlayerCollision !== position) {
      position = positionWithPlayerCollision;
      this.destroy();
      this._player.destroy();
      return;
    }

    this._position = position;
  }

  _updatePositionWithPlayerCollision(position) {
    if (this._owner instanceof Player) return position;

    const playerBoundaryBox = this._player.getBoundaryBox();

    const collision = 
      position.x + this._stepSize.width > playerBoundaryBox.x1 &&
      position.x < playerBoundaryBox.x2 &&
      position.y + this._stepSize.height > playerBoundaryBox.y1 &&
      position.y < playerBoundaryBox.y2;

    if (!collision) return position;
    else if (this._velocity.x > 0) {
      return { ...position, x: this._player.getPosition().x - this._stepSize.width };
    } else if (this._velocity.x < 0) {
      return { ...position, x: this._player.getPosition().x + this._player.getSize().width };
    } else if (this._velocity.y > 0) {
      return { ...position, y: this._player.getPosition().y - this._stepSize.height };
    } else if (this._velocity.y < 0) {
      return { ...position, y: this._player.getPosition().y + this._player.getSize().height };
    }
  }

  _updatePositionWithBulletsCollision(position) {
    const bulletsWithCollision = this._bulletsStore
      .getBullets()
      .filter(bullet => {
        if (bullet === this) return false;
        if (bullet.getOwner() instanceof Enemy && this._owner instanceof Enemy) return false;

        const bulletBoundaryBox = bullet.getBoundaryBox();

        return position.x + this._stepSize.width > bulletBoundaryBox.x1 &&
          position.x < bulletBoundaryBox.x2 &&
          position.y + this._stepSize.height > bulletBoundaryBox.y1 &&
          position.y < bulletBoundaryBox.y2;
      })

    const closestBulletWithCollision = this._findClosestBullet(bulletsWithCollision);

    if (!closestBulletWithCollision) return { position };
    else if (this._velocity.x > 0) {
      return { 
        position: { ...position, x: closestBulletWithCollision.getPosition().x - this._stepSize.width },
        bulletsForDestroy: bulletsWithCollision,
      }
    } else if (this._velocity.x < 0) {
      return {
        position: { ...position, x: closestBulletWithCollision.getPosition().x + closestBulletWithCollision.getSize().width },
        bulletsForDestroy: bulletsWithCollision,
      }
    } else if (this._velocity.y > 0) {
      return {
        position: { ...position, y: closestBulletWithCollision.getPosition().y - this._stepSize.height },
        bulletsForDestroy: bulletsWithCollision,
      }
    } else if (this._velocity.y < 0) {
      return {
        position: { ...position, y: closestBulletWithCollision.getPosition().y + closestBulletWithCollision.getSize().height },
        bulletsForDestroy: bulletsWithCollision,
      }
    }
  }

  _findClosestBullet(bullets) {
    if (!bullets.length) return null;

    const axis = this._velocity.x ? 'x' : 'y';

    return bullets.reduce((total, bullet) => {
      if (!total) return bullet;

      const currentDistance = Math.abs(bullet.getPosition()[axis] - this._position[axis]);
      const prevDistance = Math.abs(bullet.getPosition()[axis] - this._position[axis])

      return currentDistance < prevDistance ? bullet : total;
    }, null)
  }

  _updatePositionWithEnemiesCollision(position) {
    const enemiesWithCollision = this._enemiesStore
      .getEnemies()
      .filter(enemy => {
        if (this._owner instanceof Enemy) return false;

        const enemyBoundaryBox = enemy.getBoundaryBox();

        return position.x + this._stepSize.width > enemyBoundaryBox.x1 &&
          position.x < enemyBoundaryBox.x2 &&
          position.y + this._stepSize.height > enemyBoundaryBox.y1 &&
          position.y < enemyBoundaryBox.y2;
      })

    const closestEnemyWithCollision = this._findClosestEnemy(enemiesWithCollision);

    if (!closestEnemyWithCollision) return { position };
    else if (this._velocity.x > 0) {
      return { 
        position: { ...position, x: closestEnemyWithCollision.getPosition().x - this._stepSize.width },
        enemiesForDestroy: enemiesWithCollision,
      }
    } else if (this._velocity.x < 0) {
      return {
        position: { ...position, x: closestEnemyWithCollision.getPosition().x + closestEnemyWithCollision.getSize().width },
        enemiesForDestroy: enemiesWithCollision,
      }
    } else if (this._velocity.y > 0) {
      return {
        position: { ...position, y: closestEnemyWithCollision.getPosition().y - this._stepSize.height },
        enemiesForDestroy: enemiesWithCollision,
      }
    } else if (this._velocity.y < 0) {
      return {
        position: { ...position, y: closestEnemyWithCollision.getPosition().y + closestEnemyWithCollision.getSize().height },
        enemiesForDestroy: enemiesWithCollision,
      }
    }
  }

  _findClosestEnemy(enemies) {
    if (!enemies.length) return null;

    const axis = this._velocity.x ? 'x' : 'y';

    return enemies.reduce((total, enemy) => {
      if (!total) return enemy;

      const currentDistance = Math.abs(enemy.getPosition()[axis] - this._position[axis]);
      const prevDistance = Math.abs(enemy.getPosition()[axis] - this._position[axis])

      return currentDistance < prevDistance ? enemy : total;
    }, null)
  }

  _updatePositionWithLevelEdgesCollision(position) {
    const { width: levelWidth, height: levelHeight } = this._level.getMapSize();

    if (position.x + this._stepSize.width > this._safeAreaPosition.x + levelWidth) {
      return { ...position, x: this._safeAreaPosition.x + levelWidth - this._stepSize.width };
    } else if (position.x < this._safeAreaPosition.x) {
      return { ...position, x: this._safeAreaPosition.x };
    } else if (position.y + this._stepSize.height > this._safeAreaPosition.y + levelHeight) {
      return { ...position, y: this._safeAreaPosition.y + levelHeight - this._stepSize.height };
    } else if (position.y < this._safeAreaPosition.y) {
      return { ...position, y: this._safeAreaPosition.y };
    } else return position;
  }

  _updatePositionWithLevelBricksCollision(position) {
    let area;
    if (this._velocity.x > 0) {
      area = {
        x1: this._position.x + this._stepSize.width,
        y1: this._position.y,
        x2: position.x + this._stepSize.width,
        y2: position.y + this._stepSize.height,
      }
    } else if (this._velocity.x < 0) {
      area = {
        x1: position.x,
        y1: position.y,
        x2: this._position.x,
        y2: this._position.y + this._stepSize.height,
      }
    } else if (this._velocity.y > 0) {
      area = {
        x1: this._position.x,
        y1: this._position.y + this._stepSize.height,
        x2: position.x + this._stepSize.width,
        y2: position.y + this._stepSize.height,
      }
    } else if (this._velocity.y < 0) {
      area = {
        x1: position.x,
        y1: position.y,
        x2: this._position.x + this._stepSize.width,
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
        position: { ...position, x: bricksForDestroy[0].getPosition().x - this._stepSize.width },
        bricksForDestroy,
      }
    } else if (this._velocity.x < 0) {
      return {
        position: { ...position, x: bricksForDestroy[0].getPosition().x + bricksForDestroy[0].getSize().width },
        bricksForDestroy,
      }
    } else if (this._velocity.y > 0) {
      return {
        position: { ...position, y: bricksForDestroy[0].getPosition().y - this._stepSize.height },
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

  destroy() {
    this._destroyed = true;
  }

  getDestroyed() {
    return this._destroyed;
  }

  getSize() {
    return this._stepSize;
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
      x2: this._position.x + this._stepSize.width,
      y2: this._position.y + this._stepSize.height,
    }
  }
}

Bullet.SPEED_PER_SECOND_SCALE_FACTOR = 18;