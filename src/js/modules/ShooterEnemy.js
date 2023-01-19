class ShooterEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * ShooterEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * ShooterEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-03.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 0,
      price: 300,
      sign: 3,
      reloadDuration: 400,
      maxPersonalBulletsNumber: 2,
    });
  }
}

ShooterEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 6;