class ResultScene {
	constructor({ state, canvasSize, stepSize, safeAreaPosition, sceneManager, assets }) {
		this._state = state;
		this._canvasSize = canvasSize;
		this._stepSize = stepSize;
		this._safeAreaPosition = safeAreaPosition;
		this._sceneManager = sceneManager;
		this._assets = assets;

		this._statistics = new Statistics({
			state: this._state,
			canvasSize: this._canvasSize,
			stepSize: this._stepSize,
			assets: this._assets,
		});

		this._levelLabel = `STAGE ${this._state.getLevelIndex()}`;
		this._highScoreLabel = {
			hint: 'HI-SCORE',
			value: 0,
		};

		this._fontSize = 0;
		this._levelLabelPosition = {
			x: 0,
			y: 0,
		}
		this._highScoreLabelPosition = {
			x: 0,
			y: 0,
		}
		this._highScoreSpaceBetween = 0;
		this.setSize();
	}

	update(time) {

	}

	setSize() {
		this._fontSize = this._stepSize.height * ResultScene.FONT_SIZE_SCALE_FACTOR;

		this._levelLabelPosition.y = this._stepSize.height * ResultScene.LEVEL_LABEL_POSITION_Y_SCALE_FACTOR + this._fontSize;
		this._highScoreLabelPosition.y = this._stepSize.height * ResultScene.HIGH_SCORE_POSITION_Y_SCALE_FACTOR + this._fontSize;
		this._highScoreSpaceBetween = this._stepSize.width * ResultScene.HIGH_SCORE_SPACE_BETWEEN_SCALE_FACTOR;

		this._statistics.setSize();
	}

	render(ctx) {
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this._canvasSize.width, this._canvasSize.height);

		ctx.font = `${this._fontSize}px PressStart2P`;
		const { textWidth: levelLabelWidth } = calcTextMetrics(ctx, this._levelLabel);

		const levelLabelPositionX = (this._canvasSize.width - levelLabelWidth) / 2
		
		ctx.fillStyle = '#FFFFFF';
		ctx.fillText(this._levelLabel, levelLabelPositionX, this._levelLabelPosition.y);

		const { textWidth: highScoreLabelHintWidth } = calcTextMetrics(ctx, this._highScoreLabel.hint);
		const { textWidth: highScoreLabelValueWidth } = calcTextMetrics(ctx, this._highScoreLabel.value);

		const highScoreLabelHintPositionX = (this._canvasSize.width - highScoreLabelHintWidth - highScoreLabelValueWidth - this._highScoreSpaceBetween) / 2;
		const highScoreLabelValuePositionX = highScoreLabelHintPositionX + highScoreLabelHintWidth + this._highScoreSpaceBetween;

		ctx.fillStyle = '#7F4040';
		ctx.fillText(this._highScoreLabel.hint, highScoreLabelHintPositionX, this._highScoreLabelPosition.y);

		ctx.fillStyle = '#BFA080';
		ctx.fillText(this._highScoreLabel.value, highScoreLabelValuePositionX, this._highScoreLabelPosition.y);

		this._statistics.render(ctx);
	}

	_showNextScene() {
		if (this._state.getGameOver()) {
			// Сбросить стейт
			this._sceneManager.showMainScene();
		} else {
			// Обновить уровень в стейте
			this._sceneManager.showCoreScene();
		}
	}

	handleKeyDown(code) {

	}

	handleKeyUp(code) {
		if (code === 'Enter') this._showNextScene();
	}
}

ResultScene.FONT_SIZE_SCALE_FACTOR = 2;
ResultScene.HIGH_SCORE_POSITION_Y_SCALE_FACTOR = 4;
ResultScene.HIGH_SCORE_SPACE_BETWEEN_SCALE_FACTOR = 4;
ResultScene.LEVEL_LABEL_POSITION_Y_SCALE_FACTOR = 8;