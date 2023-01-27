class EnemiesStore {
	constructor() {
		this._enemies = [];
		this._hasDestroyedEnemies = false;
	}

	update(time) {
		this._enemies.forEach(enemy => enemy.update(time));

		if (this._hasDestroyedEnemies) {
			this.clearDestroyedEnemies();
			this.setHasDestroyedEnemies(false);
		}
	}

	clearDestroyedEnemies() {
		this._enemies = this._enemies.filter(enemy => !enemy.isDestroyed());
	}

	render(ctx) {
		this._enemies.forEach(enemy => enemy.render(ctx));
	}

	setSize() {
		this._enemies.forEach(enemy => enemy.setSize());
	}

	addEnemy(enemy) {
		this._enemies.push(enemy);
	}

	getEnemies() {
		return this._enemies;
	}

	setHasDestroyedEnemies(payload) {
		this._hasDestroyedEnemies = payload;
	}
}

EnemiesStore.MAX_ENEMIES_COUNTER = 7;