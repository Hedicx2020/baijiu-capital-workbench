(() => {
  "use strict";
  const body = document.body;
  const pages = [...document.querySelectorAll(".page")];
  const navButtons = [...document.querySelectorAll("[data-nav]")];
  const routeLabel = document.getElementById("route-label");
  const aiPanel = document.getElementById("ai-panel");
  const aiToggle = document.getElementById("ai-toggle");
  const aiContext = document.getElementById("ai-context");
  const aiThread = document.getElementById("ai-thread");
  const aiInput = document.getElementById("ai-input");
  const drawer = document.getElementById("detail-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const drawerTitle = document.getElementById("drawer-title");
  const drawerKicker = document.getElementById("drawer-kicker");
  const drawerBody = document.getElementById("drawer-body");
  const tweaksPanel = document.getElementById("tweaks-panel");
  const prototypeState = document.getElementById("prototype-state");
  const toast = document.getElementById("toast");
  const sidebar = document.getElementById("sidebar");
  const compactNavigation = window.matchMedia("(max-width: 1024px)");
  const priceData = window.WHITE_LIQUOR_DATA || { companies: {}, generatedFrom: {} };
  const researchData = window.WHITE_LIQUOR_RESEARCH || { channelWeekly: { companies: {} }, companyFinancials: { companies: {} } };
  const localData = window.WHITE_LIQUOR_LOCAL || { macro: [], companyQuarterly: {}, valuation: { companies: {} }, fundHolding: { companies: {} }, regionDemo: { companies: {} } };
  const companyKeyByName = { "贵州茅台": "maotai", "五粮液": "wuliangye", "泸州老窖": "guojiao" };
  const companyOrder = ["maotai", "wuliangye", "guojiao"];
  const pageMeta = {
    home: { route: "~/research/overview", label: "研究总览" },
    chain: { route: "~/industry/framework", label: "行业分析框架" },
    data: { route: "~/data/core-monitor", label: "核心数据跟踪" },
    opinions: { route: "~/views/evolution", label: "专家观点演化" },
    company: { route: "~/company/compare", label: "公司对比" }
  };

  const searchIndex = [
    { page: "home", code: "PAGE 01", title: "研究总览", note: "行业判断、四类研究功能、七维状态、拐点验证器" },
    { page: "chain", code: "PAGE 02", title: "行业分析框架", note: "宏观、动销、库存、批价、回款、报表、估值" },
    { page: "data", code: "PAGE 03", title: "核心数据跟踪", note: "核心指标、确认阈值、证伪条件、观察清单" },
    { page: "opinions", code: "PAGE 04", title: "专家观点演化", note: "原子命题、共识矩阵、版本时间线、兑现跟踪" },
    { page: "company", code: "PAGE 05", title: "公司对比", note: "贵州茅台、五粮液、泸州老窖同口径比较与六问" },
    { page: "chain", code: "NODE", title: "价格体系", note: "出厂价 → 批价 → 终端价；顺价与倒挂" },
    { page: "home", code: "SIGNAL", title: "行业见底验证", note: "渠道现金流、主动补库、主流产品批价企稳回升" },
    { page: "data", code: "PRICE", title: "08-15批价数据", note: "飞天原箱1710、普五770、国窖1573为825元" },
    { page: "opinions", code: "VIEW", title: "磨底与右侧拐点", note: "04-22深度报告、08-09周度点评、08-15价格验证" },
    { page: "company", code: "COMPARE", title: "渠道倒挂与库存", note: "茅台顺价；普五倒挂249元；国窖倒挂125元" },
    { page: "chain", code: "ERA", title: "产业变迁四阶段", note: "计划管制→产能为王→渠道为王→品牌为王，2023框架PPT" },
    { page: "chain", code: "BAND", title: "价格带格局", note: "高端>800元约2100亿、寡头垄断；2022历史口径" },
    { page: "chain", code: "STOCK", title: "选股逻辑与困境反转", note: "牛股万能公式；景气选弹性、压力择确定" },
    { page: "data", code: "TRACKING", title: "长中短期指标体系", note: "长期年度宏观、中期季度财报、短期日周度渠道跟踪" },
    { page: "data", code: "SERIES", title: "系列酒批价全景", note: "茅台系列酒、新高端、次高端、汾酒系列周度批价 08-02" },
    { page: "data", code: "SOURCES", title: "官方数据来源导航", note: "GDP/CPI/M2/社零等宏观指标与行业数据的官网获取口径" },
    { page: "data", code: "MACRO", title: "宏观指标数据", note: "本地库GDP/CPI/M2/PPI/固投；社零与地产为DEMO模拟" },
    { page: "company", code: "FIN", title: "季度财务三图", note: "收入/归母净利/合同负债，本地财报库单季度口径" },
    { page: "company", code: "HOLDING", title: "基金重仓持仓", note: "06-30：茅846只/332亿，五63只/46亿，泸85只/66亿，环比大幅下降" },
    { page: "company", code: "LISTED", title: "上市酒企总览", note: "A股16家：单季收入/利润同比、毛利率、PE、股息率、重仓基金" },
    { page: "company", code: "ANN", title: "近期公告与事件", note: "巨潮资讯近三个月：茅台半年报、五粮液回购增持、老窖分红等" },
    { page: "data", code: "BLUEPRINT", title: "数字化跟踪蓝图", note: "产业分析/比较/资本市场/舆情四分支树状图，节点标注接入状态" }
  ];

  const nodeDetails = {
    macro: {
      title: "宏观经济与消费场景",
      pro: "聚焦可映射到白酒消费场景的需求变量，并检验它们与终端动销之间的领先、同步或弱相关关系。",
      upstream: "收入与消费能力、商务与宴席、流动性与资产定价",
      downstream: "终端动销与价格带结构",
      next: "接入社零、居民收入、餐饮与区域场景数据"
    },
    sellthrough: {
      title: "终端动销",
      pro: "需按产品、区域、渠道与消费场景拆分，并与发货、库存变动交叉验证，防止把压货误判为需求。",
      upstream: "宏观环境与具体消费场景",
      downstream: "库存去化、批价、经销商现金流",
      next: "接入区域/产品级动销与同口径历史数据"
    },
    inventory: {
      title: "渠道库存与现金流",
      pro: "库存周数、库存结构和渠道现金流共同决定降价压力、打款意愿与后续主动补库能力。",
      upstream: "发货节奏与终端动销",
      downstream: "批价、渠道利润、打款意愿",
      next: "核验库存口径、区域分布与经销商资金压力"
    },
    price: {
      title: "出厂价、批价与终端价",
      pro: "价差与倒挂程度连接供需、渠道利润和回款意愿；绝对价格之外还需看持续性、区域广度与产品间传导。",
      upstream: "动销、库存、发货与渠道政策",
      downstream: "渠道利润、补库、回款和公司报表",
      next: "接入三类价格、规格、区域、频率与事件来源"
    },
    payment: {
      title: "经销商打款与酒企发货",
      pro: "需要区分计划内回款、被动打款与主动补库，并结合合同负债、发货确认和渠道库存判断质量。",
      upstream: "渠道现金流、库存、批价与利润",
      downstream: "合同负债、收入确认和经营现金流",
      next: "接入回款进度、发货节奏与渠道行为证据"
    },
    financials: {
      title: "收入、利润、合同负债与经营现金流",
      pro: "合同负债、现金流与收入利润需结合确认节奏、费用政策和产品结构变化进行质量分析。",
      upstream: "打款、发货与渠道政策",
      downstream: "分红能力、估值和资本市场判断",
      next: "接入公司公告与可比口径财务数据"
    },
    valuation: {
      title: "分红、估值与股价",
      pro: "需区分基本面证据、预期变化与风险偏好，不能把股价变化直接当成经营结论。",
      upstream: "经营数据、观点共识与风险偏好",
      downstream: "投资决策与研究命题更新",
      next: "接入估值、持仓和观点材料并保持来源隔离"
    },
    supply: {
      title: "供给端变量",
      pro: "区分名义政策与实际执行，结合区域配额、费用核销与渠道库存检验政策效果。",
      upstream: "公司经营目标与库存压力",
      downstream: "市场供给、批价与渠道利润",
      next: "接入公司公告、渠道政策与执行反馈"
    },
    channel: {
      title: "渠道端变量",
      pro: "渠道利润、库存结构、杠杆和现金流共同塑造价格行为；调研证据需标注区域、样本与可信度。",
      upstream: "动销、发货、价格体系与费用",
      downstream: "打款、补库、批价与报表",
      next: "接入可追溯渠道调研并标记可信度"
    },
    structure: {
      title: "结构端变量",
      pro: "关注价格带迁移、区域基本盘、品牌集中度、份额与 ToC 能力，避免单一高端产品代表全行业。",
      upstream: "消费场景、品牌力和渠道能力",
      downstream: "份额、产品结构和增长质量",
      next: "接入价格带、区域、品牌与渠道结构数据"
    }
  };

  const metricDetails = {
    "出厂价": ["酒企向经销商供货的名义价格。", "需结合返利、费用和实际执行条件，避免只看名义价格。"],
    "批价": ["渠道之间的真实交易价格。", "它更敏感地反映供需、库存压力和经销商利润空间。"],
    "终端价": ["消费者实际面对的成交价格。", "需区分标价与成交价，并标注区域、渠道和规格。"],
    "渠道库存": ["渠道尚未被消费者买走的货。", "应关注库存周数、产品结构、区域分布和去化速度。"],
    "终端动销": ["消费者真实买走的数量或金额。", "应与发货分开，避免把向渠道压货误判为需求。"],
    "回款与发货": ["回款体现渠道信心，发货体现供给节奏。", "二者需要结合库存、现金流和合同负债判断质量。"]
  };

  const explainTabs = {
    researcher: {
      kicker: "RESEARCH METHOD",
      title: "把价差、库存与动销放在同一时间轴",
      items: ["<strong>价差</strong>检验渠道是否顺价以及利润空间。", "<strong>库存</strong>解释未来供给压力与降价动机。", "<strong>动销</strong>验证价格变化是否来自真实需求。"]
    },
    investment: {
      kicker: "TRANSMISSION",
      title: "价格先修复渠道，再逐步传导到报表",
      items: ["<strong>渠道利润</strong>改善后，主动补库与打款意愿才可能上升。", "<strong>回款与发货</strong>随后影响合同负债、收入和现金流。", "<strong>估值</strong>可能提前反映预期，但不能替代经营证据。"]
    },
    risk: {
      kicker: "COUNTER EVIDENCE",
      title: "任何价格判断都要主动寻找反证",
      items: ["<strong>持续性</strong>一次价格反弹不等于趋势反转。", "<strong>区域广度</strong>局部改善不能直接外推到全国。", "<strong>行为验证</strong>批价企稳仍需主动补库与现金流改善确认。"]
    }
  };

  const scenarioConfig = {
    boom: {
      summary: "需求增长 → 批价上涨 → 渠道赚钱 → 囤货和加杠杆 → 供给进一步收紧 → 批价继续上涨。",
      nodes: ["macro", "sellthrough", "inventory", "price", "channel"],
      badge: "BOOM"
    },
    downturn: {
      summary: "动销走弱 → 库存累积 → 降价回笼现金 → 批价倒挂 → 利润恶化 → 打款意愿下降。",
      nodes: ["sellthrough", "inventory", "price", "payment", "channel"],
      badge: "DOWN"
    },
    repair: {
      summary: "酒企减少发货 → 库存下降 → 现金流改善 → 主动补库 → 批价企稳回升 → 渠道利润恢复。",
      nodes: ["inventory", "price", "payment", "supply", "channel"],
      badge: "REPAIR"
    }
  };

  let currentPage = "home";
  let selectedCompany = "贵州茅台";
  let currentCompanyView = "compare";
  let toastTimer;
  let drawerReturnFocus = null;
  let aiReturnFocus = null;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
  }

  function setElementInert(element, inert) {
    const focusable = element.querySelectorAll("button, [href], input, select, textarea, [tabindex]");
    if (inert) {
      element.setAttribute("inert", "");
      focusable.forEach(node => {
        if (!node.hasAttribute("data-pre-inert-tabindex")) {
          node.setAttribute("data-pre-inert-tabindex", node.hasAttribute("tabindex") ? node.getAttribute("tabindex") : "__none__");
        }
        node.setAttribute("tabindex", "-1");
      });
    } else {
      element.removeAttribute("inert");
      focusable.forEach(node => {
        const previous = node.getAttribute("data-pre-inert-tabindex");
        if (previous === null) return;
        if (previous === "__none__") node.removeAttribute("tabindex");
        else node.setAttribute("tabindex", previous);
        node.removeAttribute("data-pre-inert-tabindex");
      });
    }
  }

  function formatNumber(value, digits = 0) {
    if (!Number.isFinite(Number(value))) return "—";
    return Number(value).toLocaleString("zh-CN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  function formatPct(value, digits = 1) {
    if (!Number.isFinite(Number(value))) return "—";
    const number = Number(value) * 100;
    return `${number > 0 ? "+" : ""}${number.toFixed(digits)}%`;
  }

  function formatNumberSafe(value, digits = 0) {
    return Number.isFinite(value) ? formatNumber(value, digits) : "—";
  }

  function formatPctSafe(value, digits = 1) {
    return Number.isFinite(value) ? formatPct(value, digits) : "—";
  }

  function currentCompanyData(companyName = selectedCompany) {
    const key = companyKeyByName[companyName] || "maotai";
    return {
      key,
      price: priceData.companies[key] || {},
      channel: researchData.channelWeekly?.companies?.[key] || {},
      financial: researchData.companyFinancials?.companies?.[key] || {}
    };
  }

  function sparklinePath(series, width = 96, height = 30) {
    const values = series.map(point => point.value).filter(Number.isFinite);
    if (values.length < 2) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return series.map((point, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - ((point.value - min) / span) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }

  function renderMacroGrid() {
    const grid = document.getElementById("macro-grid");
    if (!grid || !localData.macro?.length) return;
    grid.innerHTML = localData.macro.map(item => {
      const delta = Number.isFinite(item.prev) ? item.latest - item.prev : null;
      const deltaText = delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}pct`;
      const badge = item.demo ? '<b class="track-state demo-badge">DEMO 模拟</b>' : '<b class="track-state is-full">本地库</b>';
      return `<article class="macro-card${item.demo ? " is-demo" : ""}">
        <div class="macro-card-top"><span>${escapeHtml(item.name)}</span>${badge}</div>
        <div class="macro-card-value"><strong>${item.latest}${item.unit}</strong><small>较上期 ${deltaText}</small></div>
        <svg class="macro-spark" viewBox="0 0 96 30" aria-hidden="true"><path d="${sparklinePath(item.series)}" /></svg>
        <footer>${escapeHtml(item.freq)} · 截至 ${escapeHtml(item.asOf)} · ${escapeHtml(item.source)}</footer>
      </article>`;
    }).join("");
  }

  function compareCell(value, note, source) {
    return `<span class="compare-data">${escapeHtml(value)}</span><span class="compare-note">${escapeHtml(note)}</span><span class="compare-source">${escapeHtml(source)}</span>`;
  }

  function comparisonValue(rowKey, companyKey) {
    const price = priceData.companies[companyKey] || {};
    const channel = researchData.channelWeekly?.companies?.[companyKey] || {};
    const financial = researchData.companyFinancials?.companies?.[companyKey] || {};
    const business = {
      maotai: ["超高端品牌 · 航母舰队矩阵", "国海：1500元以上概括为茅台独占；2023框架：产品矩阵+多元渠道生态+i茅台平抑周期波动"],
      wuliangye: ["千元高端龙头", "国海转引：高端带约65%份额；2023框架：大商战略合作伙伴平滑报表、守护品牌地位"],
      guojiao: ["千元高端 · 双品牌", "国海转引：高端带约12%份额；2023框架：产品结构切换保弹性、保渠道利润"]
    }[companyKey];
    const tension = {
      maotai: ["顺价但4周修复未稳", "库存低；验证原箱批价持续性、供给节奏与主动补库"],
      wuliangye: ["倒挂249元", "库存约1个月；验证旺季重定价格锚与回款质量"],
      guojiao: ["倒挂125元", "库存2个月以上；验证去库、回款与高端动销"]
    }[companyKey];
    if (rowKey === "business") return compareCell(business[0], business[1], "国海报告p12-13 / 2023框架PPT·历史档案");
    if (rowKey === "price") {
      const value = `${price.product || "核心产品"} · ${formatNumber(price.factory)}/${formatNumber(price.wholesale)}/${formatNumber(price.terminal)}元`;
      const note = `${price.inverted ? "倒挂" : "顺价"}${formatNumber(Math.abs(price.spread))}元 · 近4周${formatPct(price.trendMetrics?.change4w)}`;
      return compareCell(value, note, "价格Excel 08-15 / 月度终端价08月");
    }
    if (rowKey === "region") {
      const regions = localData.regionDemo?.companies?.[companyKey] || [];
      if (!regions.length) return compareCell("待接入", "现有材料未提供同口径区域拆分", "—");
      const top = regions.slice(0, 3).map(r => `${r.region}${r.share}%`).join(" / ");
      return compareCell(top, regions.map(r => `${r.region}${r.share}%`).join(" · "), "DEMO 模拟 · 待年报口径替换");
    }
    if (rowKey === "channel") return compareCell(channel.inventory || "—", `${channel.payment || "—"}；${channel.sellThrough || "—"}`, "渠道调研 08-03至08-09");
    if (rowKey === "strategy") return compareCell(channel.policy || "—", channel.takeaway || "—", "渠道调研 08-03至08-09");
    if (rowKey === "financial") {
      const q = (localData.companyQuarterly?.[companyKey]?.quarters || []).at(-1) || {};
      const val = localData.valuation?.companies?.[companyKey] || {};
      const fund = localData.fundHolding?.companies?.[companyKey] || {};
      const qLabel = q.date ? `${q.date.slice(0, 7)}单季收入${formatNumberSafe(q.revenue, 1)}亿` : "财报待接入";
      const value = `${qLabel} · PE ${formatNumberSafe(val.peTtm)}倍`;
      const note = `归母同比${formatPctSafe(q.netProfitYoY)} · 股息率${formatNumberSafe(val.dividendYield, 2)}% · 重仓基金${fund.funds ?? "—"}只`;
      return compareCell(value, note, `本地库：财报${q.date || "—"} / 估值${localData.valuation?.asOf || "—"} / 持仓${localData.fundHolding?.period || "—"}`);
    }
    return compareCell(tension[0], tension[1], "AI综合 · 价格/调研混合");
  }

  function renderListedOverview() {
    const tbody = document.getElementById("listed-tbody");
    const rows = localData.listedOverview?.rows;
    if (!tbody || !rows?.length) return;
    const pctCls = v => (Number.isFinite(v) && v < 0 ? "neg" : "");
    tbody.innerHTML = rows.map(r => `<tr>
      <th scope="row">${escapeHtml(r.name)}<small class="listed-code">${r.code}</small></th>
      <td>${r.period.slice(0, 7)}</td>
      <td>${formatNumberSafe(r.revenue, 1)}亿</td>
      <td class="${pctCls(r.revenueYoY)}">${formatPctSafe(r.revenueYoY)}</td>
      <td class="${pctCls(r.netProfitYoY)}">${formatPctSafe(r.netProfitYoY)}</td>
      <td>${formatPctSafe(r.grossMargin, 1)}</td>
      <td>${Number.isFinite(r.peTtm) ? (r.peTtm > 0 ? `${formatNumber(r.peTtm)}倍` : "亏损") : "—"}</td>
      <td>${Number.isFinite(r.dividendYield) ? `${formatNumber(r.dividendYield, 2)}%` : "—"}</td>
      <td>${r.funds}只</td>
      <td>${formatNumberSafe(r.fundMarketValue, 1)}亿</td>
    </tr>`).join("");
    const note = document.getElementById("listed-note");
    if (note) note.textContent = `本地财报库（单季度）· 估值 ${localData.listedOverview.valuationAsOf} · 重仓 ${localData.listedOverview.fundPeriod}`;
  }

  let currentAnnFilter = "all";
  function renderAnnouncements() {
    const list = document.getElementById("ann-list");
    const items = localData.announcements?.items || [];
    if (!list) return;
    const filtered = items.filter(item => currentAnnFilter === "all" || item.code === currentAnnFilter).slice(0, 15);
    if (!filtered.length) {
      list.innerHTML = `<li class="ann-empty">暂无公告数据，先运行 scripts/fetch_announcements.py 拉取。</li>`;
      return;
    }
    list.innerHTML = filtered.map(item => `<li>
      <time>${escapeHtml(item.date)}</time>
      <span class="ann-co">${escapeHtml(item.company)}</span>
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
    </li>`).join("");
    const note = document.getElementById("ann-note");
    if (note) note.textContent = `巨潮资讯 · ${localData.announcements.since} 至 ${localData.announcements.asOf} · 共 ${items.length} 条，显示前 ${filtered.length} 条`;
  }

  document.querySelectorAll("[data-ann-filter]").forEach(button => {
    button.addEventListener("click", () => {
      currentAnnFilter = button.dataset.annFilter;
      document.querySelectorAll("[data-ann-filter]").forEach(item => item.classList.toggle("is-active", item === button));
      renderAnnouncements();
    });
  });

  function renderFinCharts(companyKey) {
    const grid = document.getElementById("fin-chart-grid");
    if (!grid) return;
    const data = localData.companyQuarterly?.[companyKey];
    if (!data || !data.quarters?.length) { grid.innerHTML = ""; return; }
    const quarters = data.quarters;
    const quarterLabel = date => `${date.slice(2, 4)}Q${Math.ceil(Number(date.slice(5, 7)) / 3)}`;
    const charts = [
      { title: "营业总收入（亿元）", key: "revenue", yoyKey: "revenueYoY" },
      { title: "归母净利润（亿元）", key: "netProfit", yoyKey: "netProfitYoY" },
      { title: "合同负债（亿元 · 期末）", key: "contractLiability", yoyKey: null }
    ];
    grid.innerHTML = charts.map(chart => {
      const latest = quarters[quarters.length - 1];
      const values = quarters.map(q => q[chart.key]).filter(Number.isFinite);
      const max = Math.max(...values, 1);
      const bars = quarters.map(q => {
        const v = q[chart.key];
        const h = Number.isFinite(v) ? Math.max((v / max) * 100, 2) : 2;
        return `<div class="fin-bar"><span class="fin-bar-value">${Number.isFinite(v) ? formatNumber(v, 0) : "—"}</span><i style="height:${h.toFixed(1)}%"></i><span class="fin-bar-label">${quarterLabel(q.date)}</span></div>`;
      }).join("");
      const latestVal = latest[chart.key];
      const yoy = chart.yoyKey ? latest[chart.yoyKey] : null;
      return `<article class="panel fin-chart">
        <div class="fin-chart-head"><span>${chart.title}</span><strong>${formatNumberSafe(latestVal, 1)}</strong><small>${yoy !== null ? `同比 ${formatPctSafe(yoy)}` : "最新报告期"}</small></div>
        <div class="fin-bars">${bars}</div>
      </article>`;
    }).join("");
    const note = document.getElementById("fin-charts-note");
    if (note) note.textContent = `本地财报库 · 单季度口径 · 最新报告期 ${data.asOf}`;
  }

  function renderCompanyComparison() {
    document.querySelectorAll("[data-compare-row]").forEach(row => {
      const cells = [...row.querySelectorAll("td")];
      cells.forEach((cell, index) => { cell.innerHTML = comparisonValue(row.dataset.compareRow, companyOrder[index]); });
    });
  }

  function updateCompanyDetail(companyName) {
    const { key, price, channel, financial } = currentCompanyData(companyName);
    const summaries = {
      maotai: "价格仍顺价、库存低，4周批价改善但近1周回落；关注供给节奏与主动补库。",
      wuliangye: "普五近4周改善但仍倒挂，库存约1个月；等待旺季价格重锚与区域回款改善。",
      guojiao: "国窖1573批价持平且倒挂，库存2个月以上；去库和回款仍是主要验证项。"
    };
    document.getElementById("company-summary").textContent = summaries[key];
    const facts = [...document.querySelectorAll(".company-facts dd")];
    const factValues = [
      `${price.product} · ${price.inverted ? "倒挂" : "顺价"}`,
      `2024收入 ${formatNumber(financial.revenue2024, 1)}亿元`,
      key === "maotai" ? "批价持续性与供给节奏" : `${channel.inventory}与价格倒挂`,
      key === "maotai" ? "原箱批价/主动补库" : "库存、回款与渠道利润"
    ];
    facts.forEach((node, index) => { node.textContent = factValues[index]; });
    const footer = document.querySelector(".company-card-foot");
    footer.innerHTML = "<span class=\"is-live\">价格 08-15</span><span class=\"is-live\">渠道 08-09</span><span>财务/估值 04-22报告</span><span>AI综合判断</span>";
    const details = [...document.querySelectorAll(".question-list details")];
    const business = {
      maotai: "超高端品牌与稀缺性主导；2023框架口径：航母舰队产品矩阵、多元渠道生态与i茅台数字化共同平抑周期波动",
      wuliangye: "千元高端龙头；2023框架口径：以大经销商等战略合作伙伴平滑报表、守护品牌地位",
      guojiao: "双品牌战略；2023框架口径：以产品结构切换（低度国窖、特曲等中腰部产品）保持弹性、保障渠道利润"
    }[key];
    const quarter = (localData.companyQuarterly?.[key]?.quarters || []).at(-1) || {};
    const valuation = localData.valuation?.companies?.[key] || {};
    const fund = localData.fundHolding?.companies?.[key] || {};
    const regions = localData.regionDemo?.companies?.[key] || [];
    const regionText = regions.length
      ? `区域结构（DEMO 模拟）：${regions.map(r => `${r.region}${r.share}%`).join("、")}；待年报分地区口径替换。`
      : "现有材料未提供同口径区域拆分，待接入。";
    const finText = quarter.date
      ? `${quarter.date.slice(0, 7)}单季：收入${formatNumberSafe(quarter.revenue, 1)}亿（同比${formatPctSafe(quarter.revenueYoY)}），归母净利${formatNumberSafe(quarter.netProfit, 1)}亿（${formatPctSafe(quarter.netProfitYoY)}）；毛利率${formatPctSafe(quarter.grossMargin)}、净利率${formatPctSafe(quarter.netMargin)}；期末合同负债${formatNumberSafe(quarter.contractLiability, 1)}亿、存货${formatNumberSafe(quarter.inventories, 1)}亿，单季经营现金流${formatNumberSafe(quarter.operatingCashFlow, 1)}亿。PE TTM ${formatNumberSafe(valuation.peTtm)}倍、股息率${formatNumberSafe(valuation.dividendYield, 2)}%（估值${localData.valuation?.asOf || "—"}）；基金重仓${fund.funds ?? "—"}只 / ${formatNumberSafe(fund.marketValue, 1)}亿（${localData.fundHolding?.period || "—"}，环比${formatPctSafe(fund.mvChange)}）。`
      : "财报待接入。";
    const answers = [
      `${business}；2024收入为${formatNumber(financial.revenue2024, 1)}亿元。`,
      `${price.product}：出厂价/批价/终端价为${formatNumber(price.factory)}/${formatNumber(price.wholesale)}/${formatNumber(price.terminal)}元，当前${price.inverted ? `倒挂${formatNumber(Math.abs(price.spread))}元` : `顺价${formatNumber(price.spread)}元`}。${{
        maotai: "系列酒周度批价（Excel 08-02）：王子185、金王子148、贵州大曲80为130、赖茅传承蓝260、汉酱284、仁酒217元；茅台1935为610元。调研口径（08-09）：精品2340、生肖经典（散）1925、十五年4140元。",
        wuliangye: "",
        guojiao: "调研口径（08-09）：低度国窖630元、特曲（60版）410元，环比持平。"
      }[key]}`,
      regionText,
      `库存：${channel.inventory}；动销：${channel.sellThrough}；回款：${channel.payment}。`,
      `近期策略：${channel.policy}。`,
      finText
    ];
    details.forEach((detail, index) => {
      const stateTag = detail.querySelector("summary b");
      if (stateTag) {
        stateTag.textContent = index === 2 ? "DEMO模拟" : "已接入";
        stateTag.classList.toggle("is-live", index !== 2);
      }
      const paragraph = detail.querySelector(".question-body p");
      if (paragraph) paragraph.textContent = `当前答案：${answers[index]}`;
      const badges = detail.querySelectorAll(".question-body span");
      if (badges[0]) badges[0].textContent = index === 2 ? "支持证据：DEMO模拟，待年报口径替换" : "支持证据：已接入本地资料";
      if (badges[1]) badges[1].textContent = `反向证据：${key === "maotai" ? "近1周批价回落；Q2单季收入同比-5.2%" : "价格倒挂与库存压力"}`;
      if (badges[2]) badges[2].textContent = `下一验证：${key === "maotai" ? "主动补库与供给节奏" : "库存、回款和旺季动销"}`;
    });
    renderFinCharts(key);
  }

  function setPage(page, updateHistory = true) {
    if (!pageMeta[page]) page = "home";
    currentPage = page;
    pages.forEach(section => {
      const active = section.dataset.page === page;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
    });
    document.querySelectorAll(".nav-item, .mobile-nav [data-nav]").forEach(button => {
      const active = button.dataset.nav === page;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    routeLabel.textContent = pageMeta[page].route;
    aiContext.textContent = page === "company" && currentCompanyView === "detail"
      ? `上下文：公司研究 / ${selectedCompany}`
      : `上下文：${pageMeta[page].label}`;
    updateAiSuggestions(page);
    body.classList.remove("menu-open");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    syncSidebarInert();
    if (updateHistory) history.replaceState(null, "", `#${page}`);
    window.scrollTo({ top: 0, behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth" });
    document.title = `${pageMeta[page].label}｜AI 白酒研究教练`;
  }

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.company) {
        selectCompany(button.dataset.company);
        setCompanyView("detail");
      } else if (button.dataset.nav === "company") {
        setCompanyView("compare");
      }
      setPage(button.dataset.nav);
    });
  });

  function selectCompany(company) {
    selectedCompany = company;
    document.querySelectorAll("[data-company-tab]").forEach(button => {
      const active = button.dataset.companyTab === company;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.getElementById("company-name").textContent = company;
    updateCompanyDetail(company);
    document.getElementById("company-detail-label").textContent = `当前：${company}`;
    if (currentPage === "company" && currentCompanyView === "detail") {
      aiContext.textContent = `上下文：公司研究 / ${company}`;
      updateAiSuggestions("company");
    }
  }

  function setCompanyView(view) {
    if (!["compare", "detail"].includes(view)) view = "compare";
    currentCompanyView = view;
    document.querySelectorAll("[data-company-view]").forEach(button => {
      const active = button.dataset.companyView === view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll("[data-company-view-panel]").forEach(panel => {
      panel.hidden = panel.dataset.companyViewPanel !== view;
    });
    document.getElementById("company-view-note").textContent = view === "compare"
      ? "按统一维度横向对比，来源日期分列"
      : `当前查看：${selectedCompany} · 六问证据链`;
    if (currentPage === "company") {
      aiContext.textContent = view === "compare" ? "上下文：公司对比" : `上下文：公司研究 / ${selectedCompany}`;
      updateAiSuggestions("company");
    }
  }

  const companyViewButtons = [...document.querySelectorAll("[data-company-view]")];
  companyViewButtons.forEach((button, index) => {
    button.addEventListener("click", () => setCompanyView(button.dataset.companyView));
    button.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const target = companyViewButtons[(index + offset + companyViewButtons.length) % companyViewButtons.length];
      setCompanyView(target.dataset.companyView);
      target.focus();
    });
  });

  const companyTabButtons = [...document.querySelectorAll("[data-company-tab]")];
  companyTabButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectCompany(button.dataset.companyTab));
    button.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const target = companyTabButtons[(index + offset + companyTabButtons.length) % companyTabButtons.length];
      selectCompany(target.dataset.companyTab);
      target.focus();
    });
  });

  document.querySelectorAll("[data-company-detail]").forEach(button => {
    button.addEventListener("click", () => {
      selectCompany(button.dataset.companyDetail);
      setCompanyView("detail");
      const activeTab = companyTabButtons.find(tab => tab.dataset.companyTab === selectedCompany);
      setTimeout(() => activeTab?.focus(), 0);
    });
  });

  document.querySelectorAll(".question-list details").forEach(detail => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      document.querySelectorAll(".question-list details").forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });

  function drawerSection(title, content) {
    return `<section class="drawer-section"><h3>${title}</h3>${content}</section>`;
  }

  function openDrawer(title, kicker, html) {
    drawerReturnFocus = document.activeElement;
    drawerTitle.textContent = title;
    drawerKicker.textContent = kicker;
    drawerBody.innerHTML = html;
    drawer.classList.add("is-open");
    setElementInert(drawer, false);
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.hidden = false;
    setTimeout(() => document.getElementById("drawer-close").focus(), 20);
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    setElementInert(drawer, true);
    drawerBackdrop.hidden = true;
    if (drawerReturnFocus && drawerReturnFocus.isConnected) drawerReturnFocus.focus();
    drawerReturnFocus = null;
  }

  document.getElementById("drawer-close").addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  const staticDrawers = {
    "data-boundary": {
      title: "数据来源与研究边界",
      kicker: "DATA CONTRACT",
      html: drawerSection("已接入的本地资料", "<ul><li>价格Excel：日度截至2026-08-15，月度三价体系截至2026-08，系列酒周度截至08-02</li><li>本地数据库（~/local_data）：宏观GDP/CPI/M2/PPI/固投（截至03-31/04-30）、三家公司季度财报（茅Q2'26、五泸Q1'26）、估值（08-18）、基金重仓（06-30）</li><li>网页初步想法DOCX：产品需求（高频前置、宏观/行业数据获取口径）+ 渠道调研周表，观察期2026-08-03至08-09，未独立核验</li><li>国海深度报告：报告日2026-04-22，含历史事实、报告观点与预测</li><li>2023研究框架PPT（华创）：历史框架档案，方法论复用，数值为2022-2023年口径</li><li>茅台数字化汇报PPT：跟踪体系蓝图，用于定义完整跟踪范围与网页接入状态</li></ul>") +
        drawerSection("DEMO 模拟数据", "<p>社零当月同比、房地产开发投资累计同比、三家公司区域收入结构为固定种子随机模拟，仅用于演示交互，页面统一标注“DEMO 模拟”，待官方数据替换。</p>") +
        drawerSection("公告信息", "<p>三家公司近三个月公告共 62 条，来自巨潮资讯网（元数据，含 PDF 链接）；通过 scripts/fetch_announcements.py 增量更新。</p>") +
        drawerSection("不能混用的口径", "<p>DOCX周度文字表与嵌入折线端点冲突；网页价格统一采用更新至08-15的Excel，系列酒采用08-02周度列；DOCX中的精品/生肖/十五年/1935价格属调研文字口径，与Excel分列。2023框架PPT中的批价、回款、库存（如普五批价约940元、回款约75%）为2022-2023年口径，与2026年当前值不可比，仅作历史对照。报告观点、渠道观察和AI综合判断分别标注。</p>") +
        drawerSection("使用限制", `<div class="drawer-callout">本页不是实时行情，不构成投资建议；市值、PE、股息率等报告值均保留原报告日期。</div>`)
    },
    "ten-minute-check": {
      title: "10 分钟研究验收",
      kicker: "USER SUCCESS",
      html: drawerSection("第一次接触白酒行业的用户应能回答", "<ol><li>出厂价、批价和终端价有什么区别？</li><li>为什么库存和动销比酒企发货更重要？</li><li>为什么当前只能判断“修复信号出现、右侧待确认”？</li><li>哪三个指标可以验证行业是否真正见底？</li><li>4月深度报告与8月周度点评改变了什么判断？</li></ol>") +
        drawerSection("交互验收", "<p>每个判断都能展开事实、观点、AI 推断、置信度、反向证据、来源与下一验证项。</p>")
    },
    "judgment-method": {
      title: "行业状态模型",
      kicker: "EXPLAINABLE MODEL",
      html: drawerSection("确定性计算", "<p>底层状态应来自结构化指标、同口径历史分位与明确阈值；大模型不直接计算或凭空打分。</p>") +
        drawerSection("当前观点冲突", "<p>国海报告04-22判断“磨底期”；08-09周度点评判断“右侧拐点已现”；08-15价格数据仅对批价形成部分验证。</p>") +
        drawerSection("AI 的职责", "<p>把价格事实、渠道调研、报告观点和反向证据分开，再输出带置信度的综合判断。</p>") +
        drawerSection("固定输出结构", `<div class="drawer-grid"><div><span>01</span><strong>发生了什么</strong></div><div><span>02</span><strong>为什么重要</strong></div><div><span>03</span><strong>支持证据</strong></div><div><span>04</span><strong>反向证据</strong></div><div><span>05</span><strong>置信度</strong></div><div><span>06</span><strong>下一步看什么</strong></div></div>`)
    },
    "dimension-method": {
      title: "行业七维状态口径",
      kicker: "DIMENSION MODEL",
      html: drawerSection("每个维度必须同时携带", "<ul><li>当前状态与相较上期的变化</li><li>历史分位、数据新鲜度与计算口径</li><li>主要支持证据与反向证据</li><li>下一验证项与可能改变判断的条件</li></ul>") +
        drawerSection("当前来源", `<div class="drawer-callout">价格维度来自08-15 Excel；动销、库存、回款与政策来自08-09渠道调研；宏观与财报维度仍待更新。</div>`)
    }
  };

  document.querySelectorAll("[data-open-drawer]").forEach(button => {
    button.addEventListener("click", () => {
      const config = staticDrawers[button.dataset.openDrawer];
      if (config) openDrawer(config.title, config.kicker, config.html);
    });
  });

  document.querySelectorAll("[data-node]").forEach(button => {
    button.addEventListener("click", () => {
      const detail = nodeDetails[button.dataset.node];
      if (!detail) return;
      const explanation = detail.pro;
      const evidenceMap = {
        price: "08-15 Excel：飞天原箱1710元、普五770元、国窖1573为825元；茅台/普五4周改善，国窖持平。",
        inventory: "08-09渠道调研：飞天不足2周、五粮液约1个月、国窖2个月以上，其他公司约2至4个月以上。",
        sellthrough: "08-09渠道调研称茅台H1约+10%，五粮液与国窖仍分化；该来源未独立核验。",
        payment: "08-09渠道调研：茅台约63%、五粮液多数运营商约70%、国窖整体约40%，区域差异明显。",
        financials: "国海报告披露2024收入及04-17时点PE/股息率；实时财报数据仍未接入。",
        macro: "宏观实时数据尚未接入；报告历史数据显示消费场景从商务向悦己迁移。",
        structure: "国海报告：2024年悦己/商务占比37%/27%；高端与大众价格带的关键能力不同。"
      };
      const counterMap = {
        price: "普五与国窖批价仍低于Excel出厂价，分别倒挂249元和125元。",
        inventory: "库存口径来自渠道调研，样本与区域覆盖未披露，不能外推全行业。",
        sellthrough: "调研中的出货、合同任务与终端动销不能混为一谈。",
        payment: "打款进度可能由合同任务驱动，不等于主动补库或真实需求改善。"
      };
      const html = drawerSection("专业解释", `<div class="drawer-callout">${explanation}</div>`) +
        drawerSection("因果位置", `<div class="drawer-grid"><div><span>上游变量</span><strong>${detail.upstream}</strong></div><div><span>下游影响</span><strong>${detail.downstream}</strong></div></div>`) +
        drawerSection("支持证据", `<p>${escapeHtml(evidenceMap[button.dataset.node] || "当前仅有结构框架，相关实时数据待接入。")}</p>`) +
        drawerSection("反向证据", `<p>${escapeHtml(counterMap[button.dataset.node] || "需继续寻找能够削弱该链路的事实证据。")}</p>`) +
        drawerSection("下一步验证", `<p>${detail.next}</p>`);
      openDrawer(detail.title, "CAUSAL NODE", html);
    });
  });

  document.querySelectorAll("[data-dimension]").forEach(button => {
    button.addEventListener("click", () => {
      const name = escapeHtml(button.dataset.dimension);
      const cells = [...button.querySelectorAll("span")].map(node => node.textContent.trim());
      openDrawer(name, "STATUS DIMENSION", drawerSection("当前状态", `<div class="drawer-grid"><div><span>状态</span><strong>${escapeHtml(cells[1] || "—")}</strong></div><div><span>变化</span><strong>${escapeHtml(cells[2] || "—")}</strong></div><div><span>新鲜度</span><strong>${escapeHtml(cells[4] || "—")}</strong></div><div><span>置信度</span><strong>${escapeHtml(cells[5] || "—")}</strong></div></div>`) + drawerSection("下一验证", `<p>${escapeHtml(cells[6] || "待定义")}</p>`) + drawerSection("口径提醒", "<p>价格为Excel事实；渠道为未独立核验调研；报告判断和AI综合另行标注。</p>"));
    });
  });

  document.querySelectorAll("[data-metric]").forEach(button => {
    button.addEventListener("click", () => {
      const metric = button.dataset.metric;
      const detail = metricDetails[metric] || ["等待定义。", "等待定义。"];
      const companyName = document.querySelector("#page-data:not([hidden])") ? companyFilter.value : selectedCompany;
      const { price, channel } = currentCompanyData(companyName);
      const currentMap = {
        "出厂价": `${price.company} ${formatNumber(price.factory)}元 · Excel 08-15`,
        "批价": `${price.product} ${formatNumber(price.wholesale)}元 · 近4周${formatPct(price.trendMetrics?.change4w)} · Excel 08-15`,
        "终端价": `${price.company} ${formatNumber(price.terminal)}元 · 月度表2026-08`,
        "渠道库存": `${price.company}：${channel.inventory || "待接入"} · 渠道调研08-09`,
        "终端动销": `${price.company}：${channel.sellThrough || "待接入"} · 渠道调研08-09/未独核`,
        "回款与发货": `${price.company}：${channel.payment || "待接入"} · 渠道调研08-09`
      };
      openDrawer(metric, "METRIC EXPLAINER", drawerSection("它是什么", `<div class="drawer-callout">${detail[0]}</div>`) + drawerSection("研究时注意", `<p>${detail[1]}</p>`) + drawerSection("当前数据", `<p>${escapeHtml(currentMap[metric] || "待接入")}</p>`));
    });
  });

  document.querySelectorAll("[data-opinion-cell]").forEach(button => {
    button.addEventListener("click", () => {
      const label = escapeHtml(button.dataset.opinionCell);
      openDrawer(label, "ATOMIC CLAIM", drawerSection("来源类型", `<div class="drawer-callout">该矩阵分列04-22深度报告观点、08-09周度点评/调研和08-15价格事实，不能互相替代。</div>`) + drawerSection("验证原则", "<ul><li>报告观点保留报告日期和页码</li><li>渠道点评标注未独立核验</li><li>价格数据只能验证价格，不能替代库存和补库证据</li><li>综合状态必须同时展示反向证据</li></ul>"));
    });
  });

  document.querySelectorAll(".chart-event").forEach(eventNode => {
    const openEvent = () => openDrawer("图表事件槽位", "EVENT ATTRIBUTION", drawerSection("原型说明", `<div class="drawer-callout">该事件标记没有对应真实政策、公告或渠道调研。</div>`) + drawerSection("接入后应展示", "<ul><li>事件时间与原始来源</li><li>影响的价格、库存、动销或回款指标</li><li>事实事件 / 人工归因 / AI 推演的明确分类</li><li>同期反向证据与持续期</li></ul>"));
    eventNode.addEventListener("click", openEvent);
    eventNode.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openEvent(); }
    });
  });

  function setScenario(name) {
    const config = scenarioConfig[name];
    if (!config) return;
    document.getElementById("scenario-summary").textContent = config.summary;
    document.querySelectorAll("[data-scenario]").forEach(button => {
      const active = button.dataset.scenario === name;
      button.classList.toggle("is-active", active);
      if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".causal-node, .side-node").forEach(node => {
      const active = config.nodes.includes(node.dataset.node);
      node.classList.toggle("is-scenario", active);
      node.style.setProperty("--scenario-badge", `"${config.badge}"`);
    });
  }

  document.querySelectorAll("[data-scenario]").forEach(button => button.addEventListener("click", () => setScenario(button.dataset.scenario)));

  document.querySelectorAll("[data-explain-tab]").forEach(button => {
    button.addEventListener("click", () => {
      const config = explainTabs[button.dataset.explainTab];
      document.querySelectorAll("[data-explain-tab]").forEach(item => item.classList.toggle("is-active", item === button));
      document.getElementById("explain-content").innerHTML = `<span class="eyebrow">${config.kicker}</span><h2>${config.title}</h2><div class="explain-columns">${config.items.map(item => `<p>${item}</p>`).join("")}</div>`;
    });
  });

  const companyFilter = document.getElementById("company-filter");
  const productFilter = document.getElementById("product-filter");
  const regionFilter = document.getElementById("region-filter");
  const priceTypeFilter = document.getElementById("price-type-filter");
  const rangeFilter = document.getElementById("range-filter");
  const chartLabel = document.getElementById("chart-product-label");

  function chartPath(rows, key, minValue, maxValue) {
    const width = 808;
    const height = 276;
    const left = 60;
    const bottom = 324;
    let open = false;
    return rows.map((row, index) => {
      const value = row[key];
      if (!Number.isFinite(value)) { open = false; return ""; }
      const x = left + (rows.length <= 1 ? 0 : index / (rows.length - 1)) * width;
      const y = bottom - ((value - minValue) / (maxValue - minValue || 1)) * height;
      const command = open ? "L" : "M";
      open = true;
      return `${command}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }

  function updateChartFilters() {
    const { key, price, channel } = currentCompanyData(companyFilter.value);
    if (!price.company) return;
    productFilter.innerHTML = `<option>${escapeHtml(price.product)}</option>`;
    const region = regionFilter.value;
    chartLabel.textContent = `${price.company} · ${price.product} · ${region}`;
    const selectedSeries = priceTypeFilter.value;
    const monthCount = Number(rangeFilter.value);
    const rows = (price.monthlyPriceSystem || []).slice(-monthCount);
    const selectedDataSeries = selectedSeries === "retail" ? "terminal" : selectedSeries;
    const seriesKeys = selectedSeries === "all" ? ["factory", "wholesale", "terminal"] : [selectedDataSeries];
    const validValues = rows.flatMap(row => seriesKeys.map(keyName => row[keyName])).filter(Number.isFinite);
    const rawMin = Math.min(...validValues);
    const rawMax = Math.max(...validValues);
    const padding = Math.max((rawMax - rawMin) * 0.08, 10);
    const minValue = rawMin - padding;
    const maxValue = rawMax + padding;
    document.querySelectorAll("[data-series]").forEach(line => {
      line.style.display = selectedSeries === "all" || line.dataset.series === selectedSeries ? "" : "none";
      const dataKey = line.dataset.series === "retail" ? "terminal" : line.dataset.series;
      line.setAttribute("d", chartPath(rows, dataKey, minValue, maxValue));
    });
    const start = rows[0]?.date?.slice(0, 7) || "—";
    const middle = rows[Math.floor((rows.length - 1) / 2)]?.date?.slice(0, 7) || "—";
    const end = rows[rows.length - 1]?.date?.slice(0, 7) || "—";
    document.getElementById("axis-start").textContent = start;
    document.getElementById("axis-mid").textContent = middle;
    document.getElementById("axis-end").textContent = end;
    document.getElementById("axis-y-max").textContent = formatNumber(Math.round(maxValue));
    document.getElementById("axis-y-min").textContent = formatNumber(Math.round(minValue));

    const metricSummary = {
      maotai: { inventory: "不足2周", sellThrough: "H1约+10%", payment: "约63%" },
      wuliangye: { inventory: "约1个月", sellThrough: "普五出货略降", payment: "多数约70%" },
      guojiao: { inventory: "2个月+", sellThrough: "高端承压", payment: "整体约40%" }
    }[key];
    const latestMonthly = rows[rows.length - 1] || {};
    const liveValues = {
      factory: [ `${formatNumber(price.factory)}元`, "Excel日度 · 08-15" ],
      wholesale: [ `${formatNumber(price.wholesale)}元`, `近4周 ${formatPct(price.trendMetrics?.change4w)}` ],
      terminal: [ `${formatNumber(latestMonthly.terminal ?? price.terminal)}元`, `月度表 · ${latestMonthly.date?.slice(0, 7) || "—"}` ],
      inventory: [ metricSummary.inventory, "渠道调研 · 08-09" ],
      sellThrough: [ metricSummary.sellThrough, "渠道调研 · 未独立核验" ],
      payment: [ metricSummary.payment, "渠道调研 · 公司/区域分化" ]
    };
    document.querySelectorAll("[data-live-metric]").forEach(button => {
      const value = liveValues[button.dataset.liveMetric];
      button.querySelector("strong").textContent = value[0];
      button.querySelector("small").textContent = value[1];
    });

    const spreadLabel = `${price.spread >= 0 ? "+" : "-"}${formatNumber(Math.abs(price.spread))}元`;
    document.getElementById("price-diagnostics").innerHTML = [
      ["近1周", formatPct(price.trendMetrics?.change1w), `${formatNumber(price.trendMetrics?.latest)}元`],
      ["近4周", formatPct(price.trendMetrics?.change4w), `${formatNumber(price.wholesale)}元`],
      ["渠道价差", spreadLabel, price.inverted ? "批价低于出厂价" : "批价高于出厂价"],
      ["3年分位", `${Math.round((price.trendMetrics?.percentile3y || 0) * 100)}%`, `52周高点回撤${formatPct(price.trendMetrics?.drawdown52w)}`]
    ].map(([label, value, note]) => `<div><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join("");
  }
  [companyFilter, productFilter, regionFilter, priceTypeFilter, rangeFilter].forEach(control => control.addEventListener("change", updateChartFilters));
  document.getElementById("data-filters").addEventListener("reset", () => setTimeout(updateChartFilters, 0));

  document.querySelectorAll("[data-watch]").forEach(checkbox => {
    const storageKey = `baijiu-watch-${checkbox.dataset.watch}`;
    try { checkbox.checked = localStorage.getItem(storageKey) === "1"; } catch (_) { checkbox.checked = false; }
    checkbox.addEventListener("change", () => {
      try { localStorage.setItem(storageKey, checkbox.checked ? "1" : "0"); } catch (_) { /* local persistence is optional */ }
    });
  });

  function updateAiSuggestions(page) {
    const suggestions = {
      home: ["四类研究功能如何形成完整证据链？", "白酒行业目前处于周期的哪个环节？", "哪三个指标可以验证行业见底？"],
      chain: ["行业分析框架包含哪些关键环节？", "产业变迁经历了哪几个阶段？", "为什么库存领先于报表？"],
      data: ["长期、中期、短期分别跟踪哪些指标？", "宏观和行业数据去哪查？", "当前监控表的确认阈值是什么？", "哪些条件会证伪修复判断？"],
      opinions: ["什么是原子命题？", "基金重仓数据是否支持筹码出清？", "如何跟踪观点是否兑现？"],
      company: currentCompanyView === "compare"
        ? ["三家公司应该按哪些同口径维度比较？", "公司对比还缺哪些材料？", "为什么现在不能形成公司排序？"]
        : [`${selectedCompany}的公司六问需要哪些数据？`, "公司页为什么不先堆财务图？", "如何验证渠道是否健康？"]
    };
    document.getElementById("ai-suggestions").innerHTML = suggestions[page].map(text => `<button type="button">${text}</button>`).join("");
    bindSuggestionButtons();
    if (aiPanel.hasAttribute("inert")) setElementInert(aiPanel, true);
  }

  function toggleAi(force) {
    const open = typeof force === "boolean" ? force : !body.classList.contains("ai-open");
    const wasOpen = body.classList.contains("ai-open");
    if (open && !wasOpen) aiReturnFocus = document.activeElement;
    body.classList.toggle("ai-open", open);
    aiToggle.setAttribute("aria-expanded", String(open));
    aiPanel.setAttribute("aria-hidden", String(!open));
    setElementInert(aiPanel, !open);
    if (open) setTimeout(() => aiInput.focus(), 220);
    else if (wasOpen && aiReturnFocus && aiReturnFocus.isConnected) {
      aiReturnFocus.focus();
      aiReturnFocus = null;
    }
  }

  aiToggle.addEventListener("click", () => toggleAi());
  document.getElementById("ai-close").addEventListener("click", () => toggleAi(false));

  function buildAiAnswer(happened, important, support, counter, next, confidence = "资料综合：中低；价格数据：高；渠道判断：低") {
    return { happened, important, support, counter, confidence, next };
  }

  function aiResponse(question) {
    const { price, channel } = currentCompanyData(companyFilter?.value || selectedCompany);
    if (/周期.*环节|行业.*位置|修复信号/.test(question)) {
      const synthesis = researchData.synthesis || {};
      return buildAiAnswer(
        synthesis.stage || "当前阶段待判断",
        synthesis.summary || "需把价格、库存、动销、回款和观点放在同一证据链中。",
        (synthesis.supporting || []).join(""),
        (synthesis.counter || []).join(""),
        synthesis.next || "继续更新主动补库、库存和批价。",
        `AI综合置信度：${synthesis.confidence || "低"}；价格数据高、渠道调研低`
      );
    }
    if (/四类研究功能|完整证据链/.test(question)) return buildAiAnswer(
      "研究工作台分为行业分析框架、核心数据跟踪、专家观点演化与公司对比四类功能。",
      "框架定义因果关系，数据验证当前状态，观点跟踪预期变化，公司比较落实到研究对象。",
      "价格Excel、渠道调研、深度报告和历史框架已分别接入并保留日期与来源。",
      "若四类模块口径不一致，可能出现行业结论与公司判断互相矛盾。",
      "统一指标字典、证据 ID、时间口径与来源质量标准。"
    );
    if (/确认阈值|证伪条件|监控表/.test(question)) return buildAiAnswer(
      "拐点监控表把每个指标拆成当前值、状态、确认阈值、证伪条件与更新频率。",
      "明确阈值可以防止单次反弹或局部调研被误判为趋势反转。",
      "批价已由08-15 Excel部分验证；库存、动销与回款来自08-09渠道调研。",
      "价格改善仍可能短促，调研样本与区域覆盖未披露，主动补库尚未统一确认。",
      "继续更新批价持续期、库存月数、主动补库和回款质量。"
    );
    if (/同口径|公司.*比较|三家公司/.test(question)) return buildAiAnswer(
      "公司对比应在相同日期、单位和定义下比较产品价格带、渠道库存、动销回款、现金流、策略与风险。",
      "同口径比较能把公司差异与数据口径差异分开。",
      "三家公司价格、库存/回款调研及报告财务数据已接入并分列来源日期。",
      "价格截至08-15、渠道截至08-09、财务/估值为04-22报告混合时点，不能直接合成排名。",
      "补齐同口径区域拆分与最新公告财务数据后再做排序。"
    );
    if (/出厂价|批价|终端价/.test(question)) return buildAiAnswer(
      "问题是在区分酒企供货、渠道交易与终端成交三种价格口径。",
      "三者之间的价差连接供需、渠道利润、打款意愿与后续报表传导。",
      `${price.company}当前出厂价/批价/终端价为${formatNumber(price.factory)}/${formatNumber(price.wholesale)}/${formatNumber(price.terminal)}元；价格日期分别为08-15和2026-08月度。`,
      "名义出厂价可能受返利费用影响，标价也不等于成交价；区域与规格差异会改变结论。",
      "继续补齐区域成交价、返利费用和实际终端成交口径。"
    );
    if (/库存|动销|发货/.test(question)) return buildAiAnswer(
      "发货说明货进入渠道，动销说明消费者真正买走，库存连接两者。",
      "库存与渠道现金流会影响降价、打款和主动补库，因此比单看发货更接近需求质量。",
      `${price.company}渠道调研：库存${channel.inventory || "待接入"}；动销${channel.sellThrough || "待接入"}；回款${channel.payment || "待接入"}。`,
      "调研样本偏差、区域错配或口径变化，都可能让库存与动销信号失真。",
      "补齐样本量、区域覆盖与连续周度同口径数据。"
    );
    if (/三个|见底|拐点/.test(question)) return buildAiAnswer(
      "规划定义了三个拐点验证信号：渠道现金流改善、主动补库、主流产品批价企稳回升。",
      "三类证据分别覆盖资金、行为与价格，联合出现比单一价格反弹更可靠。",
      "截至08-15，价格信号部分确认；渠道现金流和主动补库仍待确认。",
      "局部或短期改善、被动打款、库存仍高，都可能推翻修复判断。",
      "继续跟踪价格持续期、区域广度、库存月数和主动补库证据。"
    );
    if (/去哪.*查|数据.*来源|宏观数据/.test(question)) return buildAiAnswer(
      "宏观与行业数据均有官方获取口径：GDP、CPI、社零、PPI等来自国家统计局，M2来自中国人民银行，行业规模与产量来自酒业协会与统计局。",
      "白酒是顺周期行业，先跟踪能影响消费者信心的宏观数据，再看行业规模、产量、吨价与人均饮酒量。",
      "数据页已列出9项宏观指标与5项行业数据的官网入口；GDP/CPI/M2/PPI/固投数值已接入本地库（截至03-31/04-30）。",
      "社零与地产当前为DEMO随机模拟值，仅演示用；销量无官方披露，采用CR6加和估算。",
      "按月度频率更新CPI/社零/M2/PPI，季度更新GDP与人均收入，年度更新产量与格局数据；社零与地产等待官方数据替换。"
    );
    if (/持仓|重仓|基金|筹码/.test(question)) {
      const fh = localData.fundHolding || { companies: {} };
      const m = fh.companies.maotai || {};
      const w = fh.companies.wuliangye || {};
      const g = fh.companies.guojiao || {};
      return buildAiAnswer(
        `基金重仓（${fh.period || "—"}）：茅台${m.funds}只/${m.marketValue}亿，五粮液${w.funds}只/${w.marketValue}亿，泸州老窖${g.funds}只/${g.marketValue}亿。`,
        "周度点评称“26Q2食品饮料持仓环比近乎腰斩、筹码接近出清极点”，本地基金重仓数据可独立验证这一资金面判断。",
        `重仓市值环比：茅台${formatPctSafe(m.mvChange)}、五粮液${formatPctSafe(w.mvChange)}、泸州老窖${formatPctSafe(g.mvChange)}（相比${fh.prevPeriod || "上期"}），方向与点评一致。`,
        "重仓口径只覆盖进入基金前十大的持仓，不等于全部机构持仓；散户与北向不在此口径内。",
        "跟踪Q3基金重仓是否继续出清或回补，并与批价企稳相互印证。"
      );
    }
    if (/长期|中期|短期|指标体系|跟踪哪些/.test(question)) {
      const tiers = researchData.trackingSystem?.tiers || [];
      return buildAiAnswer(
        "跟踪指标分三层：长期（年度，宏观消费与行业格局）、中期（季度，目标/现金/收入/盈利/周转）、短期（日/周度，三价、回款、库存、动销、渠道政策）。",
        "三层频率与来源不同：短期看渠道温度，中期验证报表质量，长期决定方向与空间。",
        tiers.map(t => `${t.tier}（${t.freq}）：${t.coverage}。`).join(""),
        "渠道调研存在口径、表述性、真实性、理解性四类偏差，需交叉验证，不能只听一面之词。",
        "短期已接入Excel与周度调研；中期等待财报与公告接入；长期以年度宏观与行业协会数据为准。"
      );
    }
    if (/产业变迁|产能为王|渠道为王|品牌为王/.test(question)) return buildAiAnswer(
      "白酒四十年经历计划管制、产能为王、渠道为王、品牌为王四个阶段，代表龙头分别为汾酒、五粮液、洋河、茅台。",
      "每次切换的产业痛点不同：生产力不足、打通终端、场景占位；当前进入头部竞争时代，集中度持续提升。",
      "2023框架PPT S11；国海报告2024年CR6收入集中度约48%，方向与品牌为王一致。",
      "该框架为2023年8月历史档案，具体公司地位与份额需用最新数据复核。",
      "跟踪CR6集中度、价格带份额与头部酒企战略变化。"
    );
    if (/反向|反证|风险/.test(question)) return buildAiAnswer(
      "当前任务是主动寻找能够削弱既有判断的证据。",
      "没有反证的 AI 结论会把不确定性隐藏成确定语气。",
      "当前反证包括：普五与国窖仍倒挂、库存与回款分化、主动补库未统一确认。",
      "渠道调研未披露样本量，且DOCX文字价格与嵌入折线端点冲突。",
      "优先核验渠道样本、价格口径和旺季补库。"
    );
    if (/原子命题|观点/.test(question)) return buildAiAnswer(
      "原子命题把一篇材料拆成可以独立验证的最小判断。",
      "这样才能比较同一专家前后改变了什么，并跟踪预测是否兑现。",
      "网页已分列04-22深度报告、08-09周度点评与08-15价格验证。",
      "脱离上下文的摘句或无出处摘要可能误读专家原意。",
      "后续继续接入更多专家原文，避免用单一机构代表市场共识。"
    );
    if (/公司|六问|渠道健康/.test(question)) return buildAiAnswer(
      "公司研究先回答商业模式、产品价格带、区域场景、渠道健康、策略变化与数据验证六问。",
      "六问把经营因果放在财务图表之前，避免只看结果不看形成过程。",
      "当前已接入三家公司价格、渠道调研及报告财务/估值数据。",
      "来源日期不同且区域拆分缺失，不能将当前表直接解释为综合排名。",
      "补齐最新公告、区域结构和同口径渠道样本。"
    );
    return buildAiAnswer(
      "当前页面已连接本地价格Excel、渠道调研、深度报告和历史框架材料。",
      "正式回答必须把事实、观点与 AI 推断分开，并能够回到原始来源。",
      "价格为结构化数据；渠道为未独立核验调研；报告观点与AI综合均单独标注。",
      "数据并非实时行情，来源日期和口径冲突可能影响结论。",
      "请从价格、渠道、观点或公司维度提出更具体的问题。"
    );
  }

  function addAiMessage(role, text) {
    const element = document.createElement("div");
    element.className = `ai-message ${role}`;
    const label = role === "user" ? "你的问题" : "资料综合回答 · 非实时行情";
    element.innerHTML = `<span>${label}</span><p>${escapeHtml(text)}</p>`;
    aiThread.appendChild(element);
    aiThread.scrollTop = aiThread.scrollHeight;
  }

  function addAiAnswer(answer) {
    const labels = [["发生了什么", answer.happened], ["为什么重要", answer.important], ["支持证据", answer.support], ["反向证据", answer.counter], ["置信度", answer.confidence], ["下一步看什么", answer.next]];
    const element = document.createElement("div");
    element.className = "ai-message system";
    element.innerHTML = `<span>资料综合回答 · 非实时行情</span><ol class="ai-structured">${labels.map(([label, value]) => `<li><b>${label}</b><p>${escapeHtml(value)}</p></li>`).join("")}</ol>`;
    aiThread.appendChild(element);
    aiThread.scrollTop = aiThread.scrollHeight;
  }

  function askAi(question) {
    const clean = String(question || "").trim();
    if (!clean) return;
    toggleAi(true);
    addAiMessage("user", clean);
    const loading = document.createElement("div");
    loading.className = "ai-message system";
    loading.innerHTML = "<span>演示编排</span><p>正在检查问题边界…</p>";
    aiThread.appendChild(loading);
    aiThread.scrollTop = aiThread.scrollHeight;
    setTimeout(() => { loading.remove(); addAiAnswer(aiResponse(clean)); }, body.classList.contains("reduce-motion") ? 10 : 420);
  }

  document.getElementById("ai-form").addEventListener("submit", event => {
    event.preventDefault();
    const value = aiInput.value;
    aiInput.value = "";
    askAi(value);
  });

  function bindSuggestionButtons() {
    document.querySelectorAll("#ai-suggestions button").forEach(button => button.addEventListener("click", () => askAi(button.textContent)));
  }

  document.querySelectorAll("[data-ai-action]").forEach(button => {
    button.addEventListener("click", () => {
      const prompts = { explain: "解释当前页面的核心逻辑", counter: "帮我寻找这个判断的反向证据", next: "下一步应该验证什么？" };
      askAi(prompts[button.dataset.aiAction]);
    });
  });

  const searchDialog = document.getElementById("search-dialog");
  const searchInput = document.getElementById("global-search");
  const searchResults = document.getElementById("search-results");

  function renderSearch(query = "") {
    const normalized = query.trim().toLowerCase();
    const results = searchIndex.filter(item => !normalized || `${item.title} ${item.note}`.toLowerCase().includes(normalized));
    searchResults.innerHTML = results.length ? results.map((item, index) => `<button class="search-result" type="button" data-result-index="${index}" data-result-page="${item.page}"><span class="mono">${item.code}</span><strong>${item.title}</strong><small>${item.note}</small></button>`).join("") : "<div class=\"empty-state compact\"><strong>没有匹配结果</strong><p>可尝试搜索“批价”“观点”或公司名称。</p></div>";
    searchResults.querySelectorAll("[data-result-page]").forEach(button => button.addEventListener("click", () => { closeSearch(); setPage(button.dataset.resultPage); }));
  }

  function openSearch() { searchDialog.hidden = false; renderSearch(); searchInput.value = ""; setTimeout(() => searchInput.focus(), 20); }
  function closeSearch() { searchDialog.hidden = true; }
  document.getElementById("search-trigger").addEventListener("click", openSearch);
  document.getElementById("search-close").addEventListener("click", closeSearch);
  searchDialog.addEventListener("click", event => { if (event.target === searchDialog) closeSearch(); });
  searchInput.addEventListener("input", () => renderSearch(searchInput.value));

  function syncSidebarInert() {
    const inert = compactNavigation.matches && !body.classList.contains("menu-open");
    setElementInert(sidebar, inert);
    if (compactNavigation.matches) sidebar.setAttribute("aria-hidden", String(inert));
    else sidebar.removeAttribute("aria-hidden");
  }

  document.getElementById("menu-toggle").addEventListener("click", event => {
    const open = !body.classList.contains("menu-open");
    body.classList.toggle("menu-open", open);
    event.currentTarget.setAttribute("aria-expanded", String(open));
    syncSidebarInert();
  });
  compactNavigation.addEventListener("change", syncSidebarInert);

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2400);
  }

  function toggleTweaks(force) {
    const open = typeof force === "boolean" ? force : tweaksPanel.hidden;
    tweaksPanel.hidden = !open;
    document.getElementById("tweaks-trigger").setAttribute("aria-expanded", String(open));
    if (open) setTimeout(() => document.getElementById("reading-mode").focus(), 20);
  }
  document.getElementById("tweaks-trigger").addEventListener("click", () => toggleTweaks());
  document.getElementById("tweaks-close").addEventListener("click", () => toggleTweaks(false));

  function savePreference(key, value) {
    try { localStorage.setItem(`baijiu-prototype-${key}`, value); } catch (_) { /* storage may be disabled */ }
  }
  function loadPreference(key, fallback) {
    try { return localStorage.getItem(`baijiu-prototype-${key}`) || fallback; } catch (_) { return fallback; }
  }

  const readingMode = document.getElementById("reading-mode");
  const densityMode = document.getElementById("density-mode");
  const stateMode = document.getElementById("state-mode");
  const themeToggle = document.getElementById("theme-toggle");
  const motionToggle = document.getElementById("motion-toggle");

  function setReadingMode(value) { body.dataset.readingMode = value; readingMode.value = value; savePreference("reading", value); }
  function setDensity(value) { body.dataset.density = value; densityMode.value = value; savePreference("density", value); }
  function setTheme(dark) { body.dataset.theme = dark ? "dark" : "light"; themeToggle.checked = dark; savePreference("theme", dark ? "dark" : "light"); }
  function setMotion(reduced) { body.classList.toggle("reduce-motion", reduced); motionToggle.checked = reduced; savePreference("motion", reduced ? "reduced" : "full"); }

  function setPrototypeState(value) {
    stateMode.value = value;
    if (value === "normal") { prototypeState.hidden = true; prototypeState.innerHTML = ""; return; }
    const content = {
      loading: { symbol: "<div class=\"loader-bars\"><i></i><i></i><i></i></div>", title: "正在加载研究现场", copy: "正在检查数据新鲜度、来源与口径。原型不会在加载中展示旧结论。" },
      empty: { symbol: "<span class=\"empty-symbol\"></span>", title: "当前筛选没有可核验数据", copy: "调整公司、产品、区域或时间范围，或等待数据源接入。" },
      error: { symbol: "<span class=\"empty-symbol\"></span>", title: "数据源暂时不可用", copy: "保留上次成功更新时间，不使用未验证缓存生成新判断。" },
      disabled: { symbol: "<span class=\"empty-symbol\"></span>", title: "结论生成暂不可用", copy: "真实数据与来源校验尚未完成，因此禁用会产生研究结论的操作。", extra: "<button class=\"secondary-button\" type=\"button\" disabled>生成结论（等待数据）</button>" }
    }[value];
    prototypeState.innerHTML = `<div>${content.symbol}<h2>${content.title}</h2><p>${content.copy}</p>${content.extra || ""}<button class="secondary-button" type="button" id="state-restore">返回正常状态</button></div>`;
    prototypeState.hidden = false;
    document.getElementById("state-restore").addEventListener("click", () => setPrototypeState("normal"));
  }

  readingMode.addEventListener("change", () => setReadingMode(readingMode.value));
  densityMode.addEventListener("change", () => setDensity(densityMode.value));
  themeToggle.addEventListener("change", () => setTheme(themeToggle.checked));
  motionToggle.addEventListener("change", () => setMotion(motionToggle.checked));
  stateMode.addEventListener("change", () => setPrototypeState(stateMode.value));

  document.addEventListener("keydown", event => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");
    if (event.key === "Tab" && drawer.classList.contains("is-open")) {
      const focusable = [...drawer.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter(element => !element.disabled);
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    if (event.key === "/" && !typing) { event.preventDefault(); openSearch(); }
    if ((event.altKey || event.metaKey) && event.key.toLowerCase() === "t") { event.preventDefault(); toggleTweaks(); }
    if (event.key === "Escape") {
      if (!searchDialog.hidden) closeSearch();
      else if (drawer.classList.contains("is-open")) closeDrawer();
      else if (!tweaksPanel.hidden) toggleTweaks(false);
      else if (body.classList.contains("ai-open")) toggleAi(false);
      else if (body.classList.contains("menu-open")) { body.classList.remove("menu-open"); syncSidebarInert(); }
    }
  });

  const initialPage = location.hash.replace("#", "");
  setReadingMode(loadPreference("reading", "coach"));
  setDensity(loadPreference("density", "comfortable"));
  setTheme(loadPreference("theme", "light") === "dark");
  setMotion(loadPreference("motion", window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full") === "reduced");
  renderCompanyComparison();
  renderMacroGrid();
  renderListedOverview();
  renderAnnouncements();
  setPage(pageMeta[initialPage] ? initialPage : "home", false);
  setScenario("repair");
  selectCompany(selectedCompany);
  setCompanyView(currentCompanyView);
  updateChartFilters();
  bindSuggestionButtons();
  setElementInert(aiPanel, true);
  setElementInert(drawer, true);
  syncSidebarInert();
})();
