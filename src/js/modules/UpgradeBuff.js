class UpgradeBuff extends Buff {
  constructor(props) {
    const { state } = props;

    super({ ...props, sprite: 'images/buff-04.png' });

    this._state = state;
  }

  apply(tank) {
    const sign = tank.getSign();
    const currentUpgradeLevel = tank.getUpgradeLevel();
    const nextUpgradeLevel = currentUpgradeLevel + 1;
    const nextUpgrade = sign === 1 ? FirstPlayer.UPGRADES[nextUpgradeLevel] : SecondPlayer.UPGRADES[nextUpgradeLevel];
    if (nextUpgrade) {
      tank.upgrade({ upgradeLevel: nextUpgradeLevel, ...nextUpgrade });
      this._state.increasePlayerUpgradeLevel(sign);
    }

    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}