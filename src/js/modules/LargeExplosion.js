class LargeExplosion extends Explosion {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      size: {
        width: tileSize.width * LargeExplosion.SIZE_SCALE_FACTOR,
        height: tileSize.height * LargeExplosion.SIZE_SCALE_FACTOR,
      },
      sprite: 'images/large-explosion.png',
      spriteFramesNumber: 5,
      spriteFps: 8,
    });
  }
}

LargeExplosion.SIZE_SCALE_FACTOR = 8;