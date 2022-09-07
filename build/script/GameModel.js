class GameModel {
	constructor({ canvasSize, baseSize, sceneManager }) {
		this._canvasSize = canvasSize;
		this._baseSize = baseSize;
		this._sceneManager = sceneManager;

		/*this._levelIndex = 1;
		this._level = new Level({
			levelIndex: this._levelIndex,
			width: this._width,
			height: this._height,
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		});

		this._bulletsStore = new BulletsStore();

		this._player = new Player({
			position: { x: 0, y: 0 },
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
			level: this._level,
			bulletsStore: this._bulletsStore,
		});*/
	}

	/*update(delta) {
		this._player.update(delta);
		this._bulletsStore.update(delta);
	}

	setSize() {
		this._setLevelSize();
		this._setPlayerSize();
		this._setBulletsSize();
	}

	_setLevelSize() {
		this._level.setSize({
			width: this._width,
			height: this._height,
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		})
	}

	_setPlayerSize() {
		this._player.setSize({
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		})
	}

	_setBulletsSize() {
		this._bulletsStore.setBulletsSize({
			baseWidth: this._baseWidth,
			baseHeight: this._baseHeight,
		})
	}

	handleKeyDown(event) {
		const playerEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Space'];
		if (playerEvents.includes(event.code)) this._player.handleKeyDown(event.code);
	}

	handleKeyUp(event) {
		const playerEvents = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
		if (playerEvents.includes(event.code)) this._player.handleKeyUp(event.code);
	}

	getPlayer() {
		return this._player;
	}

	getLevel() {
		return this._level;
	}

	getBulletsStore() {
		return this._bulletsStore;
	}*/

	showMainScene() {
		this._sceneManager.setFutureScene(new MainScene({
			model: this,
			canvasSize: this._canvasSize,
			baseSize: this._baseSize,
		}));
	}

	prepareToNextLevel() {
		this._sceneManager.setFutureScene(new IntroScene({
			model: this,
			canvasSize: this._canvasSize,
			baseSize: this._baseSize,
		}))
	}

	startLevel() {
		this._sceneManager.setFutureScene(new CoreScene({
			model: this,
			canvasSize: this._canvasSize,
			baseSize: this._baseSize,
		}))
	}

	endLevel() {
		this._sceneManager.setFutureScene(new ResultScene({
			model: this,
			canvasSize: this._canvasSize,
			baseSize: this._baseSize,
		}))
	}
}