# 梦境美术馆 · The Dream Gallery

一座以高精度日系动漫幻想氛围为灵感的沉浸式网页美术馆。项目使用原生 HTML、CSS 和 JavaScript，无需安装前端框架，可直接用 PyCharm 打开运行，也可免费部署到 GitHub Pages。

## 项目特色
- 全屏沉浸式首页：云端玻璃穹顶美术馆、动漫人物、星空和柔和光影
- 四个互动展厅：樱之庭、月光回廊、海蓝秘境、云端之境
- 展厅弹窗：点击卡片进入沉浸式介绍，可上一场/下一场切换，也支持键盘左右方向键和 Esc 关闭
- 氛围动态：星光闪烁、花瓣飘落、首页视差、滚动显现动画
- 氛围音乐：点击右上角按钮后，由 Web Audio API 生成轻柔环境音；没有外部音频依赖
- 全屏按钮、移动端导航、手机自适应布局
- 纯静态网站，无需服务器或数据库

## 文件结构
```text
dream_gallery_site/
├── index.html
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── images/
        ├── hero-gallery.jpg
        ├── exhibit-cherry.jpg
        ├── exhibit-moon.jpg
        ├── exhibit-ocean.jpg
        └── exhibit-cloud.jpg
```

## 用 PyCharm 运行
1. 下载并解压 ZIP。
2. 打开 PyCharm，选择 **Open（打开）**，选择解压后的 `dream_gallery_site` 文件夹。
3. 在项目树找到根目录的 `index.html`。
4. 右键 `index.html` → **Open in Browser（在浏览器中打开）**；也可以在 Windows 文件管理器里双击 `index.html`。
5. 音乐需要访客点击右上角按钮后才会开始，这是浏览器对自动播放的限制。

## 自定义文字
在 `index.html` 中可以直接搜索并修改：
- `梦境美术馆`：站点名称
- `这里，收藏着所有关于美好的想象。`：首页副标题
- `愿你在每一束光里...`：首页描述
- `assets/js/app.js` 中的 `scenes` 数组：四个展厅的标题、英文名和介绍

## 替换图片
将新图片放到 `assets/images/` 文件夹，然后修改 `index.html` 的 `heroArt` 对应背景（当前主视觉由 CSS 设定），以及 `assets/css/style.css` 中 `.card-cherry`、`.card-moon`、`.card-ocean`、`.card-cloud` 的 `background-image` 路径。展厅弹窗图片路径在 `assets/js/app.js` 的 `scenes` 数组中。

当前随项目提供的主视觉为 AI 生成的动漫幻想美术馆全景图；四张展厅缩略图是从同一幅全景图中的对应区域提取，以保持视觉色彩一致。后续可以把它们替换成独立绘制的展厅插画。

## 部署到 GitHub Pages
1. 登录 GitHub，新建一个 **Public（公开）** 仓库，例如 `dream-gallery`。
2. 将本项目中的所有内容上传到仓库根目录。仓库根目录应直接看到 `index.html`、`README.md` 和 `assets` 文件夹，不要多套一层项目文件夹。
3. 打开仓库 **Settings → Pages**。
4. 在 **Build and deployment** 里选择 **Deploy from a branch**。
5. Branch 选择 `main`，目录选择 `/(root)`，点击 **Save**。
6. 等待 GitHub Pages 构建完成，访问：
   `https://你的GitHub用户名.github.io/dream-gallery/`

## 隐私与兼容性
- 这是公开静态网站，上传到公开仓库的内容任何人都可能访问；不要放个人地址、电话、账号等隐私信息。
- 音乐由浏览器实时合成，不包含真实钢琴录音或外部音乐文件。
- 页面可在现代桌面和手机浏览器中运行；Google Fonts 需要网络连接，断网时会回退到系统字体。
