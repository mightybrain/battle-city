class DefaultEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * DefaultEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * DefaultEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-01.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 0,
      price: 100,
      sign: 1,
      reloadDuration: 700,
      maxPersonalBulletsNumber: 1,
    });
  }
}

DefaultEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 6;