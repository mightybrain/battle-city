class FirstPlayer extends Player {
	constructor(props) {
		super({
			...props,
			sign: 1,
			initialCoords: { x: 18, y: 48 },
			moveEvents: ['KeyW', 'KeyS', 'KeyD', 'KeyA'],
			shootEvent: 'Space',
		});
	}
}

FirstPlayer.UPGRADES = {
	0: {
		moveSprite: 'images/player-01.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 700,
	},
	1: {
		moveSprite: 'images/player-01-upgrade-01.png',
		maxPersonalBulletsNumber: 1,
		reloadDuration: 500,
	},
	2: {
		moveSprite: 'images/player-01-upgrade-02.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 300,
	},
	3: {
		moveSprite: 'images/player-01-upgrade-03.png',
		maxPersonalBulletsNumber: 2,
		reloadDuration: 100,
	},
}