import { defaultSettings, settingsKey } from '../ui/settings.js';

export function startVisualShell() {
if (window.__osuVisualShellStarted) return;
window.__osuVisualShellStarted = true;
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
const i18nTextNodes = [...document.querySelectorAll('[data-i18n]')];
const i18nPlaceholderNodes = [...document.querySelectorAll('[data-i18n-placeholder]')];
const i18nAriaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
const openScanButton = document.querySelector('#open-scan');
const openLibraryButton = document.querySelector('#open-library');
const openSettingsButton = document.querySelector('#open-settings');
const topScanButton = document.querySelector('#top-scan');
const topLibraryButton = document.querySelector('#top-library');
const topSettingsButton = document.querySelector('#top-settings');
const closeScanButton = document.querySelector('#close-scan');
const closeLibraryButton = document.querySelector('#close-library');
const closeSettingsButton = document.querySelector('#close-settings');
const detectOsuButton = document.querySelector('#detect-osu');
const scanOsuButton = document.querySelector('#scan-osu');
const scanLazerButton = document.querySelector('#scan-lazer');
const scanMusicButton = document.querySelector('#scan-music');
const prevButton = document.querySelector('#prev');
const nextButton = document.querySelector('#next');
const topPrevButton = document.querySelector('#top-prev');
const topNextButton = document.querySelector('#top-next');
const transportButtonsById = new Map([
  ['toggle-play', playButton],
  ['prev', prevButton],
  ['next', nextButton],
  ['top-play', topPlayButton],
  ['top-prev', topPrevButton],
  ['top-next', topNextButton],
]);
const debugParams = new URLSearchParams(window.location.search);
const debugPerfEnabled = debugParams.get('debugPerf') === '1';
const fpsOnlyEnabled = debugParams.get('fpsOnly') === '1';
const perfLogEnabled = debugParams.get('perfLog') === '1';
const perfStatsEnabled = debugPerfEnabled || fpsOnlyEnabled || perfLogEnabled;
const renderStageStatsEnabled = debugPerfEnabled || perfLogEnabled;
const forceCompositeSafeParam = debugParams.get('forceCompositeSafe');
const isMacLike = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') || /Mac OS X|iPhone|iPad|iPod/.test(navigator.userAgent || '');
const isRetinaLike = (window.devicePixelRatio || 1) >= 1.5;
const autoCompositeSafeMode = isMacLike && isRetinaLike;
const compositeSafeMode = forceCompositeSafeParam === '1'
  ? true
  : forceCompositeSafeParam === '0'
    ? false
    : autoCompositeSafeMode;
const compositeSafeReason = forceCompositeSafeParam === '1'
  ? 'forced-on'
  : forceCompositeSafeParam === '0'
    ? 'forced-off'
    : autoCompositeSafeMode
      ? 'auto-mac'
      : 'disabled';
const debugNoCssFx = debugPerfEnabled && debugParams.get('noCssFx') === '1';
const effectiveCssSafe = compositeSafeMode || debugNoCssFx;
const safeCssSource = compositeSafeMode && debugNoCssFx
  ? 'both'
  : compositeSafeMode
    ? 'compositeSafe'
    : debugNoCssFx
      ? 'noCssFx'
      : 'none';
const debugNoBackdropFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noBackdropFx') === '1');
const debugNoBlurFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noBlurFx') === '1');
const debugNoBlendFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noBlendFx') === '1');
const debugNoShadowFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noShadowFx') === '1');
const debugNoSideLightFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noSideLightFx') === '1');
const debugNoBgCssFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noBgCssFx') === '1');
const debugNoPanelBackdropFx = effectiveCssSafe || (debugPerfEnabled && debugParams.get('noPanelBackdropFx') === '1');
const debugNoAllBgFx = debugPerfEnabled && debugParams.get('noAllBgFx') === '1';
const debugNoAllPanelFx = debugPerfEnabled && debugParams.get('noAllPanelFx') === '1';
const debugNoAllLightFx = debugPerfEnabled && debugParams.get('noAllLightFx') === '1';
const debugNoAllAnimationFx = debugPerfEnabled && debugParams.get('noAllAnimationFx') === '1';
const debugNoAllFixedFx = debugPerfEnabled && debugParams.get('noAllFixedFx') === '1';
const debugNoCssFxButKeepBg = debugPerfEnabled && debugParams.get('noCssFxButKeepBg') === '1';
const debugNoCssFxOnlyBg = debugPerfEnabled && debugParams.get('noCssFxOnlyBg') === '1';
const debugFreezeBg = debugPerfEnabled && debugParams.get('freezeBg') === '1';
const debugNoBgImage = debugPerfEnabled && debugParams.get('noBgImage') === '1';
const debugNoBgPseudo = debugPerfEnabled && debugParams.get('noBgPseudo') === '1';
const debugNoBgAnimation = debugPerfEnabled && debugParams.get('noBgAnimation') === '1';
const debugNoBgBlendOnly = debugPerfEnabled && debugParams.get('noBgBlendOnly') === '1';
const debugNoBgFilterOnly = debugPerfEnabled && debugParams.get('noBgFilterOnly') === '1';
const debugNoBgTransformOnly = debugPerfEnabled && debugParams.get('noBgTransformOnly') === '1';
const debugNoBgOpacityOnly = debugPerfEnabled && debugParams.get('noBgOpacityOnly') === '1';
const debugNoBgCacheRebuild = debugPerfEnabled && debugParams.get('noBgCacheRebuild') === '1';
const debugShowResize = debugPerfEnabled && debugParams.get('showResize') === '1';
const debugSolidCanvasBg = debugPerfEnabled && debugParams.get('solidCanvasBg') === '1';
const debugNoCanvasClear = debugParams.get('noCanvasClear') === '1';
const debugNoSpectrumDraw = debugParams.get('noSpectrumDraw') === '1';
const debugNoCoreDraw = debugParams.get('noCoreDraw') === '1';
const debugNoRippleDraw = debugParams.get('noRippleDraw') === '1';
const debugNoStarDraw = debugParams.get('noStarDraw') === '1';
const debugNoCanvasBgDraw = debugParams.get('noCanvasBgDraw') === '1';
const debugNoGlowDraw = debugParams.get('noGlowDraw') === '1';
const dprTestValue = debugParams.has('dprTest') ? Number(debugParams.get('dprTest')) : 0;
document.documentElement.dataset.compositeSafeMode = compositeSafeMode ? 'on' : 'off';
document.documentElement.dataset.debugCssFx = effectiveCssSafe ? 'off' : 'on';
document.documentElement.dataset.debugBackdropFx = debugNoBackdropFx ? 'off' : 'on';
document.documentElement.dataset.debugBlurFx = debugNoBlurFx ? 'off' : 'on';
document.documentElement.dataset.debugBlendFx = debugNoBlendFx ? 'off' : 'on';
document.documentElement.dataset.debugShadowFx = debugNoShadowFx ? 'off' : 'on';
document.documentElement.dataset.debugSideLightFx = debugNoSideLightFx ? 'off' : 'on';
document.documentElement.dataset.debugBgCssFx = debugNoBgCssFx ? 'off' : 'on';
document.documentElement.dataset.debugPanelBackdropFx = debugNoPanelBackdropFx ? 'off' : 'on';
document.documentElement.dataset.debugAllBgFx = debugNoAllBgFx ? 'off' : 'on';
document.documentElement.dataset.debugAllPanelFx = debugNoAllPanelFx ? 'off' : 'on';
document.documentElement.dataset.debugAllLightFx = debugNoAllLightFx ? 'off' : 'on';
document.documentElement.dataset.debugAllAnimationFx = debugNoAllAnimationFx ? 'off' : 'on';
document.documentElement.dataset.debugAllFixedFx = debugNoAllFixedFx ? 'off' : 'on';
document.documentElement.dataset.debugCssFxButKeepBg = debugNoCssFxButKeepBg ? 'on' : 'off';
document.documentElement.dataset.debugCssFxOnlyBg = debugNoCssFxOnlyBg ? 'on' : 'off';
document.documentElement.dataset.debugFreezeBg = debugFreezeBg ? 'on' : 'off';
document.documentElement.dataset.debugNoBgImage = debugNoBgImage ? 'on' : 'off';
document.documentElement.dataset.debugNoBgPseudo = debugNoBgPseudo ? 'on' : 'off';
document.documentElement.dataset.debugNoBgAnimation = debugNoBgAnimation ? 'on' : 'off';
document.documentElement.dataset.debugNoBgBlendOnly = debugNoBgBlendOnly ? 'on' : 'off';
document.documentElement.dataset.debugNoBgFilterOnly = debugNoBgFilterOnly ? 'on' : 'off';
document.documentElement.dataset.debugNoBgTransformOnly = debugNoBgTransformOnly ? 'on' : 'off';
document.documentElement.dataset.debugNoBgOpacityOnly = debugNoBgOpacityOnly ? 'on' : 'off';
document.documentElement.dataset.debugShowResize = debugShowResize ? 'on' : 'off';
document.documentElement.dataset.debugSolidCanvasBg = debugSolidCanvasBg ? 'on' : 'off';

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
let cachedStageWidth = 0;
let cachedStageHeight = 0;
let cachedRatio = 1;
let cachedCoreMetrics = { cx: 0, cy: 0, size: 300 };
let cachedDevicePixelRatio = window.devicePixelRatio || 1;
let activeInheritedTimingPoints = [];
let activeAllTimingPoints = [];
let lastResizeAt = performance.now();
let resizeFrameId = 0;
let resizeTimerIds = [];
let rafId = 0;
let renderLoopRunning = false;
let activeRenderLoopCount = 0;
let frameCountForStats = 0;
let frameTimeSum = 0;
let latestFrameTimeMs = 0;
let latestFps = 0;
let lastPerfPanelUpdate = 0;
let lastPerfLogAt = 0;
let lastPerfPanelText = '';
let lastVisualizerBarCount = 0;
let lastVisualizerDrawBatchCount = 0;
let lastCanvasStateChangeCount = 0;
let lastParticleCount = 0;
let layoutReadCount = 0;
let cachedQualityProfile = null;
let cachedCssStageWidth = 0;
let cachedCssStageHeight = 0;
let cachedBackingWidth = 0;
let cachedBackingHeight = 0;
let renderedDpr = 1;
let resizeEventCount = 0;
let backingRebuildCount = 0;
let backgroundCacheRebuildCount = 0;
let glowCacheRebuildCount = 0;
let rippleCacheRebuildCount = 0;
let starCacheRebuildCount = 0;
let spectrumGeometryRebuildCount = 0;
let otherCacheRebuildCount = 0;
let lastCacheRebuildMs = 0;
let cacheRebuildInProgress = false;
let lastBackingSignature = '';
let lastSizeSignature = '';
let lastAudioFountainAt = -10000;
let ambientToken = 0;
let sideMode = 'idle';
let sideModeUntil = 0;
const cssVarCache = new Map();
const textCache = new WeakMap();
const particlePool = [];
const starParticlePool = [];
const rippleRingPool = [];
const fountainBurstPool = [];
const visualizerCandidateIndexes = new Int16Array(200);
const visualizerCandidateTargets = new Float32Array(200);
const visualizerCandidateScores = new Float32Array(200);
const visualizerGeometryCache = {
  key: '',
  values: new Float32Array(0),
};
const visualizerBatchCache = {
  capacity: 0,
  darkCounts: new Uint16Array(256),
  paleCounts: new Uint16Array(256),
  darkOffsets: new Uint16Array(257),
  paleOffsets: new Uint16Array(257),
  darkCursors: new Uint16Array(256),
  paleCursors: new Uint16Array(256),
  darkItems: new Uint16Array(0),
  paleItems: new Uint16Array(0),
};
let rippleUnitGradient = null;
const resizeEvents = [];
const backingRebuildEvents = [];
const backingSignatureHistory = [];
const frameStatsWindow = [];
const renderStageNames = ['clear', 'background', 'core', 'spectrum', 'ripple', 'stars', 'finalComposite', 'debugStats'];
const renderStageWindows = Object.fromEntries(renderStageNames.map((name) => [name, []]));
const renderStageSummary = Object.fromEntries(renderStageNames.map((name) => [name, { avg: 0, p95: 0, count: 0 }]));
const perfSummary = {
  avgFps: 0,
  minFps: 0,
  maxFps: 0,
  p95FrameMs: 0,
  p99FrameMs: 0,
  droppedFrames: 0,
  longFrames: 0,
  veryLongFrames: 0,
  sampleCount: 0,
};
const cacheRebuildEvents = {
  background: [],
  glow: [],
  ripple: [],
  star: [],
  spectrum: [],
  other: [],
};
const DEBUG_PANEL_UPDATE_MS = 250;
const FPS_ONLY_UPDATE_MS = 250;
const VISUALIZER_ALPHA_BUCKET_STEP = 4;
const qualityProfile = {
  mode: 'quality',
  maxDpr: 1.6,
  visualizerRounds: 5,
  visualizerStep: 1,
  drawPaleBars: true,
  starMax: 180,
  starSpawns: 14,
  starGlowEvery: 1,
  particleMax: 260,
};

const visualizerBars = new Float32Array(200);
const previousVisualizerBins = new Float32Array(200);
const starPath = createStarPath();
const hollowStarPath = createStarPath(0.58);
const starSpriteCache = new Map();
const starGlowSpriteCache = new Map();
const rgbaWhite = Array.from({ length: 256 }, (_, i) => `rgba(255,255,255,${(i / 255).toFixed(3)})`);
const rgbaPink  = Array.from({ length: 256 }, (_, i) => `rgba(255,232,250,${(i / 255).toFixed(3)})`);
const settings = { ...defaultSettings };
let glowColourCache = hexToRgb(settings.coreGlowColor);
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
  if (key === 'coreGlowColor') glowColourCache = hexToRgb(settings[key]);
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
  if (!cachedQualityProfile || cachedQualityProfile.mode !== requested) {
    cachedQualityProfile = { ...qualityProfile, mode: requested };
  }
  return cachedQualityProfile;
}

