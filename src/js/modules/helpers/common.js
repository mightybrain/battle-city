function calcTextMetrics(ctx, text) {
	const { width, actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText(text);
	return { textWidth: width, textHeight: actualBoundingBoxAscent + actualBoundingBoxDescent }
}

function getRandomFromRange(from, to) {
	return from === to ? from : from + Math.round(Math.random() * (to - from));
}

function twoAreasCollisioned(area1, area2) {
	return area1.x2 > area2.x1 &&
		area1.x1 < area2.x2 &&
		area1.y2 > area2.y1 &&
		area1.y1 < area2.y2;
}

function findClosestElem(elems, position, axis) {
	return elems.reduce((closest, elem) => {
		if (!closest) return elem;

		const currentDistance = Math.abs(elem.getPosition()[axis] - position[axis]);
		const prevDistance = Math.abs(closest.getPosition()[axis] - position[axis]);

		return currentDistance < prevDistance ? elem : closest;
	}, null)
}

function roundPositionByObject(position, size, velocity, objectBoundaryBox) {
	if (velocity.x > 0) return { ...position, x: objectBoundaryBox.x1 - size.width };
	else if (velocity.x < 0) return { ...position, x: objectBoundaryBox.x2 };
	else if (velocity.y > 0) return { ...position, y: objectBoundaryBox.y1 - size.height };
	else if (velocity.y < 0) return { ...position, y: objectBoundaryBox.y2 };
}

function getBoundaryBoxOfMovingElem(velocity, prevPosition, nextPosition, size) {
	if (velocity.x > 0) {
		return {
			x1: prevPosition.x,
			y1: prevPosition.y,
			x2: nextPosition.x + size.width,
			y2: nextPosition.y + size.height,
		}
	} else if (velocity.x < 0) {
		return {
			x1: nextPosition.x,
			y1: nextPosition.y,
			x2: prevPosition.x + size.width,
			y2: prevPosition.y + size.height,
		}
	} else if (velocity.y > 0) {
		return {
			x1: prevPosition.x,
			y1: prevPosition.y,
			x2: nextPosition.x + size.width,
			y2: nextPosition.y + size.height,
		}
	} else if (velocity.y < 0) {
		return {
			x1: nextPosition.x,
			y1: nextPosition.y,
			x2: prevPosition.x + size.width,
			y2: prevPosition.y + size.height,
		}
	}
}
