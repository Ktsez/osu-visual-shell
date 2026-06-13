# 已知风险

## 1. `src/visual/renderer.js` 仍然过大

当前前端拆分是 beta 阶段的低风险拆分。

`renderer.js` 仍然包含：

- 播放控制
- UI 状态
- timing 更新
- 音频能量更新
- 视觉绘制
- 粒子
- 星星喷泉
- 侧灯
- 能量柱

风险：修改其中一个效果，可能影响其它效果。

建议：后续按功能逐块迁移，不要一次性大改。

## 2. 视觉状态互相耦合

这些变量之间关系复杂：

- `smoothedEnergy`
- `logoPulse`
- `coreBreath`
- `coreFlash`
- `sectionHeat`
- `lightEnergy`
- `leftFlash`
- `rightFlash`
- `starParticles`
- `visualizerBars`

风险：调一个参数可能让圆盘、能量柱、侧灯和星星喷泉同时变化。

建议：修改视觉逻辑后必须手动播放音乐验证。

## 3. 能量柱容易被改没

能量柱依赖：

- Web Audio freqData
- visualizerBars 衰减
- 峰值筛选
- Canvas 绘制

之前出现过能量柱消失问题。

建议：任何性能优化都要确认能量柱仍可见。

## 4. 星星喷泉容易过载或消失

星星喷泉依赖：

- kiai 标记
- 音频 rise / drive
- 冷却时间
- 粒子数量限制
- Canvas glow 绘制

风险：

- 条件太严格会不触发
- 条件太宽会卡顿
- glow 太强会遮挡画面

建议：用普通歌曲和 kiai 谱面都测试。

## 5. 浏览器音频播放限制

浏览器可能要求用户点击后才允许播放音频。

这不是服务端问题。

建议：播放失败提示应保留，不要移除。

## 6. 本地路径和 URL 编码

扫描依赖用户本地路径。

风险点：

- Windows 反斜杠
- 中文路径
- 空格
- URL encode/decode
- osu! 文件夹层级

建议：修改扫描逻辑后，用中文路径和普通路径都验证。

## 7. `.osu` 解析兼容性

当前解析覆盖常见字段，但 osu! 谱面文件格式存在很多边缘情况。

风险点：

- metadata 中包含冒号
- unicode 字段为空
- Events 行格式变化
- inherited timing point
- effects 位标记

建议：新增 bug 前先补 fixture 测试。

## 8. 本地媒体服务安全

`/media/:id` 通过内存 map 暴露扫描到的本地媒体。

当前安全边界依赖：

- 默认只监听 `127.0.0.1`
- media id 不直接暴露原路径
- 只有扫描过的文件进入 map

风险：如果用户设置 `HOST=0.0.0.0`，局域网设备可能访问已扫描媒体。

建议：README 中必须保留 HOST 风险说明。

## 9. README Preview 是占位

README 中引用：

- `docs/screenshots/main.png`
- `docs/screenshots/settings.png`

当前未生成真实图片。

风险：GitHub README 会显示图片缺失。

建议：后续添加真实截图，或在 release 前确认是否接受占位。

## 10. 不要默认改变 localStorage key

用户设置保存在 localStorage。

风险：改 key 会导致用户现有设置丢失。

建议：只有默认设置结构不兼容时才迁移 key，并在 README 或交接文档说明。
