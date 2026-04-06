
const form = document.getElementById('projectileForm');
const resetBtn = document.getElementById('resetBtn');
const messageEl = document.getElementById('message');
const tableBody = document.getElementById('trajectoryTable');
const canvas = document.getElementById('trajectoryCanvas');
const ctx = canvas.getContext('2d');

const output = {
  flightTime: document.getElementById('flightTime'),
  range: document.getElementById('range'),
  maxHeight: document.getElementById('maxHeight'),
  stepsCount: document.getElementById('stepsCount'),
};

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function formatNumber(value) {
  return Number.isFinite(value) ? value.toFixed(2) : '-';
}

function solveProjectile(speed, angleDeg, height, gravity) {
  const angleRad = toRadians(angleDeg);
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);

  const discriminant = vy * vy + 2 * gravity * height;
  const flightTime = (vy + Math.sqrt(discriminant)) / gravity;
  const range = vx * flightTime;
  const maxHeight = height + (vy * vy) / (2 * gravity);

  const points = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = flightTime * i / steps;
    const x = vx * t;
    const y = height + vy * t - gravity * t * t / 2;
    points.push({ step: i, t, x, y: Math.max(0, y) });
  }

  return { flightTime, range, maxHeight, points };
}

function drawAxes(padding, chartWidth, chartHeight) {
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(padding, padding);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '14px Arial';
  ctx.fillText('x (м)', canvas.width - padding + 10, canvas.height - padding + 4);
  ctx.fillText('y (м)', padding - 8, padding - 10);
}

function drawTrajectory(points, range, maxHeight) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 48;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  drawAxes(padding, chartWidth, chartHeight);

  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 3;
  ctx.beginPath();

  points.forEach((point, index) => {
    const px = padding + (point.x / range) * chartWidth;
    const py = canvas.height - padding - (point.y / maxHeight) * chartHeight;

    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });

  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  points.forEach((point) => {
    const px = padding + (point.x / range) * chartWidth;
    const py = canvas.height - padding - (point.y / maxHeight) * chartHeight;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderTable(points) {
  tableBody.innerHTML = points.map((point) => `
    <tr>
      <td>${point.step}</td>
      <td>${formatNumber(point.t)}</td>
      <td>${formatNumber(point.x)}</td>
      <td>${formatNumber(point.y)}</td>
    </tr>
  `).join('');
}

function renderResult(data) {
  output.flightTime.textContent = `${formatNumber(data.flightTime)} с`;
  output.range.textContent = `${formatNumber(data.range)} м`;
  output.maxHeight.textContent = `${formatNumber(data.maxHeight)} м`;
  output.stepsCount.textContent = `${data.points.length}`;
  renderTable(data.points);
  drawTrajectory(data.points, data.range || 1, data.maxHeight || 1);
}

function validateInput(speed, angle, height, gravity) {
  if (speed <= 0) return 'Початкова швидкість має бути більшою за 0.';
  if (angle <= 0 || angle >= 90) return 'Кут кидання має бути в межах від 0 до 90 градусів.';
  if (height < 0) return 'Початкова висота не може бути від’ємною.';
  if (gravity <= 0) return 'Прискорення вільного падіння має бути більшим за 0.';
  return '';
}

function clearOutput() {
  output.flightTime.textContent = '-';
  output.range.textContent = '-';
  output.maxHeight.textContent = '-';
  output.stepsCount.textContent = '-';
  tableBody.innerHTML = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const speed = Number(document.getElementById('speed').value);
  const angle = Number(document.getElementById('angle').value);
  const height = Number(document.getElementById('height').value);
  const gravity = Number(document.getElementById('gravity').value);

  const error = validateInput(speed, angle, height, gravity);
  if (error) {
    messageEl.textContent = error;
    clearOutput();
    return;
  }

  messageEl.textContent = '';
  const result = solveProjectile(speed, angle, height, gravity);
  renderResult(result);
});

resetBtn.addEventListener('click', () => {
  form.reset();
  document.getElementById('speed').value = 25;
  document.getElementById('angle').value = 45;
  document.getElementById('height').value = 0;
  document.getElementById('gravity').value = 9.81;
  messageEl.textContent = '';
  clearOutput();
});

clearOutput();
