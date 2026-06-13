const app = document.querySelector('#app');
window.__appVersion = '20260613-screenshot-defaults';
const canvas = document.querySelector('#stage');
const ctx = canvas.getContext('2d');
const background = document.querySelector('#background');
const core = document.querySelector('#core');
const coreAura = document.querySelector('#core-aura');
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
const settingsInputs = Object.fromEntries([...document.querySelectorAll('[data-setting]')].map((input) => [input.dataset.setting, input]));
const settingsNumberInputs = Object.fromEntries([...document.querySelectorAll('[data-setting-number]')].map((input) => [input.dataset.settingNumber, input]));
const settingsColorInputs = Object.fromEntries([...document.querySelectorAll('[data-setting-color]')].map((input) => [input.dataset.settingColor, input]));
const settingsColorValues = Object.fromEntries([...document.querySelectorAll('[data-setting-color-value]')].map((item) => [item.dataset.settingColorValue, item]));
const resetSettingsButton = document.querySelector('#reset-settings');

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
let audioAmplitude = 0;
let amplitudeAverage = 0;
let coreBreath = 0;
let coreTargetBreath = 0;
let auraBreath = 0;
let calmWindow = 0;
let lastRippleAt = -10000;
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
let rippleRings = [];
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
let coreGhostScale = 1;
let lastVisualizerUpdate = 0;
let visualizerOffset = 0;
let lastAudioFountainAt = -10000;
const cssVarCache = new Map();
const textCache = new WeakMap();

const visualizerBars = new Float32Array(200);
const previousVisualizerBins = new Float32Array(200);
const maxStarParticles = 220;
const maxStarSpawnsPerFrame = 18;
const starPath = createStarPath();
const hollowStarPath = createStarPath(0.58);
const defaultSettings = {
  sideIntensity: 1,
  sideRestraint: 1,
  pulse: 1.6,
  coreGlow: 0.6,
  coreGlowColor: '#ffffff',
  ghostIntensity: 0.8,
  ghostSize: 0,
  ghostLag: 0.1,
  ghostBlur: 0.1,
  visualizer: 5.4,
  visualizerRange: 2.6,
  visualizerContrast: 1.2,
  visualizerDecay: 1.3,
  waveSize: 0.8,
  waveIntensity: 2,
  fountain: 1.6,
  starGlow: 0.5,
  fountainSensitivity: 3.1,
};
const settings = { ...defaultSettings };

const idleAfterMs = 6000;
const sideFlashEarlyMs = 65;
const blankDismissDelayMs = 300;
const settingsKey = 'osu-visual-shell-settings-v10';

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

function clampSettingValue(key, value) {
  const rangeInput = settingsInputs[key];
  const numberInput = settingsNumberInputs[key];
  const min = Number(rangeInput?.min ?? numberInput?.min ?? Number.NEGATIVE_INFINITY);
  const max = Number(rangeInput?.max ?? numberInput?.max ?? Number.POSITIVE_INFINITY);
  const fallback = defaultSettings[key] ?? 1;
  const numeric = Number.isFinite(Number(value)) ? Number(value) : fallback;
  return Math.min(max, Math.max(min, numeric));
}

function formatSettingValue(key, value) {
  const precision = Number(settingsNumberInputs[key]?.dataset.precision ?? 1);
  return Number(value).toFixed(precision);
}

function writeSettingInputs(key, options = {}) {
  if (!settingsInputs[key] && !settingsNumberInputs[key]) return;
  const value = clampSettingValue(key, settings[key]);
  settings[key] = value;
  if (settingsInputs[key]) settingsInputs[key].value = String(value);
  if (settingsNumberInputs[key]) {
    settingsNumberInputs[key].value = options.preserveNumberInput ? String(value) : formatSettingValue(key, value);
  }
}

function persistSetting(key, value, options = {}) {
  settings[key] = clampSettingValue(key, value);
  writeSettingInputs(key, options);
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  touch('settings');
}

function normaliseHexColour(value, fallback = '#ff48a9') {
  const text = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback;
}

