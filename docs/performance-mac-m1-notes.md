# Mac M1 Performance Notes

## Current Problem Background

The project initially showed severe performance problems on MacBook Air M1: very low FPS, visible stutter, and chaotic flashing. Windows behaved differently: it could drop frames, but it did not show the same flashing/compositor instability.

The current target remains stable 60 FPS on MacBook Air M1 without removing page elements, changing layout, reducing visual density, or replacing the established visual style.

## Completed Optimizations

- Added the `debugPerf` panel for FPS, frame time, canvas size, DPR, render loop count, cache rebuilds, and longer-term performance metrics.
- Added `fpsOnly=1` for lightweight FPS / average FPS / P95 frame-time checks.
- Added `perfLog=1` for periodic console performance summaries.
- Added `compositeSafeMode`.
- Enabled `compositeSafeMode` automatically for Mac / Retina environments.
- Added `forceCompositeSafe=1` and `forceCompositeSafe=0` URL overrides.
- Kept `noCssFx=1` as a debug comparison path.
- Added fine-grained CSS FX debug switches for backdrop, blur, blend, shadow, side light, background CSS FX, and panel backdrop FX.
- Added grouped and background-specific CSS FX diagnostic switches.
- Changed background image handling so new backgrounds are decoded before replacing the old background.
- Added requestAnimationFrame singleton protection.
- Cached DOM nodes used by hot paths.
- Coalesced resize handling and avoided repeated backing-store rebuilds.
- Preprocessed timing points for cheaper playback-time lookup.
- Cached spectrum geometry.
- Batched spectrum rendering by alpha buckets while preserving `bars/frame` density.
- Added particle, star, ripple, and fountain object pools or reusable caches.
- Stabilized star sprite/glow cache with prewarming and finite size buckets.
- Reduced debug panel DOM writes to 4 Hz.

## Current Verification Conclusions

- `forceCompositeSafe=0` causes severe stutter and flashing on Mac M1 and must not be the Mac default path.
- `compositeSafeMode` / `noCssFx` substantially reduce or remove flashing.
- Disabling only one CSS FX category, such as backdrop, blur, blend, shadow, side light, or background FX, did not solve the issue by itself.
- The flashing appears to come from the combined Mac CSS compositor chain rather than one isolated CSS property.
- Spectrum draw batches have been reduced significantly while keeping `visualizer bars/frame` unchanged.
- FPS still does not stabilize at 60.
- The remaining bottleneck is likely related to large Canvas 2D backing-store work, GPU/compositor cost, a main render stage, or combined state-update and draw submission cost.
- Resize/backing rebuild jitter is not the current main cause.
- Active render loops are stable at 1.
- Star cache rebuilds are stable in steady state, with 5-second rebuild counts near 0 after warmup.

## Current Test URLs

- <http://127.0.0.1:4173/?fpsOnly=1>
- <http://127.0.0.1:4173/?fpsOnly=1&perfLog=1>
- <http://127.0.0.1:4173/?debugPerf=1>
- <http://127.0.0.1:4173/?debugPerf=1&forceCompositeSafe=1>
- <http://127.0.0.1:4173/?debugPerf=1&forceCompositeSafe=0>
- <http://127.0.0.1:4173/?debugPerf=1&noCssFx=1>

## Recommended Next Route

- First fix the `noCoreDraw` diagnostic path that previously skewed the image, so debug-only switches do not leak canvas or DOM state.
- Add broader binary-search switches such as `noAllCanvasDraw`, `noCanvasVisuals`, `staticFrame`, `noAudioAnalysis`, and `noStateUpdate`.
- Confirm whether `dprTest` truly changes renderer DPR and canvas backing size on the target Mac.
- Make `perfLog` output complete stage timings for clear, background, core, spectrum, ripple, stars, audio analysis, state update, debug stats, total JS work, and browser/compositor gap.
- If `noAllCanvasDraw` still stays around 40 FPS, the bottleneck is probably not canvas drawing itself.
- If `noAllCanvasDraw` reaches 60 FPS, continue narrowing the specific canvas stage.
- If JS work is low but frame time remains high, suspect browser compositor, GPU, or canvas commit cost.
- If `dprTest=1` clearly improves performance, discuss whether an internal DPR strategy is acceptable before changing the formal default.
- Do not prioritize a broad `renderer.js` rewrite yet; continue with performance定位 first.

## Things Not To Do

- Do not delete page elements to gain FPS.
- Do not change layout, position, size, or interaction behavior.
- Do not reduce spectrum density.
- Do not make `forceCompositeSafe=0` the Mac default.
- Do not blindly refactor without data.
- Do not introduce React, Vue, or a complex build chain as a first response.
- Do not overturn the current visual style.
