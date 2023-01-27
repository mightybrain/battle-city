class Player extends Tank {
	constructor(props) {
		const { tileSize, moveEvents, shootEvent } = props;

		super({
			...props,
			speed: { 
				x: tileSize.width * Player.SPEED_PER_SECOND_SCALE_FACTOR,
				y: tileSize.height * Player.SPEED_PER_SECOND_SCALE_FACTOR,
			},
			moveSpriteInitialAnimationIndex: 0,
			initialDirection: { x: 0, y: -1 },
			armor: 0,
			spawnBuffOnHit: false,
			allowToBuffs: true,
		});

		this._moveEvents = moveEvents;
		this._shootEvent = shootEvent;
	}

	_getDirectionKeyFromEventCode(code) {
		let key = code.replace(/(ArrowUp|KeyW)/gi, 'up');
		key = key.replace(/(ArrowDown|KeyS)/gi, 'down');
		key = key.replace(/(ArrowRight|KeyD)/gi, 'right');
		key = key.replace(/(ArrowLeft|KeyA)/gi, 'left');
		return key;
	}

	handleKeyDown({ code, timeStamp: timestamp }) {
		if (!this.isActive()) return;

		if (code === this._shootEvent) this._shoot(timestamp);

		if (this._moveEvents.includes(code)) {
			const key = this._getDirectionKeyFromEventCode(code);
			this._move(Tank.DIRECTIONS[key]);
		}
	}

	handleKeyUp({ code }) {
		if (!this.isActive()) return;

		if (this._moveEvents.includes(code)) {
			const key = this._getDirectionKeyFromEventCode(code);
			this._stop(Tank.DIRECTIONS[key]);
		}
	}
}

Player.SPEED_PER_SECOND_SCALE_FACTOR = 6;
