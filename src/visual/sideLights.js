export function envelopeValue(envelope, now) {
  if (!envelope) return 0;
  const age = now - envelope.start;
  const attack = Math.max(24, envelope.attack);
  const decay = Math.max(80, envelope.decay);
  if (age < 0) return 0;
  if (age < attack) return envelope.power * (age / attack);
  return envelope.power * Math.exp(-(age - attack) / decay);
}

export function envelopeAlive(envelope, now) {
  return envelope && now - envelope.start < 72 + Math.max(260, envelope.beatLength);
}

export function osuSideAlpha(originalAlpha, liftedAlpha, floor, sideIntensity) {
  return Math.max(floor, Math.min(0.94, Math.max(originalAlpha, liftedAlpha))) * Math.max(0, sideIntensity);
}

export function createSideEnvelope({ now, beatLength, power, attack = 42, decay = 240 }) {
  return { start: now, beatLength, power, attack, decay };
}
