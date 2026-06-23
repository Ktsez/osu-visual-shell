# osu! Visual Shell

`osu! Visual Shell` 是一个本地运行的 osu! 风格音乐视觉外壳。它不是 osu! 客户端，不包含打图、计分、排行榜或任何游戏模式。项目目标是把本地音乐、osu!stable Songs 文件夹和 osu!lazer 本地曲库转换成一个接近 osu! 主菜单氛围的音乐舞台。

当前版本：`2.0.0-beta.1`

## 中文说明

### 主要功能

- 本地运行，默认只监听 `127.0.0.1`。
- 支持扫描普通本地音乐文件夹。
- 支持扫描 osu!stable 的 `Songs` 文件夹。
- 支持检测并扫描 osu!lazer 数据目录。
- lazer 曲库会优先从 `client.realm` 的文件使用记录中匹配音频和背景，减少歌名、封面、音频错配。
- 支持读取 `.osu` timing points、BPM、kiai 标记、背景图和 metadata。
- 自动合并同一首歌的重复难度，优先保留带封面的条目。
- 中央圆盘显示歌曲封面，并跟随音乐能量律动。
- 圆盘包含留影层、光晕、冲击波和可调参数。
- 圆盘外侧能量柱由 Web Audio 频谱驱动，并带启动保护，避免歌曲开头炸满。
- 侧灯参考 osu!lazer 主菜单逻辑：kiai 段左右交替，普通段小节强拍双侧闪动。
- 星星喷泉会在 kiai 或明显段落爆发时触发。
- 支持播放、暂停、上一首、下一首、进度拖动、歌曲搜索。
- 3 秒无操作自动回到主播放圆盘界面。
- 支持中文和英文界面切换，默认跟随浏览器语言。
- 支持桌面和手机比例响应式布局。

### 运行方式

需要先安装 Node.js。

```bash
npm install
npm start
```

打开：

```text
http://127.0.0.1:4173/
```

开发时也可以使用：

```bash
npm run dev
```

默认服务只在本机可访问。如果你确实需要让同一局域网里的其他设备访问，可以手动设置：

```bash
HOST=0.0.0.0 npm start
```

只有理解局域网访问风险并确实需要时才建议这样做。

### 使用方式

1. 打开本地页面。
2. 点击顶部按钮或中央圆盘打开控制界面。
3. 使用自动检测，或手动输入 osu!stable Songs、osu!lazer 根目录、普通音乐文件夹路径。
4. 点击扫描。
5. 从歌曲列表里选择歌曲播放。
6. 在设置里调整语言、侧灯、圆盘、能量柱、冲击波和星星喷泉参数。

### 支持的曲库

#### 普通音乐文件夹

扫描常见音频文件，例如 mp3、ogg、wav、flac、m4a、aac、opus。普通音乐文件夹没有谱面 timing 信息，因此视觉效果主要依赖音频分析。

#### osu!stable Songs

读取 `Songs/谱面文件夹/*.osu` 结构，使用 `.osu` 中的 `AudioFilename`、Events 背景、TimingPoints 和 kiai 标记。

#### osu!lazer

读取 lazer 数据目录中的 `client.realm` 和 `files/`。lazer 的文件以 SHA-256 存储，不能只靠文件夹猜测歌曲关系。本项目会优先用 `.osu hash + AudioFilename / BackgroundFile` 在 `client.realm` 中查找对应文件 hash，找不到时才使用保守兜底匹配。

### 设置项

- 语言：跟随系统、中文、英文。
- 侧灯强度：控制左右侧灯整体亮度。
- 侧灯克制：控制侧灯出现门槛。
- 圆盘律动：控制中央圆盘缩放幅度。
- 圆盘光晕强度：控制圆盘周围光晕，可调到 0 关闭。
- 圆盘光晕颜色：自定义圆盘光晕颜色。
- 圆盘留影强度、大小、延迟、虚化：控制圆盘表面慢半拍的留影感。
- 能量柱长度、范围、比例、缓降：控制圆盘外侧频谱柱。
- 冲击波大小、强度：控制中心扩散白色光波。
- 星星喷泉、星星光晕、喷泉灵敏度：控制星星粒子效果。
- 重置所有参数：恢复当前版本默认参数。

