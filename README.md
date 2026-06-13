# osu! Visual Shell

## 中文版本

osu! Visual Shell 是一个可以在本地运行的 osu! 风格音乐视觉外壳。它不是 osu! 游戏客户端，也不包含任何游戏模式；它专注于还原一种接近 osu! 主菜单/音乐舞台的视觉体验：中间的大圆盘、歌曲封面、节奏律动、圆盘留影、能量柱、侧灯、星星喷泉和本地音乐播放控制。

当前版本：`1.0.0-beta.1`

这个项目的目标是让用户可以读取自己电脑里的本地音乐，或者扫描本机已有的 osu! Songs 谱面文件夹，然后在浏览器中播放音乐并生成动态视觉效果。

### 核心特点

- 本地运行，不依赖云端服务。
- 支持扫描普通本地音乐文件夹。
- 支持扫描 osu! Songs 文件夹，并读取 `.osu` 谱面信息。
- 支持解析 timing points、BPM、kiai 标记和谱面背景图。
- 自动合并重复谱面/重复音频，减少同一首歌在列表里反复出现。
- 中央圆盘显示歌曲封面，并跟随音乐能量和节拍律动。
- 圆盘留影层覆盖在圆盘表面，可以调整强度、大小、延迟和虚化。
- 圆盘外侧能量柱根据音频频段和节奏峰值生成。
- 侧灯根据节拍、段落热度和强节奏点进行左右交替或双侧高亮。
- 星星喷泉会在 kiai 或明显高潮段落触发。
- 支持播放/暂停、上一首/下一首、进度条拖动和歌曲列表搜索。
- 支持 6 秒无操作自动回到主播放圆盘界面。
- 支持点击空白区域快速收起面板。
- 提供设置面板，可调整光效、圆盘留影、能量柱、冲击波和星星喷泉参数。

### 运行方式

请先确保电脑已经安装 Node.js。

```bash
npm install
npm start
```

启动后打开：

```text
http://localhost:4173/
```

开发时也可以使用：

```bash
npm run dev
```

侧灯调试预览页面：

```text
http://localhost:4173/scythe-preview.html
```

默认情况下，本地服务只监听 `127.0.0.1`，不会暴露到局域网。如果明确需要让同一局域网内的其他设备访问，可以手动设置：

```bash
HOST=0.0.0.0 npm start
```

只在你理解局域网访问风险并确实需要时使用这个设置。

### 使用方式

1. 打开本地页面。
2. 点击中央圆盘，打开控制面板。
3. 选择自动检测 osu! Songs，或手动输入音乐/谱面文件夹路径。
4. 点击扫描。
5. 从歌曲列表中选择音乐播放。
6. 根据需要打开设置面板，调试圆盘光晕、留影、能量柱、冲击波和星星喷泉。

### 设置项说明

- 侧灯强度：控制左右侧灯整体亮度。
- 侧灯克制：控制侧灯出现频率和持续感。
- 圆盘律动：控制中央圆盘跟随音乐缩放的幅度。
- 圆盘光晕强度：控制中央圆盘周围粉色光晕，可调到 0 完全关闭。
- 圆盘光晕颜色：自定义圆盘周围光晕颜色。
- 圆盘留影强度：控制圆盘表面的延迟留影透明度。
- 圆盘留影大小：默认 0.00 表示和主圆盘一样大，可在 -3.00 到 3.00 范围内向内或向外调整。
- 圆盘留影延迟：控制留影跟随主圆盘律动的慢半拍感觉。
- 圆盘留影虚化：控制留影柔化程度。
- 能量柱长度：控制能量柱整体长度。
- 能量柱范围：控制能量柱向外扩散的范围。
- 能量柱比例：控制长柱和短柱之间的差异。
- 能量柱缓降：控制能量柱回落速度。
- 冲击波大小：控制中心白色扩散光波的最大范围。
- 冲击波强度：控制扩散光波亮度。
- 星星喷泉：控制喷泉规模。
- 星星光晕：控制星星周围朦胧发光感。
- 喷泉灵敏度：控制星星喷泉触发灵敏度。

### 项目边界

这个项目不会搬运 osu! 的游戏功能，也不会内置任何 osu! 官方资源、谱面、音乐或第三方音乐服务内容。它只读取用户本机已经存在的音乐文件和谱面文件。

如果读取 osu! Songs 文件夹，音乐和背景图来自用户电脑本地已经拥有的谱面目录。请确保你拥有对应文件的使用权。

### Preview

预览图片路径已预留，后续可以替换为真实截图：

![Main view](docs/screenshots/main.png)
![Settings panel](docs/screenshots/settings.png)

如果这些图片暂时不存在，README 中的引用只是占位，不代表仓库已经包含截图文件。

### 隐私说明

- 本项目在本地运行。
- 默认只监听 `127.0.0.1`。
- 只读取用户主动选择或填写的本地文件夹。
- 不上传音乐、谱面、背景图或 metadata。
- 只有手动设置 `HOST=0.0.0.0` 时，才会允许局域网访问。

### Roadmap

- [ ] Refactor frontend into modules
- [ ] Add parser tests for .osu files
- [ ] Add desktop packaging
- [ ] Add drag-and-drop folder selection
- [ ] Add visual preset system
- [ ] Add FPS/performance panel
- [ ] Add screenshot / GIF preview

### Known Issues

- 大型 osu! Songs 文件夹扫描可能需要一些时间。
- 目前仍需要手动输入或自动检测本地路径。
- 浏览器可能需要用户点击后才允许播放音频。
- 当前项目不是 osu! 客户端，不支持游戏模式。

### 开源协议

本项目使用 MIT License 开源。你可以自由使用、修改和分发本项目代码，但需要保留原始版权和许可声明。

