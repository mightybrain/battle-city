class EnemiesQueue {
	constructor ({ stepSize, safeAreaPosition, assets }) {
		this._safeAreaPosition = safeAreaPosition;
		this._stepSize = stepSize;
		this._assets = assets;
		this._enemiesInQueue = 20;

		this._sprite = this._assets.get('images/enemy-in-queue.png');

		this._position = {
			x: 0,
			y: 0,
		};
		this._enemySize = {
			width: 0,
			height: 0,
		};
		this.setSize();
	}

	render(ctx) {
		for(let i = 0; i < this._enemiesInQueue; i++) {
			const offsetX = Math.ceil(i % 2);
			const offsetY = Math.floor(i / 2);
			const position = {
				x: this._position.x + this._enemySize.width * offsetX,
				y: this._position.y + this._enemySize.height * offsetY,
			}
			ctx.drawImage(this._sprite, 0, 0, this._sprite.width, this._sprite.height, position.x, position.y, this._enemySize.width, this._enemySize.height);
		}
	}

	setSize() {
		this._position.x = this._safeAreaPosition.x + this._stepSize.width * EnemiesQueue.POSITION_X_SCALE_FACTOR;
		this._position.y = this._safeAreaPosition.y + this._stepSize.height * EnemiesQueue.POSITION_Y_SCALE_FACTOR;
		this._enemySize.width = this._stepSize.width * EnemiesQueue.ENEMY_SIZE_SCALE_FACTOR;
		this._enemySize.height = this._stepSize.height * EnemiesQueue.ENEMY_SIZE_SCALE_FACTOR;
	}

	getEnemiesInQueue() {
		return this._enemiesInQueue;
	}

	decreaseEnemiesInQueue() {
		this._enemiesInQueue -= 1;
	}
}

EnemiesQueue.POSITION_X_SCALE_FACTOR = 54;
EnemiesQueue.POSITION_Y_SCALE_FACTOR = 2;
EnemiesQueue.ENEMY_SIZE_SCALE_FACTOR = 2;