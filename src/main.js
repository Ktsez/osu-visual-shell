const app = document.querySelector('#app');
window.__appVersion = '20260612-scythe-slice-rebuild';
const canvas = document.querySelector('#stage');
const ctx = canvas.getContext('2d');
const background = document.querySelector('#background');
const core = document.querySelector('#core');
const coreCover = document.querySelector('#core-cover');
const coreSubtitle = document.querySelector('#core-subtitle');
const miniState = document.querySelector('#mini-state');
const miniTime = document.querySelector('#mini-time');
const controlPanel = document.querySelector('#control-panel');
const scanPanel = document.querySelector('#scan-panel');
const songPanel = document.querySelector('#song-panel');
const folderPath = document.querySelector('#folder-path');
const statusEl = document.querySelector('#status');
const listEl = document.querySelector('#list');
const search = document.querySelector('#search');
const audio = document.querySelector('#audio');
const playButton = document.querySelector('#toggle-play');
const progress = document.querySelector('#progress');
const timeCurrent = document.querySelector('#time-current');
const timeTotal = document.querySelector('#time-total');
const trackTitle = document.querySelector('#track-title');
const trackMeta = document.querySelector('#track-meta');
const cover = document.querySelector('#cover');
const songCount = document.querySelector('#song-count');
const minimizeControls = document.querySelector('#minimize-controls');

let tracks = [];
let visibleTracks = [];
let activeIndex = -1;
let analyser;
let audioContext;
let sourceNode;
let freqData;
let leftEnergy = 0;
let rightEnergy = 0;
let lowEnergy = 0;
let midEnergy = 0;
let smoothedEnergy = 0;
let timingPulse = 0;
let logoPulse = 0;
let sectionHeat = 0;
let lightEnergy = 0;
let lightSweep = 0;
let continuousBeat = 0;
let leftFlash = 0;
let rightFlash = 0;
let leftEnvelope = null;
let rightEnvelope = null;
let beatAccent = 0;
let beatWindow = 0;
let lastScytheAt = -10000;
let scytheSide = 0;
let lastLow = 0;
let lastMid = 0;
let lastDrive = 0;
let currentDrive = 0;
let currentRise = 0;
let driveAverage = 0;
let riseAverage = 0;
let currentBeatLengthMs = 620;
let activeTimingPoint = null;
let activeEffectPoint = null;
let lastBeatIndex = null;
let lastBeatTimingPoint = null;
let lastInteraction = performance.now();
let lastFrameAt = performance.now();
let draggingProgress = false;
let particles = [];
let scytheEvents = [];
let debugScaleMin = 99;
let debugScaleMax = 0;
let lastTransportAction = 0;

const idleAfterMs = 28000;
const sideFlashEarlyMs = 65;

function touch(panel = null) {
  lastInteraction = performance.now();
  document.body.classList.remove('is-idle');
  if (panel) app.dataset.panel = panel;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setPanel(panel) {
  touch(panel);
}

function resize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function setupAudioGraph() {
  if (audioContext) return;
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.82;
  freqData = new Uint8Array(analyser.frequencyBinCount);
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
}

async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

async function detectOsu() {
  const data = await fetchJson('/api/default-paths');
  if (data.osuSongs?.length) {
    folderPath.value = data.osuSongs[0];
    setStatus(`找到 osu! Songs：${data.osuSongs[0]}`);
  } else {
    setStatus('没有自动找到 osu! Songs。可以手动粘贴路径。');
  }
}

async function scan(kind) {
  const path = folderPath.value.trim();
  if (!path) {
    setStatus('请先填写文件夹路径。');
    return;
  }

  setPanel('scan');
  setStatus(kind === 'osu' ? '正在扫描 osu! 谱面...' : '正在扫描普通音乐...');
  tracks = [];
  visibleTracks = [];
  listEl.innerHTML = '';
  songCount.textContent = '扫描中';

  try {
    const data = await fetchJson(`/api/scan?kind=${kind}&path=${encodeURIComponent(path)}`);
    const rawTracks = data.tracks || [];
    tracks = dedupeTracks(rawTracks);
    visibleTracks = tracks;
    renderList();
    const duplicateCount = Math.max(0, rawTracks.length - tracks.length);
    setStatus(tracks.length
      ? `已载入 ${tracks.length} 首歌曲，合并了 ${duplicateCount} 个重复难度/重复音频。`
      : '没有找到可播放音乐。');
    setPanel('songs');
  } catch (error) {
    setStatus(error.message);
  }
}

function dedupeTracks(input) {
  const best = new Map();
  for (const track of input) {
    const audioKey = normaliseKey(track.audioUrl || track.path || '');
    const titleKey = normaliseKey(`${track.artist || ''}::${track.title || ''}`);
    const key = track.source === 'osu' ? `${titleKey}::${audioKey}` : audioKey || titleKey;
    const current = best.get(key);
    const score = (track.timingPoints?.length || 0) + (track.backgroundUrl ? 2 : 0);
    const currentScore = (current?.timingPoints?.length || 0) + (current?.backgroundUrl ? 2 : 0);
    if (!current || score > currentScore) best.set(key, track);
  }
  return [...best.values()].sort((a, b) => `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`, 'zh-CN'));
}

