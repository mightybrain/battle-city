class ExplosionsStore {
	constructor() {
		this._explosions = [];
		this._hasFinishedExplosions = false;
	}

	update(time) {
		this._explosions.forEach(explosion => explosion.update(time));

		if (this._hasFinishedExplosions) {
			this.clearFinishedExplosions();
			this.setHasFinishedExplosions(false);
		}
	}

	clearFinishedExplosions() {
		this._explosions = this._explosions.filter(explosion => !explosion.isFinished());
	}

	render(ctx) {
		this._explosions.forEach(explosion => explosion.render(ctx));
	}

	setSize() {
		this._explosions.forEach(explosion => explosion.setSize());
	}

	addExplosion(explosion) {
		this._explosions.push(explosion);
	}

	setHasFinishedExplosions(payload) {
		this._hasFinishedExplosions = payload;
	}
}