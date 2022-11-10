class PlayersStore {
	constructor() {
		this._players = [];
	}

	update(time) {
		this._players.forEach(player => player.update(time));
		this._players.forEach(player => {
			if (player.getDestroyed()) player.respawn();
		})
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