# 已知风险

## 1. `renderer.js` 仍然过大

`src/visual/renderer.js` 同时包含：
- 播放控制
- UI 状态
- timing 更新
- 音频分析
- Canvas 绘制
- 能量柱
- 侧灯
- 星星喷泉
- 背景和圆盘状态

风险：改一个效果可能影响多个系统。

建议：后续按功能逐步拆分，不要一次性大重构。

## 2. 能量柱容易失控

能量柱依赖：
- Web Audio `freqData`
- `previousVisualizerBins`
- `visualizerBars`
- 启动预热
- 候选峰值数量
- spread 半径
- decay 和 attack

已发生过的问题：
- 歌曲开头整圈炸满。
- 能量柱太稀疏。
- 能量柱过多导致卡顿。

当前已有启动保护。后续修改时必须验证新歌开始前 10 秒。

## 3. 侧灯容易被 timing 和音频拉扯

侧灯由 timing beat 触发，但亮度依赖音频能量。

已发生过的问题：
- 左右交替时一边亮一边暗。
- kiai 和双侧闪互相插队。
- 无明显鼓点时乱闪。

当前处理：
- kiai 段左右交替。
- 普通段强拍双侧闪。
- 左右交替使用统一节拍亮度，不直接使用左右声道差。
- 增加音频门槛。

后续修改必须实际播放不同歌曲验证。

## 4. lazer 匹配不是完整 ORM

osu!lazer 使用 `client.realm` 和 `files/`。文件名是 SHA-256，不是 stable 那种目录结构。

尝试过 Realm native 直接打开用户库，但当前 Node 环境会长时间卡住。因此当前实现通过读取 `client.realm` 二进制中的文件使用记录来匹配 `.osu hash + AudioFilename / BackgroundFile`。

风险：
- 未来 lazer Realm 格式变化可能影响匹配。
- 二进制匹配不是官方数据库查询。

建议：
- 保留保守回退。
- 后续加入诊断输出和测试 fixture。

## 5. 浏览器尺寸和 Safari 兼容

项目使用 fixed canvas、fixed 背景、CSS 变量、`100dvh`、`visualViewport`。

已发生过的问题：
- Safari 下 Canvas 和 DOM 圆盘不同心。
- F11 后背景新区域未铺满。
- 列表高度不随窗口变化。

当前已有 resize/fullscreen/orientation/pageshow 同步。后续改布局必须测试桌面、竖屏和 F11。

## 6. 粒子和滤镜性能

高风险效果：
- 星星喷泉
- 大面积 blur
- background blend
- Canvas glow
- 多层能量柱

风险：高强度歌曲会掉帧。

建议：
- 控制粒子数量。
- 控制 glow 范围。
- 不要无限增加 CSS filter。
- 加性能面板前不要盲目加视觉层。

## 7. 本地 media 服务安全

`/media/:id` 暴露扫描到的本地媒体，但 id 不直接包含路径。

安全边界依赖：
- 默认监听 `127.0.0.1`。
- 只服务扫描过的文件。
- 用户主动设置 `HOST=0.0.0.0` 才开放局域网。

后续不要默认改为 `0.0.0.0`。

## 8. 编码和文档

之前 README 和 docs 出现过中文编码损坏。

建议：
- 文档统一保存为 UTF-8。
- PowerShell 查看中文可能显示异常时，不要直接判断文件已坏，必要时用编辑器或浏览器确认。

## 9. GitHub push 不稳定

用户环境中 GitHub HTTPS push 偶尔连接重置。

可尝试：

```bash
git -c http.version=HTTP/1.1 push origin main
```

不要默认使用 GitHub API 写树替代普通 push。