function updateAdaptiveQuality(elapsed) {
  frameAverageMs = frameAverageMs * 0.94 + elapsed * 0.06;
  adaptiveQuality = 0;
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
  i18nTextNodes.forEach((node) => setText(node, text(node.dataset.i18n)));
  i18nPlaceholderNodes.forEach((node) => {
    node.setAttribute('placeholder', text(node.dataset.i18nPlaceholder));
  });
  i18nAriaNodes.forEach((node) => {
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
  glowColourCache = hexToRgb(settings.coreGlowColor);
  cachedQualityProfile = null;

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
    cachedQualityProfile = null;
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    scheduleLayoutSync();
    touch('settings');
  });

  resetSettingsButton?.addEventListener('click', () => {
    Object.assign(settings, defaultSettings);
    glowColourCache = hexToRgb(settings.coreGlowColor);
    cachedQualityProfile = null;
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

function pruneRecentEvents(events, now, windowMs = 5000) {
  while (events.length && now - events[0] > windowMs) events.shift();
  return events.length;
}

function pushRecentEvent(events, now) {
  events.push(now);
  pruneRecentEvents(events, now);
}

function recordCacheRebuild(type, duration = 0) {
  const now = performance.now();
  if (type === 'background') backgroundCacheRebuildCount += 1;
  else if (type === 'glow') glowCacheRebuildCount += 1;
  else if (type === 'ripple') rippleCacheRebuildCount += 1;
  else if (type === 'star') starCacheRebuildCount += 1;
  else if (type === 'spectrum') spectrumGeometryRebuildCount += 1;
  else otherCacheRebuildCount += 1;
  pushRecentEvent(cacheRebuildEvents[type] || cacheRebuildEvents.other, now);
  lastCacheRebuildMs = duration;
}

function totalCacheRebuilds() {
  return backgroundCacheRebuildCount
    + glowCacheRebuildCount
    + rippleCacheRebuildCount
    + starCacheRebuildCount
    + spectrumGeometryRebuildCount
    + otherCacheRebuildCount;
}

function roundedViewportValue(value) {
  return Math.max(1, Math.round(Number(value) || 1));
}

function readStageSize() {
  const width = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || cachedStageWidth || 1;
  const height = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || cachedStageHeight || 1;
  return {
    width: roundedViewportValue(width),
    height: roundedViewportValue(height),
  };
}

function syncCanvasSize() {
  const { width, height } = readStageSize();
  const profile = performanceProfile();
  cachedDevicePixelRatio = window.devicePixelRatio || 1;
  const forcedDpr = Number.isFinite(dprTestValue) && dprTestValue > 0 ? Math.max(1, Math.min(2, dprTestValue)) : 0;
  const ratio = forcedDpr || Math.max(1, Math.min(profile.maxDpr, cachedDevicePixelRatio));
  const stableWidth = cachedCssStageWidth && Math.abs(width - cachedCssStageWidth) < 2 ? cachedCssStageWidth : width;
  const stableHeight = cachedCssStageHeight && Math.abs(height - cachedCssStageHeight) < 2 ? cachedCssStageHeight : height;
  const backingWidth = Math.max(1, Math.round(stableWidth * ratio));
  const backingHeight = Math.max(1, Math.round(stableHeight * ratio));
  const backingSignature = `${backingWidth}x${backingHeight}@${ratio.toFixed(3)}`;
  if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
    const rebuildStart = performance.now();
    cacheRebuildInProgress = true;
    canvas.width = backingWidth;
    canvas.height = backingHeight;
    cachedBackingWidth = backingWidth;
    cachedBackingHeight = backingHeight;
    backingRebuildCount += 1;
    pushRecentEvent(backingRebuildEvents, performance.now());
    lastBackingSignature = backingSignature;
    backingSignatureHistory.push(backingSignature);
    if (backingSignatureHistory.length > 8) backingSignatureHistory.shift();
    lastCacheRebuildMs = performance.now() - rebuildStart;
    cacheRebuildInProgress = false;
  }
  cachedCssStageWidth = stableWidth;
  cachedCssStageHeight = stableHeight;
  renderedDpr = ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  setCssVar('--viewport-width', `${stableWidth.toFixed(2)}px`);
  setCssVar('--viewport-height', `${stableHeight.toFixed(2)}px`);
  document.documentElement.dataset.performance = 'quality';
  return { width: stableWidth, height: stableHeight, ratio };
}

function coreVisualMetrics(stageWidth, stageHeight) {
  layoutReadCount += 1;
  const rect = core.getBoundingClientRect();
  const hasRect = rect.width > 0 && rect.height > 0;
  return {
    cx: hasRect ? rect.left + rect.width / 2 : stageWidth * 0.5,
    cy: hasRect ? rect.top + rect.height / 2 : stageHeight * 0.5,
    size: core.offsetWidth || rect.width || Math.min(stageWidth, stageHeight) * 0.66,
  };
}

function resize() {
  const now = performance.now();
  resizeEventCount += 1;
  pushRecentEvent(resizeEvents, now);
  const result = syncCanvasSize();
  cachedStageWidth = result.width;
  cachedStageHeight = result.height;
  cachedRatio = result.ratio;
  cachedCoreMetrics = coreVisualMetrics(result.width, result.height);
  lastResizeAt = now;
  const sizeSignature = `${result.width}x${result.height}@${result.ratio.toFixed(3)}`;
  if (sizeSignature !== lastSizeSignature) {
    lastSizeSignature = sizeSignature;
    if (!debugNoBgCacheRebuild) {
      const rebuildStart = performance.now();
      cacheRebuildInProgress = true;
      rippleUnitGradient = null;
      visualizerGeometryCache.key = '';
      recordCacheRebuild('other', performance.now() - rebuildStart);
      lastCacheRebuildMs = performance.now() - rebuildStart;
      cacheRebuildInProgress = false;
    }
  }
}

function scheduleLayoutSync() {
  lastLayoutSignature = '';
  if (!resizeFrameId) {
    resizeFrameId = window.requestAnimationFrame(() => {
      resizeFrameId = 0;
      resize();
    });
  }
  for (const id of resizeTimerIds) window.clearTimeout(id);
  resizeTimerIds = [100, 260, 620].map((delay) => window.setTimeout(() => {
    lastLayoutSignature = '';
    resize();
  }, delay));
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

function decodeImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
    if (image.decode) image.decode().then(() => resolve(image)).catch(() => {});
  });
}