function hexToRgb(value) {
  const hex = normaliseHexColour(value).slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function writeColourInput(key) {
  const value = normaliseHexColour(settings[key], defaultSettings[key]);
  settings[key] = value;
  if (settingsColorInputs[key]) settingsColorInputs[key].value = value;
  if (settingsColorValues[key]) settingsColorValues[key].textContent = value;
}

function persistColourSetting(key, value) {
  settings[key] = normaliseHexColour(value, defaultSettings[key]);
  writeColourInput(key);
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  touch('settings');
}

function setCssVar(name, value) {
  if (cssVarCache.get(name) === value) return;
  cssVarCache.set(name, value);
  document.documentElement.style.setProperty(name, value);
}

function setText(node, value) {
  if (!node || textCache.get(node) === value) return;
  textCache.set(node, value);
  node.textContent = value;
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
    writeSettingInputs(key);
    input.addEventListener('input', () => persistSetting(key, input.value));
  }

  for (const [key, input] of Object.entries(settingsNumberInputs)) {
    if (!input) continue;
    writeSettingInputs(key);
    input.addEventListener('input', () => persistSetting(key, input.value, { preserveNumberInput: true }));
    input.addEventListener('change', () => persistSetting(key, input.value));
  }

  for (const [key, input] of Object.entries(settingsColorInputs)) {
    if (!input) continue;
    writeColourInput(key);
    input.addEventListener('input', () => persistColourSetting(key, input.value));
  }

  resetSettingsButton?.addEventListener('click', () => {
    Object.assign(settings, defaultSettings);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    Object.keys(settingsInputs).forEach(writeSettingInputs);
    Object.keys(settingsColorInputs).forEach(writeColourInput);
    touch('settings');
  });
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
  audioAmplitude = 0;
  amplitudeAverage = 0;
  coreBreath = 0;
  coreTargetBreath = 0;
  auraBreath = 0;
  coreGhostScale = 1;
  calmWindow = 0;
  scytheEvents = [];
  starParticles = [];
  fountainBursts = [];
  rippleRings = [];
  lastKiaiState = false;
  lastFountainAt = -10000;
  lastAudioFountainAt = -10000;
  lastRippleAt = -10000;
  visualizerBars.fill(0);
  previousVisualizerBins.fill(0);
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
    beatAccent = Math.max(beatAccent, 0.46);
    coreFlash = Math.max(coreFlash, 0.28);
  }
  activeEffectPoint = effectPoint;

  const kiaiNow = Boolean(effectPoint?.kiai);
  if (kiaiNow && !lastKiaiState && Math.abs(syncMs - effectPoint.offset) < 500) {
    maybeTriggerStarFountain(1.05, 'kiai-start');
    coreFlash = Math.max(coreFlash, 0.72);
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
  timingPulse = Math.max(timingPulse, 0.18 + amplitudeAdjust * 0.2);
  logoPulse = Math.max(logoPulse, 0.12 + amplitudeAdjust * 0.18);

  const meter = Math.max(1, point.meter || 4);
  if (beatIndex % meter === 0) {
    sectionHeat = Math.max(sectionHeat, 0.78);
    beatAccent = Math.max(beatAccent, 1);
    beatWindow = 1;
    coreFlash = Math.max(coreFlash, 0.58);
    spawnRipple(0.7 + amplitudeAdjust * 0.45, 'downbeat');
    maybeTriggerStarFountain(kiaiNow ? 0.52 : 0.42, 'audio-fallback');
  } else {
    beatAccent = Math.max(beatAccent, 0.42);
    beatWindow = Math.max(beatWindow, 0.55);
    if (currentRise > Math.max(0.075, riseAverage * 2.8) && currentDrive > driveAverage + 0.12) {
      spawnRipple(0.36 + amplitudeAdjust * 0.28, 'audio-rise');
    }
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
  return Math.max(floor, Math.min(0.94, Math.max(originalAlpha, liftedAlpha))) * Math.max(0, settings.sideIntensity);
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
    audioAmplitude *= 0.94;
    coreTargetBreath *= 0.9;
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
  const peak = Math.max(low, mid, left, right);
  audioAmplitude = audioAmplitude * 0.82 + peak * 0.18;
  amplitudeAverage = amplitudeAverage * 0.992 + audioAmplitude * 0.008;
  const overAverage = Math.max(0, audioAmplitude - Math.max(0.08, amplitudeAverage * 0.92));
  coreTargetBreath = Math.min(1.45, Math.pow(Math.max(0, overAverage) * 2.85 + positiveRise * 6.2, 0.68));

  if (drive < Math.max(0.08, driveAverage * 0.7) && audioAmplitude < Math.max(0.12, amplitudeAverage * 0.82)) {
    calmWindow = Math.min(1.6, calmWindow + 0.032);
  } else {
    calmWindow *= 0.985;
  }

  if (lowRise > 0.06 && low > 0.22) {
    logoPulse = Math.max(logoPulse, Math.min(1.2, low * 1.3));
  }

  const track = tracks[activeIndex];
  const hasTiming = Boolean(track?.timingPoints?.length);
  if (!hasTiming && positiveRise > Math.max(0.065, riseAverage * 2.3) && drive > Math.max(0.24, driveAverage + 0.08)) {
    spawnRipple(0.5 + Math.min(0.5, drive), 'audio-fallback');
    maybeTriggerStarFountain(0.46, 'audio-fallback');
  }

  lastLow = low;
  lastMid = mid;
  lastDrive = drive;
}

function updateLogoAmplitudes(now, elapsed) {
  const decayFactor = elapsed * 0.0024 * Math.max(0.05, settings.visualizerDecay);
  for (let i = 0; i < visualizerBars.length; i += 1) {
    visualizerBars[i] -= decayFactor * (visualizerBars[i] + 0.03);
    if (visualizerBars[i] < 0) visualizerBars[i] = 0;
  }

  if (!freqData || audio.paused || now - lastVisualizerUpdate < 32) return;
  lastVisualizerUpdate = now;

  const kiaiMultiplier = activeEffectPoint?.kiai ? 1 : 0.5;
  const dynamicRange = 0.08 + Math.max(0.04, amplitudeAverage) * 1.05;
  const userScale = 0.66 + Math.max(0, settings.visualizer) * 0.34;
  const noiseFloor = Math.max(0.034, amplitudeAverage * 0.28);
  const contrast = Math.max(0.1, settings.visualizerContrast || 1.6);
  const startupLimiter = Math.min(1, Math.max(0.18, (audio.currentTime || 0) / 2.8));
  const attackLimit = (0.028 + Math.min(0.09, audioAmplitude * 0.11)) * (activeEffectPoint?.kiai ? 1.25 : 1);
  const candidates = [];

  for (let i = 0; i < visualizerBars.length; i += 1) {
    const sourceIndex = (i + visualizerOffset) % visualizerBars.length;
    const raw = (freqData[sourceIndex] || 0) / 255;
    const prev = (freqData[(sourceIndex + freqData.length - 2) % freqData.length] || 0) / 255;
    const next = (freqData[(sourceIndex + 2) % freqData.length] || 0) / 255;
    const localAverage = (prev + next) * 0.5;
    const localPeak = raw > prev * 1.04 && raw >= next * 0.98;
    const freshLift = Math.max(0, raw - previousVisualizerBins[i]);
    const peak = Math.max(0, raw - localAverage * 0.72 - noiseFloor + freshLift * 0.42);
    previousVisualizerBins[i] = raw;
    if (!localPeak || peak <= 0) continue;
    const normalised = peak / dynamicRange;
    const compressed = Math.min(1, normalised);
    const shaped = Math.pow(compressed, contrast);
    const target = Math.min(0.82, shaped * (0.42 + contrast * 0.12) * kiaiMultiplier * userScale * startupLimiter);
    if (target > visualizerBars[i]) candidates.push({ index: i, target, score: target + freshLift * 0.5 });
  }

  candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, activeEffectPoint?.kiai ? 34 : 24)
    .forEach(({ index, target }) => {
      visualizerBars[index] = Math.min(target, visualizerBars[index] + attackLimit);
    });

  for (let i = 1; i < visualizerBars.length - 1; i += 1) {
    const neighbourCap = Math.max(visualizerBars[i - 1], visualizerBars[i + 1]) * 0.92;
    if (visualizerBars[i] > neighbourCap && visualizerBars[i] < 0.08) visualizerBars[i] *= 0.86;
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

function createStarPath(innerRatio = 0.5) {
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

function spawnRipple(power = 0.6, reason = 'beat') {
  const now = performance.now();
  if (now - lastRippleAt < 140) return;
  lastRippleAt = now;
  rippleRings.push({
    start: now,
    duration: 980 + power * 520,
    power,
    reason,
  });
  rippleRings = rippleRings.slice(-10);
}

function maybeTriggerStarFountain(power = 1, reason = 'kiai') {
  const trackTime = audio.currentTime || 0;
  if (reason === 'kiai-start') {
    triggerStarFountain(power, reason);
    return;
  }

  const track = tracks[activeIndex];
  const hasKiaiMarkers = Boolean(track?.timingPoints?.some((point) => point.kiai));
  if (hasKiaiMarkers || trackTime < 10) return;

  const now = performance.now();
  if (now - lastAudioFountainAt < 6500) return;

  const sensitivity = Math.max(0.1, settings.fountainSensitivity || 2);
  const meaningfulRise = currentRise > Math.max(0.042, riseAverage * (1.9 / sensitivity));
  const suddenReturn = calmWindow > 0.32 / sensitivity && meaningfulRise && currentDrive > Math.max(0.26, driveAverage + 0.08 / sensitivity);
  const strongLift = currentDrive > Math.max(0.34, driveAverage + 0.16 / sensitivity) && currentRise > Math.max(0.055, riseAverage * 2.1 / sensitivity);

  if (!suddenReturn && !strongLift) return;
  lastAudioFountainAt = now;
  triggerStarFountain(power * (suddenReturn ? 1.05 : 0.82), reason);
}

function triggerStarFountain(power = 1, reason = 'kiai') {
  if (settings.fountain <= 0.02) return;
  const now = performance.now();
  const cooldown = reason === 'kiai-start' ? 900 : 2200 - settings.fountain * 280;
  if (now - lastFountainAt < cooldown) return;
  lastFountainAt = now;

  const direction = Math.floor(Math.random() * 3) - 1;
  fountainBursts.push({
    start: now,
    end: now + 720 + power * 170,
    power: Math.min(1.9, power * settings.fountain),
    direction,
    lastSpawn: now - 20,
  });
  fountainBursts = fountainBursts.slice(-2);
}

function updateStarFountains(now, elapsed) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const originOffset = Math.min(260, Math.max(120, width * 0.16));
  const dt = elapsed / 1000;
  let spawnsThisFrame = 0;

  for (const burst of fountainBursts) {
    if (now > burst.end) continue;

    const pressure = starParticles.length / maxStarParticles;
    const spawnEvery = 1000 / Math.max(56, (78 + burst.power * 58) * (1 - pressure * 0.42));
    while (now - burst.lastSpawn >= spawnEvery && spawnsThisFrame < maxStarSpawnsPerFrame && starParticles.length < maxStarParticles) {
      burst.lastSpawn += spawnEvery;
      for (const side of [-1, 1]) {
        if (spawnsThisFrame >= maxStarSpawnsPerFrame || starParticles.length >= maxStarParticles) break;
        const age = burst.lastSpawn - burst.start;
        const progress = Math.max(0, Math.min(1, age / (burst.end - burst.start)));
        const x = side < 0 ? originOffset : width - originOffset;
        const y = height + 18;
        const fan = burst.direction * side * 360 * (1 - progress * 1.8);
        const vx = fan + (Math.random() - 0.5) * 150;
        const vy = -1020 - Math.random() * 460 - burst.power * 260;
        starParticles.push({
          x,
          y,
          vx,
          vy,
          gravity: 980,
          age: 0,
          duration: 560 + Math.random() * 620,
          size: 9 + Math.random() * 9,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 5.5,
          hollow: Math.random() < 0.34,
        });
        spawnsThisFrame += 1;
      }
    }
  }

  fountainBursts = fountainBursts.filter((burst) => now <= burst.end);
  let writeIndex = 0;
  for (let i = 0; i < starParticles.length; i += 1) {
    const particle = starParticles[i];
    particle.age += elapsed;
    particle.vy += particle.gravity * dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.rotation += particle.spin * dt;
    if (particle.age < particle.duration && particle.y < height + 80) {
      starParticles[writeIndex] = particle;
      writeIndex += 1;
    }
  }
  starParticles.length = writeIndex;
}

function drawStar(ctx, x, y, radius, rotation, alpha, hollow = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(radius, radius);
  ctx.globalAlpha = alpha;
  if (hollow) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.18;
    ctx.lineJoin = 'round';
    ctx.stroke(hollowStarPath);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fill(starPath);
  }
  ctx.restore();
}

function drawStarGlow(ctx, x, y, radius, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRippleRings(cx, cy, coreSize, now) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'lighter';
  for (const ring of rippleRings) {
    const progress = Math.max(0, Math.min(1, (now - ring.start) / ring.duration));
    const eased = 1 - Math.pow(1 - progress, 2.05);
    const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.67 * Math.max(0.05, settings.waveSize);
    const radius = coreSize * 0.46 + eased * maxRadius;
    const fade = Math.pow(1 - progress, 1.06);
    const alpha = fade * (0.34 + ring.power * 0.28) * Math.max(0, settings.waveIntensity);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.74})`);
    gradient.addColorStop(0.24, `rgba(255, 255, 255, ${alpha * 0.36})`);
    gradient.addColorStop(0.58, `rgba(255, 255, 255, ${alpha * 0.13})`);
    gradient.addColorStop(0.82, `rgba(255, 255, 255, ${alpha * 0.035})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  rippleRings = rippleRings.filter((ring) => now - ring.start < ring.duration);
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
  const currentText = formatTime(current);
  setText(timeCurrent, currentText);
  setText(timeTotal, formatTime(duration));
  setText(miniTime, currentText);
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
  coreBreath += (coreTargetBreath - coreBreath) * Math.min(1, elapsed / 180);
  auraBreath += (coreBreath - auraBreath) * Math.min(1, elapsed / 680);
  coreTargetBreath *= Math.exp(-elapsed / 420);
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

  const beatMotion = !audio.paused ? continuousBeat * 0.015 : 0;
  const energy = Math.max(smoothedEnergy * 1.08, logoPulse * 0.34, coreBreath * 0.92, beatMotion);
  const earlyDip = timingPulse > 0.5 ? -0.005 * Math.min(1, timingPulse) : 0;
  const coreSize = core.offsetWidth || Math.min(width, height) * 0.66;
  const targetFollowX = coreHover ? Math.max(-9, Math.min(9, (pointerX - width / 2) * 0.045)) : 0;
  const targetFollowY = coreHover ? Math.max(-9, Math.min(9, (pointerY - height / 2) * 0.045)) : 0;
  coreFollowX += (targetFollowX - coreFollowX) * Math.min(1, elapsed / 120);
  coreFollowY += (targetFollowY - coreFollowY) * Math.min(1, elapsed / 120);
  const hoverBoost = coreHover ? 0.045 : 0;
  const coreScale = 1 + (coreBreath * 0.092 + energy * 0.045 + timingPulse * 0.006) * settings.pulse + hoverBoost + earlyDip;
  const ghostLag = Math.max(0.1, settings.ghostLag || 1.35);
  coreGhostScale += (coreScale - coreGhostScale) * Math.min(1, elapsed / (420 * ghostLag));
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
    coreBreath,
    auraBreath,
    coreGhostScale,
    audioAmplitude,
    amplitudeAverage,
    calmWindow,
    scytheEvents,
    scytheEventCount: scytheEvents.length,
    starParticles: starParticles.length,
    fountainBursts: fountainBursts.length,
    settings,
    paused: audio.paused,
    currentTime: audio.currentTime,
  };
  const coreTransform = `translate(calc(-50% + ${coreFollowX.toFixed(2)}px), calc(-50% + ${coreFollowY.toFixed(2)}px)) scale(${coreScale.toFixed(4)})`;
  if (core.style.transform !== coreTransform) core.style.transform = coreTransform;
  if (coreAura) {
    const ghostSize = Math.max(0.05, 1 + (settings.ghostSize ?? 0));
    const relativeGhostScale = Math.max(0.2, (coreGhostScale / Math.max(0.2, coreScale)) * ghostSize * (1.025 + auraBreath * 0.12));
    const ghostTransform = `scale(${relativeGhostScale.toFixed(4)})`;
    if (coreAura.style.transform !== ghostTransform) coreAura.style.transform = ghostTransform;
  }
  const glow = Math.max(0, settings.coreGlow || 0);
  const glowColour = hexToRgb(settings.coreGlowColor);
  const outerGlowAlpha = Math.min(0.9, (0.34 + energy * 0.5 + coreFlash * 0.22) * glow);
  const innerGlowAlpha = Math.min(0.5, (0.08 + coreFlash * 0.18) * glow);
  const innerGlowSize = (18 + coreFlash * 28).toFixed(1);
  const coreShadow = glow <= 0.001
    ? 'none'
    : `0 0 ${(54 + energy * 170 + coreFlash * 80).toFixed(1)}px rgba(${glowColour.r}, ${glowColour.g}, ${glowColour.b}, ${outerGlowAlpha.toFixed(3)}), inset 0 0 ${innerGlowSize}px rgba(255, 255, 255, ${innerGlowAlpha.toFixed(3)})`;
  if (core.style.boxShadow !== coreShadow) core.style.boxShadow = coreShadow;

  setCssVar('--energy', energy.toFixed(2));
  setCssVar('--core-flash', Math.min(1, coreFlash).toFixed(2));
  setCssVar('--core-breath', Math.min(1.2, coreBreath).toFixed(2));
  setCssVar('--aura-breath', Math.min(1.2, auraBreath).toFixed(2));
  setCssVar('--ghost-intensity', Math.max(0, settings.ghostIntensity || 0).toFixed(3));
  setCssVar('--ghost-blur', Math.max(0, settings.ghostBlur || 0).toFixed(3));
  const visualLight = Math.max(lightEnergy, sectionHeat * 0.12);
  setCssVar('--light', Math.min(1.25, visualLight).toFixed(2));
  setCssVar('--left', Math.min(1.2, leftEnergy + leftFlash * 0.42 + visualLight * 0.18).toFixed(2));
  setCssVar('--right', Math.min(1.2, rightEnergy + rightFlash * 0.42 + visualLight * 0.18).toFixed(2));
  setCssVar('--section', sectionHeat.toFixed(2));
  setCssVar('--sweep', lightSweep.toFixed(2));
  setCssVar('--flash-left', Math.min(1, leftFlash).toFixed(2));
  setCssVar('--flash-right', Math.min(1, rightFlash).toFixed(2));
  setCssVar('--left-soft', Math.min(1, leftSoft).toFixed(2));
  setCssVar('--right-soft', Math.min(1, rightSoft).toFixed(2));
  setCssVar('--left-hard', Math.min(1, leftHard).toFixed(2));
  setCssVar('--right-hard', Math.min(1, rightHard).toFixed(2));

  const cx = width * 0.5;
  const cy = height * 0.5;
  drawRippleRings(cx + coreFollowX, cy + coreFollowY, coreSize, now);
  drawLogoVisualizer(cx + coreFollowX, cy + coreFollowY, coreSize);

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

  const starGlow = Math.max(0, settings.starGlow || 0);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const particle of starParticles) {
    const progress = particle.age / particle.duration;
    const alpha = Math.max(0, (1 - progress) * 0.2 * starGlow);
    drawStarGlow(ctx, particle.x, particle.y, particle.size * (2.1 + progress * 1.8), alpha);
  }
  ctx.restore();

  for (const particle of starParticles) {
    const progress = particle.age / particle.duration;
    const alpha = Math.max(0, (1 - progress) * 0.92);
    drawStar(ctx, particle.x, particle.y, particle.size * (1 + progress * 1.1), particle.rotation, alpha, particle.hollow);
  }
  } catch (error) {
    window.__visualError = error?.stack || String(error);
  }
}

function drawLogoVisualizer(cx, cy, coreSize) {
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
window.addEventListener('pointerdown', (event) => {
  handleBlankDismiss(event);
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
document.querySelector('#prev').addEventListener('click', (event) => runTransport(event, () => stepTrack(-1)));
playButton.addEventListener('click', (event) => runTransport(event, togglePlay));
document.querySelector('#next').addEventListener('click', (event) => runTransport(event, () => stepTrack(1)));
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
