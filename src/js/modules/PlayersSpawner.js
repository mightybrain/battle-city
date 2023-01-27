class PlayersSpawner {
  constructor({ tileSize, gameAreaPosition, assets, enemiesQueue, enemiesStore, level, playersStore, bulletsStore, explosionsStore, buffsStore, buffsSpawner, eagle, state }) {
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
  }

  spawnPlayers() {
    const playersLives = this._state.getPlayersLives();
    const playersUpgradeLevels = this._state.getPlayersUpgradeLevels();

		if (playersLives[1] !== null) {
			const firstPlayer = new FirstPlayer({
				...this._getPlayersCommonProps(),
				upgradeLevel: playersUpgradeLevels[1],
				...FirstPlayer.UPGRADES[playersUpgradeLevels[1]],
			});

			this._playersStore.addPlayer(firstPlayer);
		}

		if (playersLives[2] !== null) {
			const secondPlayer = new SecondPlayer({
				...this._getPlayersCommonProps(),
				upgradeLevel: playersUpgradeLevels[2],
				...SecondPlayer.UPGRADES[playersUpgradeLevels[2]],
			});
	
			this._playersStore.addPlayer(secondPlayer);
		}
  }

  _getPlayersCommonProps() {
    return {
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			level: this._level,
			bulletsStore: this._bulletsStore,
			enemiesStore: this._enemiesStore,
			playersStore: this._playersStore,
			buffsStore: this._buffsStore,
			explosionsStore: this._explosionsStore,
			eagle: this._eagle,
			assets: this._assets,
			state: this._state,
    }
  }
}
