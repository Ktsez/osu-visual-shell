import { defaultSettings, settingsKey } from '../ui/settings.js';

export function startVisualShell() {
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
const languageSelect = document.querySelector('#language-select');
const performanceModeSelect = document.querySelector('#performance-mode');
const topTitle = document.querySelector('#top-title');
const topMeta = document.querySelector('#top-meta');
const topPlayButton = document.querySelector('#top-play');

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
let visualizerPrimed = false;
let adaptiveQuality = 0;
let frameAverageMs = 16.7;
let drawVisualizerAvgMs = 0;
let lastAudioFountainAt = -10000;
let ambientToken = 0;
let sideMode = 'idle';
let sideModeUntil = 0;
const cssVarCache = new Map();
const textCache = new WeakMap();

const visualizerBars = new Float32Array(200);
const previousVisualizerBins = new Float32Array(200);
const starPath = createStarPath();
const hollowStarPath = createStarPath(0.58);
const starSpriteCache = new Map();
const starGlowSpriteCache = new Map();
const settings = { ...defaultSettings };
let activeLanguage = 'zh';
let statusState = { key: 'readyStatus', values: {} };

const i18n = {
  zh: {
    appTitle: 'osu! 视觉播放器',
    appAria: '视觉播放器',
    topBarAria: '播放状态栏',
    quickActions: '快捷操作',
    openControls: '打开音乐控制',
    musicControls: '音乐控制',
    clickOpen: '点击打开',
    ready: '就绪',
    loading: '已载入',
    playing: '播放中',
    paused: '已暂停',
    waiting: '待播放',
    noTrack: '未选择歌曲',
    scanPrompt: '请先扫描本地曲库',
    minimize: '最小化',
    previous: '上一首',
    play: '播放',
    pause: '暂停',
    next: '下一首',
    scan: '扫描',
    library: '歌曲列表',
    settings: '设置',
    progress: '歌曲进度',
    readyStatus: '就绪。可以检测本地 osu! Songs。',
    scanFolder: '扫描文件夹',
    librarySource: '曲库来源',
    close: '关闭',
    folderPath: '文件夹路径',
    folderPlaceholder: 'C:\\Users\\You\\AppData\\Local\\osu!\\Songs',
    detectOsu: '检测 osu!',
    scanOsu: '扫描 osu! Songs',
    scanLazer: '扫描 osu!lazer',
    scanMusic: '扫描普通音乐',
    chooseSong: '选择歌曲',
    songs: '歌曲',
    songCount: '{count} 首',
    scanning: '扫描中',
    filterSongs: '筛选歌曲',
    songList: '歌曲列表',
    visualSettings: '视觉设置',
    language: '语言',
    languageAuto: '自动',
    performanceMode: '性能模式',
    performanceAuto: '自动',
    performanceQuality: '质量',
    performanceBalanced: '平衡',
    performancePerformance: '性能',
    sideIntensity: '侧灯强度',
    sideRestraint: '侧灯克制',
    pulse: '圆盘律动',
    coreGlow: '圆盘光晕强度',
    coreGlowColor: '圆盘光晕颜色',
    ghostIntensity: '圆盘留影强度',
    ghostSize: '圆盘留影大小',
    ghostLag: '圆盘留影延迟',
    ghostBlur: '圆盘留影虚化',
    visualizer: '能量柱长度',
    visualizerRange: '能量柱范围',
    visualizerContrast: '能量柱比例',
    visualizerDecay: '能量柱缓降',
    waveSize: '冲击波大小',
    waveIntensity: '冲击波强度',
    fountain: '星星喷泉',
    starGlow: '星星光晕',
    fountainSensitivity: '喷泉灵敏度',
    resetSettings: '重置所有参数',
    foundOsu: '找到 osu! Songs：{path}',
    foundLazer: '找到 osu!lazer 数据目录：{path}',
    foundBothOsu: '找到 osu! Songs 和 osu!lazer，当前使用：{path}',
    noOsu: '没有自动找到 osu! 或 osu!lazer。可以手动粘贴路径。',
    missingPath: '请先填写文件夹路径。',
    scanningOsu: '正在扫描 osu! 谱面...',
    scanningLazer: '正在扫描 osu!lazer 曲库...',
    scanningMusic: '正在扫描普通音乐...',
    loadedTracks: '已载入 {count} 首歌曲，合并了 {duplicates} 个重复难度/重复音频。',
    noPlayable: '没有找到可播放音乐。',
    requestFailed: '请求失败',
    beatSync: '节拍同步',
    audioSync: '音频同步',
    loadedTiming: '已读取 {count} 个 timing points。',
    loadedAudio: '已载入，使用音频分析。',
    playingTiming: '播放中，已同步 {count} 个 timing points。',
    playingAudio: '播放中，使用音频分析。',
    unlockAudio: '请点击播放以解锁音频分析。',
    audioBlocked: '音频播放被浏览器拦截，请再点一次播放。',
  },
  en: {
    appTitle: 'osu! Visual Shell',
    appAria: 'visual player',
    topBarAria: 'playback status bar',
    quickActions: 'quick actions',
    openControls: 'open music controls',
    musicControls: 'Music Controls',
    clickOpen: 'click to open',
    ready: 'ready',
    loading: 'loaded',
    playing: 'playing',
    paused: 'paused',
    waiting: 'waiting',
    noTrack: 'No track selected',
    scanPrompt: 'Scan a local library first',
    minimize: 'Minimize',
    previous: 'Previous',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    scan: 'Scan',
    library: 'Library',
    settings: 'Settings',
    progress: 'Track progress',
    readyStatus: 'Ready. You can detect local osu! Songs.',
    scanFolder: 'scan folder',
    librarySource: 'Library Source',
    close: 'Close',
    folderPath: 'Folder path',
    folderPlaceholder: 'C:\\Users\\You\\AppData\\Local\\osu!\\Songs',
    detectOsu: 'Detect osu!',
    scanOsu: 'Scan osu! Songs',
    scanLazer: 'Scan osu!lazer',
    scanMusic: 'Scan music folder',
    chooseSong: 'choose track',
    songs: 'Songs',
    songCount: '{count} songs',
    scanning: 'Scanning',
    filterSongs: 'Filter songs',
    songList: 'song list',
    visualSettings: 'Visual Settings',
    language: 'Language',
    languageAuto: 'Auto',
    performanceMode: 'Performance Mode',
    performanceAuto: 'Auto',
    performanceQuality: 'Quality',
    performanceBalanced: 'Balanced',
    performancePerformance: 'Performance',
    sideIntensity: 'Side light intensity',
    sideRestraint: 'Side light restraint',
    pulse: 'Core pulse',
    coreGlow: 'Core glow intensity',
    coreGlowColor: 'Core glow color',
    ghostIntensity: 'Core ghost intensity',
    ghostSize: 'Core ghost size',
    ghostLag: 'Core ghost delay',
    ghostBlur: 'Core ghost blur',
    visualizer: 'Visualizer length',
    visualizerRange: 'Visualizer range',
    visualizerContrast: 'Visualizer contrast',
    visualizerDecay: 'Visualizer decay',
    waveSize: 'Wave size',
    waveIntensity: 'Wave intensity',
    fountain: 'Star fountain',
    starGlow: 'Star glow',
    fountainSensitivity: 'Fountain sensitivity',
    resetSettings: 'Reset all parameters',
    foundOsu: 'Found osu! Songs: {path}',
    foundLazer: 'Found osu!lazer data: {path}',
    foundBothOsu: 'Found osu! Songs and osu!lazer. Current path: {path}',
    noOsu: 'No osu! or osu!lazer folder was detected. You can paste a path manually.',
    missingPath: 'Please enter a folder path first.',
    scanningOsu: 'Scanning osu! beatmaps...',
    scanningLazer: 'Scanning osu!lazer library...',
    scanningMusic: 'Scanning local music...',
    loadedTracks: 'Loaded {count} songs and merged {duplicates} duplicate difficulties/audio files.',
    noPlayable: 'No playable music was found.',
    requestFailed: 'Request failed',
    beatSync: 'beat sync',
    audioSync: 'audio sync',
    loadedTiming: 'Loaded {count} timing points.',
    loadedAudio: 'Loaded. Using audio analysis.',
    playingTiming: 'Playing with {count} timing points synced.',
    playingAudio: 'Playing with audio analysis.',
    unlockAudio: 'Click play to unlock audio analysis.',
    audioBlocked: 'Audio playback was blocked by the browser. Click play again.',
  },
};

const idleAfterMs = 3000;
const sideFlashEarlyMs = 65;
const blankDismissDelayMs = 300;

function touch(panel = null) {
  lastInteraction = performance.now();
  document.body.classList.remove('is-idle');
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

function browserLanguage() {
  const language = `${navigator.language || navigator.userLanguage || ''}`.toLowerCase();
  return language.startsWith('zh') ? 'zh' : 'en';
}

function normaliseLanguageChoice(value) {
  return value === 'zh' || value === 'en' || value === 'auto' ? value : 'auto';
}

function normalisePerformanceMode(value) {
  return ['auto', 'quality', 'balanced', 'performance'].includes(value) ? value : 'auto';
}

function resolveLanguage() {
  const choice = normaliseLanguageChoice(settings.language);
  return choice === 'auto' ? browserLanguage() : choice;
}

function performanceProfile() {
  const requested = normalisePerformanceMode(settings.performanceMode);
  const autoStep = requested === 'auto' ? adaptiveQuality : 0;
  const mode = requested === 'auto'
    ? (autoStep >= 2 ? 'performance' : autoStep >= 1 ? 'balanced' : 'quality')
    : requested;
  const profiles = {
    quality: {
      mode,
      maxDpr: 1.6,
      visualizerRounds: 5,
      visualizerStep: 1,
      drawPaleBars: true,
      starMax: 180,
      starSpawns: 14,
      starGlowEvery: 1,
      particleMax: 260,
    },
    balanced: {
      mode,
      maxDpr: 1.25,
      visualizerRounds: 4,
      visualizerStep: 1,
      drawPaleBars: true,
      starMax: 120,
      starSpawns: 10,
      starGlowEvery: 2,
      particleMax: 190,
    },
    performance: {
      mode,
      maxDpr: 1,
      visualizerRounds: 3,
      visualizerStep: 2,
      drawPaleBars: false,
      starMax: 80,
      starSpawns: 7,
      starGlowEvery: 3,
      particleMax: 140,
    },
  };
  return profiles[mode] || profiles.balanced;
}

function updateAdaptiveQuality(elapsed) {
  frameAverageMs = frameAverageMs * 0.94 + elapsed * 0.06;
  if (settings.performanceMode !== 'auto') {
    adaptiveQuality = 0;
    return;
  }
  if (frameAverageMs > 24) adaptiveQuality = Math.min(2, adaptiveQuality + 0.035);
  else if (frameAverageMs < 17.4) adaptiveQuality = Math.max(0, adaptiveQuality - 0.01);
}

function text(key, values = {}) {
  const template = i18n[activeLanguage]?.[key] || i18n.en[key] || key;
  return template.replace(/\{(\w+)}/g, (_, name) => values[name] ?? '');
}

function setStatusKey(key, values = {}) {
  statusState = { key, values };
  setStatus(text(key, values));
}

function syncTransportLabels() {
  const key = audio.paused ? 'play' : 'pause';
  const label = text(key);
  setText(playButton, label);
  setText(topPlayButton, label);
  playButton?.setAttribute('aria-label', label);
  topPlayButton?.setAttribute('aria-label', label);
}

function syncTrackText() {
  const track = tracks[activeIndex];
  if (track) {
    setText(trackTitle, track.title);
    setText(topTitle, track.title);
    const meta = `${track.artist}${track.version ? ` / ${track.version}` : ''}`;
    setText(trackMeta, meta);
    setText(topMeta, meta);
    return;
  }
  setText(trackTitle, text('noTrack'));
  setText(topTitle, text('noTrack'));
  setText(trackMeta, text('scanPrompt'));
  setText(topMeta, text('scanPrompt'));
}

function applyLanguage() {
  activeLanguage = resolveLanguage();
  document.documentElement.lang = activeLanguage === 'zh' ? 'zh-CN' : 'en';
  document.title = text('appTitle');
  document.querySelectorAll('[data-i18n]').forEach((node) => setText(node, text(node.dataset.i18n)));
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.setAttribute('placeholder', text(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    node.setAttribute('aria-label', text(node.dataset.i18nAria));
  });
  if (languageSelect) languageSelect.value = normaliseLanguageChoice(settings.language);
  if (performanceModeSelect) performanceModeSelect.value = normalisePerformanceMode(settings.performanceMode);
  syncTransportLabels();
  syncTrackText();
  setStatus(text(statusState.key, statusState.values));
  if (activeIndex === -1) {
    setText(coreSubtitle, text('clickOpen'));
    setText(miniState, text('ready'));
  }
  renderList();
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    Object.assign(settings, saved);
  } catch {
    // Keep defaults when local storage contains invalid data.
  }
  settings.language = normaliseLanguageChoice(settings.language);
  settings.performanceMode = normalisePerformanceMode(settings.performanceMode);

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

  languageSelect?.addEventListener('change', () => {
    settings.language = normaliseLanguageChoice(languageSelect.value);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    applyLanguage();
    touch('settings');
  });

  performanceModeSelect?.addEventListener('change', () => {
    settings.performanceMode = normalisePerformanceMode(performanceModeSelect.value);
    adaptiveQuality = 0;
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    scheduleLayoutSync();
    touch('settings');
  });

  resetSettingsButton?.addEventListener('click', () => {
    Object.assign(settings, defaultSettings);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    Object.keys(settingsInputs).forEach(writeSettingInputs);
    Object.keys(settingsColorInputs).forEach(writeColourInput);
    applyLanguage();
    touch('settings');
  });

  applyLanguage();
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
  return Boolean(target?.closest?.('.core, .top-bar, .control-panel, .float-panel, button, input, select, label, .track, [role="button"]'));
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

function readStageSize() {
  const rect = canvas.getBoundingClientRect();
  const width = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || rect.width;
  const height = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || rect.height;
  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
}

function syncCanvasSize() {
  const { width, height } = readStageSize();
  const profile = performanceProfile();
  const ratio = Math.max(1, Math.min(profile.maxDpr, window.devicePixelRatio || 1));
  const backingWidth = Math.max(1, Math.round(width * ratio));
  const backingHeight = Math.max(1, Math.round(height * ratio));
  if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
    canvas.width = backingWidth;
    canvas.height = backingHeight;
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  setCssVar('--viewport-width', `${width.toFixed(2)}px`);
  setCssVar('--viewport-height', `${height.toFixed(2)}px`);
  document.documentElement.dataset.performance = profile.mode;
  return { width, height, ratio };
}

function coreVisualMetrics(stageWidth, stageHeight) {
  const rect = core.getBoundingClientRect();
  const hasRect = rect.width > 0 && rect.height > 0;
  return {
    cx: hasRect ? rect.left + rect.width / 2 : stageWidth * 0.5,
    cy: hasRect ? rect.top + rect.height / 2 : stageHeight * 0.5,
    size: core.offsetWidth || rect.width || Math.min(stageWidth, stageHeight) * 0.66,
  };
}

function resize() {
  syncCanvasSize();
}

function scheduleLayoutSync() {
  lastLayoutSignature = '';
  resize();
  for (const delay of [80, 180, 360, 720]) {
    window.setTimeout(() => {
      lastLayoutSignature = '';
      resize();
    }, delay);
  }
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
  if (!res.ok) throw new Error(data.error || text('requestFailed'));
  return data;
}

async function detectOsu() {
  const data = await fetchJson('/api/default-paths');
  if (data.osuSongs?.length) {
    folderPath.value = data.osuSongs[0];
    setStatusKey(data.lazerRoots?.length ? 'foundBothOsu' : 'foundOsu', { path: data.osuSongs[0] });
  } else if (data.lazerRoots?.length) {
    folderPath.value = data.lazerRoots[0];
    setStatusKey('foundLazer', { path: data.lazerRoots[0] });
  } else {
    setStatus(data.guidance?.message || text('noOsu'));
  }
}

function samePath(left, right) {
  return normaliseKey(left) === normaliseKey(right);
}

function isStableSongsPath(path, detectedPaths) {
  return detectedPaths.osuSongs?.some((item) => samePath(path, item)) || /[/\\]osu![/\\]songs$/i.test(path);
}

function isLazerRootPath(path, detectedPaths) {
  return detectedPaths.lazerRoots?.some((item) => samePath(path, item));
}

async function resolveScanPath(kind) {
  let path = folderPath.value.trim();
  if (kind !== 'osu' && kind !== 'lazer') return path;

  const detectedPaths = await fetchJson('/api/default-paths');
  if (kind === 'lazer' && detectedPaths.lazerRoots?.length && (!path || isStableSongsPath(path, detectedPaths))) {
    path = detectedPaths.lazerRoots[0];
    folderPath.value = path;
    setStatusKey('foundLazer', { path });
  }
  if (kind === 'osu' && detectedPaths.osuSongs?.length && (!path || isLazerRootPath(path, detectedPaths))) {
    path = detectedPaths.osuSongs[0];
    folderPath.value = path;
    setStatusKey('foundOsu', { path });
  }
  return path;
}

async function scan(kind) {
  const path = await resolveScanPath(kind);
  if (!path) {
    setStatusKey('missingPath');
    return;
  }

  setPanel('scan');
  setStatusKey(kind === 'osu' ? 'scanningOsu' : kind === 'lazer' ? 'scanningLazer' : 'scanningMusic');
  tracks = [];
  visibleTracks = [];
  listEl.innerHTML = '';
  setText(songCount, text('scanning'));

  try {
    const data = await fetchJson(`/api/scan?kind=${kind}&path=${encodeURIComponent(path)}`);
    const rawTracks = data.tracks || [];
    tracks = dedupeTracks(rawTracks);
    visibleTracks = tracks;
    renderList();
    const duplicateCount = Math.max(0, rawTracks.length - tracks.length);
    if (tracks.length) {
      setStatusKey('loadedTracks', { count: tracks.length, duplicates: duplicateCount });
    } else {
      setStatusKey('noPlayable');
    }
    setPanel('songs');
  } catch (error) {
    setStatus(error.message);
  }
}

function dedupeTracks(input) {
  const best = new Map();
  const aliases = new Map();
  for (const track of input) {
    const keys = trackIdentityKeys(track);
    const existingKey = keys.map((key) => aliases.get(key)).find(Boolean);
    const canonicalKey = existingKey || keys[0];
    const current = best.get(canonicalKey);
    if (!current || trackDedupeScore(track) > trackDedupeScore(current)) best.set(canonicalKey, track);
    for (const key of keys) aliases.set(key, canonicalKey);
  }
  return [...best.values()].sort((a, b) => `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`, 'zh-CN'));
}

function trackIdentityKeys(track) {
  const audioKey = normaliseAudioKey(track.audioUrl || track.path || '');
  const folderKey = normaliseFolderAudioKey(track.audioUrl || track.path || '');
  const titleKey = normaliseKey(`${track.artist || ''}::${track.title || ''}`);
  const looseTitleKey = normaliseTitleKey(`${track.artist || ''}::${track.title || ''}`);
  const keys = [
    audioKey && `audio:${audioKey}`,
    folderKey && `folder-audio:${folderKey}`,
    titleKey && `title:${titleKey}`,
    looseTitleKey && `loose-title:${looseTitleKey}`,
  ].filter(Boolean);
  return [...new Set(keys.length ? keys : [`fallback:${Math.random()}`])];
}

function trackDedupeScore(track) {
  return (track.backgroundUrl ? 120 : 0)
    + (track.timingPoints?.length || 0)
    + (track.version ? 4 : 0)
    + (track.audioUrl ? 2 : 0);
}

function normaliseKey(value) {
  return String(value || '').trim().toLowerCase().replaceAll('\\', '/').replace(/\s+/g, ' ');
}

function normaliseAudioKey(value) {
  return normaliseKey(value)
    .replace(/^\/media\//, '')
    .replace(/[?#].*$/, '')
    .replace(/%20/g, ' ');
}

function normaliseFolderAudioKey(value) {
  const parts = normaliseAudioKey(value).split('/').filter(Boolean);
  if (parts.length < 2) return normaliseAudioKey(value);
  return parts.slice(-2).join('/');
}

function normaliseTitleKey(value) {
  return normaliseKey(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/\b(tv size|short ver|full ver|mapped by|feat|ft)\b/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .trim();
}

function renderList() {
  const query = search.value.trim().toLowerCase();
  visibleTracks = query
    ? tracks.filter((track) => `${track.title} ${track.artist} ${track.version}`.toLowerCase().includes(query))
    : tracks;

  setText(songCount, text('songCount', { count: visibleTracks.length }));
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

function setAmbientFallback() {
  ambientToken += 1;
  background.classList.remove('has-cover');
  background.style.removeProperty('--ambient-cover');
  setCssVar('--ambient-a', '210, 48, 142');
  setCssVar('--ambient-b', '72, 32, 118');
  setCssVar('--ambient-c', '18, 10, 32');
}

async function setAmbientFromTrack(track) {
  const url = track?.backgroundUrl || '';
  const token = ++ambientToken;
  if (!url) {
    setAmbientFallback();
    return;
  }

  background.classList.add('has-cover');
  background.style.setProperty('--ambient-cover', `url("${url}")`);

  try {
    const palette = await extractPalette(url);
    if (token !== ambientToken) return;
    setCssVar('--ambient-a', palette[0]);
    setCssVar('--ambient-b', palette[1]);
    setCssVar('--ambient-c', palette[2]);
  } catch {
    if (token === ambientToken) setAmbientFallback();
  }
}

function extractPalette(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      try {
        const size = 56;
        const sample = document.createElement('canvas');
        sample.width = size;
        sample.height = size;
        const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
        sampleCtx.drawImage(image, 0, 0, size, size);
        const { data } = sampleCtx.getImageData(0, 0, size, size);
        const buckets = new Map();

        for (let i = 0; i < data.length; i += 16) {
          const alpha = data[i + 3] / 255;
          if (alpha < 0.35) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = max / 255;
          const saturation = max ? (max - min) / max : 0;
          if (brightness < 0.08) continue;
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;
          const weight = alpha * (0.25 + saturation * 1.15) * (0.34 + brightness * 0.9);
          const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, weight: 0, count: 0 };
          bucket.r += r * weight;
          bucket.g += g * weight;
          bucket.b += b * weight;
          bucket.weight += weight;
          bucket.count += 1;
          buckets.set(key, bucket);
        }

        const colours = [...buckets.values()]
          .filter((bucket) => bucket.weight > 0)
          .map((bucket) => ({
            r: Math.round(bucket.r / bucket.weight),
            g: Math.round(bucket.g / bucket.weight),
            b: Math.round(bucket.b / bucket.weight),
            score: bucket.weight * Math.sqrt(bucket.count),
          }))
          .sort((a, b) => b.score - a.score);

        const primary = colours[0] || { r: 210, g: 48, b: 142 };
        const secondary = colours.find((colour) => colourDistance(colour, primary) > 58) || colours[1] || { r: 74, g: 34, b: 124 };
        const tertiary = colours.find((colour) => colourDistance(colour, primary) > 34 && colourDistance(colour, secondary) > 34) || colours[2] || { r: 20, g: 12, b: 34 };
        resolve([primary, secondary, tertiary].map(formatRgb));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = reject;
    image.src = url;
  });
}

function colourDistance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function formatRgb(colour) {
  return `${colour.r}, ${colour.g}, ${colour.b}`;
}

async function playIndex(index) {
  if (!tracks[index]) return;
  touch('controls');
  activeIndex = index;
  const track = tracks[index];

  audio.src = track.audioUrl;
  setAmbientFromTrack(track);
  cover.style.backgroundImage = track.backgroundUrl ? `url("${track.backgroundUrl}")` : '';
  coreCover.style.backgroundImage = track.backgroundUrl ? `url("${track.backgroundUrl}")` : '';
  syncTrackText();
  setText(coreSubtitle, track.timingPoints?.length ? text('beatSync') : text('audioSync'));
  setText(miniState, text('loading'));
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
  sideMode = 'idle';
  sideModeUntil = 0;
  starParticles = [];
  fountainBursts = [];
  rippleRings = [];
  lastKiaiState = false;
  lastFountainAt = -10000;
  lastAudioFountainAt = -10000;
  lastRippleAt = -10000;
  visualizerBars.fill(0);
  previousVisualizerBins.fill(0);
  visualizerPrimed = false;
  markActiveTrack();
  if (track.timingPoints?.length) {
    setStatusKey('loadedTiming', { count: track.timingPoints.length });
  } else {
    setStatusKey('loadedAudio');
  }

  try {
    setupAudioGraph();
    await audioContext.resume().catch(() => {});
    syncTransportLabels();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setText(miniState, text('playing'));
          syncTransportLabels();
          if (track.timingPoints?.length) {
            setStatusKey('playingTiming', { count: track.timingPoints.length });
          } else {
            setStatusKey('playingAudio');
          }
        })
        .catch(() => {
          syncTransportLabels();
          setText(miniState, text('waiting'));
          setStatusKey('unlockAudio');
        });
    }
  } catch {
    syncTransportLabels();
    setText(miniState, text('waiting'));
    setStatusKey('unlockAudio');
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
        syncTransportLabels();
        setText(miniState, text('playing'));
      } catch {
        syncTransportLabels();
        setText(miniState, text('waiting'));
        setStatusKey('audioBlocked');
      }
    } else {
      audio.pause();
      syncTransportLabels();
      setText(miniState, text('paused'));
    }
  } catch {
    syncTransportLabels();
    setText(miniState, text('waiting'));
    setStatusKey('audioBlocked');
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
  if (button.id === 'toggle-play' || button.id === 'top-play') runTransport(event, togglePlay);
  if (button.id === 'prev' || button.id === 'top-prev') runTransport(event, () => stepTrack(-1));
  if (button.id === 'next' || button.id === 'top-next') runTransport(event, () => stepTrack(1));
}

