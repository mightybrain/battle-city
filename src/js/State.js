class State {
	constructor() {
		this._gameOver = false;
		this._levelIndex = 1;

		this._playersLives = {
			1: 2,
			2: 0,
		}

		this._playersStatByEnemiesTypes = {
			1: {
				1: 0,
				2: 0,
				3: 0,
				4: 0,
			},
			2: {
				1: 0,
				2: 0,
				3: 0,
				4: 0,
			}
		}
	}

	getGameOver() {
		return this._gameOver;
	}

	setGameOver(value) {
		this._gameOver = value;
	}
	
	getLevelIndex() {
		return this._levelIndex;
	}

	increaseLevelIndex() {
		this._levelIndex += 1;
	}

	resetLevelIndex() {
		this._levelIndex = 1;
	}

	getPlayersHighScore() {
		const playersKeys = Object.keys(this._playersStatByEnemiesTypes);

		return playersKeys.reduce((total, key) => {
			const playerStat = this._playersStatByEnemiesTypes[key];
		}, 0)
	}

	getPlayersStatByEnemiesTypes() {
		return this._playersStatByEnemiesTypes;
	}

	increasePlayerStat(sign, type) {
		this._playersStatByEnemiesTypes[sign][type] += 1;
	}

	getPlayersLives() {
		return this._playersLives;
	}

	resetPlayersData() {
		this._playersLives = {
			1: 2,
			2: 2,
		}
		this._playersStatByEnemiesTypes = {
			1: {
				1: 0,
				2: 0,
				3: 0,
				4: 0,
			},
			2: {
				1: 0,
				2: 0,
				3: 0,
				4: 0,
			}
		}
	}

	setPlayerLives(sign, lives) {
		this._playersLives[sign] = lives;
	}
}