function normaliseKey(value) {
  return String(value || '').trim().toLowerCase().replaceAll('\\', '/').replace(/\s+/g, ' ');
}

function renderList() {
  const query = search.value.trim().toLowerCase();
  visibleTracks = query
    ? tracks.filter((track) => `${track.title} ${track.artist} ${track.version}`.toLowerCase().includes(query))
    : tracks;

  songCount.textContent = `${visibleTracks.length} 首`;
  listEl.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (const track of visibleTracks.slice(0, 500)) {
    const index = tracks.indexOf(track);
    const button = document.createElement('button');
    button.className = 'track';
    button.type = 'button';
    button.dataset.index = String(index);
    button.style.setProperty('--i', String(Math.min(24, fragment.children.length)));
    button.innerHTML = `
      <span>${escapeHtml(track.title)}</span>
      <small>${escapeHtml(track.artist)}${track.version ? ` / ${escapeHtml(track.version)}` : ''}</small>
    `;
    button.addEventListener('click', () => playIndex(index));
    fragment.appendChild(button);
  }

  listEl.appendChild(fragment);
  markActiveTrack();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);
}

async function playIndex(index) {
  if (!tracks[index]) return;
  touch('controls');
  activeIndex = index;
  const track = tracks[index];

  audio.src = track.audioUrl;
  background.style.backgroundImage = track.backgroundUrl ? `url("${track.backgroundUrl}")` : '';
  cover.style.backgroundImage = track.backgroundUrl ? `url("${track.backgroundUrl}")` : '';
  coreCover.style.backgroundImage = track.backgroundUrl ? `url("${track.backgroundUrl}")` : '';
  trackTitle.textContent = track.title;
  trackMeta.textContent = `${track.artist}${track.version ? ` / ${track.version}` : ''}`;
  coreSubtitle.textContent = track.timingPoints?.length ? '节拍同步' : '音频同步';
  miniState.textContent = '已载入';
  activeTimingPoint = pickTimingPoint(track, 0);
  activeEffectPoint = pickEffectPoint(track, 0);
  currentBeatLengthMs = activeTimingPoint?.beatLength || 620;
  continuousBeat = 0;
  lastBeatIndex = null;
  lastBeatTimingPoint = null;
  beatAccent = 0;
  beatWindow = 0;
  leftFlash = 0;
  rightFlash = 0;
  leftEnvelope = null;
  rightEnvelope = null;
  lastDrive = 0;
  currentDrive = 0;
  currentRise = 0;
  driveAverage = 0;
  riseAverage = 0;
  scytheEvents = [];
  markActiveTrack();
  setStatus(track.timingPoints?.length ? `已读取 ${track.timingPoints.length} 个 timing points。` : '已载入，使用音频分析。');

  try {
    setupAudioGraph();
    audioContext.resume().catch(() => {});
    playButton.textContent = '暂停';
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          miniState.textContent = '播放中';
          setStatus(track.timingPoints?.length ? `播放中，已同步 ${track.timingPoints.length} 个 timing points。` : '播放中，使用音频分析。');
        })
        .catch(() => {
          playButton.textContent = '播放';
          miniState.textContent = '待播放';
          setStatus('请点击播放以解锁音频分析。');
        });
    }
  } catch {
    playButton.textContent = '播放';
    miniState.textContent = '待播放';
    setStatus('请点击播放以解锁音频分析。');
  }
}

