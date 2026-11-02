/**
 * M1: Narrative only. No data fetching and no Power BI embed.
 * Claims below are constrained by SPEC.md and are NOT verified SQL outputs.
 */
const steps = [
  {
    question: '历史交易规模变化，值得继续研究什么？',
    evidence: '现有看板显示，主要观察月份的商品 GMV 整体呈增长趋势。',
    finding: '交易规模增长是现象，不能据此判断增长是否来自重复购买。',
    next: '先按真实用户去重，检查每位用户在观察期内的购买次数。',
    status: '趋势来自现有看板；月度口径待 SQL 复核',
    limit: '历史 GMV 按有效订单商品 price 汇总，不含运费；目前没有新老客 GMV 贡献拆解，不能声称“增长由新客驱动”。'
  },
  {
    question: '观察期内，用户购买了几次？',
    evidence: '按 customer_unique_id 去重，以研究口径下的有效订单数统计用户购买频次。',
    finding: '94,983 名历史购买用户中，92,096 人只购买一次（96.96%）。',
    next: '不同首购月份的用户，后续自然月再次购买的情况是否相似？',
    status: '指标来源于 Power BI 截图；SQL 结果待对账',
    limit: '“有效订单”暂排除 canceled/unavailable，仍可能包含未妥投订单；历史复购率不等同于未来流失率。'
  },
  {
    question: '一次购买现象，在不同首购月份是否一致？',
    evidence: '以首次购买自然月构建 Cohort，按后续各自然月再次购买的用户数计算回购比例。',
    finding: '现有 Cohort 看板中，首购后多数可观察月份的回购比例不足 1%。',
    next: '既然回购行为稀疏，如何区分优先触达的用户？',
    status: '现有看板可见；成熟观察窗口尚待 SQL 核验',
    limit: 'Cohort 月度回购不是连续留存。样本末端不完整的月份应标记“不可观察”，而不是记为零。'
  },
  {
    question: '哪些用户更值得进入二次购买实验？',
    evidence: '使用最近购买时间（R）、历史订单数（F）与历史消费金额（M）刻画用户差异。',
    finding: 'F=1 的用户占 96.96%，频次维度难以细分大多数人，不能只依赖传统 RFM 标签。',
    next: '以分层规则选出候选群体后，怎样检验运营是否真的有效？',
    status: '频次分布来自现有看板；分层效果尚未经实验验证',
    limit: 'RFM 是描述性分层，不是流失预测模型；“Lost / Churned”等历史标签不能被解释为未来已流失。'
  },
  {
    question: '如何判断二次购买运营是否创造了价值？',
    evidence: '设计随机对照触达实验：以首购用户为候选群体，先统一资格和观察窗口，再比较实验组与对照组。',
    finding: '优先检验 30/60 天增量二次购买率，并同时监控增量毛利、补贴成本与投诉。',
    next: '若试验有正向增量，再评估扩展人群与运营预算；没有实验数据不宣称实际提升。',
    status: '运营实验设计；尚未实施、没有效果数据',
    limit: '不能把触达后的购买率直接当成增量效果；应使用随机分组与对照组避免自然回购和选择偏差。'
  }
];

const tabButtons = Array.from(document.querySelectorAll('[role="tab"][data-step]'));
const panel = document.getElementById('reason-panel');
const nodes = {
  index: document.getElementById('panel-index'),
  title: document.getElementById('panel-title'),
  evidence: document.getElementById('panel-evidence'),
  finding: document.getElementById('panel-finding'),
  next: document.getElementById('panel-next'),
  status: document.getElementById('panel-status'),
  limit: document.getElementById('panel-limit')
};
const methodDetails = document.getElementById('method-details');

function activateStep(index, { focusTab = false } = {}) {
  if (!Number.isInteger(index) || index < 0 || index >= steps.length) return;
  const step = steps[index];
  tabButtons.forEach((tab, i) => {
    const active = i === index;
    tab.classList.toggle('is-current', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tabButtons[index].id);
  nodes.index.textContent = `STEP ${String(index + 1).padStart(2, '0')} / 05`;
  nodes.title.textContent = step.question;
  nodes.evidence.textContent = step.evidence;
  nodes.finding.textContent = step.finding;
  nodes.next.textContent = step.next;
  nodes.status.textContent = step.status;
  nodes.limit.textContent = step.limit;
  methodDetails.open = false;
  if (focusTab) tabButtons[index].focus();
}

for (const [index, tab] of tabButtons.entries()) {
  tab.addEventListener('click', () => activateStep(index));
  tab.addEventListener('keydown', (event) => {
    let target = null;
    if (event.key === 'ArrowRight') target = (index + 1) % steps.length;
    if (event.key === 'ArrowLeft') target = (index - 1 + steps.length) % steps.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = steps.length - 1;
    if (target === null) return;
    event.preventDefault();
    activateStep(target, { focusTab: true });
  });
}

activateStep(1);

