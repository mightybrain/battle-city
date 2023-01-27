class SceneManager {
	constructor({ canvasSize, tileSize, gameAreaPosition, assets }) {
		this._canvasSize = canvasSize;
		this._tileSize = tileSize;
		this._gameAreaPosition = gameAreaPosition;
		this._assets = assets;

		this._state = new State();

		this._currentScene = null;
		this._futureScene = null;
		this._transitionOverlayOpacity = 0;
	}

	resize() {
		if (this._currentScene) this._currentScene.resize();
		if (this._futureScene) this._futureScene.resize();
	}

	update(time) {
		if (this._currentScene) this._currentScene.update(time);

		if (this._futureScene) this._updateSceneOut(time);
		else if (this._transitionOverlayOpacity) this._updateSceneIn(time);
	}

	_updateSceneOut({ prevFrameDuration }) {
		if (!this._currentScene || this._transitionOverlayOpacity === 1) {
			this._currentScene = this._futureScene;
			this._futureScene = null;
		} else  {
			this._transitionOverlayOpacity = Math.min(this._transitionOverlayOpacity + prevFrameDuration / SceneManager.FADE_DURATION, 1);
		}
	}

	_updateSceneIn({ prevFrameDuration }) {
		this._transitionOverlayOpacity = Math.max(this._transitionOverlayOpacity - prevFrameDuration / SceneManager.FADE_DURATION, 0);
	}

	render(ctx) {
		if (this._currentScene) this._currentScene.render(ctx);
		if (this._transitionOverlayOpacity) this._renderTransitionOverlay(ctx);
	}

	_renderTransitionOverlay(ctx) {
		ctx.globalAlpha = this._transitionOverlayOpacity;
		ctx.fillStyle = '#0C0C0C';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
		ctx.globalAlpha = 1;
	}

	_getScenesCommonProps() {
		return {
			canvasSize: this._canvasSize,
			tileSize: this._tileSize,
			gameAreaPosition: this._gameAreaPosition,
			assets: this._assets,
			state: this._state,
			sceneManager: this,
		}
	}

	showMainScene() {
		this._futureScene = new MainScene(this._getScenesCommonProps());
	}

	showIntroScene() {
		this._futureScene = new IntroScene(this._getScenesCommonProps());
	}

	showCoreScene() {
		this._futureScene = new CoreScene(this._getScenesCommonProps());
	}

	showResultScene() {
		this._futureScene = new ResultScene(this._getScenesCommonProps());
	}

	handleKeyDown(event) {
		if (this._futureScene || this._transitionOverlayOpacity) return;

		if (this._currentScene) this._currentScene.handleKeyDown(event);
	}

	handleKeyUp(event) {
		if (this._futureScene || this._transitionOverlayOpacity) return;

		if (this._currentScene) this._currentScene.handleKeyUp(event);
	}
}

SceneManager.FADE_DURATION = 500;