async function setAmbientFromTrack(track) {
  const url = track?.backgroundUrl || '';
  const token = ++ambientToken;
  if (!url) {
    setAmbientFallback();
    return;
  }

  if (debugNoBgCacheRebuild && !audio.paused && background.classList.contains('has-cover')) {
    return;
  }

  try {
    cacheRebuildInProgress = true;
    const rebuildStart = performance.now();
    await decodeImage(url);
    if (token !== ambientToken) return;
    background.classList.add('has-cover');
    background.style.setProperty('--ambient-cover', `url("${url}")`);
    recordCacheRebuild('background', performance.now() - rebuildStart);
    cacheRebuildInProgress = false;
    const palette = await extractPalette(url);
    if (token !== ambientToken) return;
    setCssVar('--ambient-a', palette[0]);
    setCssVar('--ambient-b', palette[1]);
    setCssVar('--ambient-c', palette[2]);
  } catch {
    cacheRebuildInProgress = false;
    if (token === ambientToken) setAmbientFallback();
  } finally {
    if (token === ambientToken) cacheRebuildInProgress = false;
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
  activeInheritedTimingPoints = [];
  activeAllTimingPoints = [];
  for (const point of track.timingPoints || []) {
    if (Number.isFinite(point.offset)) activeAllTimingPoints.push(point);
    if (point.uninherited && point.beatLength > 0) activeInheritedTimingPoints.push(point);
  }
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
  for (const particle of particles) recycleParticle(particle);
  for (const particle of starParticles) recycleStarParticle(particle);
  for (const burst of fountainBursts) recycleFountainBurst(burst);
  for (const ring of rippleRings) recycleRippleRing(ring);
  particles.length = 0;
  starParticles.length = 0;
  fountainBursts.length = 0;
  rippleRings.length = 0;
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
  const points = track === tracks[activeIndex] ? activeInheritedTimingPoints : (track.timingPoints || []);
  let picked = null;
  for (const point of points) {
    if (!point.uninherited || point.beatLength <= 0) continue;
    if (!picked) picked = point;
    if (point.offset <= currentMs) picked = point;
    else break;
  }
  return picked;
}

function pickEffectPoint(track, currentMs) {
  const points = track === tracks[activeIndex] ? activeAllTimingPoints : (track.timingPoints || []);
  let picked = points[0] || null;
  for (const point of points) {
    if (!Number.isFinite(point.offset)) continue;
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
  while (scytheEvents.length > 36) scytheEvents.shift();
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

function insertVisualizerCandidate(count, limit, index, target, score) {
  if (count >= limit && score <= visualizerCandidateScores[count - 1]) return count;
  let position = Math.min(count, limit - 1);
  while (position > 0 && score > visualizerCandidateScores[position - 1]) {
    if (position < limit) {
      visualizerCandidateScores[position] = visualizerCandidateScores[position - 1];
      visualizerCandidateTargets[position] = visualizerCandidateTargets[position - 1];
      visualizerCandidateIndexes[position] = visualizerCandidateIndexes[position - 1];
    }
    position -= 1;
  }
  visualizerCandidateScores[position] = score;
  visualizerCandidateTargets[position] = target;
  visualizerCandidateIndexes[position] = index;
  return Math.min(limit, count + 1);
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

function updateLogoAmplitudes(now, elapsed, profile) {
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
  const candidateLimit = Math.round((activeEffectPoint?.kiai ? 20 : 14) + warmup * (activeEffectPoint?.kiai ? 24 : 18));
  const spreadRadius = warmup < 0.42 ? 1 : 2;
  let candidateCount = 0;

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
    if (target > visualizerBars[i]) {
      candidateCount = insertVisualizerCandidate(candidateCount, candidateLimit, i, target, target + freshLift * 0.5);
    }
  }

  for (let candidate = 0; candidate < candidateCount; candidate += 1) {
    const index = visualizerCandidateIndexes[candidate];
    const target = visualizerCandidateTargets[candidate];
    for (let spread = -spreadRadius; spread <= spreadRadius; spread += 1) {
      const wrapped = (index + spread + visualizerBars.length) % visualizerBars.length;
      const falloff = spread === 0 ? 1 : Math.abs(spread) === 1 ? 0.54 : 0.24;
      const spreadTarget = target * falloff;
      if (spreadTarget > visualizerBars[wrapped]) {
        visualizerBars[wrapped] = Math.min(spreadTarget, visualizerBars[wrapped] + attackLimit * falloff);
      }
    }
  }

  for (let i = 1; i < visualizerBars.length - 1; i += 1) {
    const neighbourCap = Math.max(visualizerBars[i - 1], visualizerBars[i + 1]) * 0.92;
    if (visualizerBars[i] > neighbourCap && visualizerBars[i] < 0.08) visualizerBars[i] *= 0.86;
  }

  visualizerOffset = (visualizerOffset + 5) % visualizerBars.length;
}

function spawnBurst(count = 10) {
  const width = cachedStageWidth || readStageSize().width;
  const height = cachedStageHeight || readStageSize().height;
  const cx = width * 0.5;
  const cy = height * 0.5;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const particle = acquireParticle();
    particle.x = cx + cos * (120 + Math.random() * 60);
    particle.y = cy + sin * (120 + Math.random() * 60);
    particle.vx = cos * (1.2 + Math.random() * 3.8);
    particle.vy = sin * (1.2 + Math.random() * 3.8);
    particle.life = 1;
    particle.size = 1.8 + Math.random() * 4.6;
    particles.push(particle);
  }
  while (particles.length > 320) recycleParticle(particles.shift());
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

function acquireParticle() {
  return particlePool.pop() || { x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0 };
}

function recycleParticle(particle) {
  if (particlePool.length < 360) particlePool.push(particle);
}

function acquireStarParticle() {
  return starParticlePool.pop() || {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 980,
    age: 0,
    duration: 0,
    size: 0,
    rotation: 0,
    spin: 0,
    hollow: false,
  };
}

function recycleStarParticle(particle) {
  if (starParticlePool.length < 220) starParticlePool.push(particle);
}

function acquireRippleRing() {
  return rippleRingPool.pop() || { start: 0, duration: 0, power: 0, reason: '' };
}

function recycleRippleRing(ring) {
  if (rippleRingPool.length < 16) rippleRingPool.push(ring);
}

function acquireFountainBurst() {
  return fountainBurstPool.pop() || { start: 0, end: 0, power: 0, direction: 0, lastSpawn: 0 };
}

function recycleFountainBurst(burst) {
  if (fountainBurstPool.length < 8) fountainBurstPool.push(burst);
}

function spawnRipple(power = 0.6, reason = 'beat') {
  const now = performance.now();
  if (now - lastRippleAt < 140) return;
  lastRippleAt = now;
  const ring = acquireRippleRing();
  ring.start = now;
  ring.duration = 980 + power * 520;
  ring.power = power;
  ring.reason = reason;
  rippleRings.push(ring);
  while (rippleRings.length > 10) recycleRippleRing(rippleRings.shift());
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
  const burst = acquireFountainBurst();
  burst.start = now;
  burst.end = now + 720 + power * 170;
  burst.power = Math.min(1.9, power * settings.fountain);
  burst.direction = direction;
  burst.lastSpawn = now - 20;
  fountainBursts.push(burst);
  while (fountainBursts.length > 2) recycleFountainBurst(fountainBursts.shift());
}

function updateStarFountains(now, elapsed, profile) {
  const width = cachedStageWidth || readStageSize().width;
  const height = cachedStageHeight || readStageSize().height;
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
        const particle = acquireStarParticle();
        particle.x = x;
        particle.y = y;
        particle.vx = vx;
        particle.vy = vy;
        particle.gravity = 980;
        particle.age = 0;
        particle.duration = 560 + Math.random() * 620;
        particle.size = 9 + Math.random() * 9;
        particle.rotation = Math.random() * Math.PI * 2;
        particle.spin = (Math.random() - 0.5) * 5.5;
        particle.hollow = Math.random() < 0.34;
        starParticles.push(particle);
        spawnsThisFrame += 1;
      }
    }
  }

  let fbWrite = 0;
  for (let i = 0; i < fountainBursts.length; i += 1) {
    if (now <= fountainBursts[i].end) {
      fountainBursts[fbWrite++] = fountainBursts[i];
    } else {
      recycleFountainBurst(fountainBursts[i]);
    }
  }
  fountainBursts.length = fbWrite;
  while (starParticles.length > profile.starMax) recycleStarParticle(starParticles.pop());
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
    } else {
      recycleStarParticle(particle);
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
  const bucket = Math.max(8, Math.min(28, Math.round(radius / 2) * 2));
  const key = `${hollow ? 'h' : 'f'}:${bucket}`;
  if (starSpriteCache.has(key)) return starSpriteCache.get(key);
  const rebuildStart = performance.now();
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
  recordCacheRebuild('star', performance.now() - rebuildStart);
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
  const rebuildStart = performance.now();
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
  recordCacheRebuild('star', performance.now() - rebuildStart);
  return sprite;
}

