class BulletsStore {
	constructor() {
		this._bullets = [];
		this._hasDestroyedBullets = false;
	}

	update(time) {
		this._bullets.forEach(bullet => bullet.update(time));

		if (this._hasDestroyedBullets) {
			this.clearDestroyedBullets();
			this.setHasDestroyedBullets(false);
		}
	}

	clearDestroyedBullets() {
		this._bullets = this._bullets.filter(bullet => !bullet.isDestroyed());
	}

	render(ctx) {
		this._bullets.forEach(bullet => bullet.render(ctx));
	}

	setSize() {
		this._bullets.forEach(bullet => bullet.setSize());
	}

	addBullet(bullet) {
		this._bullets.push(bullet);
	}

	getBullets() {
		return this._bullets;
	}

	setHasDestroyedBullets(payload) {
		this._hasDestroyedBullets = payload;
	}
}