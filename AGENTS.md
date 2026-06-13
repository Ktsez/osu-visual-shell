# AGENTS.md

## 项目概述

本项目是 `osu! Visual Shell`，一个本地运行的 osu! 风格音乐视觉外壳。

它不是 osu! 客户端，不包含游戏模式，不实现打图、计分、谱面游玩等功能。核心目标是读取用户本机音乐文件夹或 osu! Songs 文件夹，在浏览器中播放音乐，并生成接近 osu! 主菜单音乐舞台的视觉效果。

## 当前技术栈

- 前端：原生 HTML / CSS / JavaScript / Canvas
- 音频：Web Audio API
- 后端：Node.js 本地 HTTP 服务
- 测试：Node.js 内置 `node:test`
- 启动：`npm start`
- 默认地址：`http://127.0.0.1:4173/`

## 重要约束

- 不要新建项目。
- 不要重写项目。
- 不要引入 React / Vue / Svelte。
- 不要引入大型依赖。
- 不要把本地服务默认暴露到局域网。
- 不要上传用户音乐、谱面、背景图或 metadata。
- 不要改掉现有视觉风格，除非用户明确要求。
- 不要删除现有设置项。
- 不要随意更改 localStorage key。
- 不要在没有验证的情况下声称功能正常。

## 工作方式

修改前先看当前代码结构和 git 状态。

业务代码变更后至少运行：

```bash
npm test
node --check server.js
```

前端变更后应验证：

- 页面能打开
- 控制台无明显错误
- 扫描普通音乐目录正常
- 扫描 osu! Songs 目录正常
- 点击歌曲后音频源被设置
- 设置面板能保存，刷新后仍保留

每次完成有效改动后，应提交 git 版本并推送。

## 当前结构

入口：

- `server.js`
- `src/main.js`

后端解析：

- `src/server/parseOsuFile.js`

前端模块边界：

- `src/audio/`
- `src/osu/`
- `src/ui/`
- `src/utils/`
- `src/visual/`

注意：当前前端拆分是低风险 beta 拆分。`src/visual/renderer.js` 仍是主要兼容层，承接大量旧逻辑。不要误以为所有职责已经完全下沉到子模块。

## 常见风险

- `renderer.js` 中视觉状态高度耦合，修改时容易影响能量柱、侧灯、星星喷泉和圆盘律动。
- Web Audio 需要用户手势解锁，自动播放失败不一定是 bug。
- `.osu` 解析要兼容 unicode metadata、inherited timing point、kiai effects。
- Windows 路径、URL 编码、媒体 range 请求都要谨慎处理。

## 推荐优先级

1. 保持现有功能稳定。
2. 增加测试覆盖。
3. 逐步把 `renderer.js` 中的逻辑下沉到已有模块。
4. 再考虑新功能。
