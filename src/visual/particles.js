export function createStarPath(innerRatio = 0.5) {
  const path = new Path2D();
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? 1 : innerRatio;
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  }

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const control = {
      x: current.x * 0.88 + next.x * 0.12,
      y: current.y * 0.88 + next.y * 0.12,
    };
    if (i === 0) path.moveTo(current.x, current.y);
    path.quadraticCurveTo(control.x, control.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
  }
  path.closePath();
  return path;
}

export function drawStar(ctx, path, hollowPath, particle, alpha) {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.scale(particle.radius, particle.radius);
  ctx.globalAlpha = alpha;
  if (particle.hollow) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.18;
    ctx.lineJoin = 'round';
    ctx.stroke(hollowPath);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fill(path);
  }
  ctx.restore();
}

export function drawStarGlow(ctx, x, y, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
