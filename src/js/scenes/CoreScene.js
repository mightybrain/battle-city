class CoreScene {
	constructor({ state, canvasSize, tileSize, gameAreaPosition, sceneManager, assets }) {
		this._state = state;
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._sceneManager = sceneManager;
		this._assets = assets;

		this._level = new Level({
			state: this._state,
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
		});

		this._levelIndicator = new LevelIndicator({
			state: this._state,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
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
			assets: this._assets,
			state: this._state,
		});

		this._explosionsStore = new ExplosionsStore();
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

		this._player = new Player({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			level: this._level,
			bulletsStore: this._bulletsStore,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			explosionsStore: this._explosionsStore,
			eagle: this._eagle,
			assets: this._assets,
			state: this._state,
			sign: 1,
			moveSprite: 'images/player-01.png',
			moveSpriteInitialAnimationIndex: 0,
			initialDirection: { x: 0, y: -1 },
			initialCoords: { x: 18, y: 48 },
			speed: { 
				x: this._tileSize.width * Player.SPEED_PER_SECOND_SCALE_FACTOR,
				y: this._tileSize.height * Player.SPEED_PER_SECOND_SCALE_FACTOR,
			},
			armor: 0,
		});

		this._playersStore.addPlayer(this._player);

		this._enemiesSpawner = new EnemiesSpawner({
			tileSize: this._tileSize,
			gameAreaPostion: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesQueue: this._enemiesQueue,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			bulletsStore: this._bulletsStore,
			explosionsStore: this._explosionsStore,
			level: this._level,
			eagle: this._eagle,
		});

		this._gameOverOrLevelCompleteHandler = new GameOverAndLevelCompleteHandler({
			state: this._state,
			sceneManager: this._sceneManager,
			eagle: this._eagle,
			playersStore: this._playersStore,
			enemiesStore: this._enemiesStore,
			enemiesQueue: this._enemiesQueue,
		});
	}

	update(time) {
		this._enemiesSpawner.checkAndSpawn(time);
		this._playersStore.update(time);
		this._enemiesStore.update(time);
		this._bulletsStore.update(time);
		this._explosionsStore.update(time);
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
		this._enemiesQueue.render(ctx);
		this._playersIndicator.render(ctx);
		this._levelIndicator.render(ctx);
	}

	handleKeyDown(event) {
		this._player.handleKeyDown(event);
	}

	handleKeyUp(event) {
		this._player.handleKeyUp(event);
	}
}