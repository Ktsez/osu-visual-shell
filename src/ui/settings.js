import { clamp, normaliseHexColour } from '../utils/format.js';

export const defaultSettings = {
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

export const settingsKey = 'osu-visual-shell-settings-v10';

export function createSettingsStore(defaults = defaultSettings, storage = localStorage) {
  const settings = { ...defaults };

  function load() {
    try {
      Object.assign(settings, JSON.parse(storage.getItem(settingsKey) || '{}'));
    } catch {
      // Keep defaults when storage contains invalid data.
    }
    return settings;
  }

  function save() {
    storage.setItem(settingsKey, JSON.stringify(settings));
  }

  function reset() {
    Object.assign(settings, defaults);
    save();
    return settings;
  }

  function setNumber(key, value, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
    const fallback = defaults[key] ?? 1;
    const numeric = Number.isFinite(Number(value)) ? Number(value) : fallback;
    settings[key] = clamp(numeric, min, max);
    save();
    return settings[key];
  }

  function setColour(key, value) {
    settings[key] = normaliseHexColour(value, defaults[key]);
    save();
    return settings[key];
  }

  return { settings, load, save, reset, setNumber, setColour };
}
