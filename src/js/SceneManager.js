class SceneManager {
  constructor({ canvasSize, stepSize, safeAreaPosition }) {
		this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._safeAreaPosition = safeAreaPosition;

    this._state = new State();

    this._currentScene = null;
    this._futureScene = null;
    this._opacity = 0;
  }

  setSize() {
    if (this._currentScene) this._currentScene.setSize();
    if (this._futureScene) this._futureScene.setSize();
  }

  update(time) {
    if (this._currentScene) this._currentScene.update(time);

    const { prevFrameDuration } = time;

    if (this._futureScene && (!this._currentScene || this._opacity === 1)) {
      this._currentScene = this._futureScene;
      this._futureScene = null;
    } else if (this._futureScene && this._opacity < 1) {
      this._opacity = Math.min(this._opacity + prevFrameDuration / SceneManager.FADE_DURATION, 1);
    } else if (!this._futureScene && this._opacity > 0) {
      this._opacity = Math.max(this._opacity - prevFrameDuration / SceneManager.FADE_DURATION, 0);
    }
  }

  render(ctx) {
    if (this._currentScene) this._currentScene.render(ctx);

    if (!this._opacity) return;

    ctx.globalAlpha = this._opacity;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);
    ctx.globalAlpha = 1;
  }

  _getSceneData() {
    return {
			state: this._state,
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
      safeAreaPosition: this._safeAreaPosition,
      sceneManager: this,
    }
  }

	showMainScene() {
		this._futureScene = new MainScene(this._getSceneData());
	}

	showIntroScene() {
		this._futureScene = new IntroScene(this._getSceneData());
	}

	showCoreScene() {
		this._futureScene = new CoreScene(this._getSceneData());
	}

	showResultScene() {
		this._futureScene = new ResultScene(this._getSceneData());
	}

	handleKeyDown(event) {
    if (this._futureScene || this._opacity) return;

    if (this._currentScene) this._currentScene.handleKeyDown(event.code);
	}

	handleKeyUp(event) {
    if (this._futureScene || this._opacity) return;

    if (this._currentScene) this._currentScene.handleKeyUp(event.code);
	}
}

SceneManager.FADE_DURATION = 500;