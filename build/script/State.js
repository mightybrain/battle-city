class State {
	constructor() {
		this._levelIndex = 1;

		this._playersLives = {
			1: 2,
			2: 2,
		}
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

	getPlayersLives() {
		return this._playersLives;
	}

	resetPlayersData() {
		this._playersLives = {
			1: 2,
			2: 2,
		}
	}

	setPlayerLives(sign, lives) {
		this._playersLives[sign] = lives;
	}
}