function pickTimingPoint(track, currentMs) {
  const inherited = (track.timingPoints || []).filter((point) => point.uninherited && point.beatLength > 0);
  let picked = inherited[0] || null;
  for (const point of inherited) {
    if (point.offset <= currentMs) picked = point;
    else break;
  }
  return picked;
}

function pickEffectPoint(track, currentMs) {
  const points = (track.timingPoints || []).filter((point) => Number.isFinite(point.offset));
  let picked = points[0] || null;
  for (const point of points) {
    if (point.offset <= currentMs) picked = point;
    else break;
  }
  return picked;
}

function markActiveTrack() {
  [...listEl.children].forEach((item) => item.classList.toggle('active', Number(item.dataset.index) === activeIndex));
}

async function togglePlay() {
  touch('controls');
  if (activeIndex === -1 && tracks.length) return playIndex(0);
  if (activeIndex === -1) return setPanel('scan');

  try {
    setupAudioGraph();
    audioContext.resume().catch(() => {});
    if (audio.paused) {
      try {
        await audio.play();
        playButton.textContent = '暂停';
        miniState.textContent = '播放中';
      } catch {
        playButton.textContent = '播放';
        miniState.textContent = '待播放';
        setStatus('音频播放被浏览器拦截，请再点一次播放。');
      }
    } else {
      audio.pause();
      playButton.textContent = '播放';
      miniState.textContent = '已暂停';
    }
  } catch {
    playButton.textContent = '播放';
    miniState.textContent = '待播放';
    setStatus('音频播放被浏览器拦截，请再点一次播放。');
  }
}

function stepTrack(delta) {
  touch('controls');
  if (!tracks.length) return setPanel('scan');
  const next = activeIndex === -1 ? 0 : (activeIndex + delta + tracks.length) % tracks.length;
  playIndex(next);
}

function runTransport(event, action) {
  event?.preventDefault();
  event?.stopPropagation();
  const now = performance.now();
  if (now - lastTransportAction < 180) return;
  lastTransportAction = now;
  action();
}

function runTransportButton(event, button) {
  if (!button) return;
  if (button.id === 'toggle-play') runTransport(event, togglePlay);
  if (button.id === 'prev') runTransport(event, () => stepTrack(-1));
  if (button.id === 'next') runTransport(event, () => stepTrack(1));
}

function findTransportButton(event) {
  const path = event.composedPath?.() || [];
  const fromPath = path.find((item) => item?.id === 'toggle-play' || item?.id === 'prev' || item?.id === 'next');
  if (fromPath) return fromPath;
  const fromPoint = document.elementFromPoint(event.clientX, event.clientY);
  return fromPoint?.closest?.('#toggle-play, #prev, #next') || null;
}

function updateTiming() {
  const track = tracks[activeIndex];
  const timelineSeconds = audio.currentTime || 0;
  if (!track?.timingPoints?.length || !Number.isFinite(timelineSeconds)) return;
  const syncMs = timelineSeconds * 1000 + sideFlashEarlyMs;
  const point = pickTimingPoint(track, syncMs);
  const effectPoint = pickEffectPoint(track, syncMs);
  if (!point || point.beatLength <= 0) return;

  if (point !== activeTimingPoint) {
    activeTimingPoint = point;
    lastBeatIndex = null;
    lastBeatTimingPoint = null;
    sectionHeat = Math.max(sectionHeat, 0.9);
    beatAccent = Math.max(beatAccent, 0.78);
  }
  activeEffectPoint = effectPoint;

  const beatLengthSeconds = point.beatLength / 1000;
  currentBeatLengthMs = point.beatLength;
  const beatPosition = ((timelineSeconds - point.offset / 1000) / beatLengthSeconds) % 1;
  const wrappedBeat = beatPosition < 0 ? beatPosition + 1 : beatPosition;
  continuousBeat = Math.max(0, Math.cos(wrappedBeat * Math.PI * 2));

  const beatIndex = beatIndexAtTimeMs(syncMs, point);
  if (beatIndex < 0 || (point === lastBeatTimingPoint && beatIndex === lastBeatIndex)) return;

  lastBeatIndex = beatIndex;
  lastBeatTimingPoint = point;

  const timeSinceBeat = timeSinceBeatMs(syncMs, point);
  const amplitudeAdjust = Math.min(1, 0.4 + Math.max(lowEnergy, midEnergy, smoothedEnergy));
  timingPulse = Math.max(timingPulse, 0.36 + amplitudeAdjust * 0.42);
  logoPulse = Math.max(logoPulse, 0.3 + amplitudeAdjust * 0.5);

  const meter = Math.max(1, point.meter || 4);
  if (beatIndex % meter === 0) {
    sectionHeat = Math.max(sectionHeat, 0.78);
    beatAccent = Math.max(beatAccent, 1);
    beatWindow = 1;
    spawnBurst(12 + Math.min(18, meter * 3));
  } else {
    beatAccent = Math.max(beatAccent, 0.42);
    beatWindow = Math.max(beatWindow, 0.55);
  }

  handleOsuSideFlashBeat(beatIndex, meter, Boolean(effectPoint?.kiai), timeSinceBeat);
}

