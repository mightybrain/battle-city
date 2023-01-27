class SecondPlayer extends Player {
	constructor(props) {
		super({
			...props,
			sign: 2,
			initialCoords: { x: 30, y: 48 },
			moveEvents: ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'],
			shootEvent: 'Enter',
		});
	}
}

SecondPlayer.UPGRADES = {
	0: {
		moveSprite: 'images/player-02.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 700,
	},
	1: {
		moveSprite: 'images/player-02-upgrade-01.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 500,
	},
	2: {
		moveSprite: 'images/player-02-upgrade-02.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 300,
	},
	3: {
		moveSprite: 'images/player-02-upgrade-03.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 100,
	},
}