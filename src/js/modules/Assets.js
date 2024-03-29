class Assets {
	constructor() {
		this._assets = {};
		this._loaded = 0;
	}

	load() {
		return new Promise(resolve => {
			Assets.DATA.forEach(source => {
				const type = source.split('.').pop();
				if (Assets.IMAGES_TYPES.includes(type)) this._loadImage(source, resolve);
				else if (Assets.MAPS_TYPES.includes(type)) this._loadMap(source, resolve);
			})
		})
	}

	_increaseLoaded(resolve) {
		this._loaded += 1;
		if (this._loaded === Assets.DATA.length) resolve();
	}

	_loadImage(source, resolve) {
		const image = new Image();

		image.addEventListener('load', () => {
			this._assets[source] = image;
			this._increaseLoaded(resolve);
		})

		image.src = source;
	}

	_loadMap(source, resolve) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', source, true);

		xhr.addEventListener('load', () => {
			this._assets[source] = JSON.parse(xhr.responseText);
			this._increaseLoaded(resolve);
		})

		xhr.send();
	}

	get(source) {
		return this._assets[source];
	}
}

Assets.IMAGES_TYPES = ['png'];
Assets.MAPS_TYPES = ['json'];
Assets.DATA = [
	'images/title.png',
	'images/player-select.png',
	'images/player-01.png',
	'images/player-01-upgrade-01.png',
	'images/player-01-upgrade-02.png',
	'images/player-01-upgrade-03.png',
	'images/player-02.png',
	'images/player-02-upgrade-01.png',
	'images/player-02-upgrade-02.png',
	'images/player-02-upgrade-03.png',
	'images/enemy-01.png',
	'images/enemy-02.png',
	'images/enemy-03.png',
	'images/enemy-04.png',
	'images/eagle.png',
	'images/enemy-in-queue.png',
	'images/flag.png',
	'images/player-indicator.png',
	'images/enemy-type-01.png',
	'images/enemy-type-02.png',
	'images/enemy-type-03.png',
	'images/enemy-type-04.png',
	'images/small-explosion.png',
	'images/large-explosion.png',
	'images/birth.png',
	'images/bullet.png',
	'images/bricks.png',
	'images/concrete.png',
	'images/forest.png',
	'images/water.png',
	'images/shield.png',
	'images/buff-01.png',
	'images/buff-02.png',
	'images/buff-03.png',
	'images/buff-04.png',
	'images/buff-05.png',
	'images/buff-06.png',
	'json/levels.json',
];