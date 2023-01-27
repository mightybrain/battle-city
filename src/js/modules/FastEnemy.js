class FastEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * FastEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * FastEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-02.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 0,
      price: 200,
      sign: 2,
      reloadDuration: 700,
      maxPersonalBulletsNumber: 1,
    });
  }
}

FastEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 12;