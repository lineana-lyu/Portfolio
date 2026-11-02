# Olist 电商经营与用户行为分析｜作品集

本仓库采用 **项目背景 → 分析路径 → 四页 Power BI 大屏图片** 三段式页面，目的是让招聘方快速了解分析任务并查看实际可视化成果。

目前**网页代码已更新；四张 PNG 大屏图和 .pbix 二进制文件尚未上传到 GitHub**。它们已经打包为可下载的完整本地网站包。完成下方上传后，GitHub Pages 才能正常加载图片及源文件下载链接。

## 网页功能

- 01 经营总览
- 02 收入分析
- 03 用户行为与价值
- 04 订单履约与客户体验

在「Power BI 看板展示」区切换四张高清截图，并可打开原图。下载按钮指向原始 Power BI Desktop 报表文件（**静态图片本身不能筛选或交互**）。

## 需要上传到仓库的资源（必需）

```text
Portfolio/
├── index.html
├── styles.css
├── gallery.js
├── assets/
│   ├── 01_overview.png
│   ├── 02_revenue.png
│   ├── 03_customers.png
│   └── 04_fulfillment.png
└── downloads/
    ├── Olist_电商经营分析.pbix
    └── Olist_四页看板.pdf
```

> 重要：当前 GitHub 连接器能够提交文本源代码，但无法直接上传本地的二进制图片和 31 MB 的 .pbix 文件。因此对应资源需要使用 GitHub Desktop 或 Git CLI 从本地推送。没有上传完成时，网站不能视为已发布成功。

### 最简单的上传方法：GitHub Desktop

1. 下载并解压本对话提供的 **「Olist 作品集·图片大屏与 PBIX 完整包」**。
2. 在 GitHub Desktop 中克隆 `https://github.com/lineana-lyu/Portfolio.git`。
3. 从解压后的完整包中将整个 `assets/` 和 `downloads/` 文件夹复制到本地克隆仓库根目录。
4. 在 GitHub Desktop 中 **Commit to main**，再 **Push origin**。
5. 打开 GitHub 仓库检查 PNG / PBIX 文件是否已存在，再进入 Settings → Pages，选择 `Deploy from a branch` → `main` / `/(root)`。

**注意**：31 MB 的 PBIX 超过 GitHub 浏览器上传通常允许的单文件大小；请用 GitHub Desktop / Git CLI 推送（Git 普通文件上限通常为 100 MB）。

## 文件与功能

- `index.html`：三段式内容、四页图片切换区和下载入口
- `styles.css`：深色主题与响应式布局
- `gallery.js`：四图切换与原图链接
- `assets/`：四张原始看板截图（需补传）
- `downloads/`：Power BI 原始 PBIX / PDF（需补传）

## 限制与审查

- 图片是静态导出，不提供真正 Power BI 内部的筛选、交叉高亮或地图交互。
- `.pbix` 文件下载后可在 Power BI Desktop 中查看和编辑报表（部分外部数据源可能需要重新配置）。
- 数据源是 Olist 历史公开数据，页面不宣称当前经营状态或实际运营策略效果。
- 报表指标口径及 Cohort 不完整观察窗口仍应结合 SQL 复核。

见 [SPEC.md](SPEC.md) 和 [SDD 页面审查](reviews/SDD-05-static-dashboard-gallery.md)。
