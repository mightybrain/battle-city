class PlayersStore {
	constructor({ state }) {
		this._state = state;
		this._playersLives = this._state.getPlayersLives();
		this._players = [];
	}

	update(time) {
		this._players.forEach(player => player.update(time));
	}

	clearDestroyedPlayers() {
		this._players = this._players.filter(player => !player.isDestroyed() || this._tryToRespawnPlayer(player));
	}

	_tryToRespawnPlayer(player) {
		const sign = player.getSign();

		if (this._playersLives[sign] > 0) {
			player.respawn();
			this._state.setPlayerLives(sign, this._playersLives[sign] - 1);
			return true;
		} else {
			return false;
		}
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
}