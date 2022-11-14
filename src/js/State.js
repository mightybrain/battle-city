class State {
	constructor() {
		this._levelIndex = 1;

		this._playerAPoints = 0;
		this._playerALives = 2;
		
		this._playerBPoints = 0;
		this._playerBLives = 2;

		this._playerAScore = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
		};

		this._playerBScore = {
			1: 0,
			2: 0,
			3: 0,
			4: 0,
		};
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

	getPlayerLives(sign) {
		return sign === 'A' ? this._playerALives : this._playerBLives;
	}

	getPlayerData(sign) {
		switch(sign) {
			case 'A':
				return {
					points: this._playerAPoints,
					lives: this._playerALives,
				}
			case 'B':
				return {
					points: this._playerBPoints,
					lives: this._playerBLives,
				}
		}
	}

	resetPlayersData() {
		this._playerAPoints = 0;
		this._playerALives = 2;
		this._playerBPoints = 0;
		this._playerBLives = 2;
	}

	setPlayerPoints(sign, points) {

	}

	setPlayerLives(sign, lives) {
		if (sign === 'A') this._playerALives = lives;
		else this._playerBLives = lives;
	}

	increasePlayerLives(sign) {

	}
}
