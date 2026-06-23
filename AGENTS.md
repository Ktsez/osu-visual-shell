# AGENTS.md

本文写给后续 Codex / AI coding agent。

## 项目定位

`osu! Visual Shell` 是本地运行的 osu! 风格音乐视觉外壳。它不是 osu! 客户端，不做打图、计分、排行榜、账号系统或谱面下载。

核心目标：
- 播放用户本机音乐。
- 扫描 osu!stable Songs 文件夹。
- 扫描 osu!lazer 本地数据目录。
- 生成接近 osu! 主菜单音乐舞台的视觉体验。

当前版本定位：`2.0.0-beta.1`。

## 技术栈

- 前端：原生 HTML / CSS / JavaScript / Canvas
- 音频：Web Audio API
- 后端：Node.js 本地 HTTP 服务
- 测试：Node.js 内置 `node:test`
- 默认地址：`http://127.0.0.1:4173/`

## 重要约束

- 不要新建项目。
- 不要整体重写。
- 不要引入 React / Vue / Svelte 等前端框架。
- 不要默认暴露到局域网。
- 不要上传用户音乐、谱面、背景图或 metadata。
- 不要内置 osu! 官方资源、音乐或谱面。
- 不要随意改 localStorage key。
- 不要把视觉参数一次性大幅改动，尤其是能量柱、侧灯、星星喷泉。

## 当前关键文件

- `server.js`：本地服务、扫描、media URL。
- `src/main.js`：前端轻入口。
- `src/visual/renderer.js`：主要 UI、播放、Canvas 视觉、音频分析逻辑。
- `src/server/parseOsuFile.js`：`.osu` 解析。
- `src/ui/settings.js`：默认设置和 localStorage key。
- `index.html`：页面结构和设置项。
- `src/style.css`：布局、圆盘、侧灯、面板样式。

## 当前重点状态

- stable Songs 扫描可用。
- lazer 检测和扫描可用。
- lazer 匹配优先使用 `client.realm` 二进制中的文件使用记录，再保守回退。
- 侧灯逻辑已调整为：kiai 左右交替，普通段强拍双侧闪动。
- 能量柱有启动保护，避免歌曲开头整圈炸满。
- 顶部栏、列表、背景已做响应式和 F11 尺寸同步。
- README 和 docs 已按 2.0 beta 重写。

## 修改前检查

先看：

```bash
git status --short --branch
```

修改业务代码后至少运行：

```bash
npm test
node --check server.js
node --check src/visual/renderer.js
```

如果改了前端视觉，还要本地打开：

```text
http://127.0.0.1:4173/
```

验证：
- 页面能打开。
- 扫描 stable / lazer 不报错。
- 歌曲能播放、暂停、切换。
- 设置面板能打开并保存。
- F11 / 改窗口尺寸后背景和列表不乱。
- 能量柱开头不炸满。
- 侧灯不在无鼓点时乱闪。

## Git 规则

用户要求每次有效改动都留 git 版本。

常规流程：

```bash
git add ...
git commit -m "..."
git -c http.version=HTTP/1.1 push origin main
```

GitHub push 偶尔会连接重置。可以重试普通 push。不要用 GitHub API 写树替代普通 push，除非用户明确要求，因为历史上远端曾被 API 写树事故破坏过。

## 维护优先级

1. 稳定现有体验。
2. 修复扫描和媒体匹配准确性。
3. 修复视觉卡顿和尺寸适配。
4. 增加测试。
5. 逐步拆分 `src/visual/renderer.js`。
6. 最后再考虑新功能。
