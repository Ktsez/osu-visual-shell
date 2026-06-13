export function createVisualizerState(barCount = 200) {
  return {
    bars: new Float32Array(barCount),
    previousBins: new Float32Array(barCount),
    offset: 0,
    lastUpdate: 0,
  };
}

export function resetVisualizerState(state) {
  state.bars.fill(0);
  state.previousBins.fill(0);
  state.offset = 0;
  state.lastUpdate = 0;
}

export function drawLogoVisualizer(ctx, visualizerBars, cx, cy, coreSize, settings) {
  const bars = visualizerBars.length;
  const visualiserRounds = 5;
  const baseRadius = coreSize * 0.472;
  const maxBarLength = coreSize * 0.58 * Math.max(0.05, settings.visualizerRange);
  const barWidth = Math.max(5.2, (Math.PI * 2 * coreSize * 0.5) / bars * 0.86);
  const deadZone = Math.max(0.0075, 1 / Math.max(1, maxBarLength));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'lighter';
  ctx.rotate(performance.now() / 27000);

  const drawRoundedBar = (angle, innerRadius, length, width, radius, draw) => {
    if (length <= 0) return;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.roundRect(innerRadius, -width / 2, length, width, radius);
    draw();
    ctx.restore();
  };

  for (let round = 0; round < visualiserRounds; round += 1) {
    const roundOffset = (round * Math.PI * 2) / visualiserRounds;
    for (let i = 0; i < bars; i += 1) {
      const amplitude = visualizerBars[i];
      if (amplitude <= deadZone) continue;
      const angle = (i / bars) * Math.PI * 2 + roundOffset;
      const length = amplitude * maxBarLength;
      const darkAlpha = Math.min(0.28, 0.05 + amplitude * 0.62);
      const paleAlpha = Math.min(0.2, 0.026 + amplitude * 0.32);
      const darkWidth = barWidth * 0.92;
      const paleWidth = barWidth * 0.78;

      ctx.fillStyle = `rgba(255, 255, 255, ${darkAlpha})`;
      drawRoundedBar(angle, baseRadius, length, darkWidth, darkWidth * 0.5, () => ctx.fill());

      if (length > coreSize * 0.022) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${paleAlpha})`;
        ctx.lineWidth = Math.max(1.2, paleWidth * 0.18);
        drawRoundedBar(angle, baseRadius + darkWidth * 0.06, length * 0.94, paleWidth, paleWidth * 0.5, () => ctx.stroke());
      }
    }
  }

  ctx.restore();
}