function prewarmStarSprites() {
  const warmStart = performance.now();
  for (let bucket = 8; bucket <= 28; bucket += 2) {
    starSprite(false, bucket);
    starSprite(true, bucket);
  }
  for (let bucket = 12; bucket <= 56; bucket += 4) {
    starGlowSprite(bucket);
  }
  recordCacheRebuild('star', performance.now() - warmStart);
}

function rippleGradient() {
  if (rippleUnitGradient) return rippleUnitGradient;
  const rebuildStart = performance.now();
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.74)');
  gradient.addColorStop(0.24, 'rgba(255, 255, 255, 0.36)');
  gradient.addColorStop(0.58, 'rgba(255, 255, 255, 0.13)');
  gradient.addColorStop(0.82, 'rgba(255, 255, 255, 0.035)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  rippleUnitGradient = gradient;
  recordCacheRebuild('ripple', performance.now() - rebuildStart);
  return rippleUnitGradient;
}

function drawRippleRings(cx, cy, coreSize, now, stageWidth, stageHeight) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gradient = rippleGradient();
  let rrWrite = 0;
  for (let i = 0; i < rippleRings.length; i += 1) {
    const ring = rippleRings[i];
    const progress = Math.max(0, Math.min(1, (now - ring.start) / ring.duration));
    const eased = 1 - Math.pow(1 - progress, 2.05);
    const maxRadius = Math.min(stageWidth, stageHeight) * 0.67 * Math.max(0.05, settings.waveSize);
    const radius = coreSize * 0.46 + eased * maxRadius;
    const fade = Math.pow(1 - progress, 1.06);
    const alpha = fade * (0.34 + ring.power * 0.28) * Math.max(0, settings.waveIntensity);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(radius, radius);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (now - ring.start < ring.duration) {
      rippleRings[rrWrite++] = ring;
    } else {
      recycleRippleRing(ring);
    }
  }
  ctx.restore();
  rippleRings.length = rrWrite;
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

function createDebugPerfPanel() {
  if (!debugPerfEnabled && !fpsOnlyEnabled) return null;
  const panel = document.createElement('pre');
  panel.id = 'debug-perf-panel';
  panel.dataset.debugPerfPanel = debugPerfEnabled ? 'full' : 'fps-only';
  panel.style.cssText = [
    'position:fixed',
    'right:10px',
    'bottom:10px',
    'z-index:9999',
    'margin:0',
    'padding:8px 10px',
    'max-width:min(360px,calc(100vw - 20px))',
    'pointer-events:none',
    'font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
    'color:rgba(255,255,255,0.92)',
    'background:rgba(7,5,13,0.72)',
    'border:1px solid rgba(255,255,255,0.16)',
    'border-radius:8px',
    'box-shadow:0 10px 34px rgba(0,0,0,0.28)',
    'white-space:pre-wrap',
    'contain:layout paint style',
  ].join(';');
  document.body.appendChild(panel);
  return panel;
}

