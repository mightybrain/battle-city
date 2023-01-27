class SmallExplosion extends Explosion {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      size: {
        width: tileSize.width * SmallExplosion.SIZE_SCALE_FACTOR,
        height: tileSize.height * SmallExplosion.SIZE_SCALE_FACTOR,
      },
      sprite: 'images/small-explosion.png',
      spriteFramesNumber: 3,
      spriteFps: 16,
    });
  }
}

SmallExplosion.SIZE_SCALE_FACTOR = 4;