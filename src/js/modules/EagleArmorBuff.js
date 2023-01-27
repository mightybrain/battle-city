class EagleArmorBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-03.png' });
  }

  apply(tank) {
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}