const debugPerfPanel = createDebugPerfPanel();

function heapUsageText() {
  const memory = performance.memory;
  if (!memory) return 'unsupported';
  return `${(memory.usedJSHeapSize / 1048576).toFixed(1)} / ${(memory.jsHeapSizeLimit / 1048576).toFixed(0)} MB`;
}

function percentile(sortedValues, ratio) {
  if (!sortedValues.length) return 0;
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil(sortedValues.length * ratio) - 1));
  return sortedValues[index];
}

function recordRenderStage(name, duration) {
  if (!renderStageStatsEnabled) return;
  const events = renderStageWindows[name];
  if (!events) return;
  events.push({ at: performance.now(), ms: duration });
}

function updateRenderStageSummaries(now) {
  const cutoff = now - 10000;
  for (const name of renderStageNames) {
    const events = renderStageWindows[name];
    while (events.length && events[0].at < cutoff) events.shift();
    if (!events.length) {
      renderStageSummary[name].avg = 0;
      renderStageSummary[name].p95 = 0;
      renderStageSummary[name].count = 0;
      continue;
    }
    let total = 0;
    const values = new Array(events.length);
    for (let i = 0; i < events.length; i += 1) {
      const ms = events[i].ms;
      values[i] = ms;
      total += ms;
    }
    values.sort((a, b) => a - b);
    renderStageSummary[name].avg = total / events.length;
    renderStageSummary[name].p95 = percentile(values, 0.95);
    renderStageSummary[name].count = events.length;
  }
}

function topRenderStages(limit = 3) {
  return renderStageNames
    .map((name) => ({ name, ...renderStageSummary[name] }))
    .sort((a, b) => b.p95 - a.p95)
    .slice(0, limit);
}

function updatePerfSummary(now, elapsed) {
  if (!perfStatsEnabled) return;
  frameStatsWindow.push({ at: now, ms: elapsed });
  const cutoff = now - 10000;
  while (frameStatsWindow.length && frameStatsWindow[0].at < cutoff) frameStatsWindow.shift();
  const sampleCount = frameStatsWindow.length;
  if (!sampleCount) return;

  const duration = Math.max(1, frameStatsWindow[sampleCount - 1].at - frameStatsWindow[0].at);
  let minFrame = Infinity;
  let maxFrame = 0;
  let droppedFrames = 0;
  let longFrames = 0;
  let veryLongFrames = 0;
  const frameTimes = new Array(sampleCount);
  for (let i = 0; i < sampleCount; i += 1) {
    const frameMs = frameStatsWindow[i].ms;
    frameTimes[i] = frameMs;
    if (frameMs < minFrame) minFrame = frameMs;
    if (frameMs > maxFrame) maxFrame = frameMs;
    if (frameMs > 33) longFrames += 1;
    if (frameMs > 50) veryLongFrames += 1;
    droppedFrames += Math.max(0, Math.floor(frameMs / 16.67) - 1);
  }
  frameTimes.sort((a, b) => a - b);
  perfSummary.avgFps = sampleCount * 1000 / duration;
  perfSummary.minFps = minFrame > 0 ? 1000 / maxFrame : 0;
  perfSummary.maxFps = minFrame > 0 ? 1000 / minFrame : 0;
  perfSummary.p95FrameMs = percentile(frameTimes, 0.95);
  perfSummary.p99FrameMs = percentile(frameTimes, 0.99);
  perfSummary.droppedFrames = droppedFrames;
  perfSummary.longFrames = longFrames;
  perfSummary.veryLongFrames = veryLongFrames;
  perfSummary.sampleCount = sampleCount;

  if (perfLogEnabled && now - lastPerfLogAt >= 10000) {
    lastPerfLogAt = now;
    updateRenderStageSummaries(now);
    console.log('[perfLog]', {
      fps: Number(latestFps.toFixed(1)),
      avgFps10s: Number(perfSummary.avgFps.toFixed(1)),
      p95FrameMs: Number(perfSummary.p95FrameMs.toFixed(2)),
      p99FrameMs: Number(perfSummary.p99FrameMs.toFixed(2)),
      droppedFrames,
      longFrames,
      veryLongFrames,
      visualizerBars: lastVisualizerBarCount,
      visualizerDrawBatches: lastVisualizerDrawBatchCount,
      canvasStateChanges: lastCanvasStateChangeCount,
      renderStages10s: Object.fromEntries(renderStageNames.map((name) => [name, {
        avgMs: Number(renderStageSummary[name].avg.toFixed(3)),
        p95Ms: Number(renderStageSummary[name].p95.toFixed(3)),
      }])),
      compositeSafeMode,
      safeCssSource,
    });
  }
}

