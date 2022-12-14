class ExplosionsStore {
	constructor() {
		this._explosions = [];
	}

	update(time) {
		this._explosions = this._explosions.filter(explosion => !explosion.getDone());
		this._explosions.forEach(explosion => explosion.update(time));
	}

	clearExplosions() {
		this._explosions = this._explosions.filter(explosion => !explosion.getDone());
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
}