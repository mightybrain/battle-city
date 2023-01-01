class Player extends Tank {
	constructor(props) {
		super(props);
	}

	handleKeyDown({ code, timeStamp: timestamp }) {
		if (!this.isActive()) return;

		if (code === Player.SHOOT_EVENT) this._shoot(timestamp);

		if (Player.MOVE_EVENTS.includes(code)) {
			const key = code.replace('Arrow', '').toLowerCase();
			this._move(Tank.DIRECTIONS[key]);
		}
	}

	handleKeyUp({ code }) {
		if (!this.isActive()) return;

		if (Player.MOVE_EVENTS.includes(code)) {
			const key = code.replace('Arrow', '').toLowerCase();
			this._stop(Tank.DIRECTIONS[key]);
		}
	}
}

Player.MOVE_EVENTS = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
Player.SHOOT_EVENT = 'Space';
Player.SPEED_PER_SECOND_SCALE_FACTOR = 6;