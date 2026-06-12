const app = document.querySelector('#app');
window.__appVersion = '20260612-lightfield-logo-fountain';
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
const settingsPanel = document.querySelector('#settings-panel');
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
const settingsInputs = {
  sideIntensity: document.querySelector('#setting-side-intensity'),
  sideRestraint: document.querySelector('#setting-side-restraint'),
  pulse: document.querySelector('#setting-pulse'),
  visualizer: document.querySelector('#setting-visualizer'),
  fountain: document.querySelector('#setting-fountain'),
};

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
let sideEnvelopes = {
  leftSoft: null,
  rightSoft: null,
  leftHard: null,
  rightHard: null,
};
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
let starParticles = [];
let fountainBursts = [];
let scytheEvents = [];
let debugScaleMin = 99;
let debugScaleMax = 0;
let lastTransportAction = 0;
let lastUiActionAt = 0;
let lastKiaiState = false;
let lastFountainAt = -10000;
let coreHover = false;
let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;
let coreFollowX = 0;
let coreFollowY = 0;
let coreFlash = 0;
let lastVisualizerUpdate = 0;
let visualizerOffset = 0;

const visualizerBars = new Float32Array(200);
const settings = {
  sideIntensity: 1,
  sideRestraint: 0.55,
  pulse: 1,
  visualizer: 1,
  fountain: 1,
};

const idleAfterMs = 6000;
const sideFlashEarlyMs = 65;
const blankDismissDelayMs = 300;
const settingsKey = 'osu-visual-shell-settings-v1';

function touch(panel = null) {
  lastInteraction = performance.now();
  if (panel || app.dataset.panel !== 'idle') document.body.classList.remove('is-idle');
  if (panel) {
    markUiAction();
    app.dataset.panel = panel;
    if (panel !== 'idle') coreHover = false;
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function setPanel(panel) {
  if (panel === 'idle') {
    markUiAction();
    setIdlePanel();
    return;
  }
  touch(panel);
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    Object.assign(settings, saved);
  } catch {
    // Keep defaults when local storage contains invalid data.
  }

  for (const [key, input] of Object.entries(settingsInputs)) {
    if (!input) continue;
    input.value = String(settings[key]);
    input.addEventListener('input', () => {
      settings[key] = Number(input.value);
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      touch('settings');
    });
  }
}

function markUiAction() {
  lastUiActionAt = performance.now();
}

function setIdlePanel() {
  lastInteraction = performance.now();
  app.dataset.panel = 'idle';
  coreHover = false;
  document.body.classList.add('is-idle');
}

function isInterfaceTarget(target) {
  return Boolean(target?.closest?.('.core, .control-panel, .float-panel, button, input, label, .track, [role="button"]'));
}

function handleBlankDismiss(event) {
  if (isInterfaceTarget(event.target)) {
    markUiAction();
    return false;
  }

  if (app.dataset.panel === 'idle' || performance.now() - lastUiActionAt < blankDismissDelayMs) return false;
  setIdlePanel();
  return true;
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
  sideEnvelopes = {
    leftSoft: null,
    rightSoft: null,
    leftHard: null,
    rightHard: null,
  };
  lastDrive = 0;
  currentDrive = 0;
  currentRise = 0;
  driveAverage = 0;
  riseAverage = 0;
  scytheEvents = [];
  starParticles = [];
  fountainBursts = [];
  lastKiaiState = Boolean(activeEffectPoint?.kiai);
  lastFountainAt = -10000;
  visualizerBars.fill(0);
  markActiveTrack();
  setStatus(track.timingPoints?.length ? `已读取 ${track.timingPoints.length} 个 timing points。` : '已载入，使用音频分析。');

  try {
    setupAudioGraph();
    await audioContext.resume().catch(() => {});
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
    await audioContext.resume().catch(() => {});
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
  markUiAction();
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
    coreFlash = Math.max(coreFlash, 0.74);
  }
  activeEffectPoint = effectPoint;

  const kiaiNow = Boolean(effectPoint?.kiai);
  if (kiaiNow && !lastKiaiState && Math.abs(syncMs - effectPoint.offset) < 1100) {
    triggerStarFountain(1.05, 'kiai-start');
    coreFlash = Math.max(coreFlash, 1);
  }
  lastKiaiState = kiaiNow;

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
    coreFlash = Math.max(coreFlash, 0.92);
    if (kiaiNow || currentDrive > driveAverage + 0.08 || currentRise > Math.max(0.06, riseAverage * 2.4)) {
      triggerStarFountain(kiaiNow ? 0.8 : 0.55, 'strong-downbeat');
    }
  } else {
    beatAccent = Math.max(beatAccent, 0.42);
    beatWindow = Math.max(beatWindow, 0.55);
  }

  handleOsuSideFlashBeat(beatIndex, meter, kiaiNow, timeSinceBeat);
}

