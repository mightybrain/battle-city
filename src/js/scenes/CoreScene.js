class CoreScene {
  constructor({ state, canvasSize, stepSize, safeAreaPosition, sceneManager }) {
    this._state = state;
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._safeAreaPosition = safeAreaPosition;
    this._sceneManager = sceneManager;

    this._level = new Level({
      state: this._state,
      canvasSize: this._canvasSize,
      stepSize: this._stepSize,
      safeAreaPosition: this._safeAreaPosition,
		});

    this._eagle = new Eagle({
      stepSize: this._stepSize,
      safeAreaPosition: this._safeAreaPosition,
    })

    this._enemiesQueue = new EnemiesQueue();
    this._enemiesStore = new EnemiesStore();
		this._bulletsStore = new BulletsStore();

    this._prevEnemiesSpawnTime = 0;
    this._nextEnemiesSpawnTime = 0;

		this._player = new Player({
			stepSize: this._stepSize,
      safeAreaPosition: this._safeAreaPosition,
			level: this._level,
			bulletsStore: this._bulletsStore,
      enemiesStore: this._enemiesStore,
		});
  }

	update(time) {
    if (this._player.getDestroyed()) this._player.respawn();
    if (!this._player.getDestroyed()) this._player.update(time);
    this._bulletsStore.update(time);
    this._enemiesStore.update(time);
    this._tryToSpawnEnemies(time);
	}

  _tryToSpawnEnemies({ timestamp }) {
    if (!this._prevEnemiesSpawnTime || timestamp > this._nextEnemiesSpawnTime) {
      this._prevEnemiesSpawnTime = timestamp;
      this._nextEnemiesSpawnTime = this._prevEnemiesSpawnTime + getRandomFromRange(10000, 15000);
      this._spawnEnemies();
    }
  }

  _spawnEnemies() {
    let spawnCounter = this._enemiesQueue.getEnemiesInQueue();
    if (spawnCounter) spawnCounter = Math.min(CoreScene.MAX_ENEMIES_COUNTER - this._enemiesStore.getEnemies().length, CoreScene.INITIAL_COORDS.length);

    CoreScene.INITIAL_COORDS.slice(0, spawnCounter).forEach(coords => {
      const enemy = new Enemy({
        stepSize: this._stepSize,
        safeAreaPosition: this._safeAreaPosition,
        level: this._level,
        bulletsStore: this._bulletsStore,
        player: this._player,
        enemiesStore: this._enemiesStore,
        initialCoords: coords,
      });
      this._enemiesStore.addEnemy(enemy);
      this._enemiesQueue.decreaseEnemiesInQueue();
    })
  }

  setSize() {
    this._level.setSize();
    this._player.setSize();
    this._bulletsStore.setSize();
    this._enemiesStore.setSize();
  }

  render(ctx) {
    ctx.fillStyle = '#636363';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

    this._level.render(ctx, 'bottom');
    if (!this._player.getDestroyed()) this._player.render(ctx);
    this._bulletsStore.render(ctx);
    this._enemiesStore.render(ctx);
    this._level.render(ctx, 'top');
    this._eagle.render(ctx);
  }

  handleKeyDown(code) {
    this._player.handleKeyDown(code);
  }

	handleKeyUp(code) {
    this._player.handleKeyUp(code);
	}
}

CoreScene.MAX_ENEMIES_COUNTER = 7;
CoreScene.INITIAL_COORDS = [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 48, y: 0 }];