function osuSideAlpha(channel, kiai) {
  const amplitudeDeadZone = 0.25;
  const alphaMultiplier = (1 - amplitudeDeadZone) / 0.55;
  const kiaiMultiplier = (1 - amplitudeDeadZone * 0.95) / 0.8;
  const multiplier = kiai ? kiaiMultiplier : alphaMultiplier;
  const originalAlpha = 0.1 + (channel - amplitudeDeadZone) / multiplier;
  const base = kiai ? 0.32 : 0.27;
  const drive = Math.max(channel, lowEnergy * 0.82, currentDrive * 0.64, smoothedEnergy * 0.72);
  const audioLift = Math.sqrt(Math.max(0, drive)) * (kiai ? 0.44 : 0.38);
  const riseLift = Math.min(0.16, currentRise * 1.5);
  const liftedAlpha = base + audioLift + riseLift;
  return Math.max(base, Math.min(0.94, Math.max(originalAlpha, liftedAlpha)));
}

function beatIndexAtTimeMs(currentTrackTime, point) {
  const beatLengthMs = point.beatLength || 1;
  let index = Math.trunc((currentTrackTime - point.offset) / beatLengthMs);
  if (currentTrackTime < point.offset) index -= 1;
  return index;
}

function timeSinceBeatMs(currentTrackTime, point) {
  const beatLengthMs = point.beatLength || 1;
  const raw = (currentTrackTime - point.offset) % beatLengthMs;
  return raw < 0 ? raw + beatLengthMs : raw;
}

function flashSide(side, amount, reason = 'beat', beatIndex = lastBeatIndex, timeSinceBeat = 0) {
  const clamped = Math.max(0.18, Math.min(0.96, amount));
  const now = performance.now();
  const startedAt = now - Math.max(0, timeSinceBeat);
  const makeEnvelope = (existing) => ({
    start: startedAt,
    peak: Math.max(clamped, envelopeValue(existing, now) * 0.9),
    beatLength: Math.max(260, currentBeatLengthMs || 620),
  });
  if (side === 'left' || side === 'both') leftEnvelope = makeEnvelope(leftEnvelope);
  if (side === 'right' || side === 'both') rightEnvelope = makeEnvelope(rightEnvelope);
  lightEnergy = Math.max(lightEnergy, clamped * 0.66);
  lightSweep = Math.max(lightSweep, clamped * 0.72);
  scytheEvents.push({
    at: Number((audio.currentTime || 0).toFixed(3)),
    reason,
    side,
    amount: Number(clamped.toFixed(3)),
    beat: beatIndex,
    kiai: Boolean(activeEffectPoint?.kiai),
  });
  scytheEvents = scytheEvents.slice(-36);
}

