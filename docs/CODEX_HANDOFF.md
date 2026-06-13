# Codex 交接记录

## 当前状态

仓库：`https://github.com/Ktsez/osu-visual-shell`

项目已经开源，当前定位为 `1.0.0-beta.1`。

本地服务默认监听：

```text
http://127.0.0.1:4173/
```

如果用户手动设置：

```bash
HOST=0.0.0.0 npm start
```

才会暴露到局域网。

## 已完成改动

### 安全边界

- `server.js` 默认监听 `127.0.0.1`
- 支持 `HOST` 环境变量覆盖监听地址
- 启动日志显示真实访问地址
- README 增加本地监听、隐私和局域网暴露说明

### 后端解析

- `.osu` 解析逻辑已从 `server.js` 抽离到 `src/server/parseOsuFile.js`
- 解析函数尽量保持纯函数形式：输入 text 和 baseDir，输出解析结果
- 新增 `node:test` 测试

测试覆盖：

- `AudioFilename`
- `Title`
- `TitleUnicode`
- `Artist`
- `ArtistUnicode`
- `Creator`
- `Version`
- Events 背景图
- TimingPoints
- uninherited timing point
- inherited timing point
- kiai effects

### 前端结构

已建立模块目录：

- `src/audio/`
- `src/osu/`
- `src/server/`
- `src/ui/`
- `src/utils/`
- `src/visual/`

`src/main.js` 已变成轻入口。

当前主要兼容层是：

```text
src/visual/renderer.js
```

它仍保留大量原始视觉、播放、UI 逻辑，用于降低本轮重构风险。

### README

已增强：

- Preview 占位
- Privacy / 隐私说明
- Roadmap
- Known Issues
- HOST 安全说明

## 最近验证结果

已验证：

- `npm test` 通过
- 全部 JS `node --check` 通过
- `npm start` 能启动
- 服务监听 `127.0.0.1:4173`
- 首页能打开
- 普通音乐文件夹扫描返回歌曲
- osu! Songs 测试目录扫描返回歌曲和 timing points
- 设置能保存
- 刷新后设置能保留
- 点击歌曲后 audio src 能设置
- 浏览器探针未捕获明显控制台错误

## 当前风险

- 前端模块拆分尚未完全完成，`renderer.js` 仍然偏大。
- 视觉系统状态耦合较强，能量柱、侧灯、星星喷泉、圆盘律动之间互相影响。
- 大型 osu! Songs 文件夹扫描仍可能较慢。
- 浏览器音频播放依赖用户手势。
- README 中 Preview 图片是占位引用，仓库内未生成真实截图。

## 下一步建议

1. 不要急着加新功能。
2. 优先继续把 `renderer.js` 中逻辑逐步下沉到已有模块。
3. 每次只迁移一类逻辑，并做页面验证。
4. 增加前端可测试的纯函数覆盖。
5. 再考虑桌面打包、拖拽选择目录、视觉 preset、性能面板等功能。

## 本轮后不要继续做

本轮用户明确要求：生成/更新交接文档后，不继续改功能。
