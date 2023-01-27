class BuffsSpawner {
  constructor({ tileSize, gameAreaPosition, state, assets, enemiesStore, buffsStore }) {
    this._tileSize = tileSize;
    this._gameAreaPosition = gameAreaPosition;
		this._state = state;
    this._assets = assets;
		this._enemiesStore = enemiesStore;
    this._buffsStore = buffsStore;
  }

	spawnRandomBuff() {
		const randomBuffClassIndex = getRandomFromRange(0, BuffsSpawner.BUFFS_CLASSES.length - 1);

		const buff = new BuffsSpawner.BUFFS_CLASSES[randomBuffClassIndex]({
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			state: this._state,
			assets: this._assets,
			enemiesStore: this._enemiesStore,
			buffsStore: this._buffsStore,
			coords: {
        x: getRandomFromRange(0, Level.MAP_WIDTH_SCALE_FACTOR - Buff.SIZE_SCALE_FACTOR),
        y: getRandomFromRange(0, Level.MAP_HEIGHT_SCALE_FACTOR - Buff.SIZE_SCALE_FACTOR),
      },
		})

		this._buffsStore.addBuff(buff);
	}
}

BuffsSpawner.BUFFS_CLASSES = [ShieldBuff, UpgradeBuff, BombBuff, LifeBuff]; // TimerBuff, EagleArmorBuff,