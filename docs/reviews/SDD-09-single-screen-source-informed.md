# SDD-09｜按实际开源源码重构“一页一屏”分析作品集

2026-11-02。经用户同意，在完成 [开源项目代码阅读](../UI_OPEN_SOURCE_REFERENCES.md) 后实施。

## 用户硬约束
- 首屏抓住重点：少字、大图、三个有证据的核心成果。
- 左右分区鲜明：深色固定侧栏、浅色工作区、白色内容面板。
- 1366×768 与 1440×900 桌面环境：6 个路由都必须不依赖纵向滚动。
- 不能通过裁剪 Power BI 图片或缩小正文到 9px 来假装一屏。

## 源码到本项目的映射
1. **Studio Admin / analytics-kpi-strip.tsx**：借鉴单外容器、3 列等权数据摘要和 `divide-x`，对应 `.metric-strip` 的单一白色区域与分隔线。没有复制其 React 组件。
2. **satnaing/shadcn-admin / authenticated-layout.tsx + main.tsx**：借鉴 sidebar/inset 职责分离、固定视口 `h-svh` 和 `flex grow overflow-hidden`；转写为 `height:100dvh`、`minmax(0,1fr)` 和所有重要 Grid 中的 `min-height:0`。仅隐藏 body 溢出不算完成。
3. **Tabler / _page.scss**：借鉴页标题层级的单一规则；overview/report/evidence 各只有一个主标题和可选一行辅助说明。
4. **Flowbite / src/sidebar.js**：移动抽屉/遮罩行为已在项目中存在，继续保留。不额外引入 React/Next/Tailwind 等依赖。

## 内容与布局改动

- 首页：只用 3 个垂直区块（82px 标题、106px KPI、剩余自适应内容）；下方真实原始看板预览作为主视觉，右边是 3 条非常短的能力说明；取消长篇项目故事。
- 四页看板：固定 76px 标题行 + 50px 发现行 + 自适应图像容器 + 32px 下载行。图像在可用区域内 `max-width:100%;max-height:100%` 并保持原始 1551:874 长宽比，不裁剪。
- 技术证据：固定 83px 标题 + 自适应三行证据表格 + 62px 来源说明。每行直接指向对应 SQL 和结果口径。
- 侧栏：深灰绿 `#222824`；主区 `#e9ece9`；白色面板 `#fff`；强调色为 `#d47562`。分区用实底而非漫无目的的留白。
- 业务数字与原始四张 PNG、PBIX、PDF 保持不变。

## 测试要求

浏览器回归测试运行 1366×768、1440×900、1024×768、375×812：
- 逐个打开 overview、operations、revenue、customers、fulfillment、evidence。
- 桌面检测 `workspace.scrollHeight <= workspace.clientHeight`，且每个 view 自身也满足同样要求。
- 检查图片本身完整包含在可见容器内，图片原始纵横比不变；每个主要区域 `getBoundingClientRect()` 必须落在可视区域。
- 检查深链接、侧栏菜单高亮、移动抽屉、弹窗左右键切换、原文件存在、无 JS 页面报错。
- GitHub Actions 上传不同宽度的实际截图，供目视复核。

## 事实边界
- Olist 为公开历史数据；商品收入 R$13,494,400.74 是 Notebook 四维汇总一致的输出结果。
- 3.04% 为原 Power BI 历史复购率，不是流失预测。
- 4.29→1.70 为配送时效分组评分的观察性差异，不意味着因果关系。
- 原 SQL 已执行；新修订的三份 SQL 尚未在原 MySQL 重跑。

## 发布闸门
只在新增浏览器测试确实通过后合并。CI 成功不替代对设计品味的人工意见，但至少不能再出现「看起来一屏、实际还要滚动」或图片部分超出内容区的问题。
