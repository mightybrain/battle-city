class EnemiesSpawner {
  constructor({ tileSize, gameAreaPosition, assets, enemiesQueue, enemiesStore, level, playersStore, buffsStore, bulletsStore, explosionsStore, buffsSpawner, eagle, state }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
		this._state = state;
    this._assets = assets;
    this._enemiesQueue = enemiesQueue;
    this._enemiesStore = enemiesStore;
		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._explosionsStore = explosionsStore;
		this._buffsStore = buffsStore;
		this._buffsSpawner = buffsSpawner;
		this._level = level;
		this._eagle = eagle;

		this._prevEnemiesSpawnTime = null;
		this._nextEnemiesSpawnTime = null;
  }

  checkAndSpawnRandomEnemy({ timestamp }) {
    if (this._prevEnemiesSpawnTime !== null && timestamp < this._nextEnemiesSpawnTime) return;

    this._prevEnemiesSpawnTime = timestamp;
    this._nextEnemiesSpawnTime = this._prevEnemiesSpawnTime + getRandomFromRange(10000, 15000);

		let spawnCounter = Math.min(this._enemiesQueue.getEnemiesInQueue(), Enemy.INITIAL_COORDS.length);
		if (spawnCounter) spawnCounter = Math.min(EnemiesStore.MAX_ENEMIES_COUNTER - this._enemiesStore.getEnemies().length, spawnCounter);

		Enemy.INITIAL_COORDS.slice(0, spawnCounter).forEach(coords => {
			const randomEnemyClassIndex = getRandomFromRange(0, EnemiesSpawner.ENEMIES_CLASSES.length - 1);

			const enemy = new EnemiesSpawner.ENEMIES_CLASSES[randomEnemyClassIndex]({
				tileSize: this._tileSize,
				gameAreaPosition: this._gameAreaPosition,
				level: this._level,
				playersStore: this._playersStore,
				bulletsStore: this._bulletsStore,
				enemiesStore: this._enemiesStore,
				explosionsStore: this._explosionsStore,
				buffsStore: this._buffsStore,
				buffsSpawner: this._buffsSpawner,
				initialCoords: coords,
				eagle: this._eagle,
				assets: this._assets,
				state: this._state,
				spawnBuffOnHit: Math.random() <= 0.2,
			});

			this._enemiesStore.addEnemy(enemy);
			this._enemiesQueue.decreaseEnemiesInQueue();
		})
  }
}

EnemiesSpawner.ENEMIES_CLASSES = [DefaultEnemy, ShooterEnemy, FastEnemy, ArmoredEnemy];