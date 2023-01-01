class GameOverAndLevelCompleteHandler {
  constructor({ state, sceneManager, eagle, playersStore, enemiesStore, enemiesQueue }) {
    this._state = state;
    this._sceneManager = sceneManager;
    this._eagle = eagle;
    this._playersStore = playersStore;
    this._enemiesStore = enemiesStore;
    this._enemiesQueue = enemiesQueue;

    this._gameOverOrLevelCompleteTime = 0;
  }

  checkAndHandle({timestamp}) {
    if (this._gameOverOrLevelCompleteTime) {
      this._checkAndHandleSceneOut(timestamp);
    } else {
      this._checkAndHandleGameOver(timestamp);
      this._checkAndHandleLevelComplete(timestamp);
    }
  }

  _checkAndHandleSceneOut(timestamp) {
    if (timestamp > this._gameOverOrLevelCompleteTime + GameOverAndLevelCompleteHandler.DELAY_BEFORE_SCENE_OUT) this._sceneManager.showResultScene();
  }

	_checkAndHandleGameOver(timestamp) {
		const eagleDestroyed = this._eagle.isDestroyed();
		const playersInStore = this._playersStore.getPlayers();

		if (eagleDestroyed || !playersInStore.length) {
      this._gameOverOrLevelCompleteTime = timestamp;
			this._state.setGameOver(true);
    };
	}

	_checkAndHandleLevelComplete(timestamp) {
		const enemiesInQueue = this._enemiesQueue.getEnemiesInQueue();
		const enemiesInStore = this._enemiesStore.getEnemies();

		if (!enemiesInQueue && !enemiesInStore.length) this._gameOverOrLevelCompleteTime = timestamp;
	}
}

GameOverAndLevelCompleteHandler.DELAY_BEFORE_SCENE_OUT = 5000;