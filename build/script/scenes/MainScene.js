class MainScene {
  constructor({ model, canvasSize, stepSize, maxSteps, safeAreaPosition }) {
    this._model = model;
    this._canvasSize = canvasSize;
    this._stepSize = stepSize;
    this._maxSteps = maxSteps;
    this._safeAreaPosition = safeAreaPosition;

    this._sprite = new Image();
    this._sprite.src = 'images/title.png';

    this._loaded = false;

    this._sprite.addEventListener('load', () => {
      this._loaded = true;
    })
  }

	update(delta) {

	}

  render(ctx) {
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

    if (this._loaded) {
      const positionX = this._safeAreaPosition.x + this._stepSize.width * 12;
      const positionY = this._safeAreaPosition.y + this._stepSize.height * 5;
      const width = this._stepSize.width * 28;
      const height = this._stepSize.height * 16;
      ctx.drawImage(this._sprite, positionX, positionY, width, height);
    }
  }

  handleKeyDown(code) {
    
  }

	handleKeyUp(code) {
    if (code === 'Enter') this._model.prepareToNextLevel();
	}
}