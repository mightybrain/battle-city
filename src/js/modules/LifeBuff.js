class LifeBuff extends Buff {
  constructor(props) {
    super({ ...props, sprite: 'images/buff-06.png' });

    const { state } = props;
    this._state = state;
  }

  apply(tank) {
    const playerSign = tank.getSign();
    this._state.increasePlayerLives(playerSign);
    
    this._status = Buff.STATUSES[3];
    this._buffsStore.setHasUnactiveBuffs(true);
  }
}