function updateDebugPerfPanel(now) {
  const updateMs = fpsOnlyEnabled && !debugPerfEnabled ? FPS_ONLY_UPDATE_MS : DEBUG_PANEL_UPDATE_MS;
  if (!debugPerfPanel || now - lastPerfPanelUpdate < updateMs) return;
  lastPerfPanelUpdate = now;
  if (renderStageStatsEnabled) updateRenderStageSummaries(now);
  if (fpsOnlyEnabled && !debugPerfEnabled) {
    const textValue = [
      `FPS: ${latestFps.toFixed(1)}`,
      `avg FPS 10s: ${perfSummary.avgFps.toFixed(1)}`,
      `P95 frame 10s: ${perfSummary.p95FrameMs.toFixed(2)} ms`,
      `debug panel update hz: ${(1000 / updateMs).toFixed(1)}`,
    ].join('\n');
    if (textValue !== lastPerfPanelText) {
      debugPerfPanel.textContent = textValue;
      lastPerfPanelText = textValue;
    }
    return;
  }
  const resizeCount5s = pruneRecentEvents(resizeEvents, now);
  const backingCount5s = pruneRecentEvents(backingRebuildEvents, now);
  const backgroundCache5s = pruneRecentEvents(cacheRebuildEvents.background, now);
  const glowCache5s = pruneRecentEvents(cacheRebuildEvents.glow, now);
  const rippleCache5s = pruneRecentEvents(cacheRebuildEvents.ripple, now);
  const starCache5s = pruneRecentEvents(cacheRebuildEvents.star, now);
  const spectrumCache5s = pruneRecentEvents(cacheRebuildEvents.spectrum, now);
  const otherCache5s = pruneRecentEvents(cacheRebuildEvents.other, now);
  const resizePrefix = debugShowResize && (resizeCount5s || backingCount5s) ? '! ' : '';
  const stageTopText = topRenderStages(3)
    .map((stage) => `${stage.name} ${stage.avg.toFixed(2)}/${stage.p95.toFixed(2)}ms`)
    .join(' | ');
  const visualViewportText = window.visualViewport
    ? `${window.visualViewport.width.toFixed(1)} x ${window.visualViewport.height.toFixed(1)}`
    : 'unsupported';
  const textValue = [
    `FPS: ${latestFps.toFixed(1)}`,
    `frame: ${latestFrameTimeMs.toFixed(2)} ms`,
    `window: ${window.innerWidth} x ${window.innerHeight}`,
    `visualViewport: ${visualViewportText}`,
    `canvas CSS: ${cachedCssStageWidth.toFixed(0)} x ${cachedCssStageHeight.toFixed(0)}`,
    `canvas backing: ${canvas.width} x ${canvas.height}`,
    `devicePixelRatio: ${cachedDevicePixelRatio.toFixed(2)}`,
    `renderer DPR: ${renderedDpr.toFixed(3)}`,
    `compositeSafeMode: ${compositeSafeMode ? 'on' : 'off'} (${compositeSafeReason})`,
    `effectiveCssSafe: ${effectiveCssSafe ? 'on' : 'off'}`,
    `safeCssSource: ${safeCssSource}`,
    `unsafeCssFxActive: ${effectiveCssSafe ? 'no' : 'yes'}`,
    `avg FPS 10s: ${perfSummary.avgFps.toFixed(1)} min/max: ${perfSummary.minFps.toFixed(1)} / ${perfSummary.maxFps.toFixed(1)}`,
    `P95/P99 frame 10s: ${perfSummary.p95FrameMs.toFixed(2)} / ${perfSummary.p99FrameMs.toFixed(2)} ms`,
    `dropped est 10s: ${perfSummary.droppedFrames} long>33ms: ${perfSummary.longFrames} veryLong>50ms: ${perfSummary.veryLongFrames}`,
    `stage top3 avg/P95 10s: ${stageTopText}`,
    `debug panel update hz: ${(1000 / DEBUG_PANEL_UPDATE_MS).toFixed(1)}`,
    `${resizePrefix}resize 5s: ${resizeCount5s} / total ${resizeEventCount}`,
    `${resizePrefix}backing rebuild 5s: ${backingCount5s} / total ${backingRebuildCount}`,
    `backing signatures: ${backingSignatureHistory.join(' -> ') || lastBackingSignature || 'none'}`,
    `active render loops: ${activeRenderLoopCount}`,
    `particles/frame: ${lastParticleCount}`,
    `visualizer bars/frame: ${lastVisualizerBarCount}`,
    `visualizer draw batches/frame: ${lastVisualizerDrawBatchCount}`,
    `canvas state changes/frame: ${lastCanvasStateChangeCount}`,
    `path rebuilds 5s: ${spectrumCache5s}`,
    `cached layers: spectrum ${visualizerGeometryCache.key ? 'yes' : 'warming'} / ripple ${rippleUnitGradient ? 'yes' : 'warming'} / star ${starSpriteCache.size + starGlowSpriteCache.size}`,
    `cache rebuilds total: ${totalCacheRebuilds()}`,
    `cache 5s bg/glow/ripple/star/spectrum/other: ${backgroundCache5s}/${glowCache5s}/${rippleCache5s}/${starCache5s}/${spectrumCache5s}/${otherCache5s}`,
    `cache total bg/glow/ripple/star/spectrum/other: ${backgroundCacheRebuildCount}/${glowCacheRebuildCount}/${rippleCacheRebuildCount}/${starCacheRebuildCount}/${spectrumGeometryRebuildCount}/${otherCacheRebuildCount}`,
    `last cache rebuild: ${lastCacheRebuildMs.toFixed(2)} ms`,
    `rebuilding cache: ${cacheRebuildInProgress ? 'yes' : 'no'}`,
    `debug flags: allCss=${debugNoCssFx ? 'off' : 'on'} backdrop=${debugNoBackdropFx ? 'off' : 'on'} blur=${debugNoBlurFx ? 'off' : 'on'} blend=${debugNoBlendFx ? 'off' : 'on'} shadow=${debugNoShadowFx ? 'off' : 'on'}`,
    `debug flags: side=${debugNoSideLightFx ? 'off' : 'on'} bgCss=${debugNoBgCssFx ? 'off' : 'on'} panelBackdrop=${debugNoPanelBackdropFx ? 'off' : 'on'} noBgCacheRebuild=${debugNoBgCacheRebuild ? '1' : '0'} solidCanvasBg=${debugSolidCanvasBg ? '1' : '0'}`,
    `combo flags: allBg=${debugNoAllBgFx ? 'off' : 'on'} allPanel=${debugNoAllPanelFx ? 'off' : 'on'} allLight=${debugNoAllLightFx ? 'off' : 'on'} allAnim=${debugNoAllAnimationFx ? 'off' : 'on'} allFixed=${debugNoAllFixedFx ? 'off' : 'on'}`,
    `combo flags: cssButKeepBg=${debugNoCssFxButKeepBg ? '1' : '0'} cssOnlyBg=${debugNoCssFxOnlyBg ? '1' : '0'}`,
    `bg flags: freeze=${debugFreezeBg ? '1' : '0'} noImage=${debugNoBgImage ? '1' : '0'} noPseudo=${debugNoBgPseudo ? '1' : '0'} noAnim=${debugNoBgAnimation ? '1' : '0'} blendOnly=${debugNoBgBlendOnly ? 'off' : 'on'} filterOnly=${debugNoBgFilterOnly ? 'off' : 'on'} transformOnly=${debugNoBgTransformOnly ? 'off' : 'on'} opacityOnly=${debugNoBgOpacityOnly ? 'off' : 'on'}`,
    `canvas debug: noClear=${debugNoCanvasClear ? '1' : '0'} noBg=${debugNoCanvasBgDraw ? '1' : '0'} noCore=${debugNoCoreDraw ? '1' : '0'} noSpectrum=${debugNoSpectrumDraw ? '1' : '0'} noRipple=${debugNoRippleDraw ? '1' : '0'} noStar=${debugNoStarDraw ? '1' : '0'} noGlow=${debugNoGlowDraw ? '1' : '0'} dprTest=${Number.isFinite(dprTestValue) && dprTestValue > 0 ? dprTestValue : 'off'}`,
    `tab hidden: ${document.hidden ? 'yes' : 'no'}`,
    `last resize: ${(now - lastResizeAt).toFixed(0)} ms ago`,
    `layout reads: ${layoutReadCount}`,
    `JS heap: ${heapUsageText()}`,
  ].join('\n');
  if (textValue !== lastPerfPanelText) {
    debugPerfPanel.textContent = textValue;
    lastPerfPanelText = textValue;
  }
}

