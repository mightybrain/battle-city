class EnemiesStore {
  constructor() {
    this._enemies = [];
  }

  update(time) {
    this._enemies.forEach(enemy => enemy.update(time));
    this._enemies = this._enemies.filter(enemy => !enemy.getDestroyed());
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
}