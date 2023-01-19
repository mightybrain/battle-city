class BuffsStore {
  constructor() {
    this._buffs = [];
    this._hasUnactiveBuffs = false;
  }

	update(time) {
		this._buffs.forEach(buff => buff.update(time));

    if (this._hasUnactiveBuffs) {
      this.clearUnactiveBuffs();
      this.setHasUnactiveBuffs(false);
    }
	}

	clearUnactiveBuffs() {
		this._buffs = this._buffs.filter(buff => buff.isActive());
	}

	render(ctx) {
		this._buffs.forEach(buff => buff.render(ctx));
	}

  setSize() {
    this._buffs.forEach(buff => buff.setSize());
  }

  addBuff(buff) {
    this._buffs.push(buff);
  }

  getBuffs() {
    return this._buffs;
  }

  setHasUnactiveBuffs(payload) {
    this._hasUnactiveBuffs = payload;
  }
}