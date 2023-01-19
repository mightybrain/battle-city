class PlayersStore {
	constructor({ state }) {
		this._state = state;
		this._players = [];
		this._hasDestroyedPlayers = false;
	}

	update(time) {
		this._players.forEach(player => player.update(time));

		if (this._hasDestroyedPlayers) {
			this.clearDestroyedPlayers();
			this.setHasDestroyedPlayers(false);
		}
	}

	clearDestroyedPlayers() {
		this._players = this._players.filter(player => !player.isDestroyed() || this._tryToRespawnPlayer(player));
	}

	_tryToRespawnPlayer(player) {
		const sign = player.getSign();
		const playersLives = this._state.getPlayersLives();

		if (playersLives[sign] > 0) {
			this._state.setPlayerLives(sign, playersLives[sign] - 1);
			this._resetPlayerUpgradeLievel(player, sign);
			player.respawn();
		} else {
			this._state.setPlayerLives(sign, null);
		}

		return !player.isDestroyed();
	}

	_resetPlayerUpgradeLievel(player, sign) {
		const upgradeLevel = 0;
		const upgrade = sign === 1 ? FirstPlayer.UPGRADES[upgradeLevel] : SecondPlayer.UPGRADES[upgradeLevel];
		player.upgrade({ upgradeLevel, ...upgrade });
		this._state.resetPlayerUpgradeLevel(sign);
	}

	render(ctx) {
		this._players.forEach(player => player.render(ctx));
	}

	setSize() {
		this._players.forEach(player => player.setSize());
	}

	addPlayer(player) {
		this._players.push(player);
	}

	getPlayers() {
		return this._players;
	}

	setHasDestroyedPlayers(payload) {
		this._hasDestroyedPlayers = payload;
	}

	handleKeyDown(event) {
		this._players.forEach(player => player.handleKeyDown(event));
	}

	handleKeyUp(event) {
		this._players.forEach(player => player.handleKeyUp(event));
	}
}