class State {
	constructor() {
		this._levelIndex = 1;

		this._playerAPoints = 0;
		this._playerALives = 2;
		
		this._playerBPoints = 0;
		this._playerBLives = 2;
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

	decreasePlayerLives(sign) {

	}

	increasePlayerLives(sign) {

	}
}
