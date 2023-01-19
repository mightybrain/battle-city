class BombBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-05.png' });

    const { state, enemiesStore } = props;
    this._state = state;
    this._enemiesStore = enemiesStore;
  }

  apply(tank) {
    const enemies = this._enemiesStore.getEnemies();

    enemies.forEach(enemy => {
      enemy.destroy();
      this._updatePlayerStatistics(enemy, tank);
    })

    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }

	_updatePlayerStatistics(enemy, player) {
		const enemySign = enemy.getSign();
		const enemyPrice = enemy.getPrice();
		const playerSign = player.getSign();
		this._state.increasePlayerStatistics(playerSign, enemySign, enemyPrice);
	}
}