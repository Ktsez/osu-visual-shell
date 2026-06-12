# osu! Visual Shell

一个本地运行的 osu! 风格音乐视觉壳，用来读取本机音乐或 osu! Songs 文件夹，并根据谱面 timing points、kiai 标记和音频能量驱动主圆盘与左右侧灯动效。

## 运行

```bash
npm install
npm start
```

默认地址：

```text
http://localhost:4173/
```

侧灯调试预览：

```text
http://localhost:4173/scythe-preview.html
```

## 当前能力

- 自动检测常见 osu! Songs 路径。
- 扫描 `.osu` 谱面并合并重复音频。
- 读取 timing points、拍号和 kiai 标记。
- 支持本地普通音乐文件夹扫描。
- 主圆盘显示歌曲封面并随节拍和音频能量律动。
- 左右白色圆形切面侧灯根据节拍、kiai 和声道能量闪动。
- 音乐控制、进度条、扫描面板和歌曲列表均在本地页面内完成。

## 注意

本项目只读取用户本机已有的音乐/谱面文件，不包含 osu! 游戏内容、游戏模式、谱面资源或第三方音乐服务接入。