function findTransportButton(event) {
  const path = event.composedPath?.() || [];
  const fromPath = path.find((item) => ['toggle-play', 'prev', 'next', 'top-play', 'top-prev', 'top-next'].includes(item?.id));
  if (fromPath) return fromPath;
  const fromPoint = document.elementFromPoint(event.clientX, event.clientY);
  return fromPoint?.closest?.('#toggle-play, #prev, #next, #top-play, #top-prev, #top-next') || null;
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

function sideBeatAlpha(kiai, strong) {
  const activity = Math.max(lowEnergy, midEnergy * 0.82, smoothedEnergy, currentDrive * 0.76);
  const lift = Math.max(0, activity - driveAverage);
  const base = kiai ? 0.2 : 0.08;
  const energyLift = Math.sqrt(Math.max(0, activity)) * (kiai ? 0.46 : 0.28);
  const riseLift = Math.min(kiai ? 0.12 : 0.08, currentRise * 1.15 + lift * 0.42);
  const accent = strong ? 0.13 : 0;
  return Math.min(0.92, base + energyLift + riseLift + accent) * Math.max(0, settings.sideIntensity);
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
  const mode = side === 'both' ? 'both' : 'alternate';
  if (sideMode !== 'idle' && sideMode !== mode && now < sideModeUntil) return false;
  sideMode = mode;
  sideModeUntil = Math.max(sideModeUntil, now + Math.max(320, (currentBeatLengthMs || 620) * (hard ? 1.8 : 1.45)));
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
  return true;
}

function handleOsuSideFlashBeat(beatIndex, meter, kiaiTagged, timeSinceBeat = 0) {
  const downbeat = beatIndex % Math.max(1, meter) === 0;
  const activity = Math.max(lowEnergy, midEnergy * 0.82, smoothedEnergy, currentDrive * 0.72);
  const lift = Math.max(0, activity - driveAverage);
  const percussivePresence = Math.max(lowEnergy * 1.1, currentRise * 2.35, Math.max(0, currentDrive - driveAverage) * 1.45);
  const strongRise = currentRise > Math.max(0.055, riseAverage * (2.25 - settings.sideRestraint * 0.55));
  const hasDrumLikeEnergy = percussivePresence > 0.16 + settings.sideRestraint * 0.11;
  const audibleBeat = activity > 0.22 + settings.sideRestraint * 0.08 || lift > 0.075 || strongRise;
  const strongMoment = downbeat && hasDrumLikeEnergy && (kiaiTagged || activity > 0.38 + settings.sideRestraint * 0.12 || lift > 0.11 || strongRise);
  if (!hasDrumLikeEnergy && !audibleBeat) return;

  if (kiaiTagged) {
    if (!hasDrumLikeEnergy && activity < 0.28 + settings.sideRestraint * 0.08 && !strongRise) return;
    const layer = strongMoment || downbeat ? 'hard' : 'soft';
    const amount = sideBeatAlpha(true, layer === 'hard') * (layer === 'hard' ? 1 : 0.76);
    if (beatIndex % 2 === 0) {
      flashSide('left', amount, layer, `kiai-${layer}-left`, beatIndex, timeSinceBeat);
    } else {
      flashSide('right', amount, layer, `kiai-${layer}-right`, beatIndex, timeSinceBeat);
    }

    return;
  }

  if (!downbeat) return;

  const enoughPresence = (activity > 0.28 + settings.sideRestraint * 0.18 && hasDrumLikeEnergy) || (strongRise && percussivePresence > 0.18);
  if (!enoughPresence) return;

  const layer = strongMoment ? 'hard' : 'soft';
  const amount = sideBeatAlpha(false, layer === 'hard') * (layer === 'hard' ? 0.88 : 0.66);
  if (flashSide('both', amount, layer, `normal-downbeat-both-${layer}`, beatIndex, timeSinceBeat)) {
    sideMode = 'both';
    sideModeUntil = Math.max(sideModeUntil, performance.now() + (currentBeatLengthMs || 620) * Math.max(1.25, meter * 0.62));
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
  const trackTime = audio.currentTime || 0;
  const warmupRaw = Math.min(1, Math.max(0, (trackTime - 0.35) / 8));
  const warmup = warmupRaw * warmupRaw * (3 - 2 * warmupRaw);
  const startupGuard = 0.28 + warmup * 0.72;
  const dynamicRange = 0.1 + Math.max(0.04, amplitudeAverage) * 1.08 + (1 - warmup) * 0.12;
  const userScale = 0.6 + Math.max(0, settings.visualizer) * 0.32;
  const noiseFloor = Math.max(0.03, amplitudeAverage * 0.25);
  const contrast = Math.max(0.1, settings.visualizerContrast || 1.6);
  const startupLimiter = Math.min(1, Math.max(0.08, trackTime / 4.5)) * startupGuard;
  const attackLimit = (0.014 + Math.min(0.062, audioAmplitude * 0.075)) * (activeEffectPoint?.kiai ? 1.12 : 1) * (0.42 + warmup * 0.58);
  const candidates = [];

  if (!visualizerPrimed) {
    for (let i = 0; i < visualizerBars.length; i += 1) {
      const sourceIndex = (i + visualizerOffset) % visualizerBars.length;
      previousVisualizerBins[i] = (freqData[sourceIndex] || 0) / 255;
    }
    visualizerPrimed = true;
    visualizerOffset = (visualizerOffset + 5) % visualizerBars.length;
    return;
  }

  for (let i = 0; i < visualizerBars.length; i += 1) {
    const sourceIndex = (i + visualizerOffset) % visualizerBars.length;
    const raw = (freqData[sourceIndex] || 0) / 255;
    const prev = (freqData[(sourceIndex + freqData.length - 2) % freqData.length] || 0) / 255;
    const next = (freqData[(sourceIndex + 2) % freqData.length] || 0) / 255;
    const localAverage = (prev + next) * 0.5;
    const localPeak = raw > prev * 1.018 && raw >= next * 0.965;
    const freshLift = Math.max(0, raw - previousVisualizerBins[i]);
    const spectralLift = Math.max(0, raw - localAverage * 0.52);
    const peak = Math.max(0, spectralLift - noiseFloor + freshLift * 0.36);
    previousVisualizerBins[i] = raw;
    if ((!localPeak && freshLift < 0.035) || peak <= 0) continue;
    const normalised = peak / dynamicRange;
    const compressed = Math.min(1, normalised);
    const shaped = Math.pow(compressed, contrast * 0.9);
    const target = Math.min(0.72, shaped * (0.4 + contrast * 0.1) * kiaiMultiplier * userScale * startupLimiter);
    if (target > visualizerBars[i]) candidates.push({ index: i, target, score: target + freshLift * 0.5 });
  }

  const candidateLimit = Math.round((activeEffectPoint?.kiai ? 20 : 14) + warmup * (activeEffectPoint?.kiai ? 24 : 18));
  const spreadRadius = warmup < 0.42 ? 1 : 2;

  candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, candidateLimit)
    .forEach(({ index, target }) => {
      for (let spread = -spreadRadius; spread <= spreadRadius; spread += 1) {
        const wrapped = (index + spread + visualizerBars.length) % visualizerBars.length;
        const falloff = spread === 0 ? 1 : Math.abs(spread) === 1 ? 0.54 : 0.24;
        const spreadTarget = target * falloff;
        if (spreadTarget > visualizerBars[wrapped]) {
          visualizerBars[wrapped] = Math.min(spreadTarget, visualizerBars[wrapped] + attackLimit * falloff);
        }
      }
    });

  for (let i = 1; i < visualizerBars.length - 1; i += 1) {
    const neighbourCap = Math.max(visualizerBars[i - 1], visualizerBars[i + 1]) * 0.92;
    if (visualizerBars[i] > neighbourCap && visualizerBars[i] < 0.08) visualizerBars[i] *= 0.86;
  }

  visualizerOffset = (visualizerOffset + 5) % visualizerBars.length;
}

function spawnBurst(count = 10) {
  const { width, height } = readStageSize();
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
  const profile = performanceProfile();
  const { width, height } = readStageSize();
  const isPortrait = height > width * 1.18;
  const originOffset = isPortrait
    ? Math.max(54, width * 0.24)
    : Math.min(260, Math.max(120, width * 0.16));
  const dt = elapsed / 1000;
  let spawnsThisFrame = 0;

  for (const burst of fountainBursts) {
    if (now > burst.end) continue;

    const pressure = starParticles.length / profile.starMax;
    const spawnEvery = 1000 / Math.max(56, (78 + burst.power * 58) * (1 - pressure * 0.42));
    while (now - burst.lastSpawn >= spawnEvery && spawnsThisFrame < profile.starSpawns && starParticles.length < profile.starMax) {
      burst.lastSpawn += spawnEvery;
      for (const side of [-1, 1]) {
        if (spawnsThisFrame >= profile.starSpawns || starParticles.length >= profile.starMax) break;
        const age = burst.lastSpawn - burst.start;
        const progress = Math.max(0, Math.min(1, age / (burst.end - burst.start)));
        const x = side < 0 ? originOffset : width - originOffset;
        const y = height + 18;
        const fan = isPortrait
          ? -side * (130 + Math.random() * 150) + burst.direction * side * 95 * (1 - progress)
          : burst.direction * side * 360 * (1 - progress * 1.8);
        const vx = fan + (Math.random() - 0.5) * (isPortrait ? 90 : 150);
        const vy = (isPortrait ? -880 : -1020) - Math.random() * (isPortrait ? 360 : 460) - burst.power * (isPortrait ? 210 : 260);
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
  if (starParticles.length > profile.starMax) starParticles.length = profile.starMax;
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
  const sprite = starSprite(hollow, radius);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();
}

function makeSpriteCanvas(size) {
  const canvasNode = document.createElement('canvas');
  canvasNode.width = size;
  canvasNode.height = size;
  return canvasNode;
}

function starSprite(hollow, radius) {
  const bucket = Math.max(8, Math.min(28, Math.round(radius)));
  const key = `${hollow ? 'h' : 'f'}:${bucket}`;
  if (starSpriteCache.has(key)) return starSpriteCache.get(key);
  const padding = 4;
  const size = (bucket + padding) * 2;
  const sprite = makeSpriteCanvas(size);
  const spriteCtx = sprite.getContext('2d');
  spriteCtx.translate(size / 2, size / 2);
  spriteCtx.scale(bucket, bucket);
  if (hollow) {
    spriteCtx.strokeStyle = '#fff';
    spriteCtx.lineWidth = 0.18;
    spriteCtx.lineJoin = 'round';
    spriteCtx.stroke(hollowStarPath);
  } else {
    spriteCtx.fillStyle = '#fff';
    spriteCtx.fill(starPath);
  }
  starSpriteCache.set(key, sprite);
  return sprite;
}

function drawStarGlow(ctx, x, y, radius, alpha) {
  const sprite = starGlowSprite(radius);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
  ctx.restore();
}

function starGlowSprite(radius) {
  const bucket = Math.max(12, Math.min(56, Math.round(radius / 4) * 4));
  const key = String(bucket);
  if (starGlowSpriteCache.has(key)) return starGlowSpriteCache.get(key);
  const size = bucket * 2;
  const sprite = makeSpriteCanvas(size);
  const spriteCtx = sprite.getContext('2d');
  const gradient = spriteCtx.createRadialGradient(bucket, bucket, 0, bucket, bucket, bucket);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.42, 'rgba(255, 255, 255, 0.34)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  spriteCtx.fillStyle = gradient;
  spriteCtx.fillRect(0, 0, size, size);
  starGlowSpriteCache.set(key, sprite);
  return sprite;
}

function drawRippleRings(cx, cy, coreSize, now, stageWidth, stageHeight) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'lighter';
  for (const ring of rippleRings) {
    const progress = Math.max(0, Math.min(1, (now - ring.start) / ring.duration));
    const eased = 1 - Math.pow(1 - progress, 2.05);
    const maxRadius = Math.min(stageWidth, stageHeight) * 0.67 * Math.max(0.05, settings.waveSize);
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
  updateAdaptiveQuality(elapsed);
  const profile = performanceProfile();

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

  if (now - lastInteraction > idleAfterMs) {
    if (app.dataset.panel !== 'idle') app.dataset.panel = 'idle';
    document.body.classList.add('is-idle');
  }

  const { width, height } = syncCanvasSize();
  ctx.clearRect(0, 0, width, height);

  const beatMotion = !audio.paused ? continuousBeat * 0.015 : 0;
  const energy = Math.max(smoothedEnergy * 1.08, logoPulse * 0.34, coreBreath * 0.92, beatMotion);
  const earlyDip = timingPulse > 0.5 ? -0.005 * Math.min(1, timingPulse) : 0;
  const coreMetrics = coreVisualMetrics(width, height);
  const coreSize = coreMetrics.size;
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
    frameAverageMs,
    drawVisualizerAvgMs,
    performanceMode: profile.mode,
    adaptiveQuality,
    stageSize: [width, height],
    visualCenter: [coreMetrics.cx, coreMetrics.cy],
    coreSize,
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
  setCssVar('--ambient-energy', Math.min(1, Math.max(energy, visualLight * 0.38)).toFixed(3));
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

  drawRippleRings(coreMetrics.cx, coreMetrics.cy, coreSize, now, width, height);
  drawLogoVisualizer(coreMetrics.cx, coreMetrics.cy, coreSize);

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
  particles = particles.filter((particle) => particle.life > 0.04).slice(-profile.particleMax);

  const starGlow = Math.max(0, settings.starGlow || 0);
  if (starGlow > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < starParticles.length; i += profile.starGlowEvery) {
      const particle = starParticles[i];
      const progress = particle.age / particle.duration;
      const alpha = Math.max(0, (1 - progress) * 0.2 * starGlow);
      drawStarGlow(ctx, particle.x, particle.y, particle.size * (2.1 + progress * 1.8), alpha);
    }
    ctx.restore();
  }

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
  performance.mark('dlv-start');
  const profile = performanceProfile();
  const bars = visualizerBars.length;
  const visualiserRounds = profile.visualizerRounds;
  const baseRadius = coreSize * 0.472;
  const maxBarLength = coreSize * 0.58 * Math.max(0.05, settings.visualizerRange);
  const barWidth = Math.max(5.2, (Math.PI * 2 * coreSize * 0.5) / bars * 0.86);
  const deadZone = Math.max(0.0075, 1 / Math.max(1, maxBarLength));
  const darkWidth = barWidth * 0.92;
  const paleWidth = barWidth * 0.78;
  const hwDark = darkWidth * 0.5;
  const hwPale = paleWidth * 0.5;
  const paleBaseRadius = baseRadius + darkWidth * 0.06;
  const paleStrokeWidth = Math.max(1.2, paleWidth * 0.18);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'lighter';
  ctx.rotate(performance.now() / 27000);

  for (let round = 0; round < visualiserRounds; round += 1) {
    const roundOffset = (round * Math.PI * 2) / visualiserRounds;
    for (let i = 0; i < bars; i += profile.visualizerStep) {
      const amplitude = visualizerBars[i];
      if (amplitude <= deadZone) continue;
      const angle = (i / bars) * Math.PI * 2 + roundOffset;
      const length = amplitude * maxBarLength;

      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const hws = hwDark * sin;
      const hwc = hwDark * cos;
      const x0 = baseRadius * cos;
      const y0 = baseRadius * sin;
      const x1 = (baseRadius + length) * cos;
      const y1 = (baseRadius + length) * sin;

      const darkAlpha = Math.min(0.28, 0.05 + amplitude * 0.62);
      ctx.fillStyle = `rgba(255, 255, 255, ${darkAlpha})`;
      ctx.beginPath();
      ctx.moveTo(x0 + hws, y0 - hwc);
      ctx.lineTo(x1 + hws, y1 - hwc);
      ctx.lineTo(x1 - hws, y1 + hwc);
      ctx.lineTo(x0 - hws, y0 + hwc);
      ctx.closePath();
      ctx.fill();

      if (profile.drawPaleBars && length > coreSize * 0.022) {
        const paleAlpha = Math.min(0.2, 0.026 + amplitude * 0.32);
        const paleLength = length * 0.94;
        const phws = hwPale * sin;
        const phwc = hwPale * cos;
        const px0 = paleBaseRadius * cos;
        const py0 = paleBaseRadius * sin;
        const px1 = (paleBaseRadius + paleLength) * cos;
        const py1 = (paleBaseRadius + paleLength) * sin;

        ctx.strokeStyle = `rgba(255, 255, 255, ${paleAlpha})`;
        ctx.lineWidth = paleStrokeWidth;
        ctx.beginPath();
        ctx.moveTo(px0 + phws, py0 - phwc);
        ctx.lineTo(px1 + phws, py1 - phwc);
        ctx.lineTo(px1 - phws, py1 + phwc);
        ctx.lineTo(px0 - phws, py0 + phwc);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  ctx.restore();
  performance.mark('dlv-end');
  performance.measure('drawLogoVisualizer', 'dlv-start', 'dlv-end');
  const dlvMs = performance.getEntriesByName('drawLogoVisualizer').at(-1)?.duration ?? 0;
  drawVisualizerAvgMs = drawVisualizerAvgMs * 0.95 + dlvMs * 0.05;
  performance.clearMeasures('drawLogoVisualizer');
  performance.clearMarks('dlv-start');
  performance.clearMarks('dlv-end');
}

window.addEventListener('resize', scheduleLayoutSync);
window.addEventListener('fullscreenchange', scheduleLayoutSync);
window.addEventListener('orientationchange', scheduleLayoutSync);
window.addEventListener('pageshow', scheduleLayoutSync);
window.visualViewport?.addEventListener('resize', scheduleLayoutSync);
window.visualViewport?.addEventListener('scroll', scheduleLayoutSync);
window.addEventListener('pointermove', (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  const { height } = readStageSize();
  if (event.clientY <= height * 0.2 || app.dataset.panel !== 'idle') touch();
}, { passive: true });
let lastLayoutSignature = '';
setInterval(() => {
  const { width, height } = readStageSize();
  const signature = `${Math.round(width)}x${Math.round(height)}:${app.dataset.panel}`;
  if (signature === lastLayoutSignature) return;
  lastLayoutSignature = signature;
  resize();
}, 500);
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
  const button = document.activeElement?.closest?.('#toggle-play, #prev, #next, #top-play, #top-prev, #top-next');
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
document.querySelector('#top-scan').addEventListener('click', () => setPanel('scan'));
document.querySelector('#top-library').addEventListener('click', () => setPanel(tracks.length ? 'songs' : 'scan'));
document.querySelector('#top-settings').addEventListener('click', () => setPanel('settings'));
minimizeControls.addEventListener('click', () => setPanel('idle'));
document.querySelector('#close-scan').addEventListener('click', () => setPanel('idle'));
document.querySelector('#close-library').addEventListener('click', () => setPanel('idle'));
document.querySelector('#close-settings').addEventListener('click', () => setPanel('idle'));
document.querySelector('#detect-osu').addEventListener('click', detectOsu);
document.querySelector('#scan-osu').addEventListener('click', () => scan('osu'));
document.querySelector('#scan-lazer').addEventListener('click', () => scan('lazer'));
document.querySelector('#scan-music').addEventListener('click', () => scan('music'));
document.querySelector('#prev').addEventListener('click', (event) => runTransport(event, () => stepTrack(-1)));
playButton.addEventListener('click', (event) => runTransport(event, togglePlay));
document.querySelector('#next').addEventListener('click', (event) => runTransport(event, () => stepTrack(1)));
document.querySelector('#top-prev').addEventListener('click', (event) => runTransport(event, () => stepTrack(-1)));
topPlayButton.addEventListener('click', (event) => runTransport(event, togglePlay));
document.querySelector('#top-next').addEventListener('click', (event) => runTransport(event, () => stepTrack(1)));
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
  syncTransportLabels();
  setText(miniState, text('playing'));
});
audio.addEventListener('pause', () => {
  syncTransportLabels();
  setText(miniState, activeIndex === -1 ? text('ready') : text('paused'));
});

loadSettings();
resize();
draw();
detectOsu();
}