### 隐私和版权边界

- 项目默认只在本机运行。
- 不上传音乐、谱面、背景图、封面或 metadata。
- 只读取用户主动选择、输入或本机检测到的目录。
- 不内置 osu! 官方资源、谱面或音乐。
- 不提供第三方音乐平台接入。
- 读取 osu! 或 lazer 曲库时，内容来自用户本机已有文件，请确保你拥有对应使用权。

### 已知限制

- 这仍是 beta 版本，视觉参数会继续调整。
- Safari、移动浏览器和高 DPI 环境仍需要持续验证。
- 超大曲库扫描会消耗时间。
- 浏览器可能要求用户点击后才允许播放音频。
- lazer 的官方 Realm 数据库无法在当前 Node 环境中稳定通过 Realm native 直接打开，因此使用二进制文件使用记录匹配作为主方案。
- 当前前端主逻辑仍集中在 `src/visual/renderer.js`，后续需要继续拆分。

### 开发与测试

```bash
npm test
node --check server.js
node --check src/visual/renderer.js
```

本地入口：

```text
server.js
src/main.js
src/visual/renderer.js
src/server/parseOsuFile.js
```

### 版本说明：2.0 beta

2.0 beta 相比 1.0 beta 的重点变化：

- 增加 osu!lazer 曲库检测和扫描。
- 改进 lazer 音频、曲名、封面匹配。
- 增加中英文界面和设置内语言切换。
- 重做顶部控制栏和响应式布局。
- 改进 Apple Music 风格动态背景。
- 修复 F11 / 窗口尺寸变化后的背景和列表尺寸问题。
- 优化侧灯节拍逻辑。
- 优化能量柱启动阶段，避免歌曲开头爆满导致卡顿。
- 更新项目文档和交接说明。

### License

MIT License。详见 `LICENSE`。

---

## English

`osu! Visual Shell` is a local osu!-inspired music visual shell. It is not an osu! client and does not include gameplay, scoring, leaderboards, or beatmap play. The goal is to turn local music, osu!stable Songs folders, and osu!lazer local libraries into an osu!-style main-menu music stage.

Current version: `2.0.0-beta.1`

### Features

- Runs locally and listens on `127.0.0.1` by default.
- Scans ordinary local music folders.
- Scans osu!stable `Songs` folders.
- Detects and scans osu!lazer data folders.
- Uses lazer `client.realm` file-usage records to improve audio and background matching.
- Reads `.osu` timing points, BPM, kiai markers, background images, and metadata.
- Deduplicates repeated difficulties and prefers entries with artwork.
- Shows the current artwork inside the center disc.
- Drives disc pulse, ghosting, wave effects, side lights, visualizer bars, and star fountains from timing and audio analysis.
- Supports Chinese and English UI, with browser-language auto detection.
- Supports desktop and portrait mobile layouts.

### Run

Install Node.js first.

```bash
npm install
npm start
```

Open:

```text
http://127.0.0.1:4173/
```

Development:

```bash
npm run dev
```

The server is local-only by default. To expose it to your LAN:

```bash
HOST=0.0.0.0 npm start
```

Only use LAN exposure when you understand the privacy tradeoff.

### Supported Libraries

- Local music folders: audio analysis only.
- osu!stable Songs: `.osu` metadata, timing points, audio, and backgrounds.
- osu!lazer: reads `client.realm` and `files/`, then maps `.osu` files to audio/background hashes as accurately as possible without requiring the osu! client.

### Privacy

- No uploads.
- No bundled songs, beatmaps, or osu! assets.
- No third-party music service integration.
- Only user-selected or locally detected folders are scanned.
- Media files are served through local temporary `/media/:id` URLs while the local app is running.

### Known Limits

- This is still a beta.
- Very large libraries can take time to scan.
- Browser autoplay restrictions may require a user click.
- Safari and mobile browsers still need extra verification.
- The largest frontend file is still `src/visual/renderer.js` and should be refactored gradually.

### Test

```bash
npm test
node --check server.js
node --check src/visual/renderer.js
```

### License

MIT License. See `LICENSE`.
