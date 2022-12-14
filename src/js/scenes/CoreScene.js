class CoreScene {
	constructor({ state, canvasSize, stepSize, safeAreaPosition, sceneManager, assets }) {
		this._state = state;
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._sceneManager = sceneManager;
		this._assets = assets;

		this._level = new Level({
			state: this._state,
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
		});

		this._levelIndicator = new LevelIndicator({
			state: this._state,
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
		});
		
		this._enemiesQueue = new EnemiesQueue({
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
		});
		this._explosionsStore = new ExplosionsStore();
		this._enemiesStore = new EnemiesStore();
		this._bulletsStore = new BulletsStore();
		this._playersStore = new PlayersStore({
			state: this._state,
		});

		this._eagle = new Eagle({
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
			explosionsStore: this._explosionsStore,
		})

		this._playersIndicator = new PlayersIndicator({
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			assets: this._assets,
			state: this._state,
		});

		this._player = new Player({
			stepSize: this._stepSize,
			safeAreaPosition: this._safeAreaPosition,
			level: this._level,
			bulletsStore: this._bulletsStore,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			explosionsStore: this._explosionsStore,
			eagle: this._eagle,
			assets: this._assets,
			state: this._state,
			sign: 1,
			sprite: this._assets.get('images/player-01.png'),
			spriteInitialAnimationIndex: 0,
			initialDirection: { x: 0, y: -1 },
			initialCoords: { x: 18, y: 48 },
			speed: { 
				x: this._stepSize.width * Player.SPEED_PER_SECOND_SCALE_FACTOR,
				y: this._stepSize.height * Player.SPEED_PER_SECOND_SCALE_FACTOR,
			},
			armor: 0,
		});

		this._playersStore.addPlayer(this._player);

		this._prevEnemiesSpawnTime = 0;
		this._nextEnemiesSpawnTime = 0;
		this._gameOverOrLevelCompleteTime = 0;
		window.addEventListener('blur', () => {
			this._prevEnemiesSpawnTime = 0;
			this._nextEnemiesSpawnTime = 0;
			this._gameOverOrLevelCompleteTime = 0;
		})
	}

	update(time) {
		this._playersStore.update(time);
		this._enemiesStore.update(time);
		this._bulletsStore.update(time);
		this._explosionsStore.update(time);
		
		this._tryToSpawnEnemies(time);
		this._checkAndHandleGameOver(time);
		this._checkAndHandleLevelComplete(time);
	}

	_checkAndHandleGameOver({ timestamp }) {
		const eagleDestroyed = this._eagle.getDestroyed();
		const noPlayersInStore = !this._playersStore.getPlayers().length;

		if (!eagleDestroyed && !noPlayersInStore) return;

		if (!this._gameOverOrLevelCompleteTime) {
			this._gameOverOrLevelCompleteTime = timestamp;
			this._state.setGameOver(true);
		} else if (timestamp > this._gameOverOrLevelCompleteTime + CoreScene.DELAY_BEFORE_SCENE_END) {
			this._sceneManager.showResultScene();
		}
	}

	_checkAndHandleLevelComplete({ timestamp }) {
		const noEnemiesInQueue = !this._enemiesQueue.getEnemiesInQueue();
		const noEnemiesInStore = !this._enemiesStore.getEnemies().length;

		if (!noEnemiesInQueue || !noEnemiesInStore) return;

		if (!this._gameOverOrLevelCompleteTime) this._gameOverOrLevelCompleteTime = timestamp;
		else if (timestamp > this._gameOverOrLevelCompleteTime + CoreScene.DELAY_BEFORE_SCENE_END) this._sceneManager.showResultScene();
	}

	_tryToSpawnEnemies({ timestamp }) {
		if (!this._prevEnemiesSpawnTime || timestamp > this._nextEnemiesSpawnTime) {
			this._prevEnemiesSpawnTime = timestamp;
			this._nextEnemiesSpawnTime = this._prevEnemiesSpawnTime + getRandomFromRange(10000, 15000);
			this._spawnEnemies();
		}
	}

	_spawnEnemies() {
		let spawnCounter = Math.min(this._enemiesQueue.getEnemiesInQueue(), Enemy.INITIAL_COORDS.length);
		if (spawnCounter) spawnCounter = Math.min(EnemiesStore.MAX_ENEMIES_COUNTER - this._enemiesStore.getEnemies().length, spawnCounter);

		Enemy.INITIAL_COORDS.slice(0, spawnCounter).forEach(coords => {
			const typeIndex = getRandomFromRange(0, Enemy.TYPES.length - 1);
			const type = Enemy.TYPES[typeIndex];

			const enemy = new Enemy({
				stepSize: this._stepSize,
				safeAreaPosition: this._safeAreaPosition,
				level: this._level,
				player: this._player,
				playersStore: this._playersStore,
				bulletsStore: this._bulletsStore,
				enemiesStore: this._enemiesStore,
				explosionsStore: this._explosionsStore,
				initialCoords: coords,
				initialDirection: { x: 0, y: 1 },
				eagle: this._eagle,
				assets: this._assets,
				state: this._state,
				sprite: this._assets.get(type.sprite),
				spriteInitialAnimationIndex: 1,
				speed: { 
					x: this._stepSize.width * type.speedPerSecondScaleFactor,
					y: this._stepSize.height * type.speedPerSecondScaleFactor,
				},
				armor: type.armor,
				price: type.price,
				sign: type.sign,
			});
			this._enemiesStore.addEnemy(enemy);
			this._enemiesQueue.decreaseEnemiesInQueue();
		})
	}

	setSize() {
		this._level.setSize();
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

	handleKeyDown(code) {
		this._player.handleKeyDown(code);
	}

	handleKeyUp(code) {
		this._player.handleKeyUp(code);
	}
}

CoreScene.DELAY_BEFORE_SCENE_END = 5000;
CoreScene.FONT_SIZE_SCALE_FACTOR = 2;