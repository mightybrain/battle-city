class EnemiesSpawner {
  constructor({ tileSize, gameAreaPostion, assets, enemiesQueue, enemiesStore, level, playersStore, bulletsStore, explosionsStore, eagle, state }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPostion;
		this._state = state;
    this._assets = assets;
    this._enemiesQueue = enemiesQueue;
    this._enemiesStore = enemiesStore;
		this._playersStore = playersStore;
		this._bulletsStore = bulletsStore;
		this._explosionsStore = explosionsStore;
		this._level = level;
		this._eagle = eagle;

		this._prevEnemiesSpawnTime = 0;
		this._nextEnemiesSpawnTime = 0;
  }

  checkAndSpawn({ timestamp }) {
    if (this._prevEnemiesSpawnTime && timestamp < this._nextEnemiesSpawnTime) return;

    this._prevEnemiesSpawnTime = timestamp;
    this._nextEnemiesSpawnTime = this._prevEnemiesSpawnTime + getRandomFromRange(10000, 15000);

		let spawnCounter = Math.min(this._enemiesQueue.getEnemiesInQueue(), Enemy.INITIAL_COORDS.length);
		if (spawnCounter) spawnCounter = Math.min(EnemiesStore.MAX_ENEMIES_COUNTER - this._enemiesStore.getEnemies().length, spawnCounter);

		Enemy.INITIAL_COORDS.slice(0, spawnCounter).forEach(coords => {
			const typeIndex = getRandomFromRange(0, Enemy.TYPES.length - 1);
			const type = Enemy.TYPES[typeIndex];

			const enemy = new Enemy({
				tileSize: this._tileSize,
				gameAreaPosition: this._gameAreaPosition,
				level: this._level,
				playersStore: this._playersStore,
				bulletsStore: this._bulletsStore,
				enemiesStore: this._enemiesStore,
				explosionsStore: this._explosionsStore,
				initialCoords: coords,
				initialDirection: { x: 0, y: 1 },
				eagle: this._eagle,
				assets: this._assets,
				state: this._state,
				moveSprite: type.sprite,
				moveSpriteInitialAnimationIndex: 1,
				speed: { 
					x: this._tileSize.width * type.speedPerSecondScaleFactor,
					y: this._tileSize.height * type.speedPerSecondScaleFactor,
				},
				armor: type.armor,
				price: type.price,
				sign: type.sign,
			});

			this._enemiesStore.addEnemy(enemy);
			this._enemiesQueue.decreaseEnemiesInQueue();
		})
  }
}