class EnemiesQueue {
	constructor ({ tileSize, gameAreaPosition, assets }) {
		this._gameAreaPosition = gameAreaPosition;
		this._tileSize = tileSize;
		this._assets = assets;
		this._enemiesInQueue = 20;

		this._sprite = this._assets.get('images/enemy-in-queue.png');

		this._position = {
			x: 0,
			y: 0,
		};
		this._spriteSize = {
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
				x: this._position.x + this._spriteSize.width * offsetX,
				y: this._position.y + this._spriteSize.height * offsetY,
			}
			ctx.drawImage(this._sprite, position.x, position.y, this._spriteSize.width, this._spriteSize.height);
		}
	}

	setSize() {
		this._position.x = this._gameAreaPosition.x + this._tileSize.width * EnemiesQueue.POSITION_X_SCALE_FACTOR;
		this._position.y = this._gameAreaPosition.y + this._tileSize.height * EnemiesQueue.POSITION_Y_SCALE_FACTOR;
		this._spriteSize.width = this._tileSize.width * EnemiesQueue.SPRITE_SIZE_SCALE_FACTOR;
		this._spriteSize.height = this._tileSize.height * EnemiesQueue.SPRITE_SIZE_SCALE_FACTOR;
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
EnemiesQueue.SPRITE_SIZE_SCALE_FACTOR = 2;