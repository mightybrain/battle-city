class CoreScene {
	constructor({ state, canvasSize, tileSize, gameAreaPosition, sceneManager, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._sceneManager = sceneManager;
		this._state = state;
		this._assets = assets;

		this._level = new Level({
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
		});

		this._levelIndicator = new LevelIndicator({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
		});
		
		this._enemiesQueue = new EnemiesQueue({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
		});

		this._playersIndicator = new PlayersIndicator({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
		});

		this._explosionsStore = new ExplosionsStore();
		this._buffsStore = new BuffsStore();
		this._enemiesStore = new EnemiesStore();
		this._bulletsStore = new BulletsStore();
		this._playersStore = new PlayersStore({
			state: this._state,
		});

		this._eagle = new Eagle({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			explosionsStore: this._explosionsStore,
		})

		this._buffsSpawner = new BuffsSpawner({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesStore: this._enemiesStore,
			buffsStore: this._buffsStore,
		});

		this._enemiesSpawner = new EnemiesSpawner({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesQueue: this._enemiesQueue,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			bulletsStore: this._bulletsStore,
			buffsStore: this._buffsStore,
			explosionsStore: this._explosionsStore,
			buffsSpawner: this._buffsSpawner,
			level: this._level,
			eagle: this._eagle,
		});

		this._playersSpawner = new PlayersSpawner({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesQueue: this._enemiesQueue,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			bulletsStore: this._bulletsStore,
			explosionsStore: this._explosionsStore,
			buffsStore: this._buffsStore,
			buffsSpawner: this._buffsSpawner,
			level: this._level,
			eagle: this._eagle,
		})

		this._playersSpawner.spawnPlayers();

		this._gameOverOrLevelCompleteHandler = new GameOverAndLevelCompleteHandler({
			sceneManager: this._sceneManager,
			state: this._state,
			eagle: this._eagle,
			playersStore: this._playersStore,
			enemiesStore: this._enemiesStore,
			enemiesQueue: this._enemiesQueue,
		});
	}

	update(time) {
		this._enemiesSpawner.checkAndSpawnRandomEnemy(time);
		this._playersStore.update(time);
		this._enemiesStore.update(time);
		this._bulletsStore.update(time);
		this._explosionsStore.update(time);
		this._buffsStore.update(time);
		this._gameOverOrLevelCompleteHandler.checkAndHandle(time);
	}

	resize() {
		this._level.resize();
		this._eagle.setSize();
		this._playersStore.setSize();
		this._enemiesStore.setSize();
		this._bulletsStore.setSize();
		this._enemiesQueue.setSize();
		this._explosionsStore.setSize();
		this._buffsStore.setSize();
		this._playersIndicator.setSize();
		this._levelIndicator.setSize();
	}

	render(ctx) {
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		this._level.render(ctx, 'bottom');
		this._eagle.render(ctx);
		this._playersStore.render(ctx);
		this._enemiesStore.render(ctx);
		this._bulletsStore.render(ctx);
		this._explosionsStore.render(ctx);
		this._level.render(ctx, 'top');
		this._buffsStore.render(ctx);
		this._enemiesQueue.render(ctx);
		this._playersIndicator.render(ctx);
		this._levelIndicator.render(ctx);
	}

	handleKeyDown(event) {
		this._playersStore.handleKeyDown(event);
	}

	handleKeyUp(event) {
		this._playersStore.handleKeyUp(event);
	}
}