function handleOsuSideFlashBeat(beatIndex, meter, kiaiTagged, timeSinceBeat = 0) {
  const downbeat = beatIndex % Math.max(1, meter) === 0;
  const strongAccent = downbeat
    && (currentDrive > Math.max(0.32, driveAverage + 0.08)
      || currentRise > Math.max(0.045, riseAverage * 2.1)
      || lowEnergy > 0.34);

  if (kiaiTagged) {
    if (beatIndex % 2 === 0) {
      const amount = osuSideAlpha(leftEnergy, true);
      flashSide('left', amount, 'kiai-left', beatIndex, timeSinceBeat);
      if (strongAccent) flashSide('right', amount * 0.62, 'kiai-accent-right', beatIndex, timeSinceBeat);
    } else {
      const amount = osuSideAlpha(rightEnergy, true);
      flashSide('right', amount, 'kiai-right', beatIndex, timeSinceBeat);
      if (strongAccent) flashSide('left', amount * 0.62, 'kiai-accent-left', beatIndex, timeSinceBeat);
    }
    return;
  }

  if (downbeat) {
    flashSide('left', osuSideAlpha(leftEnergy, false), 'downbeat-left', beatIndex, timeSinceBeat);
    flashSide('right', osuSideAlpha(rightEnergy, false), 'downbeat-right', beatIndex, timeSinceBeat);
  }
}

function envelopeValue(envelope, now) {
  if (!envelope) return 0;
  const attack = 72;
  const age = now - envelope.start;
  if (age < 0) return 0;
  if (age <= attack) {
    const progress = age / attack;
    return envelope.peak * (1 - Math.pow(1 - progress, 2.7));
  }
  const release = Math.max(260, envelope.beatLength);
  const fade = Math.max(0, 1 - (age - attack) / release);
  return envelope.peak * Math.pow(fade, 1.45);
}

function envelopeAlive(envelope, now) {
  return envelope && now - envelope.start < 72 + Math.max(260, envelope.beatLength);
}

function bandAverage(start, end) {
  let sum = 0;
  let count = 0;
  for (let i = start; i < end; i += 1) {
    sum += freqData[i] || 0;
    count += 1;
  }
  return count ? sum / count / 255 : 0;
}

function updateAudioEnergy() {
  if (!analyser || !freqData || audio.paused) {
    lowEnergy *= 0.94;
    midEnergy *= 0.94;
    smoothedEnergy *= 0.95;
    return;
  }

  analyser.getByteFrequencyData(freqData);
  const low = bandAverage(1, 34);
  const mid = bandAverage(34, 165);
  const left = bandAverage(3, 64);
  const right = bandAverage(64, 190);

  leftEnergy = leftEnergy * 0.8 + left * 0.2;
  rightEnergy = rightEnergy * 0.8 + right * 0.2;
  lowEnergy = lowEnergy * 0.74 + low * 0.26;
  midEnergy = midEnergy * 0.78 + mid * 0.22;
  smoothedEnergy = smoothedEnergy * 0.82 + Math.max(low, mid * 0.8) * 0.18;

  const lowRise = low - lastLow;
  const midRise = mid - lastMid;
  const drive = low * 0.72 + mid * 0.48;
  const driveRise = drive - lastDrive;
  const positiveRise = Math.max(0, driveRise, lowRise * 0.86, midRise * 0.68);
  currentDrive = drive;
  currentRise = positiveRise;
  driveAverage = driveAverage * 0.985 + drive * 0.015;
  riseAverage = riseAverage * 0.94 + positiveRise * 0.06;

  if (lowRise > 0.06 && low > 0.22) {
    logoPulse = Math.max(logoPulse, Math.min(1.2, low * 1.3));
  }

  lastLow = low;
  lastMid = mid;
  lastDrive = drive;
}

function spawnBurst(count = 10) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cx = width * 0.5;
  const cy = height * 0.5;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: cx + Math.cos(angle) * (120 + Math.random() * 60),
      y: cy + Math.sin(angle) * (120 + Math.random() * 60),
      vx: Math.cos(angle) * (1.2 + Math.random() * 3.8),
      vy: Math.sin(angle) * (1.2 + Math.random() * 3.8),
      life: 1,
      size: 1.8 + Math.random() * 4.6,
    });
  }
  particles = particles.slice(-320);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateProgress() {
  const duration = audio.duration || 0;
  const current = audio.currentTime || 0;
  if (!draggingProgress && duration) progress.value = String(Math.round((current / duration) * 1000));
  timeCurrent.textContent = formatTime(current);
  timeTotal.textContent = formatTime(duration);
  miniTime.textContent = formatTime(current);
}

