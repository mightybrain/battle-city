class ArmoredEnemy extends Enemy {
  constructor(props) {
    const { tileSize } = props;

    super({
      ...props,
      speed: { 
        x: tileSize.width * ArmoredEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
        y: tileSize.height * ArmoredEnemy.SPEED_PER_SECOND_SCALE_FACTOR,
      },
      initialDirection: { x: 0, y: 1 },
      moveSprite: 'images/enemy-04.png',
      moveSpriteInitialAnimationIndex: 1,
      armor: 3,
      price: 400,
      sign: 4,
      reloadDuration: 700,
      maxPersonalBulletsNumber: 1,
    });
  }
}

ArmoredEnemy.SPEED_PER_SECOND_SCALE_FACTOR = 4;