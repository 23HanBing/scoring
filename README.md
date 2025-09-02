# 台球计分（scoring）

一个基于 uni-app（Vue 3 + Vite）的微信小程序/多端应用，用于中式八球、九球的计分与对局记录，支持二人追分与三人追分模式，内置性能监控与友好的视觉设计。

## 技术与框架
- 开发框架：Vue 3 + uni-app
- 构建工具：Vite 5 + @dcloudio/vite-plugin-uni
- 运行平台：微信小程序（主）、H5（可选）
- 代码组织：按页面模块划分，组件化、样式 Scoped 管理
- 性能与体验：
  - 页面骨架屏，首屏更平滑
  - 生命周期优化与结构调整
  - 代码分割预留（rollup manualChunks）
  - 性能监控工具（src/utils/performance.js）

## 主要功能
- 主页（模式选择）：中式八球、九球追分入口。
- 九球二人追分：零和计分，支持大金/小金/普胜/犯规，一键撤销与历史记录。
- 九球三人追分：三方零和，支持胜局与犯规的选择式计分流程。
- 视觉设计：
  - 首页紫蓝渐变背景（#667eea → #764ba2）
  - 磨砂玻璃卡片（backdrop-filter + 半透明）
  - 导航栏白底黑字，统一专业风格

## 目录结构（节选）
```
scoring/
├── src/
│   ├── pages/
│   │   ├── index/                # 主页（模式选择）
│   │   ├── nine-ball-2p/         # 九球二人追分
│   │   ├── nine-ball-3p/         # 九球三人追分
│   │   └── room-setup/           # 房间设置
│   ├── utils/performance.js      # 性能监控工具
│   ├── pages.json                # 页面与全局配置
│   ├── manifest.json             # 各端配置（含微信小程序 appid）
│   └── uni.scss                  # 全局样式变量
├── vite.config.js                # Vite 与构建优化
├── package.json                  # 脚本与依赖
└── .gitignore                    # 忽略 dist、.idea 等
```

## 快速开始

### 环境要求
- Node.js 18+ 建议
- 微信开发者工具（用于微信小程序调试与预览）

### 安装依赖
```
npm install
```

### 配置小程序 AppID
在 `src/manifest.json` 文件中，将 `mp-weixin.appid` 字段的值 `YOUR_APPID_HERE` 替换为你的微信小程序 AppID

### 开发调试
1) H5 调试（可选）
```
npm run dev:h5
```
访问终端输出的本地地址即可预览。

2) 微信小程序调试（推荐）
```
npm run dev:mp-weixin
```
- 生成目录：dist/dev/mp-weixin/
- 打开微信开发者工具，项目目录选择上述生成目录
- manifest.json 中已配置 appid（可在 src/manifest.json 调整）

### 生产构建
- 微信小程序构建：
```
npm run build:mp-weixin
```
- H5 构建：
```
npm run build:h5
```

## 首页（主页）作用
- 作为应用入口与模式选择页：中式八球、九球追分。
- 展示品牌视觉风格：紫蓝渐变背景 + 磨砂玻璃卡片，清晰的层次与高级感。
- 启动时展示骨架屏，提升首屏加载体验。

## 备注与说明
- 针对微信小程序环境，已移除不支持的 `uni.preloadPage` 调用，但保留资源预处理逻辑（preloadResources）。
- 代码分割已在构建配置中预留（vendor 拆分），后续可按需扩展更细粒度的业务分包与懒加载。
- 如需自定义导航栏为完全自定义样式，请改为"自定义导航栏"方案（当前使用系统导航，白底黑字）。

## License
本项目仅用于学习与演示，实际使用请根据业务进行二次开发与合规处理。