function draw() {
  requestAnimationFrame(draw);
  const now = performance.now();
  const elapsed = Math.min(80, now - lastFrameAt);
  lastFrameAt = now;

  updateAudioEnergy();
  updateTiming();
  updateProgress();

  timingPulse *= Math.exp(-elapsed / 88);
  logoPulse *= Math.exp(-elapsed / 102);
  sectionHeat *= Math.exp(-elapsed / 1500);
  beatAccent *= Math.exp(-elapsed / 190);
  beatWindow *= Math.exp(-elapsed / 115);
  lightEnergy *= Math.exp(-elapsed / 420);
  lightSweep *= Math.exp(-elapsed / 260);
  leftFlash = envelopeValue(leftEnvelope, now);
  rightFlash = envelopeValue(rightEnvelope, now);
  if (!envelopeAlive(leftEnvelope, now)) leftEnvelope = null;
  if (!envelopeAlive(rightEnvelope, now)) rightEnvelope = null;

  if (now - lastInteraction > idleAfterMs && app.dataset.panel !== 'idle') {
    app.dataset.panel = 'idle';
    document.body.classList.add('is-idle');
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);

  const beatMotion = !audio.paused ? continuousBeat * 0.045 : 0;
  const energy = Math.max(smoothedEnergy * 1.35, logoPulse * 0.86, timingPulse * 0.62, beatMotion);
  const earlyDip = timingPulse > 0.5 ? -0.012 * Math.min(1, timingPulse) : 0;
  const coreScale = 1 + energy * 0.16 + earlyDip;
  debugScaleMin = Math.min(debugScaleMin, coreScale);
  debugScaleMax = Math.max(debugScaleMax, coreScale);
  window.__visualDebug = {
    coreScale,
    scaleRange: [debugScaleMin, debugScaleMax],
    energy,
    timingPulse,
    logoPulse,
    lightEnergy,
    lightSweep,
    leftFlash,
    rightFlash,
    leftEnvelope,
    rightEnvelope,
    beatAccent,
    scytheEvents,
    scytheEventCount: scytheEvents.length,
    paused: audio.paused,
    currentTime: audio.currentTime,
  };
  core.style.transform = `translate(-50%, -50%) scale(${coreScale})`;
  core.style.boxShadow = `0 0 ${54 + energy * 170}px rgba(255, 72, 169, ${0.34 + energy * 0.5})`;

  document.documentElement.style.setProperty('--energy', energy.toFixed(3));
  const visualLight = Math.max(lightEnergy, sectionHeat * 0.12);
  document.documentElement.style.setProperty('--light', Math.min(1.25, visualLight).toFixed(3));
  document.documentElement.style.setProperty('--left', Math.min(1.2, leftEnergy + leftFlash * 0.42 + visualLight * 0.18).toFixed(3));
  document.documentElement.style.setProperty('--right', Math.min(1.2, rightEnergy + rightFlash * 0.42 + visualLight * 0.18).toFixed(3));
  document.documentElement.style.setProperty('--section', sectionHeat.toFixed(3));
  document.documentElement.style.setProperty('--sweep', lightSweep.toFixed(3));
  document.documentElement.style.setProperty('--flash-left', Math.min(1, leftFlash).toFixed(3));
  document.documentElement.style.setProperty('--flash-right', Math.min(1, rightFlash).toFixed(3));

  const cx = width * 0.5;
  const cy = height * 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(now / 4200);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + energy * 0.16})`;
  ctx.lineWidth = 1.5 + energy * 5;
  for (let i = 0; i < 5; i += 1) {
    const radius = 154 + i * 44 + energy * 22;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -0.4 + i * 0.18, Math.PI * 1.12 + i * 0.16);
    ctx.stroke();
  }
  ctx.restore();

  drawLogoVisualizer(cx, cy, energy);

  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.986;
    particle.vy *= 0.986;
    particle.life *= 0.962;
    ctx.fillStyle = `rgba(255, 232, 250, ${particle.life * 0.88})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
    ctx.fill();
  }
  particles = particles.filter((particle) => particle.life > 0.04);
}