function osuSideAlpha(channel, kiai) {
  const amplitudeDeadZone = 0.25;
  const alphaMultiplier = (1 - amplitudeDeadZone) / 0.55;
  const kiaiMultiplier = (1 - amplitudeDeadZone * 0.95) / 0.8;
  const multiplier = kiai ? kiaiMultiplier : alphaMultiplier;
  const originalAlpha = 0.1 + (channel - amplitudeDeadZone) / multiplier;
  const base = kiai ? 0.22 : 0.05;
  const drive = Math.max(channel, lowEnergy * 0.82, currentDrive * 0.64, smoothedEnergy * 0.72);
  const audioLift = Math.sqrt(Math.max(0, drive)) * (kiai ? 0.42 : 0.22);
  const riseLift = Math.min(kiai ? 0.16 : 0.08, currentRise * 1.35);
  const liftedAlpha = base + audioLift + riseLift;
  const floor = kiai ? base : 0;
  return Math.max(floor, Math.min(0.94, Math.max(originalAlpha, liftedAlpha))) * settings.sideIntensity;
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

function flashSide(side, amount, layer = 'soft', reason = 'beat', beatIndex = lastBeatIndex, timeSinceBeat = 0) {
  const clamped = Math.max(layer === 'hard' ? 0.18 : 0.08, Math.min(1.1, amount));
  const now = performance.now();
  const startedAt = now - Math.max(0, timeSinceBeat);
  const hard = layer === 'hard';
  const makeEnvelope = (existing) => ({
    start: startedAt,
    peak: Math.max(clamped, envelopeValue(existing, now) * 0.9),
    beatLength: Math.max(hard ? 420 : 260, (currentBeatLengthMs || 620) * (hard ? 1.1 : 0.82)),
    layer,
  });
  if (side === 'left' || side === 'both') {
    const key = hard ? 'leftHard' : 'leftSoft';
    sideEnvelopes[key] = makeEnvelope(sideEnvelopes[key]);
  }
  if (side === 'right' || side === 'both') {
    const key = hard ? 'rightHard' : 'rightSoft';
    sideEnvelopes[key] = makeEnvelope(sideEnvelopes[key]);
  }
  lightEnergy = Math.max(lightEnergy, clamped * (hard ? 0.78 : 0.42));
  lightSweep = Math.max(lightSweep, clamped * (hard ? 0.86 : 0.48));
  scytheEvents.push({
    at: Number((audio.currentTime || 0).toFixed(3)),
    reason,
    side,
    layer,
    amount: Number(clamped.toFixed(3)),
    beat: beatIndex,
    kiai: Boolean(activeEffectPoint?.kiai),
  });
  scytheEvents = scytheEvents.slice(-36);
}

function handleOsuSideFlashBeat(beatIndex, meter, kiaiTagged, timeSinceBeat = 0) {
  const downbeat = beatIndex % Math.max(1, meter) === 0;
  const activity = Math.max(lowEnergy, midEnergy * 0.82, smoothedEnergy, currentDrive * 0.72);
  const lift = Math.max(0, activity - driveAverage);
  const strongRise = currentRise > Math.max(0.055, riseAverage * (2.25 - settings.sideRestraint * 0.55));
  const strongMoment = downbeat && (kiaiTagged || activity > 0.36 + settings.sideRestraint * 0.12 || lift > 0.1 || strongRise);

  if (kiaiTagged) {
    const layer = strongMoment ? 'hard' : 'soft';
    if (beatIndex % 2 === 0) {
      const amount = osuSideAlpha(leftEnergy, true) * (layer === 'hard' ? 1 : 0.68);
      flashSide('left', amount, layer, `kiai-${layer}-left`, beatIndex, timeSinceBeat);
    } else {
      const amount = osuSideAlpha(rightEnergy, true) * (layer === 'hard' ? 1 : 0.68);
      flashSide('right', amount, layer, `kiai-${layer}-right`, beatIndex, timeSinceBeat);
    }

    if (strongMoment) {
      const bothAmount = Math.max(osuSideAlpha(leftEnergy, true), osuSideAlpha(rightEnergy, true)) * 0.76;
      flashSide('both', bothAmount, 'hard', 'kiai-downbeat-both', beatIndex, timeSinceBeat);
    }
    return;
  }

  if (!downbeat && !(strongRise && activity > 0.31 + settings.sideRestraint * 0.08)) return;

  const enoughPresence = activity > 0.24 + settings.sideRestraint * 0.18 || strongRise;
  if (!enoughPresence) return;

  const layer = strongMoment ? 'hard' : 'soft';
  const side = beatIndex % 2 === 0 ? 'left' : 'right';
  const leftAmount = osuSideAlpha(leftEnergy, false);
  const rightAmount = osuSideAlpha(rightEnergy, false);
  const amount = side === 'left' ? leftAmount : rightAmount;

  if (layer === 'hard') {
    flashSide('both', Math.max(leftAmount, rightAmount) * 0.88, 'hard', 'normal-downbeat-both', beatIndex, timeSinceBeat);
  } else {
    flashSide(side, amount * 0.7, 'soft', `normal-soft-${side}`, beatIndex, timeSinceBeat);
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

function updateLogoAmplitudes(now, elapsed) {
  const decayFactor = elapsed * 0.0024;
  for (let i = 0; i < visualizerBars.length; i += 1) {
    visualizerBars[i] -= decayFactor * (visualizerBars[i] + 0.03);
    if (visualizerBars[i] < 0) visualizerBars[i] = 0;
  }

  if (!freqData || audio.paused || now - lastVisualizerUpdate < 50) return;
  lastVisualizerUpdate = now;

  const kiaiMultiplier = activeEffectPoint?.kiai ? 1 : 0.5;
  for (let i = 0; i < visualizerBars.length; i += 1) {
    const sourceIndex = (i + visualizerOffset) % visualizerBars.length;
    const raw = (freqData[sourceIndex] || 0) / 255;
    const target = Math.max(0, raw - 0.012) * kiaiMultiplier * settings.visualizer;
    if (target > visualizerBars[i]) visualizerBars[i] = Math.min(0.52, target);
  }
  visualizerOffset = (visualizerOffset + 5) % visualizerBars.length;
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

function triggerStarFountain(power = 1, reason = 'kiai') {
  if (settings.fountain <= 0.02) return;
  const now = performance.now();
  const cooldown = reason === 'kiai-start' ? 900 : 2400 - settings.fountain * 520;
  if (now - lastFountainAt < cooldown) return;
  lastFountainAt = now;

  const direction = Math.floor(Math.random() * 3) - 1;
  fountainBursts.push({
    start: now,
    end: now + 760 + power * 180,
    power: power * settings.fountain,
    direction,
    lastSpawn: now - 20,
  });
  fountainBursts = fountainBursts.slice(-4);
}

function updateStarFountains(now, elapsed) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const originOffset = Math.min(260, Math.max(120, width * 0.16));
  const dt = elapsed / 1000;

  for (const burst of fountainBursts) {
    if (now > burst.end) continue;

    const spawnEvery = 1000 / (80 + burst.power * 80);
    while (now - burst.lastSpawn >= spawnEvery) {
      burst.lastSpawn += spawnEvery;
      for (const side of [-1, 1]) {
        const age = burst.lastSpawn - burst.start;
        const progress = Math.max(0, Math.min(1, age / (burst.end - burst.start)));
        const x = side < 0 ? originOffset : width - originOffset;
        const y = height + 18;
        const fan = burst.direction * side * 360 * (1 - progress * 1.8);
        const vx = fan + (Math.random() - 0.5) * 150;
        const vy = -760 - Math.random() * 360 - burst.power * 190;
        starParticles.push({
          x,
          y,
          vx,
          vy,
          gravity: 900,
          age: 0,
          duration: 460 + Math.random() * 640,
          size: 4.2 + Math.random() * 5.8,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 7,
        });
      }
    }
  }

  fountainBursts = fountainBursts.filter((burst) => now <= burst.end);
  for (const particle of starParticles) {
    particle.age += elapsed;
    particle.vy += particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.rotation += particle.spin * dt;
  }
  starParticles = starParticles.filter((particle) => particle.age < particle.duration && particle.y < height + 80);
}

function drawStar(ctx, x, y, radius, rotation, alpha) {
  const inner = radius * 0.46;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? radius : inner;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
  ctx.shadowBlur = 10 + radius * 1.2;
  ctx.fill();
  ctx.restore();
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
  try {
  const now = performance.now();
  const elapsed = Math.min(80, now - lastFrameAt);
  lastFrameAt = now;

  updateAudioEnergy();
  updateLogoAmplitudes(now, elapsed);
  updateTiming();
  updateProgress();
  updateStarFountains(now, elapsed);

  timingPulse *= Math.exp(-elapsed / 88);
  logoPulse *= Math.exp(-elapsed / 102);
  sectionHeat *= Math.exp(-elapsed / 1500);
  beatAccent *= Math.exp(-elapsed / 190);
  beatWindow *= Math.exp(-elapsed / 115);
  coreFlash *= Math.exp(-elapsed / 145);
  lightEnergy *= Math.exp(-elapsed / 420);
  lightSweep *= Math.exp(-elapsed / 260);
  const leftSoft = envelopeValue(sideEnvelopes.leftSoft, now);
  const rightSoft = envelopeValue(sideEnvelopes.rightSoft, now);
  const leftHard = envelopeValue(sideEnvelopes.leftHard, now);
  const rightHard = envelopeValue(sideEnvelopes.rightHard, now);
  leftFlash = Math.max(leftSoft, leftHard);
  rightFlash = Math.max(rightSoft, rightHard);
  for (const key of Object.keys(sideEnvelopes)) {
    if (!envelopeAlive(sideEnvelopes[key], now)) sideEnvelopes[key] = null;
  }

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
  const coreRect = core.getBoundingClientRect();
  const targetFollowX = coreHover ? Math.max(-9, Math.min(9, (pointerX - (coreRect.left + coreRect.width / 2)) * 0.045)) : 0;
  const targetFollowY = coreHover ? Math.max(-9, Math.min(9, (pointerY - (coreRect.top + coreRect.height / 2)) * 0.045)) : 0;
  coreFollowX += (targetFollowX - coreFollowX) * Math.min(1, elapsed / 120);
  coreFollowY += (targetFollowY - coreFollowY) * Math.min(1, elapsed / 120);
  const hoverBoost = coreHover ? 0.045 : 0;
  const coreScale = 1 + (energy * 0.16 + timingPulse * 0.035) * settings.pulse + hoverBoost + earlyDip;
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
    leftSoft,
    rightSoft,
    leftHard,
    rightHard,
    sideEnvelopes,
    beatAccent,
    coreFlash,
    scytheEvents,
    scytheEventCount: scytheEvents.length,
    starParticles: starParticles.length,
    fountainBursts: fountainBursts.length,
    settings,
    paused: audio.paused,
    currentTime: audio.currentTime,
  };
  core.style.transform = `translate(calc(-50% + ${coreFollowX.toFixed(2)}px), calc(-50% + ${coreFollowY.toFixed(2)}px)) scale(${coreScale})`;
  core.style.boxShadow = `0 0 ${54 + energy * 170 + coreFlash * 80}px rgba(255, 72, 169, ${Math.min(0.9, 0.34 + energy * 0.5 + coreFlash * 0.22)})`;

  document.documentElement.style.setProperty('--energy', energy.toFixed(3));
  document.documentElement.style.setProperty('--core-flash', Math.min(1, coreFlash).toFixed(3));
  const visualLight = Math.max(lightEnergy, sectionHeat * 0.12);
  document.documentElement.style.setProperty('--light', Math.min(1.25, visualLight).toFixed(3));
  document.documentElement.style.setProperty('--left', Math.min(1.2, leftEnergy + leftFlash * 0.42 + visualLight * 0.18).toFixed(3));
  document.documentElement.style.setProperty('--right', Math.min(1.2, rightEnergy + rightFlash * 0.42 + visualLight * 0.18).toFixed(3));
  document.documentElement.style.setProperty('--section', sectionHeat.toFixed(3));
  document.documentElement.style.setProperty('--sweep', lightSweep.toFixed(3));
  document.documentElement.style.setProperty('--flash-left', Math.min(1, leftFlash).toFixed(3));
  document.documentElement.style.setProperty('--flash-right', Math.min(1, rightFlash).toFixed(3));
  document.documentElement.style.setProperty('--left-soft', Math.min(1, leftSoft).toFixed(3));
  document.documentElement.style.setProperty('--right-soft', Math.min(1, rightSoft).toFixed(3));
  document.documentElement.style.setProperty('--left-hard', Math.min(1, leftHard).toFixed(3));
  document.documentElement.style.setProperty('--right-hard', Math.min(1, rightHard).toFixed(3));

  const cx = width * 0.5;
  const cy = height * 0.5;
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

  for (const particle of starParticles) {
    const progress = particle.age / particle.duration;
    const alpha = Math.max(0, (1 - progress) * 0.92);
    drawStar(ctx, particle.x, particle.y, particle.size * (1 + progress * 1.25), particle.rotation, alpha);
  }
  } catch (error) {
    window.__visualError = error?.stack || String(error);
  }
}

function drawLogoVisualizer(cx, cy, energy) {
  const bars = visualizerBars.length;
  const visualiserRounds = 5;
  const coreSize = core.getBoundingClientRect().width || Math.min(window.innerWidth, window.innerHeight) * 0.4;
  const baseRadius = coreSize * 0.515;
  const maxBarLength = coreSize * 1.38;
  const barWidth = Math.max(1.25, (Math.PI * 2 * baseRadius) / bars * 0.42);
  const deadZone = 1 / Math.max(1, maxBarLength);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(performance.now() / 14000);
  ctx.lineCap = 'butt';
  for (let round = 0; round < visualiserRounds; round += 1) {
    const roundOffset = (round * Math.PI * 2) / visualiserRounds;
    for (let i = 0; i < bars; i += 1) {
      const amplitude = visualizerBars[i];
      if (amplitude <= deadZone && energy < 0.04) continue;
      const angle = (i / bars) * Math.PI * 2 + roundOffset;
      const length = Math.max(1.5, amplitude * maxBarLength + energy * 5);
      const r1 = baseRadius + 7;
      const r2 = r1 + length;
      const alpha = Math.min(0.56, 0.045 + amplitude * 1.4 + energy * 0.06);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = barWidth;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  touch();
}, { passive: true });
window.addEventListener('keydown', () => touch());
core.addEventListener('click', () => setPanel(app.dataset.panel === 'controls' ? 'idle' : 'controls'));
core.addEventListener('pointerenter', () => {
  coreHover = true;
});
core.addEventListener('pointerleave', () => {
  coreHover = false;
});
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
  if (handleBlankDismiss(event)) return;
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
settingsPanel.addEventListener('pointerdown', () => touch('settings'));

document.querySelector('#open-scan').addEventListener('click', () => setPanel('scan'));
document.querySelector('#open-library').addEventListener('click', () => setPanel(tracks.length ? 'songs' : 'scan'));
document.querySelector('#open-settings').addEventListener('click', () => setPanel('settings'));
minimizeControls.addEventListener('click', () => setPanel('idle'));
document.querySelector('#close-scan').addEventListener('click', () => setPanel('controls'));
document.querySelector('#close-library').addEventListener('click', () => setPanel('controls'));
document.querySelector('#close-settings').addEventListener('click', () => setPanel('controls'));
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

loadSettings();
resize();
draw();
detectOsu();
