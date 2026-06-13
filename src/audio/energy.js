export function bandAverage(freqData, start, end) {
  let sum = 0;
  let count = 0;
  for (let i = start; i < end; i += 1) {
    sum += freqData[i] || 0;
    count += 1;
  }
  return count ? sum / count / 255 : 0;
}

export function updateEnergySnapshot(previous, freqData) {
  const low = bandAverage(freqData, 1, 34);
  const mid = bandAverage(freqData, 34, 165);
  const left = bandAverage(freqData, 3, 64);
  const right = bandAverage(freqData, 64, 190);
  const lowRise = low - previous.lastLow;
  const midRise = mid - previous.lastMid;
  const drive = low * 0.72 + mid * 0.48;
  const driveRise = drive - previous.lastDrive;
  const positiveRise = Math.max(0, driveRise, lowRise * 0.86, midRise * 0.68);
  return { low, mid, left, right, lowRise, midRise, drive, positiveRise };
}
