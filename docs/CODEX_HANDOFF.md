# Codex 交接记录

## 当前状态

仓库：`https://github.com/Ktsez/osu-visual-shell`

当前定位：`2.0.0-beta.1`

默认本地地址：

```text
http://127.0.0.1:4173/
```

当前主分支已经包含 2.0 beta 前的功能修复；文档重写后应再提交一次。

## 已完成能力

- 本地音乐文件夹扫描。
- osu!stable Songs 扫描。
- osu!lazer 数据目录检测和扫描。
- stable `.osu` metadata、背景、timing points、kiai 解析。
- lazer 音频和背景匹配：优先查 `client.realm` 文件使用记录，再回退到保守匹配。
- 曲目去重，优先保留带封面条目。
- 中央圆盘、封面、光晕、留影、冲击波。
- 圆盘外侧能量柱，带启动保护。
- 侧灯：kiai 左右交替，普通段强拍双侧闪动。
- 星星喷泉。
- Apple Music 风格动态背景。
- 顶部控制栏。
- 歌曲列表、扫描面板、设置面板。
- 中文 / 英文界面，支持跟随浏览器语言。
- 桌面和手机比例布局。
- F11 / 窗口尺寸变化后的背景和列表同步。

## 最近验证

已运行：

```bash
npm test
node --check server.js
node --check src/visual/renderer.js
```

最近本地验证通过：
- 侧灯基本正常。
- 能量柱启动阶段已增加预热保护，用户确认测试通过。
- 本地服务可启动。
- lazer 扫描之前验证过可返回约 900+ 条曲目，具体数量取决于用户本机曲库。

## 当前风险

- `src/visual/renderer.js` 仍然过大，改动容易连带影响播放、UI、视觉和设置。
- lazer Realm 不是通过官方 Realm native 直接读取。Realm native 在当前 Node 环境下打开用户库会卡住，因此使用二进制文件使用记录匹配。这个方案比猜测稳定，但不是完整数据库 ORM。
- 能量柱、侧灯、星星喷泉都依赖 Web Audio 状态，参数微调需要实际听歌测试。
- GitHub push 偶尔会因网络连接重置失败。普通重试即可，不建议用 API 写树。
- Safari 和移动端仍需要持续测试。

## 下一步建议

1. 不要立即加大功能。
2. 继续稳定 2.0 beta。
3. 增加真实截图或录屏，再更新 README。
4. 给 lazer 匹配补测试或诊断输出。
5. 逐步拆分 `src/visual/renderer.js`：
   - playback/controller
   - library scanning UI
   - visualizer bars
   - side lights
   - star fountains
   - settings binding
6. 增加性能面板，显示 FPS、粒子数、能量柱候选数、扫描耗时。

## 不要做

- 不要重写整个前端。
- 不要默认开放局域网访问。
- 不要接第三方音乐平台。
- 不要内置任何歌曲、谱面或 osu! 官方资源。
- 不要为了追求视觉效果无限增加粒子、blur、filter。
