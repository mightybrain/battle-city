class EnemiesQueue {
	constructor () {
		this._enemiesInQueue = 20;
	}

	getEnemiesInQueue() {
		return this._enemiesInQueue;
	}

	decreaseEnemiesInQueue() {
		this._enemiesInQueue -= 1;
	}
}