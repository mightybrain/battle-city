class Sprite {
  constructor({ sprite, framesNumber, animationsNumber = 1, initialAnimationIndex = 0, fps = 8, loop = true, playing = false }) {
    this._sprite = sprite;
    this._framesNumber = framesNumber;
    this._animationsNumber = animationsNumber;
    this._fps = fps;
    this._frameDuration = 1000 / this._fps;
    this._frameSize = {
      width: this._sprite.width / this._animationsNumber,
      height: this._sprite.height / this._framesNumber,
    }

    this._frameIndex = 0;
    this._initialAnimationIndex = initialAnimationIndex;
    this._animationIndex = this._initialAnimationIndex;
    this._playing = playing;
    this._loop = loop;

    this._float = 0;
  }

  update({ prevFrameDuration }) {
    if (!this._playing) return;

    const timePassed = this._float + prevFrameDuration;
    const framesPassed = Math.floor(timePassed / this._frameDuration);
    
    this._float = timePassed % this._frameDuration;
    if (this._loop) {
      this._frameIndex = (this._frameIndex + framesPassed) % this._framesNumber;
    } else {
      this._frameIndex = Math.min(this._frameIndex + framesPassed, this._framesNumber - 1);
    }

    if (!this._loop && this._frameIndex === this._framesNumber - 1) this.stop();
  }

  render(ctx, position, size) {
    const framePosition = {
      x: this._animationIndex * this._frameSize.width,
      y: this._frameIndex * this._frameSize.height,
    }

    ctx.drawImage(this._sprite, framePosition.x, framePosition.y, this._frameSize.width, this._frameSize.height, position.x, position.y, size.width, size.height);
  }

  resetAnimation() {
    this._frameIndex = 0;
    this._animationIndex = this._initialAnimationIndex;
  }

  setAnimationIndex(index) {
    this._animationIndex = index;
  }

  play() {
    this._playing = true;
  }

  stop() {
    this._playing = false;
  }
  
  isPlaying() {
    return this._playing;
  }

  setSprite(sprite) {
    this._sprite = sprite;
  }
}