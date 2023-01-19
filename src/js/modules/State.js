class State {
	constructor() {
		this._gameOver = false;
		this._levelIndex = 1;

		this._playersLives = {
			1: null,
			2: null,
		}

		this._playersUpgradeLevels = {
			1: 0,
			2: 0,
		}

		this._playersPoints = {
			1: 0,
			2: 0,
		}

		this._playersStatisticsByEnemiesTypes = {};
		this.resetPlayersStatisticsByEnemiesTypes();
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

	setLevelIndex(index) {
		this._levelIndex = index;
	}

	getPlayersLives() {
		return this._playersLives;
	}

	setPlayerLives(sign, lives) {
		this._playersLives[sign] = lives;
	}

	increasePlayerLives(sign) {
		this._playersLives[sign] += 1;
	}

	getPlayersUpgradeLevels() {
		return this._playersUpgradeLevels;
	}

	increasePlayerUpgradeLevel(sign) {
		this._playersUpgradeLevels[sign] += 1;
	}

	resetPlayerUpgradeLevel(sign) {
		this._playersUpgradeLevels[sign] = 0;
	}

	getPlayersStatisticsByEnemiesTypes() {
		return this._playersStatisticsByEnemiesTypes;
	}

	getPlayerTotal(sign) {
    return Object.values(this._playersStatisticsByEnemiesTypes[sign])
      .reduce((total, item) => {
        return { 
          counter: total.counter + item.counter,
          points: total.points + item.points,
        }
      }, { counter: 0, points: 0 })
	}

	increasePlayerStatistics(playerSign, enemySign, enemyPrice) {
		const statistics = this._playersStatisticsByEnemiesTypes[playerSign][enemySign];
		statistics.counter += 1;
		statistics.points += enemyPrice;
		this._playersPoints[playerSign] += enemyPrice;
	}

	resetPlayersStatisticsByEnemiesTypes() {
		this._playersStatisticsByEnemiesTypes = {
			1: {
				1: { counter: 0, points: 0 },
				2: { counter: 0, points: 0 },
				3: { counter: 0, points: 0 },
				4: { counter: 0, points: 0 },
			},
			2: {
				1: { counter: 0, points: 0 },
				2: { counter: 0, points: 0 },
				3: { counter: 0, points: 0 },
				4: { counter: 0, points: 0 },
			}
		}
	}

	reset() {
		this._gameOver = false;
		this._levelIndex = 1;
		this._playersLives = {
			1: null,
			2: null,
		}
		this._playersUpgradeLevels = {
			1: 0,
			2: 0,
		}
		this._playersPoints = {
			1: 0,
			2: 0,
		}
		this.resetPlayersStatisticsByEnemiesTypes();
	}
}