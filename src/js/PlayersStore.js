class PlayersStore {
	constructor() {
		this._players = [];
	}

	update(time) {
		this._players.forEach(player => player.update(time));
	}

	clearDestroyedPlayers() {
		this._players.filter(player => !player.getDestroyed());
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