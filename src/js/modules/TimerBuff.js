class TimerBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-02.png' });
  }

  apply(tank) {
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}