function resetCanvasState() {
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'rgba(0, 0, 0, 0)';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

function scheduleNextFrame() {
  rafId = window.requestAnimationFrame(draw);
}

function startRenderLoop() {
  if (renderLoopRunning) return;
  renderLoopRunning = true;
  activeRenderLoopCount = 1;
  window.__osuVisualShellActiveRenderLoops = activeRenderLoopCount;
  scheduleNextFrame();
}

function draw() {
  rafId = 0;
  scheduleNextFrame();
  try {
  const now = performance.now();
  const elapsed = Math.min(80, now - lastFrameAt);
  lastFrameAt = now;
  latestFrameTimeMs = elapsed;
  lastCanvasStateChangeCount = 0;
  frameCountForStats += 1;
  frameTimeSum += elapsed;
  if (frameTimeSum >= 250) {
    latestFps = frameCountForStats * 1000 / frameTimeSum;
    frameCountForStats = 0;
    frameTimeSum = 0;
  }
  let stageStart = renderStageStatsEnabled ? performance.now() : 0;
  updatePerfSummary(now, elapsed);
  if (renderStageStatsEnabled) {
    recordRenderStage('debugStats', performance.now() - stageStart);
    stageStart = performance.now();
  }
  updateAdaptiveQuality(elapsed);
  const profile = performanceProfile();

  updateAudioEnergy();
  updateLogoAmplitudes(now, elapsed, profile);
  updateTiming();
  updateProgress();
  updateStarFountains(now, elapsed, profile);

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
  if (!envelopeAlive(sideEnvelopes.leftSoft, now)) sideEnvelopes.leftSoft = null;
  if (!envelopeAlive(sideEnvelopes.rightSoft, now)) sideEnvelopes.rightSoft = null;
  if (!envelopeAlive(sideEnvelopes.leftHard, now)) sideEnvelopes.leftHard = null;
  if (!envelopeAlive(sideEnvelopes.rightHard, now)) sideEnvelopes.rightHard = null;

  if (now - lastInteraction > idleAfterMs) {
    if (app.dataset.panel !== 'idle') app.dataset.panel = 'idle';
    document.body.classList.add('is-idle');
  }

  ctx.setTransform(cachedRatio, 0, 0, cachedRatio, 0, 0);
  resetCanvasState();
  const width = cachedStageWidth;
  const height = cachedStageHeight;
  if (!debugNoCanvasClear) ctx.clearRect(0, 0, width, height);
  if (renderStageStatsEnabled) {
    recordRenderStage('clear', performance.now() - stageStart);
    stageStart = performance.now();
  }
  if (debugSolidCanvasBg && !debugNoCanvasBgDraw) {
    ctx.fillStyle = 'rgb(7, 5, 13)';
    ctx.fillRect(0, 0, width, height);
  }
  if (renderStageStatsEnabled) {
    recordRenderStage('background', performance.now() - stageStart);
    stageStart = performance.now();
  }

  const beatMotion = !audio.paused ? continuousBeat * 0.015 : 0;
  const energy = Math.max(smoothedEnergy * 1.08, logoPulse * 0.34, coreBreath * 0.92, beatMotion);
  const earlyDip = timingPulse > 0.5 ? -0.005 * Math.min(1, timingPulse) : 0;
  const coreMetrics = cachedCoreMetrics;
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
  if (debugPerfEnabled) window.__visualDebug = {
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
    visualizerDrawBatches: lastVisualizerDrawBatchCount,
    canvasStateChanges: lastCanvasStateChangeCount,
    compositeSafeMode,
    compositeSafeReason,
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
  if (!debugNoCoreDraw && core.style.transform !== coreTransform) core.style.transform = coreTransform;
  if (!debugNoCoreDraw && coreAura) {
    const ghostSize = Math.max(0.05, 1 + (settings.ghostSize ?? 0));
    const relativeGhostScale = Math.max(0.2, (coreGhostScale / Math.max(0.2, coreScale)) * ghostSize * (1.025 + auraBreath * 0.12));
    const ghostTransform = `scale(${relativeGhostScale.toFixed(4)})`;
    if (coreAura.style.transform !== ghostTransform) coreAura.style.transform = ghostTransform;
  }
  const glow = Math.max(0, settings.coreGlow || 0);
  const glowColour = glowColourCache;
  const outerGlowAlpha = Math.min(0.9, (0.34 + energy * 0.5 + coreFlash * 0.22) * glow);
  const innerGlowAlpha = Math.min(0.5, (0.08 + coreFlash * 0.18) * glow);
  const innerGlowSize = (18 + coreFlash * 28).toFixed(1);
  const coreShadow = glow <= 0.001
    ? 'none'
    : `0 0 ${(54 + energy * 170 + coreFlash * 80).toFixed(1)}px rgba(${glowColour.r}, ${glowColour.g}, ${glowColour.b}, ${outerGlowAlpha.toFixed(3)}), inset 0 0 ${innerGlowSize}px rgba(255, 255, 255, ${innerGlowAlpha.toFixed(3)})`;
  if (!debugNoCoreDraw && !debugNoGlowDraw && core.style.boxShadow !== coreShadow) core.style.boxShadow = coreShadow;

  if (!debugNoCoreDraw) {
    setCssVar('--energy', energy.toFixed(2));
    setCssVar('--core-flash', Math.min(1, coreFlash).toFixed(2));
    setCssVar('--core-breath', Math.min(1.2, coreBreath).toFixed(2));
    setCssVar('--aura-breath', Math.min(1.2, auraBreath).toFixed(2));
    setCssVar('--ghost-intensity', Math.max(0, settings.ghostIntensity || 0).toFixed(3));
    setCssVar('--ghost-blur', Math.max(0, settings.ghostBlur || 0).toFixed(3));
  }
  const visualLight = Math.max(lightEnergy, sectionHeat * 0.12);
  if (!debugNoGlowDraw) {
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
  }
  if (renderStageStatsEnabled) {
    recordRenderStage('core', performance.now() - stageStart);
    stageStart = performance.now();
  }

  if (!debugNoRippleDraw) drawRippleRings(coreMetrics.cx, coreMetrics.cy, coreSize, now, width, height);
  if (renderStageStatsEnabled) {
    recordRenderStage('ripple', performance.now() - stageStart);
    stageStart = performance.now();
  }
  if (!debugNoSpectrumDraw) drawLogoVisualizer(coreMetrics.cx, coreMetrics.cy, coreSize, profile, now);
  else {
    lastVisualizerBarCount = 0;
    lastVisualizerDrawBatchCount = 0;
  }
  if (renderStageStatsEnabled) {
    recordRenderStage('spectrum', performance.now() - stageStart);
    stageStart = performance.now();
  }

  if (!debugNoStarDraw) {
    const pStart = particles.length > profile.particleMax ? particles.length - profile.particleMax : 0;
    for (let i = 0; i < pStart; i += 1) recycleParticle(particles[i]);
    let pWrite = 0;
    for (let i = pStart; i < particles.length; i += 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.986;
      particle.vy *= 0.986;
      particle.life *= 0.962;
      if (particle.life > 0.04) {
        ctx.fillStyle = rgbaPink[Math.round(particle.life * 0.88 * 255)];
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
        particles[pWrite++] = particle;
      } else {
        recycleParticle(particle);
      }
    }
    particles.length = pWrite;

    const starGlow = Math.max(0, settings.starGlow || 0);
    if (!debugNoGlowDraw && starGlow > 0.01) {
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
  }
  if (renderStageStatsEnabled) {
    recordRenderStage('stars', performance.now() - stageStart);
    stageStart = performance.now();
  }

  resetCanvasState();
  lastParticleCount = particles.length + starParticles.length + rippleRings.length;
  if (renderStageStatsEnabled) {
    recordRenderStage('finalComposite', performance.now() - stageStart);
    stageStart = performance.now();
  }
  updateDebugPerfPanel(now);
  if (renderStageStatsEnabled) recordRenderStage('debugStats', performance.now() - stageStart);
  } catch (error) {
    window.__visualError = error?.stack || String(error);
  }
}

function visualizerGeometry(profile) {
  const key = `${visualizerBars.length}:${profile.visualizerRounds}:${profile.visualizerStep}`;
  if (visualizerGeometryCache.key === key) return visualizerGeometryCache.values;
  const rebuildStart = performance.now();
  const entries = Math.ceil(visualizerBars.length / profile.visualizerStep) * profile.visualizerRounds;
  const values = new Float32Array(entries * 3);
  let write = 0;
  for (let round = 0; round < profile.visualizerRounds; round += 1) {
    const roundOffset = (round * Math.PI * 2) / profile.visualizerRounds;
    for (let i = 0; i < visualizerBars.length; i += profile.visualizerStep) {
      const angle = (i / visualizerBars.length) * Math.PI * 2 + roundOffset;
      values[write++] = i;
      values[write++] = Math.cos(angle);
      values[write++] = Math.sin(angle);
    }
  }
  visualizerGeometryCache.key = key;
  visualizerGeometryCache.values = values;
  recordCacheRebuild('spectrum', performance.now() - rebuildStart);
  return values;
}

function ensureVisualizerBatchCapacity(entries) {
  if (visualizerBatchCache.capacity >= entries) return;
  visualizerBatchCache.capacity = entries;
  visualizerBatchCache.darkItems = new Uint16Array(entries);
  visualizerBatchCache.paleItems = new Uint16Array(entries);
}

function addVisualizerBarPath(pathCtx, cos, sin, radius, length, halfWidth) {
  const hws = halfWidth * sin;
  const hwc = halfWidth * cos;
  const x0 = radius * cos;
  const y0 = radius * sin;
  const x1 = (radius + length) * cos;
  const y1 = (radius + length) * sin;
  pathCtx.moveTo(x0 + hws, y0 - hwc);
  pathCtx.lineTo(x1 + hws, y1 - hwc);
  pathCtx.lineTo(x1 - hws, y1 + hwc);
  pathCtx.lineTo(x0 - hws, y0 + hwc);
  pathCtx.closePath();
}

function visualizerAlphaBucket(alpha) {
  return Math.max(0, Math.min(255, Math.round((alpha * 255) / VISUALIZER_ALPHA_BUCKET_STEP) * VISUALIZER_ALPHA_BUCKET_STEP));
}

function drawLogoVisualizer(cx, cy, coreSize, profile, now) {
  const dlvStart = debugPerfEnabled ? performance.now() : 0;
  const bars = visualizerBars.length;
  const geometry = visualizerGeometry(profile);
  const entries = geometry.length / 3;
  ensureVisualizerBatchCapacity(entries);
  const baseRadius = coreSize * 0.472;
  const maxBarLength = coreSize * 0.58 * Math.max(0.05, settings.visualizerRange);
  const paleMinLength = coreSize * 0.022;
  const barWidth = Math.max(5.2, (Math.PI * 2 * coreSize * 0.5) / bars * 0.86);
  const deadZone = Math.max(0.0075, 1 / Math.max(1, maxBarLength));
  const darkWidth = barWidth * 0.92;
  const paleWidth = barWidth * 0.78;
  const hwDark = darkWidth * 0.5;
  const hwPale = paleWidth * 0.5;
  const paleBaseRadius = baseRadius + darkWidth * 0.06;
  const paleStrokeWidth = Math.max(1.2, paleWidth * 0.18);
  const {
    darkCounts,
    paleCounts,
    darkOffsets,
    paleOffsets,
    darkCursors,
    paleCursors,
    darkItems,
    paleItems,
  } = visualizerBatchCache;

  darkCounts.fill(0);
  paleCounts.fill(0);
  lastVisualizerBarCount = 0;
  lastVisualizerDrawBatchCount = 0;

  for (let offset = 0; offset < geometry.length; offset += 3) {
    const i = geometry[offset];
    const amplitude = visualizerBars[i];
    if (amplitude <= deadZone) continue;
    const length = amplitude * maxBarLength;
    const darkAlphaIndex = visualizerAlphaBucket(Math.min(0.28, 0.05 + amplitude * 0.62));
    darkCounts[darkAlphaIndex] += 1;
    lastVisualizerBarCount += 1;
    if (profile.drawPaleBars && length > paleMinLength) {
      const paleAlphaIndex = visualizerAlphaBucket(Math.min(0.2, 0.026 + amplitude * 0.32));
      paleCounts[paleAlphaIndex] += 1;
      lastVisualizerBarCount += 1;
    }
  }

  let darkTotal = 0;
  let paleTotal = 0;
  for (let alpha = 0; alpha < 256; alpha += 1) {
    darkOffsets[alpha] = darkTotal;
    paleOffsets[alpha] = paleTotal;
    darkTotal += darkCounts[alpha];
    paleTotal += paleCounts[alpha];
  }
  darkOffsets[256] = darkTotal;
  paleOffsets[256] = paleTotal;
  darkCursors.set(darkOffsets.subarray(0, 256));
  paleCursors.set(paleOffsets.subarray(0, 256));

  let entryIndex = 0;
  for (let offset = 0; offset < geometry.length; offset += 3) {
    const i = geometry[offset];
    const amplitude = visualizerBars[i];
    if (amplitude > deadZone) {
      const length = amplitude * maxBarLength;
      const darkAlphaIndex = visualizerAlphaBucket(Math.min(0.28, 0.05 + amplitude * 0.62));
      darkItems[darkCursors[darkAlphaIndex]] = entryIndex;
      darkCursors[darkAlphaIndex] += 1;
      if (profile.drawPaleBars && length > paleMinLength) {
        const paleAlphaIndex = visualizerAlphaBucket(Math.min(0.2, 0.026 + amplitude * 0.32));
        paleItems[paleCursors[paleAlphaIndex]] = entryIndex;
        paleCursors[paleAlphaIndex] += 1;
      }
    }
    entryIndex += 1;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'lighter';
  ctx.rotate(now / 27000);
  lastCanvasStateChangeCount += 4;

  for (let alpha = 0; alpha < 256; alpha += 1) {
    const start = darkOffsets[alpha];
    const end = darkOffsets[alpha + 1];
    if (start === end) continue;
    ctx.fillStyle = rgbaWhite[alpha];
    ctx.beginPath();
    lastCanvasStateChangeCount += 1;
    for (let item = start; item < end; item += 1) {
      const offset = darkItems[item] * 3;
      const i = geometry[offset];
      const amplitude = visualizerBars[i];
      if (amplitude <= deadZone) continue;
      const length = amplitude * maxBarLength;
      const cos = geometry[offset + 1];
      const sin = geometry[offset + 2];
      addVisualizerBarPath(ctx, cos, sin, baseRadius, length, hwDark);
    }
    ctx.fill();
    lastVisualizerDrawBatchCount += 1;
  }

  if (profile.drawPaleBars && paleTotal > 0) {
    ctx.lineWidth = paleStrokeWidth;
    lastCanvasStateChangeCount += 1;
    for (let alpha = 0; alpha < 256; alpha += 1) {
      const start = paleOffsets[alpha];
      const end = paleOffsets[alpha + 1];
      if (start === end) continue;
      ctx.strokeStyle = rgbaWhite[alpha];
      ctx.beginPath();
      lastCanvasStateChangeCount += 1;
      for (let item = start; item < end; item += 1) {
        const offset = paleItems[item] * 3;
        const i = geometry[offset];
        const amplitude = visualizerBars[i];
        const length = amplitude * maxBarLength;
        const cos = geometry[offset + 1];
        const sin = geometry[offset + 2];
        addVisualizerBarPath(ctx, cos, sin, paleBaseRadius, length * 0.94, hwPale);
      }
      ctx.stroke();
      lastVisualizerDrawBatchCount += 1;
    }
  }

  ctx.restore();
  lastCanvasStateChangeCount += 1;
  if (debugPerfEnabled) {
    const dlvMs = performance.now() - dlvStart;
    drawVisualizerAvgMs = drawVisualizerAvgMs * 0.95 + dlvMs * 0.05;
  }
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
  const height = cachedStageHeight || readStageSize().height;
  if (event.clientY <= height * 0.2 || app.dataset.panel !== 'idle') touch();
}, { passive: true });
let lastLayoutSignature = '';
setInterval(() => {
  const width = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || cachedStageWidth || 1;
  const height = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || cachedStageHeight || 1;
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
  const button = event.detail ? transportButtonsById.get(event.detail) : null;
  runTransportButton(event, button);
});
scanPanel.addEventListener('pointerdown', () => touch('scan'));
songPanel.addEventListener('pointerdown', () => touch('songs'));
settingsPanel.addEventListener('pointerdown', () => touch('settings'));

openScanButton.addEventListener('click', () => setPanel('scan'));
openLibraryButton.addEventListener('click', () => setPanel(tracks.length ? 'songs' : 'scan'));
openSettingsButton.addEventListener('click', () => setPanel('settings'));
topScanButton.addEventListener('click', () => setPanel('scan'));
topLibraryButton.addEventListener('click', () => setPanel(tracks.length ? 'songs' : 'scan'));
topSettingsButton.addEventListener('click', () => setPanel('settings'));
minimizeControls.addEventListener('click', () => setPanel('idle'));
closeScanButton.addEventListener('click', () => setPanel('idle'));
closeLibraryButton.addEventListener('click', () => setPanel('idle'));
closeSettingsButton.addEventListener('click', () => setPanel('idle'));
detectOsuButton.addEventListener('click', detectOsu);
scanOsuButton.addEventListener('click', () => scan('osu'));
scanLazerButton.addEventListener('click', () => scan('lazer'));
scanMusicButton.addEventListener('click', () => scan('music'));
prevButton.addEventListener('click', (event) => runTransport(event, () => stepTrack(-1)));
playButton.addEventListener('click', (event) => runTransport(event, togglePlay));
nextButton.addEventListener('click', (event) => runTransport(event, () => stepTrack(1)));
topPrevButton.addEventListener('click', (event) => runTransport(event, () => stepTrack(-1)));
topPlayButton.addEventListener('click', (event) => runTransport(event, togglePlay));
topNextButton.addEventListener('click', (event) => runTransport(event, () => stepTrack(1)));
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
prewarmStarSprites();
startRenderLoop();
detectOsu();
}
