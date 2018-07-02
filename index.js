const R = require('ramda');

const canvas = document.getElementById('canvas');
const canvasPos = canvas.getBoundingClientRect();
const context = canvas.getContext('2d');

var mouseCoord = { x: 0, y: 0 };

var state = {
  coord0: null,
  coord1: null,
  coord2: null,
  clicks: 0,
  showAngle: false
}

var updateState = (key, value) => {
  state = R.assoc(key, value, state);
}

var getRealCoord = (event) => {
  return {
    x: event.clientX - canvasPos.x,
    y: event.clientY - canvasPos.y
  }
}

const sqr = (x) => x * x;
var toDegrees = (angle) => angle * (180 / Math.PI);

var distance = (from, to) => {
  return Math.sqrt(
    sqr(from.x - to.x) + sqr(from.y - to.y)
  );
}

var calculateAngle = (prop) => {
  const props = R.filter((p) => p != prop, ['coord0', 'coord1', 'coord2']);

  const current = R.prop(prop, state);
  const other1 = R.prop(props[0], state);
  const other2 = R.prop(props[1], state);

  const opp = distance(other1, other2);
  const adj1 = distance(current, other1);
  const adj2 = distance(current, other2);

  const res = (sqr(adj1) + sqr(adj2) - sqr(opp)) / (2 * adj1 * adj2);
  return toDegrees(Math.acos(res));
}

var drawText = (angle) => {
  context.font = "30px Arial";
  context.fillText("Angle: " + angle, 10, 50);
}

var drawLine = (from, to) => {
  context.beginPath();
  context.moveTo(from.x, from.y);
  context.lineTo(to.x, to.y);
  context.stroke();
  context.closePath();
}

var drawPoint = (coord) => {
  if (R.prop('clicks', state) % 3 != 0 || R.prop('clicks', state) == 0) {return;}

  const radius = 25;

  R.forEach((prop) => {
    const propCoord = R.prop(prop, state);

    const distance = Math.sqrt(
      sqr(propCoord.x - coord.x) + sqr(propCoord.y - coord.y)
    );

    if (distance < radius) {
      context.beginPath();
      context.arc(propCoord.x, propCoord.y, radius, 0, 2 * Math.PI, false);
      context.lineWidth = 2;
      context.strokeStyle = '#003300';
      context.stroke();
      context.closePath();

      var angle = calculateAngle(prop);
      drawText(angle);
    } else {

    }
  }, ['coord0', 'coord1', 'coord2'])
}

var updateTriangle = () => {
  const numClicks = R.prop('clicks', state) % 3;

  if (numClicks == 0 && R.prop('clicks', state) != 0) {
    drawLine(state.coord0, state.coord1);
    drawLine(state.coord1, state.coord2);
    drawLine(state.coord0, state.coord2);
  }

  if (numClicks == 1) {
    return;
  }

  if (numClicks == 2) {
    drawLine(state.coord0, state.coord1);
  }
}

canvas.onclick = (e) => {
  const coord = getRealCoord(event);
  const currentCoord = 'coord' + (R.prop('clicks', state) % 3);

  updateState(currentCoord, getRealCoord(e));
  updateState('clicks', R.prop('clicks', state) + 1);
}

canvas.onmousemove = (e) => {
  const coord = getRealCoord(event);
  mouseCoord = coord;
}

setInterval(function() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawPoint(mouseCoord);
  updateTriangle();
}, 1000/60);
