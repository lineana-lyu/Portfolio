# UI 开源源码调研｜固定侧栏 + 单屏分析工作台

日期：2026-11-02  
任务：针对用户指出的「文字过多、区域不明确、每个菜单页面仍要上下滚动」，核验此前视觉参考是否有公开 GitHub 源码，并研究真正可借鉴的实现。

**状态：源码调研完成；本文件不代表网页已按新方案重构。**

## 1. 对此前视觉参考的核验

| 视觉参考 | 能否将展示图直接对应到可核验的 GitHub 项目？ | 结论 |
| --- | --- | --- |
| Behance: [KPI Dashboard Design](https://www.behance.net/gallery/153742683/KPI-Dashboard-Design) | 没有核实到其作者公布的官方源代码仓库 | 仅作视觉参考，不照搬或声称开源 |
| Behance: [Management Dashboard](https://www.behance.net/gallery/182780261/Management-Dashboard) | 未核实到与展示图精确匹配的官方源码 | 仅作视觉参考，不得标为可复制模板 |
| Stripe / Linear 等商业产品界面 | 未核实到其真实产品完整 UI 源码 | 只能借鉴交互原则，不能宣称可使用其源码 |

## 2. 真正经过 GitHub 源码阅读的项目

### A. Studio Admin（优先借鉴数据排版）

- 仓库：<https://github.com/arhamkhnz/next-shadcn-admin-dashboard>
- Analytics 页面源码：<https://github.com/arhamkhnz/next-shadcn-admin-dashboard/blob/main/src/app/%28main%29/dashboard/analytics/page.tsx>
- KPI Strip 源码：<https://github.com/arhamkhnz/next-shadcn-admin-dashboard/blob/main/src/app/%28main%29/dashboard/analytics/_components/analytics-kpi-strip.tsx>
- 侧栏源码：<https://github.com/arhamkhnz/next-shadcn-admin-dashboard/blob/main/src/app/%28main%29/dashboard/_components/sidebar/app-sidebar.tsx>
- 技术：Next.js、Tailwind、shadcn/ui；开源 MIT。
- 实际读到的实现：
  - Analytics 页面使用纵向 `flex flex-col gap-4`；标题独立于 Tabs；主图区使用 `xl:grid-cols-12` 和 `xl:col-span-7 / xl:col-span-5`。
  - `AnalyticsKpiStrip` 把多个 KPI 放在**同一个外层** `bg-card rounded-xl ...` 中，内部使用 `grid divide-y ... md:divide-x` 进行分区，而不是给每个 KPI 一层独立浮动卡。
  - 侧栏把 `SidebarHeader`、`SidebarContent`、`SidebarFooter` 分离；菜单配置集中到 `navigation/sidebar/sidebar-items`。
- 对 Olist 的启发：单个「三指标条」用同一容器 + 竖线分隔；四个看板本身应独占主视觉区；控制栏与内容栏用明确的 12 列或 2 列栅格。
- 不能直接照搬：示例包含多张图/表与纵向 `gap-4` 堆叠，不保证 1366×768 单屏。

### B. satnaing/shadcn-admin（优先借鉴固定视口和菜单行为）

- 仓库：<https://github.com/satnaing/shadcn-admin>
- Layout：<https://github.com/satnaing/shadcn-admin/blob/main/src/components/layout/authenticated-layout.tsx>
- Main：<https://github.com/satnaing/shadcn-admin/blob/main/src/components/layout/main.tsx>
- Sidebar：<https://github.com/satnaing/shadcn-admin/blob/main/src/components/layout/app-sidebar.tsx>
- Navigation：<https://github.com/satnaing/shadcn-admin/blob/main/src/components/layout/nav-group.tsx>
- 技术：Vite、React、shadcn/ui、TanStack Router；MIT。
- 实际读到的实现：
  - `AuthenticatedLayout` 使用 `SidebarProvider` → `AppSidebar` + `SidebarInset` 实现导航与内容分离。
  - 有明确的固定视口规则：`has-data-[layout=fixed]:h-svh`；inset 模式再扣除外边距；不是单纯对整个 body 加一个隐藏 overflow。
  - `Main` 组件通过 `fixed && 'flex grow flex-col overflow-hidden'` 给布局固定高度，另有内容容器最大宽度约束。
  - `NavGroup` 使用路由位置判断选中态；点击移动导航后调用 `setOpenMobile(false)`。
- 对 Olist 的启发：将侧栏、顶部标题、展示区分别限制高度；点击菜单只替换右侧内容；手机菜单自动收起；深链接和当前菜单高亮保持一致。
- 不能直接照搬：该项目默认 Dashboard 的 `<Main>` 不一定以 `fixed` 模式调用，所以整个模板**不自动保证所有菜单内容一屏**。

### C. Tabler（优先借鉴 HTML 层级、侧栏与标题体系）

- 仓库：<https://github.com/tabler/tabler>
- 布局入口：<https://github.com/tabler/tabler/blob/main/shared/layouts/DefaultLayout.astro>
- 页面文字层级：<https://github.com/tabler/tabler/blob/main/core/scss/layout/_page.scss>
- 侧栏交互：<https://github.com/tabler/tabler/blob/main/core/js/src/sidebar.ts>
- 技术：Bootstrap 5、Sass、TypeScript；开源 HTML 仪表板组件体系。
- 实际读到的实现：
  - `DefaultLayout` 显式配置 `navbarPosition`、`layout=default/fluid/boxed`、`wrapperFull`、`sidebarMode=folded/folded-hover`、`navbarDark`。
  - `_page.scss` 用 `.page-pretitle`、`.page-title`、`.page-subtitle`、`.page-section-title` 固化统一标题层级。
  - `sidebar.ts` 用 `data-bs-sidebar` 切换折叠模式，并同步 `aria-pressed`，展开/折叠与导航状态一致。
- 对 Olist 的启发：不再在每页发明不同大小的标题、标签；建立一个统一的页面标题组件及侧栏栏位；必要时侧栏可收窄，但不要增加过多菜单层级。
- 不能直接照搬：Tabler 许多示例有滚动和多图表，不能当作原生一屏模板。

### D. Flowbite Admin（补充观察手机抽屉）

- 仓库：<https://github.com/themesberg/flowbite-admin-dashboard>
- 移动侧栏源码：<https://github.com/themesberg/flowbite-admin-dashboard/blob/main/src/sidebar.js>
- 实际代码通过 `toggleSidebarMobile` 函数切换 sidebar、backdrop、hamburger、close 的 `hidden` 类；背景遮罩支持点击关闭。
- 适合借鉴菜单抽屉行为，不适合整套重建我们的 6 页静态作品集。

## 3. Olist 推荐实现：借鉴源码原理，而非搬入 React/Next.js

**继续保留现有原生 HTML/CSS/JS + GitHub Pages 架构。** 新项目不需要 Next.js、服务端鉴权、Recharts、React 状态管理或后台 CRUD。实现可按以下三个物理区划：

```
viewport 100dvh
┌──────────────┬────────────────────────────────────┐
│ Sidebar 220px│ Top bar 48–52px                    │
│ 固定深色导航 ├────────────────────────────────────┤
│              │ Content Area [minmax(0,1fr)]      │
│              │  Overview = Title + KPI + Image   │
│              │  Report   = Title + Original PNG   │
│              │  Evidence = 3 proof rows + links   │
└──────────────┴────────────────────────────────────┘
```

核心实现思路（是本项目的设计建议，**不是从开源项目逐字复制的源码**）：

```css
html, body { height: 100%; margin: 0; overflow: hidden; }
.app-shell { height: 100dvh; display: grid; grid-template-columns: 220px minmax(0,1fr); }
.main-panel { min-width: 0; min-height: 0; display: grid; grid-template-rows: 52px minmax(0,1fr); overflow: hidden; }
.view { min-height: 0; display: grid; grid-template-rows: auto minmax(0,1fr); gap: 14px; overflow: hidden; }
.report-image-wrap { min-height: 0; overflow: hidden; display: grid; place-items: center; }
.report-image-wrap img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
```

**单屏关键不只是 `overflow:hidden`**：需要每层容器都有真实的高度约束，特别是 Grid/Flex 的 `minmax(0,1fr)`、`min-height:0` 和图片的双向 `max-width/max-height`。直接把超出内容隐藏而不调整组件高度属于错误实现。

页面区分：
- 概览：最多 1 行项目介绍 + 3 个 KPI 的统一容器 + 1 张原始看板图片。能力说明放在「技术证据」菜单，不放一整列长段落。
- 4 个看板：1 行标题 + 1 行发现 + 尽可能大的原始 1551×874 PNG；点击可放大，不再显示冗余的窗口框。
- 技术证据：3 条问题-方法-证据的简洁行，点击链接看 GitHub SQL，屏幕内只说明关键词。

## 4. 不可妥协的发布检查

- 1366×768 和 1440×900：**每一个路由内部 `scrollHeight <= clientHeight`**；不仅是 `body` 不滚动，也不能有右侧隐藏滚动。
- 正确判断截图是否完整可见：`img.getBoundingClientRect()` 完全处于工作区内容可见范围；图片不得被 `overflow:hidden` 截掉。
- 不能为了避免滚动把普通中文阅读文字压缩到 9–11px。应优先删减冗余文字。
- 侧栏菜单有分组、选中态、hover、键盘 focus；移动端可开关抽屉。
- 检查 `#overview` / `#operations` / `#revenue` / `#customers` / `#fulfillment` / `#evidence` 六条直达路由。
- PNG、原 `.pbix`、PDF 路径必须保持；静态图片不能被伪称 Power BI 网页版。
- 当极小屏幕无法同时容纳所有内容时优先保留可访问性与大屏放大功能；不要直接裁剪看板内容。

## 5. 决策

**首选源码组合：Studio Admin（信息分区 / KPI 条）+ shadcn-admin（固定视口 / 菜单机制）+ Tabler（标题系统）。**  
Flowbite 只作移动端抽屉补充。Behance 参考未证实有官方源码，不作为代码来源。  
**先基于已阅读的确切源文件实施，再用真实浏览器单屏验收；不要再次凭感觉微调 CSS。**
