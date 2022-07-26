class BulletsStore {
  constructor() {
    this._bullets = [];
  }

  update(delta) {
    this._bullets.forEach(bullet => bullet.update(delta));
    this._bullets = this._bullets.filter(bullet => !bullet.isDestroyed());
  }

  setBulletsSize({ baseWidth, baseHeight }) {
    this._bullets.forEach(bullet => bullet.setSize({ baseWidth, baseHeight }));
  }

  addBullet(bullet) {
    this._bullets.push(bullet);
  }

  getBullets() {
    return this._bullets;
  }
}