### 技术说明

- 前端使用原生 HTML、CSS 和 Canvas。
- 后端使用 Node.js 提供本地文件扫描和静态页面服务。
- 音频可视化基于浏览器 Web Audio API。
- osu! 谱面读取基于 `.osu` 文件中的 metadata、events 和 timing points。
- 视觉效果优先保持本地可控、可调试和高性能。

---

## English Version

osu! Visual Shell is a locally runnable osu!-inspired music visual shell. It is not an osu! game client and does not include gameplay modes. The project focuses on recreating a stage-like main-menu music experience: a large center disc, album cover display, beat-driven pulsing, ghost overlay, audio bars, side lights, star fountains, and local music controls.

Current version: `1.0.0-beta.1`

The goal is to let users play local music from their own computer, or scan an existing osu! Songs folder, then generate responsive visual effects directly in the browser.

### Key Features

- Runs locally without a cloud service.
- Supports scanning ordinary local music folders.
- Supports scanning osu! Songs folders and reading `.osu` beatmap files.
- Parses timing points, BPM, kiai markers, metadata, and beatmap background images.
- Deduplicates repeated difficulties and repeated audio files.
- Displays the current song artwork inside the center disc.
- Drives the center disc with music energy and beat timing.
- Adds a ghost overlay on top of the disc surface, with adjustable intensity, size, lag, and blur.
- Generates circular audio bars around the center disc from frequency peaks.
- Adds left/right side lights that react to beat accents, section intensity, and strong rhythm changes.
- Triggers star fountains during kiai sections or major musical lift moments.
- Includes play/pause, previous/next, draggable progress bar, and searchable song list.
- Automatically returns to the main disc view after 6 seconds of inactivity.
- Supports clicking empty space to quickly collapse panels.
- Includes a settings panel for tuning glow, ghosting, audio bars, wave pulses, and star fountains.

### How to Run

Make sure Node.js is installed first.

```bash
npm install
npm start
```

Then open:

```text
http://localhost:4173/
```

For development:

```bash
npm run dev
```

Side-light preview page:

```text
http://localhost:4173/scythe-preview.html
```

By default, the local server listens on `127.0.0.1` only and is not exposed to your LAN. If you explicitly need access from another device on the same network, run:

```bash
HOST=0.0.0.0 npm start
```

Use this only when you understand the LAN exposure tradeoff and actually need it.

### How to Use

1. Open the local page.
2. Click the center disc to open the control panel.
3. Auto-detect your osu! Songs folder, or manually enter a local music/beatmap folder path.
4. Start scanning.
5. Select a song from the library list.
6. Open the settings panel to tune glow, ghosting, audio bars, wave pulses, and star fountain behavior.

### Settings Overview

- Side Light Intensity: Controls the overall brightness of the side lights.
- Side Light Restraint: Controls how frequently and strongly the side lights appear.
- Disc Pulse: Controls the scale response of the center disc.
- Disc Glow Intensity: Controls the pink glow around the center disc. Set it to 0 to turn it off.
- Disc Glow Color: Changes the color of the disc glow.
- Ghost Intensity: Controls the opacity of the delayed disc-surface ghost layer.
- Ghost Size: Default 0.00 matches the main disc size. It can be adjusted from -3.00 to 3.00.
- Ghost Lag: Controls how far behind the ghost layer follows the main pulse.
- Ghost Blur: Controls the softness of the ghost layer.
- Audio Bar Length: Controls the general length of the circular audio bars.
- Audio Bar Range: Controls the outward reach of the audio bars.
- Audio Bar Contrast: Controls the difference between short and long bars.
- Audio Bar Decay: Controls how quickly audio bars fall back.
- Wave Size: Controls the maximum size of the expanding center light wave.
- Wave Intensity: Controls the brightness of the expanding light wave.
- Star Fountain: Controls the amount and strength of fountain particles.
- Star Glow: Controls the soft glowing halo around stars.
- Fountain Sensitivity: Controls how easily star fountains are triggered.

### Project Scope

This project does not copy osu! gameplay features, official osu! assets, beatmaps, songs, or third-party music service content. It only reads files that already exist on the user's local computer.

When scanning an osu! Songs folder, music and background images are loaded from the user's existing local beatmap directories. Please make sure you have the right to use those files.

### Preview

Preview image paths are reserved for future real screenshots:

![Main view](docs/screenshots/main.png)
![Settings panel](docs/screenshots/settings.png)

If these files do not exist yet, the links are placeholders only.

### Privacy

- The project runs locally.
- The server listens on `127.0.0.1` by default.
- It only reads local folders that the user explicitly selects or enters.
- It does not upload music, beatmaps, background images, or metadata.
- LAN access is enabled only when `HOST=0.0.0.0` is set manually.

### Roadmap

- [ ] Refactor frontend into modules
- [ ] Add parser tests for .osu files
- [ ] Add desktop packaging
- [ ] Add drag-and-drop folder selection
- [ ] Add visual preset system
- [ ] Add FPS/performance panel
- [ ] Add screenshot / GIF preview

### Known Issues

- Large osu! Songs folders can take time to scan.
- Local paths still need to be entered manually or detected automatically.
- Browsers may require a user click before audio playback is allowed.
- This is not an osu! client and does not support gameplay modes.

### License

This project is open-sourced under the MIT License. You may use, modify, and distribute the code freely as long as the original copyright and license notice are preserved.

### Technical Notes

- The frontend is built with plain HTML, CSS, and Canvas.
- The local backend is powered by Node.js for static serving and file scanning.
- Audio visualization uses the browser Web Audio API.
- Beatmap parsing reads metadata, events, and timing points from `.osu` files.
- The visual system is designed to stay local, controllable, tunable, and performance-conscious.