function drawLogoVisualizer(cx, cy, energy) {
  const bars = 96;
  const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.225;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(performance.now() / 9000);
  for (let i = 0; i < bars; i += 1) {
    const sourceIndex = freqData && !audio.paused ? Math.floor((i / bars) * Math.min(freqData.length, 256)) : -1;
    const amplitude = sourceIndex >= 0 ? Math.max(0, freqData[sourceIndex] / 255 - 0.02) : 0;
    if (amplitude <= 0.006 && energy < 0.05) continue;
    const angle = (i / bars) * Math.PI * 2;
    const length = 3 + amplitude * 46 + energy * 7;
    const r1 = baseRadius + 18;
    const r2 = r1 + length;
    ctx.strokeStyle = `rgba(255,255,255,${0.07 + amplitude * 0.34})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
    ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
    ctx.stroke();
  }
  ctx.restore();
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', () => touch(), { passive: true });
window.addEventListener('keydown', () => touch());
core.addEventListener('click', () => setPanel(app.dataset.panel === 'controls' ? 'idle' : 'controls'));
core.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  setPanel(app.dataset.panel === 'controls' ? 'idle' : 'controls');
});
controlPanel.addEventListener('pointerdown', () => touch('controls'));
controlPanel.addEventListener('pointerdown', (event) => {
  runTransportButton(event, findTransportButton(event));
}, { capture: true });
controlPanel.addEventListener('click', (event) => {
  runTransportButton(event, findTransportButton(event));
}, { capture: true });
window.addEventListener('pointerdown', (event) => {
  if (app.dataset.panel === 'idle') return;
  runTransportButton(event, findTransportButton(event));
}, { capture: true });
window.addEventListener('click', (event) => {
  if (app.dataset.panel === 'idle') return;
  runTransportButton(event, findTransportButton(event));
}, { capture: true });
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const button = document.activeElement?.closest?.('#toggle-play, #prev, #next');
  if (!button) return;
  runTransportButton(event, button);
});
document.addEventListener('visual-transport', (event) => {
  const button = event.detail ? document.querySelector(`#${event.detail}`) : null;
  runTransportButton(event, button);
});
scanPanel.addEventListener('pointerdown', () => touch('scan'));
songPanel.addEventListener('pointerdown', () => touch('songs'));

document.querySelector('#open-scan').addEventListener('click', () => setPanel('scan'));
document.querySelector('#open-library').addEventListener('click', () => setPanel(tracks.length ? 'songs' : 'scan'));
minimizeControls.addEventListener('click', () => setPanel('idle'));
document.querySelector('#close-scan').addEventListener('click', () => setPanel('controls'));
document.querySelector('#close-library').addEventListener('click', () => setPanel('controls'));
document.querySelector('#detect-osu').addEventListener('click', detectOsu);
document.querySelector('#scan-osu').addEventListener('click', () => scan('osu'));
document.querySelector('#scan-music').addEventListener('click', () => scan('music'));
playButton.addEventListener('click', (event) => {
  if (performance.now() - lastTransportAction < 280) {
    event.preventDefault();
    return;
  }
  togglePlay();
});
search.addEventListener('input', renderList);

progress.addEventListener('pointerdown', () => {
  draggingProgress = true;
  touch('controls');
});
progress.addEventListener('input', () => {
  touch('controls');
  const duration = audio.duration || 0;
  if (duration) timeCurrent.textContent = formatTime((Number(progress.value) / 1000) * duration);
});
progress.addEventListener('change', () => {
  const duration = audio.duration || 0;
  if (duration) audio.currentTime = (Number(progress.value) / 1000) * duration;
  draggingProgress = false;
});
progress.addEventListener('pointerup', () => {
  draggingProgress = false;
});

audio.addEventListener('ended', () => stepTrack(1));
audio.addEventListener('play', () => {
  playButton.textContent = '暂停';
  miniState.textContent = '播放中';
});
audio.addEventListener('pause', () => {
  playButton.textContent = '播放';
  miniState.textContent = activeIndex === -1 ? '就绪' : '已暂停';
});

resize();
draw();
detectOsu();
