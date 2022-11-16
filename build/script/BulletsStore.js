class BulletsStore {
	constructor() {
		this._bullets = [];
	}

	update(time) {
		this._bullets.forEach(bullet => bullet.update(time));
	}

	clearDestroyedBullets() {
		this._bullets = this._bullets.filter(bullet => !bullet.getDestroyed());
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
}