class ShieldBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-01.png' });
  }

  apply(tank) {
    tank.enableShield();
    
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}