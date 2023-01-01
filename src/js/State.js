class State {
	constructor() {
		this._gameOver = false;
		this._levelIndex = 1;

		this._playersLives = {
			1: 0,
			2: 0,
		}

		this._playersPoints = {
			1: 0,
			2: 0,
		}

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

	getPlayersLives() {
		return this._playersLives;
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
			1: 0,
			2: 0,
		}
		this._playersPoints = {
			1: 0,
			2: 0,
		}
		this.resetPlayersStatisticsByEnemiesTypes();
	}

	setPlayerLives(sign, lives) {
		this._playersLives[sign] = lives;
	}
}