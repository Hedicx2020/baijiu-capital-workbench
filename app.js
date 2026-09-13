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
  const reviewData = window.WHITE_LIQUOR_REVIEW || { industry: [], companies: {} };
  const companyKeyByName = { "贵州茅台": "maotai", "五粮液": "wuliangye", "泸州老窖": "guojiao" };
  const companyOrder = ["maotai", "wuliangye", "guojiao"];
  const marketCompanyOrder = ["maotai", "wuliangye", "guojiao", "fenjiu", "yanghe", "gujing"];
  const pageMeta = {
    home: { route: "~/overview", label: "总揽" },
    industry: { route: "~/industry/analysis", label: "产业分析" },
    compare: { route: "~/industry/compare", label: "产业比较" },
    market: { route: "~/capital-market", label: "资本市场" },
    sentiment: { route: "~/sentiment", label: "舆情跟踪" },
    llm: { route: "~/settings/llm", label: "模型配置" },
    upload: { route: "~/settings/upload", label: "材料上传" }
  };
  const pageAliases = { chain: "industry", data: "industry", opinions: "market", company: "compare" };

  const searchIndex = [
    { page: "home", code: "PAGE 01", title: "总揽", note: "行业判断、功能蓝图、七维状态、拐点验证器" },
    { page: "industry", code: "PAGE 02", title: "产业分析", note: "宏观分析、长期趋势研判、中短期数据跟踪、调研情况" },
    { page: "compare", code: "PAGE 03", title: "产业比较", note: "国内外企业：产品结构、品牌建设、渠道情况、财务状况" },
    { page: "market", code: "PAGE 04", title: "资本市场", note: "分析师观点、目标价与盈利预测、估值、持仓与资金" },
    { page: "sentiment", code: "PAGE 05", title: "舆情跟踪", note: "行业观点、高管声音、企业新闻、重要公告" },
    { page: "llm", code: "PAGE 06", title: "模型配置", note: "接入大模型：接口地址、API Key、模型名、温度与系统提示词" },
    { page: "industry", code: "NODE", title: "价格体系", note: "出厂价 → 批价 → 终端价；顺价与倒挂" },
    { page: "home", code: "SIGNAL", title: "行业见底验证", note: "渠道现金流、主动补库、主流产品批价企稳回升" },
    { page: "home", code: "EVENTS", title: "大事记：股价核心驱动因素", note: "个股/行业事件钉、收入利润复盘、供需需求拟合；中报PPT+本地库" },
    { page: "industry", code: "PRICE", title: "08-15批价数据", note: "飞天原箱1710、普五770、国窖1573为825元" },
    { page: "market", code: "VIEW", title: "磨底与右侧拐点", note: "04-22深度报告、08-09周度点评、08-15价格验证" },
    { page: "compare", code: "COMPARE", title: "渠道倒挂与库存", note: "茅台顺价；普五倒挂249元；国窖倒挂125元" },
    { page: "industry", code: "ERA", title: "产业变迁四阶段", note: "计划管制→产能为王→渠道为王→品牌为王，2023框架PPT" },
    { page: "industry", code: "BAND", title: "价格带格局", note: "高端>800元约2100亿、寡头垄断；2022历史口径" },
    { page: "industry", code: "STOCK", title: "选股逻辑与困境反转", note: "牛股万能公式；景气选弹性、压力择确定" },
    { page: "industry", code: "TRACKING", title: "长中短期指标体系", note: "长期年度宏观、中期季度财报、短期日周度渠道跟踪" },
    { page: "industry", code: "SERIES", title: "系列酒批价全景", note: "茅台系列酒、新高端、次高端、汾酒系列周度批价 08-02" },
    { page: "industry", code: "SOURCES", title: "官方数据来源导航", note: "GDP/CPI/M2/社零等宏观指标与行业数据的官网获取口径" },
    { page: "industry", code: "MACRO", title: "宏观指标数据", note: "本地库GDP/CPI/M2/PPI/固投 + 统计局核验社零/餐饮/地产/信心（部分序列）" },
    { page: "industry", code: "SURVEY", title: "渠道周度调研表", note: "七家公司库存/动销/回款/渠道政策，08-03至08-09未独立核验" },
    { page: "compare", code: "FIN", title: "季度财务三图", note: "收入/归母净利/合同负债，本地财报库单季度口径" },
    { page: "compare", code: "PRODUCT", title: "产品结构对比", note: "核心单品三价体系 + 产品收入结构拆分（DEMO）" },
    { page: "compare", code: "GLOBAL", title: "国内外企业对标", note: "海外烈酒龙头对照（DEMO 虚拟），A股16家真实总览" },
    { page: "compare", code: "LISTED", title: "上市酒企总览", note: "A股16家：单季收入/利润同比、毛利率、PE、股息率、重仓基金" },
    { page: "market", code: "HOLDING", title: "机构持仓情况", note: "06-30：茅846只/332亿，五63只/46亿，泸85只/66亿，环比大幅下降" },
    { page: "market", code: "VALUATION", title: "估值", note: "PE TTM/PB/股息率，本地估值库08-18，对照报告时点04-17" },
    { page: "market", code: "TARGET", title: "目标价与盈利预测", note: "DEMO 虚拟示例，待接入券商一致预期" },
    { page: "market", code: "FUND FLOW", title: "交易活跃度/大宗/北上/两融", note: "DEMO 虚拟示例，待接入行情与资金数据源" },
    { page: "sentiment", code: "ANN", title: "重要公告", note: "巨潮资讯近三个月：茅台半年报、五粮液回购增持、老窖分红等" },
    { page: "sentiment", code: "VOICE", title: "高管声音与企业新闻", note: "DEMO 虚拟示例，待接入真实舆情源" },
    { page: "home", code: "BLUEPRINT", title: "数字化跟踪蓝图", note: "产业分析/比较/资本市场/舆情四分支树状图，节点标注接入状态" },
    { page: "home", code: "REVIEW", title: "复盘历史", note: "行业与个股的历史判断、验证结果与复盘结论，可记录新判断" },
    { page: "upload", code: "PAGE 07", title: "材料上传", note: "卖方按模块上传材料，大模型提取后采纳进入前端模块" },
    { page: "upload", code: "INBOX", title: "材料收件箱", note: "待核验/已采纳材料管理，与内置数据分列标注" }
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
      const badge = item.demo ? '<b class="track-state demo-badge">DEMO 模拟</b>'
        : (item.partial ? '<b class="track-state is-partial">部分序列</b>' : '<b class="track-state is-full">已核验</b>');
      return `<article class="macro-card${item.demo ? " is-demo" : ""}">
        <div class="macro-card-top"><span>${escapeHtml(item.name)}</span>${badge}</div>
        <div class="macro-card-value"><strong>${item.latest}${item.unit}</strong><small>较上期 ${deltaText}</small></div>
        <svg class="macro-spark" viewBox="0 0 96 30" aria-hidden="true"><path d="${sparklinePath(item.series)}" /></svg>
        <footer>${escapeHtml(item.freq)} · 截至 ${escapeHtml(item.asOf)} · ${escapeHtml(item.source)}</footer>
      </article>`;
    }).join("");
  }

  /* ===== 产业分析页扩展：阶段信号 / 产量与消费场景 / 渠道出清 ===== */
  const industryExtra = window.WHITE_LIQUOR_INDUSTRY || { stageSignal: {}, productionScene: {}, channelShakeout: {} };
  const WATCH_STATE_CLASS = { confirmed: "is-support", partial: "is-partial", pending: "" };

  function renderStageSignal() {
    const wrap = document.getElementById("stage-timeline");
    if (!wrap || !industryExtra.stageSignal?.timeline) return;
    const { rows, periods } = industryExtra.stageSignal.timeline;
    const stateTag = { past: '<b class="track-state is-full">已发生</b>', current: '<b class="track-state is-partial">当前位置</b>', forecast: '<b class="track-state demo-badge">预测</b>' };
    wrap.innerHTML = `
      <div class="stage-grid" style="grid-template-columns: 72px repeat(${periods.length}, minmax(0, 1fr));">
        <span class="stage-corner"></span>
        ${periods.map(p => `<div class="stage-period${p.state === "current" ? " is-current" : ""}"><strong class="mono">${escapeHtml(p.period)}</strong>${stateTag[p.state] || ""}</div>`).join("")}
        ${rows.map((row, ri) => `
          <span class="stage-row-label">${escapeHtml(row)}</span>
          ${periods.map(p => `<div class="stage-cell${p.state === "current" ? " is-current" : ""}${p.state === "forecast" ? " is-forecast" : ""}">${escapeHtml(p.cells[ri])}</div>`).join("")}
        `).join("")}
      </div>
      <p class="micro-note stage-source">${escapeHtml(industryExtra.stageSignal.source || "")}</p>`;
    const watchGrid = document.getElementById("watch-grid");
    const note = document.getElementById("watch-note");
    if (note) note.textContent = industryExtra.stageSignal.watchNote || "";
    if (watchGrid) {
      watchGrid.innerHTML = (industryExtra.stageSignal.watchIndicators || []).map(w => `
        <div class="focus-card">
          <div class="focus-card-head"><strong>${escapeHtml(w.name)}</strong><b class="signal-state ${WATCH_STATE_CLASS[w.state] || ""}">${escapeHtml(w.stateLabel)}</b></div>
          <p>${escapeHtml(w.desc)}</p>
        </div>`).join("");
    }
  }

  function renderProductionScene() {
    const ps = industryExtra.productionScene || {};
    const cards = document.getElementById("production-cards");
    if (!cards) return;
    cards.innerHTML = (ps.productionCards || []).map(c =>
      `<article class="panel evidence-stat"><span>${escapeHtml(c.label)}</span><strong>${escapeHtml(c.value)}</strong><p>${escapeHtml(c.sub)}</p></article>`
    ).join("");
    const noteEl = document.getElementById("production-note");
    if (noteEl) noteEl.textContent = ps.productionNote || "";
    const annual = ps.annual || {};
    const tag = document.getElementById("annual-source-tag");
    if (tag) tag.textContent = annual.source || "";
    const note = document.getElementById("annual-note");
    if (note) note.textContent = annual.note || "";
    const canvas = document.getElementById("annual-supply-chart");
    if (canvas && annual.years?.length) {
      drawLineChart(canvas, annual.years.map(String), [
        { color: "#1f77b4", values: annual.revenueGrowth || [] },
        { color: "#d62728", values: annual.sellthroughGrowth || [] }
      ], { height: 250 });
    }
    const scene = ps.scene || {};
    const bars = document.getElementById("scene-bars");
    if (bars && scene.groups?.length) {
      const palette = ["#0f5ea8", "#7fb3dd", "#c9a227", "#9aa8b5"];
      const allLabels = [...new Set(scene.groups.flatMap(g => g.shares.map(s => s[0])))];
      bars.innerHTML = scene.groups.map(g => `
        <div class="scene-bar-row">
          <span class="scene-bar-label">${escapeHtml(g.name)}</span>
          <div class="scene-bar" role="img" aria-label="${escapeHtml(g.name)}消费场景结构">
            ${g.shares.map(([label, pct], si) => `<i style="width:${pct}%;background:${palette[allLabels.indexOf(label) % palette.length]}" title="${escapeHtml(label)} ${pct}%"></i>`).join("")}
          </div>
          <div class="scene-bar-values">${g.shares.map(([label, pct], si) => `<span><i style="background:${palette[allLabels.indexOf(label) % palette.length]}"></i>${escapeHtml(label)} ${pct}%</span>`).join("")}</div>
        </div>`).join("");
    }
    const notes = document.getElementById("scene-notes");
    if (notes) {
      notes.innerHTML = (scene.notes || []).map(n => `<li>${escapeHtml(n)}</li>`).join("") +
        `<li class="scene-source">${escapeHtml(scene.source || "")}</li>`;
    }
  }

  function renderShakeout() {
    const cs = industryExtra.channelShakeout || {};
    const grid = document.getElementById("shakeout-grid");
    if (!grid) return;
    grid.innerHTML = (cs.cards || []).map(c =>
      `<article class="panel evidence-stat shakeout-card"><span>${escapeHtml(c.label)}${c.real ? "" : '<b class="track-state demo-badge">媒体口径</b>'}</span><strong>${escapeHtml(c.value)}</strong><p>${escapeHtml(c.sub)}</p></article>`
    ).join("");
    const title = document.getElementById("shakeout-essence-title");
    if (title) title.textContent = cs.essenceTitle || "出清本质";
    const essence = document.getElementById("shakeout-essence");
    if (essence) essence.textContent = cs.essence || "";
    const src = document.getElementById("shakeout-essence-source");
    if (src) src.textContent = `来源：${cs.essenceSource || ""}；其余卡片为中国烟酒流通协会/天眼查/美团白皮书等媒体转引口径，未独立核验`;
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

  function renderProductStructure() {
    const tbody = document.getElementById("product-structure-tbody");
    if (!tbody) return;
    tbody.innerHTML = companyOrder.map(key => {
      const price = priceData.companies[key] || {};
      return `<tr>
        <th scope="row">${escapeHtml(price.company || "—")}</th>
        <td>${escapeHtml(price.product || "—")}</td>
        <td>${formatNumber(price.factory)}元</td>
        <td>${formatNumber(price.wholesale)}元</td>
        <td>${formatNumber(price.terminal)}元</td>
        <td class="${price.inverted ? "neg" : ""}">${price.inverted ? `倒挂${formatNumber(Math.abs(price.spread))}元` : `顺价${formatNumber(price.spread)}元`}</td>
        <td>${formatPct(price.trendMetrics?.change4w)}</td>
      </tr>`;
    }).join("");
  }

  function renderChannelTable(tbodyId, keys) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const companies = researchData.channelWeekly?.companies || {};
    tbody.innerHTML = keys.map(key => companies[key]).filter(Boolean).map(c => `<tr>
      <th scope="row">${escapeHtml(c.company)}</th>
      <td>${escapeHtml(c.inventory || "—")}</td>
      <td>${escapeHtml(c.sellThrough || "—")}</td>
      <td>${escapeHtml(c.payment || "—")}</td>
      <td>${escapeHtml(c.policy || "—")}</td>
      ${tbodyId === "channel-research-tbody" ? `<td>${escapeHtml(c.weeklyPriceText || "—")}</td>` : ""}
      <td>${escapeHtml(c.takeaway || "—")}<small class="listed-code">${escapeHtml(c.locator || "")}</small></td>
    </tr>`).join("");
  }

  function marketCompanyName(key) {
    return priceData.companies[key]?.company || localData.companyQuarterly?.[key]?.company || key;
  }

  function renderMarketData() {
    const valGrid = document.getElementById("valuation-grid");
    if (valGrid) {
      const asOf = localData.valuation?.asOf || "—";
      valGrid.innerHTML = marketCompanyOrder.map(key => {
        const v = localData.valuation?.companies?.[key] || {};
        const name = marketCompanyName(key);
        const fin = researchData.companyFinancials?.companies?.[key] || {};
        return `<article class="panel track-card">
          <div class="track-card-head"><span class="mono">VALUATION</span><h3>${escapeHtml(name)}</h3><b class="track-state is-full">本地库</b></div>
          <ul class="track-list">
            <li><strong>PE TTM</strong><span>${formatNumberSafe(v.peTtm, 1)}倍</span></li>
            <li><strong>PB</strong><span>${formatNumberSafe(v.pb, 2)}倍</span></li>
            <li><strong>股息率</strong><span>${formatNumberSafe(v.dividendYield, 2)}%</span></li>
            <li><strong>总市值（报告时点）</strong><span>${formatNumberSafe(fin.marketCap, 0)}亿元</span></li>
          </ul>
          <footer>截至 ${asOf} · ${escapeHtml(localData.valuation?.source || "")}${fin.peTtm ? `<br>报告时点（04-17）对照：PE ${formatNumberSafe(fin.peTtm)}倍 / 股息率 ${formatNumberSafe(fin.dividendYield, 1)}%</footer>` : "</footer>"}
        </article>`;
      }).join("");
      const note = document.getElementById("valuation-note");
      if (note) note.textContent = `本地估值库 · 截至 ${asOf} · 毛五泸+汾洋古六家`;
    }
    const holdGrid = document.getElementById("fundholding-grid");
    if (holdGrid) {
      const fh = localData.fundHolding || { companies: {} };
      holdGrid.innerHTML = marketCompanyOrder.map(key => {
        const h = fh.companies?.[key] || {};
        const name = marketCompanyName(key);
        const changeCls = Number.isFinite(h.mvChange) && h.mvChange < 0 ? "neg" : "";
        return `<article class="panel track-card">
          <div class="track-card-head"><span class="mono">FUND HOLDING</span><h3>${escapeHtml(name)}</h3><b class="track-state is-full">本地库</b></div>
          <ul class="track-list">
            <li><strong>重仓基金数</strong><span>${h.funds ?? "—"}只（上期 ${h.prevFunds ?? "—"}只）</span></li>
            <li><strong>重仓市值</strong><span>${formatNumberSafe(h.marketValue, 1)}亿（上期 ${formatNumberSafe(h.prevMarketValue, 1)}亿）</span></li>
            <li><strong>重仓市值环比</strong><span class="${changeCls}">${formatPctSafe(h.mvChange)}</span></li>
          </ul>
          <footer>${escapeHtml(fh.period || "—")} 相比 ${escapeHtml(fh.prevPeriod || "上期")} · ${escapeHtml(fh.source || "")}</footer>
        </article>`;
      }).join("");
      const note = document.getElementById("holding-note");
      if (note) note.textContent = `本地库 fund_keystock · ${fh.period || "—"} 基金重仓口径，相比 ${fh.prevPeriod || "上期"} · 六家`;
    }
  }

  /* ===== 资本市场页扩展：中报六家速览 / 古井跟踪 / 媒体源目录 ===== */
  const deepData = window.WHITE_LIQUOR_DEEP || { interimCR6: {}, gujingTracking: {}, mediaSources: {}, maotaiSplit: {} };

  function renderInterimCR6() {
    const thead = document.getElementById("interim-thead");
    const tbody = document.getElementById("interim-tbody");
    if (!thead || !tbody || !deepData.interimCR6?.rows) return;
    const d = deepData.interimCR6;
    thead.innerHTML = `<tr>${d.head.map((h, i) => i === 0 ? `<th scope="col">${escapeHtml(h)}</th>` : `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr>`;
    tbody.innerHTML = d.rows.map(row =>
      `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td class="${String(cell).startsWith("-") ? "neg" : ""}">${escapeHtml(cell)}</td>`).join("")}</tr>`
    ).join("");
    const note = document.getElementById("interim-note");
    if (note) note.textContent = `${d.note} ${d.maotaiShare}`;
    const src = document.getElementById("interim-source-note");
    if (src) src.textContent = d.source || "";
  }

  function renderGujingTracking() {
    const g = deepData.gujingTracking || {};
    const kpis = document.getElementById("gujing-kpis");
    if (kpis && g.kpis) {
      kpis.innerHTML = g.kpis.map(c =>
        `<div class="events-fin-card"><span>${escapeHtml(c.label)}</span><strong class="mono">${escapeHtml(c.value)}</strong><small>${escapeHtml(c.sub)}</small></div>`
      ).join("");
    }
    const mixTitle = document.getElementById("gujing-mix-title");
    if (mixTitle && g.productMix) mixTitle.textContent = g.productMix.title;
    const mixTbody = document.getElementById("gujing-mix-tbody");
    if (mixTbody && g.productMix) {
      mixTbody.innerHTML = g.productMix.rows.map(r =>
        `<tr><th scope="row">${escapeHtml(r[0])}</th><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td></tr>`
      ).join("");
    }
    const priceTitle = document.getElementById("gujing-price-title");
    if (priceTitle && g.priceSystem) priceTitle.textContent = g.priceSystem.title;
    const priceThead = document.getElementById("gujing-price-thead");
    const priceTbody = document.getElementById("gujing-price-tbody");
    if (priceThead && priceTbody && g.priceSystem) {
      priceThead.innerHTML = `<tr>${g.priceSystem.head.map(h => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr>`;
      priceTbody.innerHTML = g.priceSystem.rows.map(r =>
        `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${escapeHtml(c)}</th>` : `<td>${escapeHtml(c)}</td>`).join("")}</tr>`
      ).join("");
      const priceNote = document.getElementById("gujing-price-note");
      if (priceNote) priceNote.textContent = `${g.priceSystem.note}；来源：${g.source}`;
    }
  }

  function renderMediaSources() {
    const grid = document.getElementById("media-grid");
    if (!grid || !deepData.mediaSources) return;
    const m = deepData.mediaSources;
    const group = (title, code, items) => `
      <article class="panel media-group">
        <div class="panel-topline"><span class="eyebrow">${code}</span><b class="track-state is-partial">${items.length}个源 · 待接入</b></div>
        <h3>${title}</h3>
        <div class="media-chips">${items.map(name => `<span class="media-chip">${escapeHtml(name)}</span>`).join("")}</div>
      </article>`;
    grid.innerHTML = group("酒类媒体", "LIQUOR MEDIA", m.liquor || []) + group("食品类媒体与数据机构", "FOOD MEDIA", m.food || []);
    const note = document.getElementById("media-sources-note");
    if (note) note.textContent = m.note || "";
  }

  /* ===== JYDB 数据块：目标价 / 一致预期 / 交易活跃度 / 最新研报 ===== */
  function klineLastClose(key) {
    const rows = localData.kline?.[key]?.rows;
    return rows?.length ? rows[rows.length - 1][4] : null;
  }

  function renderTargetPrice() {
    const panel = document.getElementById("target-price-panel");
    const note = document.getElementById("target-note");
    if (!panel) return;
    const data = localData.targetPrice;
    if (!data?.companies || !Object.keys(data.companies).length) {
      panel.innerHTML = `<div class="panel is-demo-panel"><div class="panel-topline"><span class="eyebrow">PRICE TARGET</span><b class="track-state demo-badge">待接入</b></div>
        <p class="blueprint-note">目标价统计暂未接入；接入 JYDB C_EX_TargetPrice 后此处展示各机构目标价均值/区间与覆盖机构数。</p></div>`;
      if (note) note.textContent = "待接入券商目标价统计";
      return;
    }
    const rows = [];
    marketCompanyOrder.forEach(key => {
      const c = data.companies[key];
      if (!c) return;
      const price = klineLastClose(key);
      c.windows.forEach(w => {
        const space = Number.isFinite(price) && Number.isFinite(w.avg) ? w.avg / price - 1 : null;
        rows.push({ key, w, price, space, asOf: c.asOf });
      });
    });
    panel.innerHTML = `<div class="panel band-table-wrap">
      <div class="panel-topline"><span class="eyebrow">PRICE TARGET</span><b class="track-state is-full">JYDB</b></div>
      <table class="band-table">
        <thead><tr><th scope="col">公司</th><th scope="col">统计窗口</th><th scope="col">目标价均值</th><th scope="col">最高</th><th scope="col">最低</th><th scope="col">中位数</th><th scope="col">覆盖机构</th><th scope="col">较现价空间</th><th scope="col">统计日</th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <th scope="row">${escapeHtml(marketCompanyName(r.key))}</th>
          <td>近${r.w.period}日</td>
          <td><strong>${formatNumberSafe(r.w.avg, 0)}元</strong></td>
          <td>${formatNumberSafe(r.w.max, 0)}元</td>
          <td>${formatNumberSafe(r.w.min, 0)}元</td>
          <td>${formatNumberSafe(r.w.median, 0)}元</td>
          <td>${r.w.orgs ?? "—"}家 / ${r.w.researchers ?? "—"}人</td>
          <td class="${r.space !== null && r.space < 0 ? "neg" : ""}">${r.space !== null ? formatPct(r.space) : "—"}</td>
          <td class="mono">${escapeHtml(r.asOf)}</td>
        </tr>`).join("")}</tbody>
      </table>
      <p class="blueprint-note">${escapeHtml(data.source || "JYDB C_EX_TargetPrice")}；较现价空间=目标价均值/最新收盘价-1（收盘价为K线最近交易日）；30/90/180日为滚动统计窗口，机构数为窗口内给出目标价的机构数量。</p>
    </div>`;
    if (note) note.textContent = `${data.source || "JYDB"} · 统计日 ${Object.values(data.companies)[0]?.asOf || "—"}`;
  }

  function renderForecast() {
    const panel = document.getElementById("forecast-panel");
    const note = document.getElementById("forecast-note");
    if (!panel) return;
    const data = localData.forecast;
    if (!data?.companies || !Object.keys(data.companies).length) {
      panel.innerHTML = `<div class="panel is-demo-panel"><div class="panel-topline"><span class="eyebrow">CONSENSUS FORECAST</span><b class="track-state demo-badge">待接入</b></div>
        <p class="blueprint-note">一致预期暂未接入；接入 JYDB C_EX_ProForStat 后此处展示 2026E-2028E 收入/净利/EPS 机构均值与样本数。</p></div>`;
      if (note) note.textContent = "待接入一致预期数据";
      return;
    }
    const rows = [];
    marketCompanyOrder.forEach(key => {
      const c = data.companies[key];
      if (!c) return;
      c.years.forEach(y => {
        const revYoy = c.base2025?.revenue && Number.isFinite(y.revenueAvgYi) ? y.revenueAvgYi / c.base2025.revenue - 1 : null;
        const npYoy = c.base2025?.netProfit && Number.isFinite(y.npAvgYi) ? y.npAvgYi / c.base2025.netProfit - 1 : null;
        rows.push({ key, y, revYoy, npYoy, asOf: c.asOf });
      });
    });
    panel.innerHTML = `<div class="panel band-table-wrap">
      <div class="panel-topline"><span class="eyebrow">CONSENSUS FORECAST</span><b class="track-state is-full">JYDB</b></div>
      <table class="band-table">
        <thead><tr><th scope="col">公司</th><th scope="col">预测年度</th><th scope="col">营业收入均值</th><th scope="col">较2025实际</th><th scope="col">归母净利均值</th><th scope="col">较2025实际</th><th scope="col">EPS 均值</th><th scope="col">机构样本</th><th scope="col">统计日</th></tr></thead>
        <tbody>${rows.map(r => `<tr>
          <th scope="row">${escapeHtml(marketCompanyName(r.key))}${r.key === "wuliangye" ? '<sup class="neg">*</sup>' : ""}</th>
          <td class="mono">${escapeHtml(r.y.year)}E</td>
          <td><strong>${formatNumberSafe(r.y.revenueAvgYi, 0)}亿</strong></td>
          <td class="${r.revYoy !== null && r.revYoy < 0 ? "neg" : ""}">${r.revYoy !== null ? formatPct(r.revYoy) : "—"}</td>
          <td><strong>${formatNumberSafe(r.y.npAvgYi, 0)}亿</strong></td>
          <td class="${r.npYoy !== null && r.npYoy < 0 ? "neg" : ""}">${r.npYoy !== null ? formatPct(r.npYoy) : "—"}</td>
          <td>${formatNumberSafe(r.y.epsAvg, 2)}元</td>
          <td>${r.y.npOrgs ?? "—"}家</td>
          <td class="mono">${escapeHtml(r.asOf)}</td>
        </tr>`).join("")}</tbody>
      </table>
      <p class="blueprint-note">${escapeHtml(data.source || "JYDB C_EX_ProForStat")}；金额为机构预测算术均值（聚源口径，收入/净利由万元/元换算为亿元）；「较2025实际」=一致预期/本地库2025四季加总-1，两口径分列可核对。*五粮液2025年报表追溯调整（平台公司监管商品重分类），同比跨口径仅供参考。预测属机构观点汇总，不构成投资建议。</p>
    </div>`;
    if (note) note.textContent = `${data.source || "JYDB"} · 统计日 ${Object.values(data.companies)[0]?.asOf || "—"}`;
  }

  function renderTradingActivity() {
    const bodyEl = document.getElementById("trading-activity-body");
    if (!bodyEl) return;
    const data = localData.trading;
    if (!data?.companies || !Object.keys(data.companies).length) {
      bodyEl.innerHTML = `<table class="band-table"><thead><tr><th scope="col">公司</th><th scope="col">近20日日均成交额</th><th scope="col">近20日涨跌幅</th></tr></thead>
        <tbody><tr><td colspan="3">待接入日度成交数据（JYDB QT_DailyQuote）</td></tr></tbody></table>`;
      return;
    }
    const rows = marketCompanyOrder.map(key => {
      const days = data.companies[key] || [];
      if (!days.length) return null;
      const last20 = days.slice(-20);
      const avgTurnover = last20.reduce((s, d) => s + (d.turnoverValueYi || 0), 0) / last20.length;
      const latest = days[days.length - 1];
      const firstClose = last20.find(d => Number.isFinite(d.close))?.close;
      const chg20 = Number.isFinite(firstClose) && Number.isFinite(latest.close) ? latest.close / firstClose - 1 : null;
      const lastTurnover = latest.turnoverValueYi;
      return { key, avgTurnover, lastTurnover, chg20, asOf: latest.date };
    }).filter(Boolean);
    bodyEl.innerHTML = `<table class="band-table">
      <thead><tr><th scope="col">公司</th><th scope="col">近20日日均成交额</th><th scope="col">最新单日成交额</th><th scope="col">近20日涨跌幅</th><th scope="col">截至</th></tr></thead>
      <tbody>${rows.map(r => `<tr>
        <th scope="row">${escapeHtml(marketCompanyName(r.key))}</th>
        <td>${formatNumber(r.avgTurnover, 1)}亿</td>
        <td>${formatNumberSafe(r.lastTurnover, 1)}亿</td>
        <td class="${r.chg20 !== null && r.chg20 < 0 ? "neg" : ""}">${r.chg20 !== null ? formatPct(r.chg20) : "—"}</td>
        <td class="mono">${escapeHtml(r.asOf)}</td>
      </tr>`).join("")}</tbody>
    </table>
    <p class="blueprint-note">${escapeHtml(data.source || "JYDB QT_DailyQuote")}；换手率待接入自由流通股本后补充（镜像库 QT_Performance 止步 2023-05，不可用）。</p>`;
    const badge = document.getElementById("trading-activity-badge");
    if (badge) badge.textContent = `JYDB · ${rows[0]?.asOf || ""}`;
  }

  function renderResearchReports() {
    const list = document.getElementById("report-list");
    if (!list) return;
    const items = localData.researchReports || [];
    if (!items.length) {
      list.innerHTML = `<li class="ann-empty">暂无研报元数据（JYDB C_RR_ResearchReport 未接入或近期无记录）</li>`;
      return;
    }
    list.innerHTML = items.map(r => `<li class="report-item">
      <time class="mono">${escapeHtml(r.date || "")}</time>
      <span class="report-org">${escapeHtml(r.org || "")}</span>
      <strong>${escapeHtml(r.title || "")}</strong>
      ${r.pages ? `<small>${r.pages}页</small>` : ""}
    </li>`).join("");
    const note = document.getElementById("reports-note");
    if (note) note.textContent = `JYDB C_RR_ResearchReport · 近75天 · ${items.length}条`;
  }

  /* ===== 产业比较页：茅台独家拆分 ===== */
  function renderMaotaiSplit() {
    const ms = deepData.maotaiSplit || {};
    const kpis = document.getElementById("maotai-split-kpis");
    const tables = document.getElementById("maotai-split-tables");
    if (!kpis || !tables) return;
    kpis.innerHTML = (ms.kpis || []).map(c =>
      `<div class="events-fin-card"><span>${escapeHtml(c.label)}</span><strong class="mono">${escapeHtml(c.value)}</strong><small>${escapeHtml(c.sub)}</small></div>`
    ).join("");
    tables.innerHTML = (ms.tables || []).map(t => `
      <article class="panel split-table-panel">
        <div class="panel-topline"><span class="eyebrow">${escapeHtml(t.title)}</span></div>
        <div class="company-compare-scroll" tabindex="0">
          <table class="band-table">
            <thead><tr>${t.head.map(h => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr></thead>
            <tbody>${t.rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${escapeHtml(c)}</th>` : `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="blueprint-note">${escapeHtml(t.note)}</p>
      </article>`).join("") +
      `<p class="blueprint-note">来源：${escapeHtml(ms.source || "")}。测算类口径：2026H1茅台酒销量基于成本法倒推；i茅台飞天/高附加值比例为假设（70%/30%）；社会库存按假设比例测算，仅作结构参考。</p>`;
  }

  function syncMaotaiSplitVisibility() {
    const section = document.getElementById("maotai-split-section");
    if (section) section.hidden = selectedCompany !== "贵州茅台";
  }

  function fmtMdShort(iso) {
    const m = String(iso || "").match(/\d{4}-(\d{2})-(\d{2})/);
    return m ? `${m[1]}-${m[2]}` : "—";
  }

  function syncDataDates() {
    const priceAsOf = priceData.generatedFrom?.asOf || "";
    const period = researchData.channelWeekly?.period || "";
    const surveyEnd = (period.match(/至(\d{4}-\d{2}-\d{2})/) || [])[1] || "";
    const banner = document.getElementById("demo-banner-dates");
    if (banner) banner.textContent = `价格 ${fmtMdShort(priceAsOf)} · 调研 ${fmtMdShort(surveyEnd)} · 中报总结 09-03 · 财报/估值/持仓已接本地库 · 标注 DEMO 处为模拟 · 非实时行情`;
    const topbarDate = document.getElementById("topbar-date");
    if (topbarDate) topbarDate.textContent = `${String(priceAsOf || "").replace(/-/g, ".")} / 价格已接入`;
    const homeAsof = document.getElementById("home-asof");
    if (homeAsof) homeAsof.textContent = priceAsOf || "—";
    const kpiNote = document.getElementById("overview-kpi-note");
    if (kpiNote) kpiNote.textContent = `价格截至${fmtMdShort(priceAsOf)} · 产量来自04-22报告`;
    const surveyNote = document.getElementById("survey-note");
    if (surveyNote && period) surveyNote.textContent = `网页初步想法DOCX · 周度调研表 · 观察期 ${period}`;
  }

  function renderViewpoints() {
    const wrap = document.getElementById("viewpoint-cards");
    if (!wrap) return;
    const items = researchData.viewpointTension || [];
    wrap.innerHTML = items.map(item => `<article class="panel viewpoint-card">
      <div class="panel-topline"><span class="mono">${escapeHtml(item.date)}</span><b class="track-state is-full">${escapeHtml(item.type)}</b></div>
      <h3>${escapeHtml(item.source)}</h3>
      <p>${escapeHtml(item.claim)}</p>
      <footer class="micro-note">${escapeHtml(item.locator)}</footer>
    </article>`).join("");
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

  /* ---------- 复盘历史（首页） ---------- */
  const REVIEW_STORAGE_KEY = "baijiu-prototype-review-custom";
  const REVIEW_RESULT_META = {
    confirmed: { label: "已兑现", className: "is-confirmed" },
    partial: { label: "部分兑现", className: "is-partial" },
    refuted: { label: "被证伪", className: "is-refuted" },
    pending: { label: "验证中", className: "is-pending" }
  };
  const REVIEW_RESULT_ORDER = ["pending", "partial", "confirmed", "refuted"];
  const reviewList = document.getElementById("review-list");
  const reviewForm = document.getElementById("review-form");
  const reviewCompanyTabs = document.getElementById("review-company-tabs");
  const reviewAddToggle = document.getElementById("review-add-toggle");
  let reviewScope = "industry";
  let reviewCompany = "maotai";

  function loadCustomReviews() {
    try { return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)) || []; } catch (_) { return []; }
  }
  function saveCustomReviews(items) {
    try { localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(items)); } catch (_) { /* local persistence is optional */ }
  }

  function reviewItems() {
    const builtin = reviewScope === "industry" ? (reviewData.industry || []) : (reviewData.companies?.[reviewCompany] || []);
    const custom = loadCustomReviews().filter(item => reviewScope === "industry" ? item.scope === "industry" : item.scope === reviewCompany);
    return [...custom, ...builtin].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  function renderReviewList() {
    const items = reviewItems();
    if (!items.length) {
      reviewList.innerHTML = `<li class="ann-empty">当前范围还没有复盘条目，点击「记录新判断」添加。</li>`;
      renderReviewChart();
      return;
    }
    reviewList.innerHTML = items.map(item => {
      const meta = REVIEW_RESULT_META[item.result] || REVIEW_RESULT_META.pending;
      const rows = [
        ["当时依据", item.basis],
        ["验证指标", item.verifyBy],
        ["验证结果", item.outcome],
        ["复盘结论", item.lesson]
      ].filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
      const customControls = item.custom ? `<span class="review-controls">
        <button type="button" data-review-cycle="${escapeHtml(item.id)}">更新验证结果</button>
        <button type="button" data-review-delete="${escapeHtml(item.id)}">删除</button>
      </span>` : "";
      return `<li class="review-item${item.custom ? " is-custom" : ""}" data-review-id="${escapeHtml(item.id)}">
        <div class="review-head">
          <time class="mono">${escapeHtml(item.date)}</time>
          <span class="review-type">${escapeHtml(item.type || "判断记录")}</span>
          ${item.custom ? `<span class="status-tag demo">${item.autoReview ? "卖方观点" : "我的记录"}</span>` : ""}
          <span class="review-result ${meta.className}">${meta.label}</span>
        </div>
        <strong>${escapeHtml(item.claim)}</strong>
        <dl>${rows}</dl>
        <footer><span>${escapeHtml(item.source || "手动记录")}${item.locator ? ` · ${escapeHtml(item.locator)}` : ""}</span>${customControls}</footer>
      </li>`;
    }).join("");
    renderReviewChart();
  }

  /* 复盘K线：判断按日期标记在行情上 */
  const reviewChartWrap = document.getElementById("review-chart-wrap");
  const reviewChartCanvas = document.getElementById("review-chart");
  const reviewChartTip = document.getElementById("review-chart-tip");
  const reviewChartTitle = document.getElementById("review-chart-title");
  const REVIEW_MARKER_COLORS = { confirmed: "#1c7c46", partial: "#1f77b4", refuted: "#b3372e", pending: "#b58a2a" };
  let reviewRange = 250;
  let reviewMarkers = [];

  function reviewKlineSeries() {
    const kl = localData.kline;
    if (!kl) return null;
    return reviewScope === "industry" ? kl.industry : kl[reviewCompany];
  }

  function renderReviewChart() {
    const series = reviewKlineSeries();
    if (!series || !series.rows?.length) { reviewChartWrap.hidden = true; return; }
    reviewChartWrap.hidden = false;
    reviewChartTip.hidden = true;
    reviewChartTitle.textContent = `${series.name}（${series.code}）· 日K · 截至 ${series.rows[series.rows.length - 1][0]}`;

    const rows = reviewRange > 0 ? series.rows.slice(-reviewRange) : series.rows;
    const dpr = window.devicePixelRatio || 1;
    const width = reviewChartCanvas.parentElement.clientWidth || 600;
    const height = 300;
    reviewChartCanvas.width = width * dpr;
    reviewChartCanvas.height = height * dpr;
    reviewChartCanvas.style.height = `${height}px`;
    const ctx = reviewChartCanvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const dark = body.dataset.theme === "dark";
    const axisColor = dark ? "#5a7186" : "#9aa8b5";
    const gridColor = dark ? "rgba(255,255,255,.07)" : "rgba(11,27,47,.07)";

    const padL = 10, padR = 56, padT = 26, padB = 24;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    let min = Infinity, max = -Infinity;
    rows.forEach(([, , h, l]) => { if (l < min) min = l; if (h > max) max = h; });
    const span = max - min || 1;
    min -= span * 0.04; max += span * 0.04;
    const x = i => padL + (i + 0.5) * (plotW / rows.length);
    const y = v => padT + (max - v) / (max - min) * plotH;

    ctx.strokeStyle = gridColor;
    ctx.fillStyle = axisColor;
    ctx.font = "9px ui-monospace, monospace";
    ctx.textAlign = "left";
    for (let g = 0; g <= 4; g++) {
      const v = min + (max - min) * g / 4;
      const gy = Math.round(y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
      ctx.fillText(v.toFixed(v >= 100 ? 0 : 2), padL + plotW + 6, gy + 3);
    }
    [0, Math.floor(rows.length / 2), rows.length - 1].forEach(i => {
      ctx.textAlign = i === 0 ? "left" : (i === rows.length - 1 ? "right" : "center");
      ctx.fillText(rows[i][0].slice(2), i === 0 ? padL : (i === rows.length - 1 ? padL + plotW : x(i)), height - 8);
    });

    const cw = plotW / rows.length;
    const bodyW = Math.max(1, Math.min(9, cw * 0.62));
    rows.forEach(([, o, h, l, c], i) => {
      const up = c >= o;
      ctx.strokeStyle = ctx.fillStyle = up ? "#d62728" : "#2e7d32";
      const cx = x(i);
      ctx.beginPath(); ctx.moveTo(cx, y(h)); ctx.lineTo(cx, y(l)); ctx.stroke();
      const top = y(Math.max(o, c)), bh = Math.max(1, Math.abs(y(o) - y(c)));
      if (up) ctx.strokeRect(cx - bodyW / 2, top, bodyW, bh); else ctx.fillRect(cx - bodyW / 2, top, bodyW, bh);
    });

    /* 复盘图钉：判断日落在首个不早于该日的交易日 */
    reviewMarkers = [];
    reviewItems().forEach(item => {
      const idx = rows.findIndex(row => row[0] >= item.date);
      if (idx === -1) return;
      const mx = x(idx);
      const color = REVIEW_MARKER_COLORS[item.result] || REVIEW_MARKER_COLORS.pending;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + plotH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(mx, padT - 14); ctx.lineTo(mx - 5, padT - 4); ctx.lineTo(mx + 5, padT - 4);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      reviewMarkers.push({ x: mx, item });
    });
  }

  reviewChartCanvas.addEventListener("click", event => {
    const rect = reviewChartCanvas.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    let best = null;
    reviewMarkers.forEach(m => { const d = Math.abs(m.x - cx); if (d < 12 && (!best || d < best.d)) best = { d, m }; });
    if (!best) { reviewChartTip.hidden = true; return; }
    const { item } = best.m;
    const meta = REVIEW_RESULT_META[item.result] || REVIEW_RESULT_META.pending;
    reviewChartTip.innerHTML = `<div class="review-head"><time class="mono">${escapeHtml(item.date)}</time><span class="review-result ${meta.className}">${meta.label}</span></div>
      <strong>${escapeHtml(item.claim)}</strong>
      <button class="text-button" type="button" id="review-tip-goto">定位到复盘条目 ↓</button>`;
    reviewChartTip.hidden = false;
    document.getElementById("review-tip-goto").addEventListener("click", () => {
      const el = reviewList.querySelector(`[data-review-id="${CSS.escape(item.id)}"]`);
      if (el) {
        el.scrollIntoView({ behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth", block: "center" });
        el.classList.add("is-flash");
        setTimeout(() => el.classList.remove("is-flash"), 1600);
      }
    });
  });

  document.querySelectorAll("[data-review-range]").forEach(button => {
    button.addEventListener("click", () => {
      reviewRange = Number(button.dataset.reviewRange);
      document.querySelectorAll("[data-review-range]").forEach(b => b.classList.toggle("is-active", b === button));
      renderReviewChart();
    });
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentPage === "home" && !reviewChartWrap.hidden) renderReviewChart();
      if (currentPage === "home" && !eventsChartWrap.hidden) { renderEventsChart(); renderEventsFin(); renderEventsSupply(); }
      if (currentPage === "industry") renderProductionScene();
    }, 160);
  });

  document.querySelectorAll("[data-review-scope]").forEach(button => {
    button.addEventListener("click", () => {
      reviewScope = button.dataset.reviewScope;
      document.querySelectorAll("[data-review-scope]").forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      reviewCompanyTabs.hidden = reviewScope !== "company";
      renderReviewList();
    });
  });

  reviewCompanyTabs.querySelectorAll("[data-review-company]").forEach(button => {
    button.addEventListener("click", () => {
      reviewCompany = button.dataset.reviewCompany;
      reviewCompanyTabs.querySelectorAll("[data-review-company]").forEach(item => item.classList.toggle("is-active", item === button));
      renderReviewList();
    });
  });

  reviewAddToggle.addEventListener("click", () => {
    const open = reviewForm.hidden;
    reviewForm.hidden = !open;
    reviewAddToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      document.getElementById("review-scope-select").value = reviewScope === "company" ? reviewCompany : "industry";
      setTimeout(() => document.getElementById("review-claim-input").focus(), 20);
    }
  });

  reviewForm.addEventListener("submit", event => {
    event.preventDefault();
    const scope = document.getElementById("review-scope-select").value;
    const claim = document.getElementById("review-claim-input").value.trim();
    const verifyBy = document.getElementById("review-verify-input").value.trim();
    if (!claim || !verifyBy) { showToast("判断内容与验证指标为必填项"); return; }
    const items = loadCustomReviews();
    items.push({
      id: `custom-${Date.now()}`,
      custom: true,
      scope,
      date: new Date().toISOString().slice(0, 10),
      source: "手动记录",
      type: document.getElementById("review-type-input").value.trim() || "判断记录",
      claim,
      basis: document.getElementById("review-basis-input").value.trim(),
      verifyBy,
      result: "pending",
      outcome: "",
      lesson: ""
    });
    saveCustomReviews(items);
    reviewForm.reset();
    reviewForm.hidden = true;
    reviewAddToggle.setAttribute("aria-expanded", "false");
    reviewScope = scope === "industry" ? "industry" : "company";
    if (reviewScope === "company") reviewCompany = scope;
    document.querySelectorAll("[data-review-scope]").forEach(item => {
      const active = item.dataset.reviewScope === reviewScope;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    reviewCompanyTabs.hidden = reviewScope !== "company";
    reviewCompanyTabs.querySelectorAll("[data-review-company]").forEach(item => item.classList.toggle("is-active", item.dataset.reviewCompany === reviewCompany));
    renderReviewList();
    showToast("已保存到复盘历史，状态：验证中");
  });

  reviewList.addEventListener("click", event => {
    const cycle = event.target.closest("[data-review-cycle]");
    const del = event.target.closest("[data-review-delete]");
    if (!cycle && !del) return;
    const id = (cycle || del).dataset.reviewCycle || (del ? del.dataset.reviewDelete : "");
    const items = loadCustomReviews();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;
    if (del) {
      items.splice(index, 1);
      saveCustomReviews(items);
      renderReviewList();
      showToast("已删除该条记录");
      return;
    }
    const next = REVIEW_RESULT_ORDER[(REVIEW_RESULT_ORDER.indexOf(items[index].result) + 1) % REVIEW_RESULT_ORDER.length];
    items[index].result = next;
    if (!items[index].outcome && next !== "pending") items[index].outcome = "（待补充验证结果说明）";
    saveCustomReviews(items);
    renderReviewList();
    showToast(`验证结果更新为：${REVIEW_RESULT_META[next].label}`);
  });

  /* ===== 大事记：股价核心驱动因素（总揽页） ===== */
  const eventsData = window.WHITE_LIQUOR_EVENTS || { scopes: {}, financialReview: {}, supplyDemand: {}, directionMeta: {} };
  const eventsList = document.getElementById("events-list");
  const eventsChartWrap = document.getElementById("events-chart-wrap");
  const eventsChartCanvas = document.getElementById("events-chart");
  const eventsChartTip = document.getElementById("events-chart-tip");
  const eventsChartTitle = document.getElementById("events-chart-title");
  const eventsFinChart = document.getElementById("events-fin-chart");
  const eventsFinCards = document.getElementById("events-fin-cards");
  const eventsFinNote = document.getElementById("events-fin-note");
  const eventsFinTag = document.getElementById("events-fin-tag");
  const eventsFinLegend = document.getElementById("events-fin-legend");
  const eventsSupplyChart = document.getElementById("events-supply-chart");
  const eventsSupplyChartWrap = document.getElementById("events-supply-chart-wrap");
  const eventsSupplySummary = document.getElementById("events-supply-summary");
  const eventsSupplyMetrics = document.getElementById("events-supply-metrics");
  const eventsSupplyStages = document.getElementById("events-supply-stages");
  const eventsSupplyTag = document.getElementById("events-supply-tag");
  const eventsSupplyLegend = document.getElementById("events-supply-legend");
  const EVENTS_DIRECTION_COLORS = { support: "#0d6c44", pressure: "#a8331f", neutral: "#8b5e14" };
  const eventsScopeNames = { industry: "行业", maotai: "贵州茅台", wuliangye: "五粮液", guojiao: "泸州老窖" };
  let eventsScope = "industry";
  let eventsRange = 250;
  let eventsMarkers = [];

  function eventsItems() {
    return (eventsData.scopes?.[eventsScope] || []).slice().sort((a, b) => a.date < b.date ? 1 : -1);
  }

  function renderEventsList() {
    const items = eventsItems();
    if (!items.length) { eventsList.innerHTML = `<li class="ann-empty">当前范围还没有大事记条目。</li>`; return; }
    eventsList.innerHTML = items.map(item => {
      const dir = eventsData.directionMeta?.[item.direction] || { label: "中性", className: "is-neutral" };
      return `<li class="events-item" data-events-id="${escapeHtml(item.id)}">
        <div class="events-item-head">
          <time class="mono">${escapeHtml(item.date)}</time>
          <span class="events-driver">${escapeHtml(item.driver)}</span>
          <span class="events-direction ${dir.className}">${dir.label}</span>
          <span class="events-kpi mono">${escapeHtml(item.kpi || "")}</span>
        </div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
        <footer><span>${escapeHtml(item.locator || "")}</span><span>驱动因素：${escapeHtml(item.driver)}</span></footer>
      </li>`;
    }).join("");
  }

  function setupEventsCanvas(canvas, height) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const dark = body.dataset.theme === "dark";
    return {
      ctx, width, height,
      axisColor: dark ? "#5a7186" : "#9aa8b5",
      gridColor: dark ? "rgba(255,255,255,.07)" : "rgba(11,27,47,.07)",
      bandColor: dark ? "rgba(255,255,255,.03)" : "rgba(15,94,168,.045)"
    };
  }

  function renderEventsChart() {
    const kl = localData.kline;
    const series = kl ? (eventsScope === "industry" ? kl.industry : kl[eventsScope]) : null;
    if (!series || !series.rows?.length) { eventsChartWrap.hidden = true; return; }
    eventsChartWrap.hidden = false;
    eventsChartTip.hidden = true;
    eventsChartTitle.textContent = `${series.name}（${series.code}）· 日K · 截至 ${series.rows[series.rows.length - 1][0]} · ${eventsScopeNames[eventsScope]}大事记`;

    const rows = eventsRange > 0 ? series.rows.slice(-eventsRange) : series.rows;
    const height = 300;
    const { ctx, width, axisColor, gridColor } = setupEventsCanvas(eventsChartCanvas, height);

    const padL = 10, padR = 56, padT = 26, padB = 24;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    let min = Infinity, max = -Infinity;
    rows.forEach(([, , h, l]) => { if (l < min) min = l; if (h > max) max = h; });
    const span = max - min || 1;
    min -= span * 0.04; max += span * 0.04;
    const x = i => padL + (i + 0.5) * (plotW / rows.length);
    const y = v => padT + (max - v) / (max - min) * plotH;

    ctx.strokeStyle = gridColor;
    ctx.fillStyle = axisColor;
    ctx.font = "9px ui-monospace, monospace";
    ctx.textAlign = "left";
    for (let g = 0; g <= 4; g++) {
      const v = min + (max - min) * g / 4;
      const gy = Math.round(y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
      ctx.fillText(v.toFixed(v >= 100 ? 0 : 2), padL + plotW + 6, gy + 3);
    }
    [0, Math.floor(rows.length / 2), rows.length - 1].forEach(i => {
      ctx.textAlign = i === 0 ? "left" : (i === rows.length - 1 ? "right" : "center");
      ctx.fillText(rows[i][0].slice(2), i === 0 ? padL : (i === rows.length - 1 ? padL + plotW : x(i)), height - 8);
    });

    const cw = plotW / rows.length;
    const bodyW = Math.max(1, Math.min(9, cw * 0.62));
    rows.forEach(([, o, h, l, c], i) => {
      const up = c >= o;
      ctx.strokeStyle = ctx.fillStyle = up ? "#d62728" : "#2e7d32";
      const cx = x(i);
      ctx.beginPath(); ctx.moveTo(cx, y(h)); ctx.lineTo(cx, y(l)); ctx.stroke();
      const top = y(Math.max(o, c)), bh = Math.max(1, Math.abs(y(o) - y(c)));
      if (up) ctx.strokeRect(cx - bodyW / 2, top, bodyW, bh); else ctx.fillRect(cx - bodyW / 2, top, bodyW, bh);
    });

    /* 事件钉：同日多事件横向错开 */
    eventsMarkers = [];
    const byIndex = new Map();
    eventsItems().forEach(item => {
      const idx = rows.findIndex(row => row[0] >= item.date);
      if (idx === -1) return;
      if (!byIndex.has(idx)) byIndex.set(idx, []);
      byIndex.get(idx).push(item);
    });
    byIndex.forEach((group, idx) => {
      group.forEach((item, j) => {
        const mx = x(idx) + (j - (group.length - 1) / 2) * 9;
        const color = EVENTS_DIRECTION_COLORS[item.direction] || EVENTS_DIRECTION_COLORS.neutral;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + plotH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(mx, padT - 14); ctx.lineTo(mx - 5, padT - 4); ctx.lineTo(mx + 5, padT - 4);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        eventsMarkers.push({ x: mx, item });
      });
    });
  }

  eventsChartCanvas.addEventListener("click", event => {
    const rect = eventsChartCanvas.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    let best = null;
    eventsMarkers.forEach(m => { const d = Math.abs(m.x - cx); if (d < 12 && (!best || d < best.d)) best = { d, m }; });
    if (!best) { eventsChartTip.hidden = true; return; }
    const { item } = best.m;
    const dir = eventsData.directionMeta?.[item.direction] || { label: "中性", className: "is-neutral" };
    eventsChartTip.innerHTML = `<div class="review-head"><time class="mono">${escapeHtml(item.date)}</time><span class="events-driver">${escapeHtml(item.driver)}</span><span class="events-direction ${dir.className}">${dir.label}</span></div>
      <strong>${escapeHtml(item.title)}</strong>
      <button class="text-button" type="button" id="events-tip-goto">定位到大事记条目 ↓</button>`;
    eventsChartTip.hidden = false;
    document.getElementById("events-tip-goto").addEventListener("click", () => {
      const el = eventsList.querySelector(`[data-events-id="${CSS.escape(item.id)}"]`);
      if (el) {
        el.scrollIntoView({ behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth", block: "center" });
        el.classList.add("is-flash");
        setTimeout(() => el.classList.remove("is-flash"), 1600);
      }
    });
  });

  function drawLineChart(canvas, labels, seriesDefs, opts = {}) {
    const height = opts.height || 240;
    const { ctx, width, axisColor, gridColor, bandColor } = setupEventsCanvas(canvas, height);
    const padL = 44, padR = 12, padT = opts.bandLabels ? 30 : 16, padB = 30;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    const allValues = seriesDefs.flatMap(s => s.values.filter(Number.isFinite));
    let min = Math.min(...allValues, 0), max = Math.max(...allValues, 0);
    const span = max - min || 1;
    min -= span * 0.08; max += span * 0.08;
    const x = i => padL + (labels.length === 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
    const y = v => padT + (max - v) / (max - min) * plotH;

    if (opts.phases?.length) {
      const bandW = plotW / (labels.length - 1);
      opts.phases.forEach((phase, pi) => {
        const x0 = x(phase.from) - bandW / 2;
        const x1 = Math.min(x(phase.to) + bandW / 2, padL + plotW);
        if (pi % 2 === 0) { ctx.fillStyle = bandColor; ctx.fillRect(x0, padT, x1 - x0, plotH); }
        /* 窄区间标签上下交错，避免相邻阶段文字重叠 */
        const narrow = (phase.to - phase.from + 1) < 3;
        const row = narrow ? pi % 2 : 0;
        const ly = padT - 19 + row * 10;
        ctx.fillStyle = axisColor;
        ctx.font = "8px PingFang SC, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(narrow ? phase.label : `${phase.label} ${phase.range || ""}`, (x0 + x1) / 2, ly);
      });
    }

    ctx.strokeStyle = gridColor;
    ctx.fillStyle = axisColor;
    ctx.font = "9px ui-monospace, monospace";
    ctx.textAlign = "right";
    for (let g = 0; g <= 4; g++) {
      const v = min + (max - min) * g / 4;
      const gy = Math.round(y(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
      ctx.fillText(`${(v * 100).toFixed(0)}%`, padL - 6, gy + 3);
    }
    if (min < 0 && max > 0) {
      const zy = Math.round(y(0)) + 0.5;
      ctx.save();
      ctx.strokeStyle = axisColor;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(padL, zy); ctx.lineTo(padL + plotW, zy); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = axisColor;
    ctx.font = "8px ui-monospace, monospace";
    const step = Math.ceil(labels.length / 8);
    labels.forEach((label, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return;
      ctx.textAlign = i === labels.length - 1 ? "right" : "center";
      ctx.fillText(label, x(i), height - 12);
    });

    seriesDefs.forEach(series => {
      ctx.strokeStyle = series.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      series.values.forEach((v, i) => {
        if (!Number.isFinite(v)) { started = false; return; }
        if (!started) { ctx.moveTo(x(i), y(v)); started = true; } else ctx.lineTo(x(i), y(v));
      });
      ctx.stroke();
      ctx.fillStyle = series.color;
      series.values.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        ctx.beginPath(); ctx.arc(x(i), y(v), 2, 0, Math.PI * 2); ctx.fill();
      });
    });
    ctx.lineWidth = 1;
  }

  function renderEventsFin() {
    const fin = eventsData.financialReview || {};
    if (eventsScope === "industry") {
      eventsFinTag.textContent = "行业 · 中报PPT S3/S4/S11";
      eventsFinCards.innerHTML = (fin.interimCards || []).map(card =>
        `<div class="events-fin-card"><span>${escapeHtml(card.label)}</span><strong class="mono">${escapeHtml(card.value)}</strong><small>${escapeHtml(card.sub)}</small></div>`
      ).join("");
      eventsFinNote.textContent = "行业收入增速（21Q1-26Q2，中报PPT拟合口径）：25Q3大幅下滑出清、26Q1增速一度回正，26Q2同比-18.0%加速出清。";
      drawLineChart(eventsFinChart, fin.industryQuarters || [], [
        { color: "#1f77b4", values: fin.industryRevenueGrowth || [] }
      ], { height: 230 });
      eventsFinLegend.innerHTML = `<span><i style="background:#1f77b4"></i>上市酒企收入增速（中报PPT拟合）</span><span class="micro-note">虚线为0轴</span>`;
      return;
    }
    const data = localData.companyQuarterly?.[eventsScope];
    const interim = fin.companyInterim?.[eventsScope];
    eventsFinTag.textContent = `${eventsScopeNames[eventsScope]} · 本地财报库`;
    eventsFinCards.innerHTML = interim ? `
      <div class="events-fin-card"><span>收入（中报PPT）</span><strong class="mono">${escapeHtml(interim.revenue.value)}</strong><small>${escapeHtml(interim.revenue.sub)}</small></div>
      <div class="events-fin-card"><span>归母净利润（中报PPT）</span><strong class="mono">${escapeHtml(interim.profit.value)}</strong><small>${escapeHtml(interim.profit.sub)}</small></div>` : "";
    eventsFinNote.textContent = interim?.note || "";
    if (!data || !data.quarters?.length) {
      eventsFinLegend.innerHTML = "";
      const { ctx, width, height } = setupEventsCanvas(eventsFinChart, 230);
      ctx.fillStyle = "#9aa8b5"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("本地库暂无该公司季度数据", width / 2, height / 2);
      return;
    }
    const quarters = data.quarters;
    const labels = quarters.map(q => `${q.date.slice(2, 4)}Q${Math.ceil(Number(q.date.slice(5, 7)) / 3)}`);
    const height = 250;
    const { ctx, width, axisColor, gridColor } = setupEventsCanvas(eventsFinChart, height);
    const padL = 44, padR = 46, padT = 16, padB = 30;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    const maxBar = Math.max(...quarters.map(q => Math.max(q.revenue || 0, q.netProfit || 0)), 1);
    const slot = plotW / quarters.length;
    const barW = Math.min(26, slot * 0.3);
    const yBar = v => padT + (1 - v / (maxBar * 1.12)) * plotH;

    ctx.strokeStyle = gridColor;
    ctx.fillStyle = axisColor;
    ctx.font = "9px ui-monospace, monospace";
    ctx.textAlign = "right";
    for (let g = 0; g <= 4; g++) {
      const v = maxBar * 1.12 * g / 4;
      const gy = Math.round(yBar(v)) + 0.5;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
      ctx.fillText(v.toFixed(0), padL - 6, gy + 3);
    }
    quarters.forEach((q, i) => {
      const cx = padL + slot * i + slot / 2;
      ctx.fillStyle = "#1f77b4";
      if (Number.isFinite(q.revenue)) ctx.fillRect(cx - barW - 2, yBar(q.revenue), barW, padT + plotH - yBar(q.revenue));
      ctx.fillStyle = "#d62728";
      if (Number.isFinite(q.netProfit)) ctx.fillRect(cx + 2, yBar(q.netProfit), barW, padT + plotH - yBar(q.netProfit));
      ctx.fillStyle = axisColor;
      ctx.font = "8px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], cx, height - 12);
    });
    /* 收入同比折线（右轴）：同口径上年同季起算 */
    const yoy = quarters.map((q, i) => {
      if (i < 4 || !Number.isFinite(q.revenue) || !Number.isFinite(quarters[i - 4].revenue) || quarters[i - 4].revenue === 0) return null;
      return q.revenue / quarters[i - 4].revenue - 1;
    });
    const yoyValues = yoy.filter(Number.isFinite);
    if (yoyValues.length) {
      const yMin = Math.min(...yoyValues, 0), yMax = Math.max(...yoyValues, 0);
      const ySpan = yMax - yMin || 1;
      const yYoy = v => padT + (1 - (v - (yMin - ySpan * 0.15)) / (ySpan * 1.3)) * plotH;
      ctx.strokeStyle = "#8b5e14";
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      let started = false;
      yoy.forEach((v, i) => {
        if (!Number.isFinite(v)) { started = false; return; }
        const cx = padL + slot * i + slot / 2;
        if (!started) { ctx.moveTo(cx, yYoy(v)); started = true; } else ctx.lineTo(cx, yYoy(v));
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#8b5e14";
      ctx.font = "9px ui-monospace, monospace";
      ctx.textAlign = "center";
      const labelHalo = body.dataset.theme === "dark" ? "#101c2c" : "#ffffff";
      yoy.forEach((v, i) => {
        if (!Number.isFinite(v)) return;
        const cx = padL + slot * i + slot / 2;
        ctx.beginPath(); ctx.arc(cx, yYoy(v), 2.2, 0, Math.PI * 2); ctx.fill();
        const ly = v >= 0 ? yYoy(v) - 6 : yYoy(v) + 13;
        ctx.save();
        ctx.strokeStyle = labelHalo;
        ctx.lineWidth = 3;
        ctx.strokeText(`${(v * 100).toFixed(0)}%`, cx, ly);
        ctx.restore();
        ctx.fillText(`${(v * 100).toFixed(0)}%`, cx, ly);
      });
      ctx.lineWidth = 1;
    }
    eventsFinLegend.innerHTML = `<span><i style="background:#1f77b4"></i>营业总收入（亿元）</span><span><i style="background:#d62728"></i>归母净利润（亿元）</span><span><i style="background:#8b5e14"></i>收入同比（虚线，同口径上年同季）</span><span class="micro-note">本地库 · 单季度 · 最新 ${escapeHtml(data.asOf)}</span>`;
  }

  function renderEventsSupply() {
    const sd = eventsData.supplyDemand || {};
    const fin = eventsData.financialReview || {};
    if (eventsScope === "industry") {
      eventsSupplyTag.textContent = "行业 · 中报PPT S11/S12";
      eventsSupplySummary.textContent = "供需拐点已至：24Q3起收入利润增速转负、25Q3大幅下滑出清，当前供需逐步扭转、底部特征明显（国海判断）。交界面为库存基数——动销增速持续高于收入增速的阶段，渠道在消化库存。";
      eventsSupplyChartWrap.hidden = false;
      eventsSupplyMetrics.innerHTML = "";
      drawLineChart(eventsSupplyChart, fin.industryQuarters || [], [
        { color: "#1f77b4", values: fin.industryRevenueGrowth || [] },
        { color: "#d62728", values: sd.sellthroughGrowth || [] }
      ], { height: 260, bandLabels: true, phases: (sd.phases || []).map(p => ({ ...p, range: `${(fin.industryQuarters || [])[p.from] || ""}~${(fin.industryQuarters || [])[p.to] || ""}` })) });
      eventsSupplyLegend.innerHTML = `<span><i style="background:#1f77b4"></i>收入增速</span><span><i style="background:#d62728"></i>动销增速（调研拟合）</span><span class="micro-note">阶段划分为报告原文标注</span>`;
      eventsSupplyStages.innerHTML = `<div class="events-stages-head"><strong>见底修复传导推演（国海判断）</strong><span class="micro-note">先动销好转修复预期，后报表兑现</span></div>
        <ol>${(sd.recoveryStages || []).map(s => `<li><span class="events-stage-tag">${escapeHtml(s.stage)}</span><div><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.desc)}</small></div><b class="signal-state${s.state === "部分确认" ? " is-partial" : ""}">${escapeHtml(s.state)}</b></li>`).join("")}</ol>`;
      return;
    }
    const supply = sd.companySupply?.[eventsScope];
    eventsSupplyTag.textContent = `${eventsScopeNames[eventsScope]} · 中报PPT产销存`;
    eventsSupplyChartWrap.hidden = true;
    eventsSupplyLegend.innerHTML = "";
    eventsSupplySummary.textContent = supply?.summary || "";
    eventsSupplyMetrics.innerHTML = (supply?.metrics || []).map(m =>
      `<div class="events-metric"><span>${escapeHtml(m.label)}</span><strong class="mono">${escapeHtml(m.value)}</strong></div>`
    ).join("");
    if (eventsScope === "maotai" && sd.maotaiPriceStages?.length) {
      eventsSupplyStages.innerHTML = `<div class="events-stages-head"><strong>飞天量价推演（国海判断与预测）</strong><span class="micro-note">中报PPT S17</span></div>
        <ol>${sd.maotaiPriceStages.map(s => `<li><span class="events-stage-tag">${escapeHtml(s.period)}</span><div><strong>${escapeHtml(s.relation)}</strong><small>${escapeHtml(s.desc)}</small></div></li>`).join("")}</ol>`;
    } else {
      eventsSupplyStages.innerHTML = "";
    }
  }

  function renderEvents() {
    renderEventsChart();
    renderEventsList();
    renderEventsFin();
    renderEventsSupply();
  }

  document.querySelectorAll("[data-events-scope]").forEach(button => {
    button.addEventListener("click", () => {
      eventsScope = button.dataset.eventsScope;
      document.querySelectorAll("[data-events-scope]").forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderEvents();
    });
  });

  document.querySelectorAll("[data-events-range]").forEach(button => {
    button.addEventListener("click", () => {
      eventsRange = Number(button.dataset.eventsRange);
      document.querySelectorAll("[data-events-range]").forEach(b => b.classList.toggle("is-active", b === button));
      renderEventsChart();
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
    if (pageAliases[page]) page = pageAliases[page];
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
    const moreMenu = document.getElementById("mobile-more-menu");
    const moreToggle = document.getElementById("mobile-more-toggle");
    if (moreMenu && moreToggle) {
      moreMenu.hidden = true;
      moreToggle.setAttribute("aria-expanded", "false");
      moreToggle.classList.toggle("is-active", ["llm", "upload"].includes(page));
      moreMenu.querySelectorAll("[data-nav]").forEach(button => button.classList.toggle("is-active", button.dataset.nav === page));
    }
    aiContext.textContent = page === "compare" && currentCompanyView === "detail"
      ? `上下文：产业比较 / ${selectedCompany}`
      : `上下文：${pageMeta[page].label}`;
    updateAiSuggestions(page);
    body.classList.remove("menu-open");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    syncSidebarInert();
    if (updateHistory) history.replaceState(null, "", `#${page}`);
    window.scrollTo({ top: 0, behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth" });
    document.title = `${pageMeta[page].label}｜白酒资本市场分析工具`;
  }

  document.querySelectorAll("[data-scroll-to]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: body.classList.contains("reduce-motion") ? "auto" : "smooth", block: "start" });
    });
  });

  navButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.company) {
        selectCompany(button.dataset.company);
        setCompanyView("detail");
      } else if (button.dataset.nav === "compare") {
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
    syncMaotaiSplitVisibility();
    if (currentPage === "compare" && currentCompanyView === "detail") {
      aiContext.textContent = `上下文：产业比较 / ${company}`;
      updateAiSuggestions("compare");
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
    if (currentPage === "compare") {
      aiContext.textContent = view === "compare" ? "上下文：产业比较" : `上下文：产业比较 / ${selectedCompany}`;
      updateAiSuggestions("compare");
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
      html: drawerSection("已接入的本地资料", "<ul><li>价格Excel：日度截至2026-08-15，月度三价体系截至2026-08，系列酒周度截至08-02</li><li>本地数据库（~/local_data）：宏观GDP/CPI/M2/PPI/固投（截至03-31/04-30）、三家公司季度财报（茅Q2'26、五泸Q1'26）、估值（08-18）、基金重仓（06-30）</li><li>网页初步想法DOCX：产品需求（高频前置、宏观/行业数据获取口径）+ 渠道调研周表，观察期2026-08-03至08-09，未独立核验</li><li>国海深度报告：报告日2026-04-22，含历史事实、报告观点与预测</li><li>国海白酒中报总结PPT：报告日2026-09，总揽页大事记、收入利润复盘与供需拟合的主要来源；其中26H2/27年推演、估值修复两阶段为报告预测，不作为事实</li><li>JYDB（JyPy 聚源库，TLS）：行情/基金重仓/一致预期/目标价/交易活跃度/最新研报，统计日期随构建更新；本地 parquet 为其同步缓存与回退</li><li>2023研究框架PPT（华创）：历史框架档案，方法论复用，数值为2022-2023年口径</li><li>茅台数字化汇报PPT：跟踪体系蓝图，用于定义完整跟踪范围与网页接入状态</li></ul>") +
        drawerSection("DEMO 模拟数据", "<p>目标价预测、一致预期、交易活跃度已切换为 JYDB 真实值；剩余 DEMO：三家公司区域收入结构为固定种子随机模拟，仅用于演示交互，页面统一标注“DEMO 模拟”，待官方数据替换。社零、餐饮收入、房地产开发投资、消费者信心已替换为国家统计局2026-08-17发布的核验值（部分序列，完整月度序列待接入）。</p>") +
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
      const companyName = document.querySelector("#page-industry:not([hidden])") ? companyFilter.value : selectedCompany;
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
      home: ["四大功能模块如何形成完整证据链？", "白酒行业目前处于周期的哪个环节？", "哪三个指标可以验证行业见底？"],
      industry: ["行业分析框架包含哪些关键环节？", "长期、中期、短期分别跟踪哪些指标？", "宏观和行业数据去哪查？", "哪些条件会证伪修复判断？"],
      compare: currentCompanyView === "compare"
        ? ["三家公司应该按哪些同口径维度比较？", "公司对比还缺哪些材料？", "为什么现在不能形成公司排序？"]
        : [`${selectedCompany}的公司六问需要哪些数据？`, "公司页为什么不先堆财务图？", "如何验证渠道是否健康？"],
      market: ["什么是原子命题？", "基金重仓数据是否支持筹码出清？", "如何跟踪观点是否兑现？"],
      sentiment: ["重要公告来自哪里，如何更新？", "高管声音和企业新闻为什么标注DEMO？", "行业观点与企业公告如何交叉验证？"],
      llm: ["支持哪些大模型服务商？", "API Key 保存在哪里？", "保存配置后 AI 研究员如何工作？"],
      upload: ["卖方材料上传到哪些模块？", "大模型提取后如何采纳到前端？", "上传的材料保存在哪里？"]
    };
    document.getElementById("ai-suggestions").innerHTML = (suggestions[page] || suggestions.home).map(text => `<button type="button">${text}</button>`).join("");
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
    if (/四类研究功能|四大功能|完整证据链/.test(question)) return buildAiAnswer(
      "研究工作台按蓝图分为产业分析、产业比较、资本市场与舆情跟踪四个模块，外加总揽页。",
      "产业分析定义因果关系并验证当前状态，产业比较落实到公司差异，资本市场跟踪预期与资金行为，舆情跟踪覆盖公告与动态。",
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
      "产业分析页已列出9项宏观指标与5项行业数据的官网入口；GDP/CPI/M2/PPI/固投数值已接入本地库（截至03-31/04-30）。",
      "社零/餐饮/地产/消费者信心已接入统计局核验值（部分序列）；销量无官方披露，采用CR6加和估算。",
      "按月度频率更新CPI/社零/餐饮/M2/PPI，季度更新GDP与人均收入，年度更新产量与格局数据；宏观部分序列等待iFinD完整接入。"
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

  /* ---------- 大模型配置（模型配置页） ---------- */
  const LLM_STORAGE_KEY = "baijiu-prototype-llm-config";
  const llmForm = document.getElementById("llm-form");
  const llmBaseUrl = document.getElementById("llm-base-url");
  const llmApiKey = document.getElementById("llm-api-key");
  const llmModel = document.getElementById("llm-model");
  const llmTemperature = document.getElementById("llm-temperature");
  const llmSystemPrompt = document.getElementById("llm-system-prompt");
  const llmTestResult = document.getElementById("llm-test-result");
  const llmStatusLabel = document.getElementById("llm-status-label");
  const llmStatusTag = document.getElementById("llm-status-tag");
  const aiBoundary = document.getElementById("ai-boundary");

  const LLM_PRESETS = {
    deepseek: { baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
    moonshot: { baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k" },
    zhipu: { baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-flash" },
    qwen: { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
    openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" }
  };

  const DEFAULT_SYSTEM_PROMPT = "你是白酒资本市场研究助理，服务于白酒行业研究工作台。基于用户当前查看的页面回答问题：结论区分事实与推断，标注不确定性，不编造具体数据，不知道就明确说明。回答使用中文，简洁分点。";

  function loadLlmConfig() {
    try { return JSON.parse(localStorage.getItem(LLM_STORAGE_KEY)) || null; } catch (_) { return null; }
  }

  function readLlmForm() {
    return {
      baseUrl: llmBaseUrl.value.trim().replace(/\/+$/, ""),
      apiKey: llmApiKey.value.trim(),
      model: llmModel.value.trim(),
      temperature: llmTemperature.value === "" ? null : Number(llmTemperature.value),
      systemPrompt: llmSystemPrompt.value.trim()
    };
  }

  function fillLlmForm(config) {
    llmBaseUrl.value = config?.baseUrl || "";
    llmApiKey.value = config?.apiKey || "";
    llmModel.value = config?.model || "";
    llmTemperature.value = config?.temperature ?? "";
    llmSystemPrompt.value = config?.systemPrompt || "";
  }

  function llmConfigured() {
    const config = loadLlmConfig();
    return config && config.baseUrl && config.apiKey && config.model ? config : null;
  }

  function syncLlmStatus() {
    const config = llmConfigured();
    llmStatusLabel.textContent = config ? config.model : "未配置";
    llmStatusTag.textContent = config ? "LLM CONNECTED" : "LOCAL MODE";
    llmStatusTag.classList.toggle("demo", Boolean(config));
    llmStatusTag.classList.toggle("pending", !config);
    aiBoundary.innerHTML = config
      ? `<strong>大模型模式</strong><span>已接入 ${escapeHtml(config.model)} · ${escapeHtml(config.baseUrl)}；调用失败自动回退本地回答。</span>`
      : `<strong>本地资料模式</strong><span>已连接价格Excel与研究材料；不访问实时行情。</span>`;
    const uploadNote = document.getElementById("upload-llm-note");
    if (uploadNote) uploadNote.textContent = config ? `提取模型：${config.model}` : "未配置大模型 · 提取不可用（仍可保存原文到收件箱）";
  }

  document.querySelectorAll("[data-llm-preset]").forEach(button => {
    button.addEventListener("click", () => {
      const preset = LLM_PRESETS[button.dataset.llmPreset];
      if (!preset) return;
      llmBaseUrl.value = preset.baseUrl;
      llmModel.value = preset.model;
      showToast(`已填入 ${button.textContent} 预设，请补充 API Key`);
    });
  });

  document.getElementById("llm-key-toggle").addEventListener("click", () => {
    const showing = llmApiKey.type === "text";
    llmApiKey.type = showing ? "password" : "text";
    document.getElementById("llm-key-toggle").textContent = showing ? "显示" : "隐藏";
  });

  async function testLlmConnection() {
    const config = readLlmForm();
    if (!config.baseUrl || !config.apiKey || !config.model) {
      llmTestResult.dataset.state = "error";
      llmTestResult.textContent = "请先填写接口地址、API Key 与模型名";
      return;
    }
    llmTestResult.dataset.state = "loading";
    llmTestResult.textContent = "正在测试连接…";
    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: "回复 ok 即可" }], max_tokens: 8, temperature: 0 }),
        signal: controller.signal
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}${detail ? ` · ${detail.slice(0, 120)}` : ""}`);
      }
      const data = await response.json();
      const reply = String(data?.choices?.[0]?.message?.content || "").trim();
      llmTestResult.dataset.state = "ok";
      llmTestResult.textContent = `连接成功 · ${Math.round(performance.now() - started)}ms${reply ? ` · 回复：${reply.slice(0, 30)}` : ""}`;
    } catch (error) {
      llmTestResult.dataset.state = "error";
      llmTestResult.textContent = `连接失败：${error.name === "AbortError" ? "请求超时（20s）" : error.message}`;
    } finally {
      clearTimeout(timer);
    }
  }

  document.getElementById("llm-test").addEventListener("click", testLlmConnection);

  llmForm.addEventListener("submit", event => {
    event.preventDefault();
    const config = readLlmForm();
    if (!config.baseUrl || !config.apiKey || !config.model) {
      showToast("接口地址、API Key、模型名为必填项");
      return;
    }
    try { localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(config)); } catch (_) { /* local persistence is optional */ }
    syncLlmStatus();
    showToast(`已保存：${config.model} · ${config.baseUrl}`);
  });

  document.getElementById("llm-clear").addEventListener("click", () => {
    try { localStorage.removeItem(LLM_STORAGE_KEY); } catch (_) { /* local persistence is optional */ }
    fillLlmForm(null);
    llmTestResult.textContent = "";
    delete llmTestResult.dataset.state;
    syncLlmStatus();
    showToast("已清除大模型配置，回退到本地资料模式");
  });

  function addLlmAnswer(text, model) {
    const element = document.createElement("div");
    element.className = "ai-message system";
    element.innerHTML = `<span>大模型回答 · ${escapeHtml(model)}</span><p>${escapeHtml(text)}</p>`;
    aiThread.appendChild(element);
    aiThread.scrollTop = aiThread.scrollHeight;
  }

  async function llmChat(messages, config, { timeoutMs = 60000, maxTokens } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const body = { model: config.model, messages, temperature: config.temperature ?? 0.3 };
      if (maxTokens) body.max_tokens = maxTokens;
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}${detail ? ` · ${detail.slice(0, 120)}` : ""}`);
      }
      const data = await response.json();
      const content = String(data?.choices?.[0]?.message?.content || "").trim();
      if (!content) throw new Error("接口返回为空");
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  function buildPageContext(page) {
    const nameOf = key => priceData.companies?.[key]?.company || key;
    const priceAsOf = priceData.generatedFrom?.asOf || "";
    const priceLines = companyOrder.map(key => {
      const c = priceData.companies?.[key];
      if (!c) return "";
      return `${c.company}（${c.product}）：出厂${c.factory}/批价${c.wholesale}/终端${c.terminal}元，${c.inverted ? "倒挂" : "顺价"}${Math.abs(c.spread)}元，近4周${formatPct(c.trendMetrics?.change4w)}`;
    }).filter(Boolean);
    const survey = researchData.channelWeekly;
    const surveyLines = Object.values(survey?.companies || {}).map(c => `${c.company}：库存${c.inventory}；动销${c.sellThrough}`).slice(0, 7);
    const lines = [];
    if (page === "home") {
      const s = researchData.synthesis || {};
      lines.push(`行业综合判断（${s.asOf || "?"}）：${s.stage || ""}。${s.summary || ""}`);
      if (s.counter?.length) lines.push(`反向证据：${s.counter.join("；")}`);
      if (priceLines.length) lines.push(`最新批价（${priceAsOf}）：${priceLines.join("；")}`);
    } else if (page === "industry" || page === "compare") {
      if (priceLines.length) lines.push(`最新批价（${priceAsOf}）：${priceLines.join("；")}`);
      if (surveyLines.length) lines.push(`渠道调研（${survey.period}，未独立核验）：${surveyLines.join("；")}`);
    } else if (page === "market") {
      const val = localData.valuation || {};
      const valLines = Object.entries(val.companies || {}).map(([key, v]) => `${nameOf(key)}：PE(TTM)${v.peTtm}/PB${v.pb}/股息率${v.dividendYield}%`);
      if (valLines.length) lines.push(`估值（${val.asOf || "?"}）：${valLines.join("；")}`);
      const fh = localData.fundHolding || {};
      const fhLines = Object.entries(fh.companies || {}).map(([key, v]) => `${nameOf(key)}：${v.funds}只/${v.marketValue}亿（上期${v.prevFunds}只/${v.prevMarketValue}亿）`);
      if (fhLines.length) lines.push(`基金重仓（${fh.period || "?"}，环比大幅下降）：${fhLines.join("；")}`);
      const views = (researchData.viewpointTension || []).map(v => `${v.date} ${v.source}：${v.claim}`);
      if (views.length) lines.push(`观点版本：${views.join("；")}`);
    } else if (page === "sentiment") {
      const anns = (localData.announcements?.items || []).slice(0, 6).map(a => `${a.date} ${a.company}《${a.title}》`);
      if (anns.length) lines.push(`近期公告（巨潮）：${anns.join("；")}`);
      const views = (researchData.viewpointTension || []).map(v => `${v.date} ${v.source}：${v.claim}`);
      if (views.length) lines.push(`行业观点：${views.join("；")}`);
    }
    if (!lines.length) return "";
    return `【页面数据摘要（含日期口径，供回答参考；摘要之外的数据不要编造）】\n${lines.join("\n")}\n`;
  }

  async function llmChatStream(messages, config, onToken) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({ model: config.model, messages, temperature: config.temperature ?? 0.3, stream: true }),
        signal: controller.signal
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}${detail ? ` · ${detail.slice(0, 120)}` : ""}`);
      }
      const contentType = response.headers.get("content-type") || "";
      if (!response.body || !contentType.includes("event-stream")) {
        const data = await response.json();
        const content = String(data?.choices?.[0]?.message?.content || "").trim();
        if (!content) throw new Error("接口返回为空");
        onToken(content);
        return content;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content || "";
            if (delta) { content += delta; onToken(content); }
          } catch (_) { /* partial JSON chunk, wait for more data */ }
        }
      }
      if (!content) throw new Error("接口返回为空");
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  function runLlmAnswer(question, config, loading) {
    const messages = [
      { role: "system", content: config.systemPrompt || DEFAULT_SYSTEM_PROMPT },
      { role: "user", content: `【当前页面：${pageMeta[currentPage].label}】\n${buildPageContext(currentPage)}【问题】${question}` }
    ];
    let answerEl = null;
    let para = null;
    llmChatStream(messages, config, content => {
      if (!answerEl) {
        loading.remove();
        answerEl = document.createElement("div");
        answerEl.className = "ai-message system";
        answerEl.innerHTML = `<span>大模型回答 · ${escapeHtml(config.model)}</span><p class="ai-stream"></p>`;
        para = answerEl.querySelector("p");
        aiThread.appendChild(answerEl);
      }
      para.textContent = content;
      aiThread.scrollTop = aiThread.scrollHeight;
    }).then(content => {
      if (!answerEl) { loading.remove(); addLlmAnswer(content, config.model); }
    }).catch(error => {
      loading.remove();
      if (answerEl) answerEl.remove();
      const note = document.createElement("div");
      note.className = "ai-message system";
      note.innerHTML = `<span>大模型调用失败</span><p>${escapeHtml(error.name === "AbortError" ? "请求超时（120s）" : error.message)}</p>`;
      const actions = document.createElement("div");
      actions.className = "ai-error-actions";
      const retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.textContent = "重试大模型";
      retryBtn.addEventListener("click", () => {
        note.remove();
        const retryLoading = document.createElement("div");
        retryLoading.className = "ai-message system";
        retryLoading.innerHTML = `<span>大模型 · ${escapeHtml(config.model)}</span><p>正在调用接口…</p>`;
        aiThread.appendChild(retryLoading);
        aiThread.scrollTop = aiThread.scrollHeight;
        runLlmAnswer(question, config, retryLoading);
      });
      const fallbackBtn = document.createElement("button");
      fallbackBtn.type = "button";
      fallbackBtn.textContent = "回退本地回答";
      fallbackBtn.addEventListener("click", () => { note.remove(); addAiAnswer(aiResponse(question)); });
      actions.append(retryBtn, fallbackBtn);
      note.appendChild(actions);
      aiThread.appendChild(note);
      aiThread.scrollTop = aiThread.scrollHeight;
    });
  }

  function askAi(question) {
    const clean = String(question || "").trim();
    if (!clean) return;
    toggleAi(true);
    addAiMessage("user", clean);
    const config = llmConfigured();
    const loading = document.createElement("div");
    loading.className = "ai-message system";
    loading.innerHTML = config
      ? `<span>大模型 · ${escapeHtml(config.model)}</span><p>正在调用接口…</p>`
      : "<span>演示编排</span><p>正在检查问题边界…</p>";
    aiThread.appendChild(loading);
    aiThread.scrollTop = aiThread.scrollHeight;
    if (config) {
      runLlmAnswer(clean, config, loading);
      return;
    }
    setTimeout(() => { loading.remove(); addAiAnswer(aiResponse(clean)); }, body.classList.contains("reduce-motion") ? 10 : 420);
  }

  document.getElementById("ai-form").addEventListener("submit", event => {
    event.preventDefault();
    const value = aiInput.value;
    aiInput.value = "";
    askAi(value);
  });

  /* ---------- 卖方材料上传（材料上传页） ---------- */
  const INBOX_STORAGE_KEY = "baijiu-prototype-seller-inbox";
  const uploadForm = document.getElementById("upload-form");
  const uploadModule = document.getElementById("upload-module");
  const uploadDate = document.getElementById("upload-date");
  const uploadOrg = document.getElementById("upload-org");
  const uploadAnalyst = document.getElementById("upload-analyst");
  const uploadFile = document.getElementById("upload-file");
  const uploadText = document.getElementById("upload-text");
  const uploadExtractBtn = document.getElementById("upload-extract");
  const uploadExtractStatus = document.getElementById("upload-extract-status");
  const uploadExtractPreview = document.getElementById("upload-extract-preview");
  const uploadExtractJson = document.getElementById("upload-extract-json");
  const inboxList = document.getElementById("inbox-list");
  const uploadInboxCount = document.getElementById("upload-inbox-count");

  const SELLER_MODULES = {
    survey: {
      label: "调研情况",
      target: "产业分析 D1",
      schema: `{"tone":"调研基调一句话","period":"调研观察期","items":[{"company":"公司名","inventory":"库存","sellthrough":"动销","payment":"回款","policy":"渠道政策","priceNote":"周度价格（文字口径）","summary":"调研要点"}]}`
    },
    viewpoint: {
      label: "报告观点",
      target: "资本市场 A1",
      schema: `{"title":"报告标题","rating":"行业评级（如有）","claim":"核心判断一句话","arguments":["论据"],"risks":["风险"],"changes":"与上期观点的边际变化（如材料提及）"}`
    },
    target: {
      label: "目标价与评级",
      target: "资本市场 A2",
      schema: `{"rows":[{"company":"公司","rating":"评级","targetPrice":"目标价","upside":"较现价空间","logic":"核心逻辑"}]}`
    },
    forecast: {
      label: "盈利和收入预测",
      target: "资本市场 A3",
      schema: `{"rows":[{"company":"公司","period":"预测年份，如2026E","revenue":"收入","revenueYoY":"收入同比","profit":"归母净利","profitYoY":"净利同比"}]}`
    },
    sentiment: {
      label: "舆情观点",
      target: "舆情跟踪 01",
      schema: `{"items":[{"kind":"行业观点/高管声音/企业新闻","who":"发言人或主体","date":"日期","summary":"要点","companies":["涉及公司"],"sentiment":"偏正面/中性/偏负面"}]}`
    }
  };

  /* 提取结果字段归一化：大模型返回的字段名不一时按别名归位，避免静默渲染空表 */
  const EXTRACT_ALIASES = {
    surveyRoot: { tone: ["tone", "基调", "调研基调"], period: ["period", "观察期", "调研期间", "调研期"] },
    surveyItem: { company: ["company", "name", "公司", "酒企"], inventory: ["inventory", "库存"], sellthrough: ["sellthrough", "sellThrough", "sales", "动销"], payment: ["payment", "回款", "回款进度"], policy: ["policy", "政策", "渠道政策"], priceNote: ["priceNote", "price", "价格", "周度价格"], summary: ["summary", "note", "要点", "调研要点"] },
    viewpointRoot: { title: ["title", "标题", "报告标题"], rating: ["rating", "评级"], claim: ["claim", "核心判断", "核心观点", "判断"], arguments: ["arguments", "论据", "主要论据"], risks: ["risks", "risk", "风险", "风险提示"], changes: ["changes", "边际变化", "变化"] },
    targetRow: { company: ["company", "公司"], rating: ["rating", "评级"], targetPrice: ["targetPrice", "target", "目标价"], upside: ["upside", "空间", "较现价空间"], logic: ["logic", "核心逻辑", "逻辑"] },
    forecastRow: { company: ["company", "公司"], period: ["period", "year", "年份", "预测年份"], revenue: ["revenue", "收入"], revenueYoY: ["revenueYoY", "收入同比"], profit: ["profit", "归母净利", "净利润"], profitYoY: ["profitYoY", "净利同比"] },
    sentimentItem: { kind: ["kind", "type", "类型"], who: ["who", "speaker", "发言人", "主体"], date: ["date", "日期"], summary: ["summary", "要点", "内容"], companies: ["companies", "涉及公司"], sentiment: ["sentiment", "倾向"] }
  };

  function normalizeKeys(obj, aliases, warnings) {
    const lookup = {};
    Object.entries(aliases).forEach(([canon, names]) => names.forEach(name => { lookup[String(name).toLowerCase()] = canon; }));
    const out = {};
    Object.entries(obj && typeof obj === "object" ? obj : {}).forEach(([key, value]) => {
      const canon = lookup[String(key).toLowerCase()];
      if (canon && out[canon] === undefined) {
        if (canon !== key) warnings.push(`${key}→${canon}`);
        out[canon] = value;
      } else {
        out[key] = value;
      }
    });
    return out;
  }

  function normalizeExtraction(moduleKey, raw) {
    const warnings = [];
    const data = raw && typeof raw === "object" ? { ...raw } : {};
    if (moduleKey === "survey") {
      Object.assign(data, normalizeKeys(data, EXTRACT_ALIASES.surveyRoot, warnings));
      data.items = (Array.isArray(data.items) ? data.items : []).map(row => normalizeKeys(row, EXTRACT_ALIASES.surveyItem, warnings));
      if (!data.items.length) warnings.push("未提取到公司条目");
      else if (data.items.some(row => !row.company)) warnings.push("部分条目缺少公司名");
    } else if (moduleKey === "viewpoint") {
      Object.assign(data, normalizeKeys(data, EXTRACT_ALIASES.viewpointRoot, warnings));
      if (!data.claim) warnings.push("缺少核心判断（claim）");
    } else if (moduleKey === "target" || moduleKey === "forecast") {
      const aliases = moduleKey === "target" ? EXTRACT_ALIASES.targetRow : EXTRACT_ALIASES.forecastRow;
      data.rows = (Array.isArray(data.rows) ? data.rows : []).map(row => normalizeKeys(row, aliases, warnings));
      if (!data.rows.length) warnings.push("未提取到预测行");
      else if (data.rows.every(row => !row.company)) warnings.push("所有行缺少公司名");
    } else if (moduleKey === "sentiment") {
      data.items = (Array.isArray(data.items) ? data.items : []).map(row => normalizeKeys(row, EXTRACT_ALIASES.sentimentItem, warnings));
      if (!data.items.length) warnings.push("未提取到舆情条目");
    }
    return { data, warnings: [...new Set(warnings)] };
  }

  function loadInbox() {
    try { return JSON.parse(localStorage.getItem(INBOX_STORAGE_KEY)) || []; } catch (_) { return []; }
  }
  function saveInbox(items) {
    try { localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(items)); } catch (_) { showToast("本地存储空间不足，保存失败"); }
  }

  const scriptCache = {};
  function ensureScript(key, src, check) {
    if (check()) return Promise.resolve();
    if (scriptCache[key]) return scriptCache[key];
    scriptCache[key] = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.onload = () => resolve();
      el.onerror = () => { delete scriptCache[key]; reject(new Error("解析组件加载失败（需联网），请改用粘贴正文")); };
      document.head.appendChild(el);
    });
    return scriptCache[key];
  }

  async function extractFileText(file) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (["txt", "md", "csv", "json"].includes(ext)) return await file.text();
    if (ext === "docx") {
      await ensureScript("mammoth", "https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js", () => window.mammoth);
      const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return result.value;
    }
    if (ext === "pdf") {
      await ensureScript("pdfjs", "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js", () => window.pdfjsLib);
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages = Math.min(pdf.numPages, 30);
      let text = "";
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      if (pdf.numPages > 30) text += `\n（已截取前30页，共${pdf.numPages}页）`;
      return text;
    }
    throw new Error(`暂不支持 .${ext} 文件，请使用 PDF / DOCX / TXT / MD，或直接粘贴正文`);
  }

  function parseLlmJson(text) {
    const cleaned = String(text).replace(/```(?:json)?/g, "").trim();
    const start = cleaned.search(/[{[]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start === -1 || end <= start) throw new Error("大模型未返回可解析的 JSON，请重试");
    return JSON.parse(cleaned.slice(start, end + 1));
  }

  async function extractWithLlm(text, moduleKey, meta) {
    const config = llmConfigured();
    if (!config) throw new Error("未配置大模型，请先在「模型配置」页接入");
    const mod = SELLER_MODULES[moduleKey];
    const clipped = String(text || "").slice(0, 20000);
    if (!clipped.trim()) throw new Error("材料正文为空");
    const content = await llmChat([
      { role: "system", content: "你是白酒行业卖方研究资料的结构化提取器。从材料中提取核心内容，只输出符合指定结构的 JSON，不要输出任何其他文字。字段无法从材料确认时留空字符串或空数组，不要编造。数值保留原文口径与单位。" },
      { role: "user", content: `目标模块：${mod.label}\n材料机构：${meta.org || "未知"}\n材料日期：${meta.materialDate || "未知"}\n\n请按以下 JSON 结构提取（字段名保持不变）：\n${mod.schema}\n\n材料正文：\n${clipped}` }
    ], config, { timeoutMs: 120000, maxTokens: 4000 });
    return parseLlmJson(content);
  }

  uploadFile.addEventListener("change", async () => {
    const file = uploadFile.files?.[0];
    if (!file) return;
    uploadExtractStatus.dataset.state = "loading";
    uploadExtractStatus.textContent = `正在解析 ${file.name}…`;
    try {
      const text = await extractFileText(file);
      uploadText.value = text.slice(0, 20000);
      uploadExtractStatus.dataset.state = "ok";
      uploadExtractStatus.textContent = `解析完成 · ${text.length} 字符${text.length > 20000 ? "（已截取前2万字符）" : ""}`;
    } catch (error) {
      uploadExtractStatus.dataset.state = "error";
      uploadExtractStatus.textContent = error.message;
    }
  });

  uploadExtractBtn.addEventListener("click", async () => {
    const text = uploadText.value.trim();
    if (!text) {
      uploadExtractStatus.dataset.state = "error";
      uploadExtractStatus.textContent = "请先上传文件或粘贴正文";
      return;
    }
    if (!llmConfigured()) {
      uploadExtractStatus.dataset.state = "error";
      uploadExtractStatus.textContent = "未配置大模型，请先在「模型配置」页接入";
      return;
    }
    uploadExtractBtn.disabled = true;
    uploadExtractStatus.dataset.state = "loading";
    uploadExtractStatus.textContent = "正在调用大模型提取…";
    try {
      const raw = await extractWithLlm(text, uploadModule.value, { org: uploadOrg.value.trim(), materialDate: uploadDate.value });
      const { data: extracted, warnings } = normalizeExtraction(uploadModule.value, raw);
      uploadExtractJson.value = JSON.stringify(extracted, null, 2);
      uploadExtractPreview.hidden = false;
      uploadExtractStatus.dataset.state = warnings.length ? "warn" : "ok";
      uploadExtractStatus.textContent = warnings.length
        ? `提取完成，请核对：${warnings.join("、")}`
        : "提取完成，可在下方核对编辑后保存";
    } catch (error) {
      uploadExtractStatus.dataset.state = "error";
      uploadExtractStatus.textContent = `提取失败：${error.name === "AbortError" ? "请求超时（120s）" : error.message}`;
    } finally {
      uploadExtractBtn.disabled = false;
    }
  });

  uploadForm.addEventListener("submit", event => {
    event.preventDefault();
    const org = uploadOrg.value.trim();
    const text = uploadText.value.trim();
    if (!org) { showToast("请填写机构名称"); return; }
    if (!text) { showToast("请上传文件或粘贴正文"); return; }
    let extracted = null;
    if (!uploadExtractPreview.hidden && uploadExtractJson.value.trim()) {
      try { extracted = JSON.parse(uploadExtractJson.value); }
      catch (_) { showToast("提取内容 JSON 格式有误，请修正或清空预览"); return; }
    }
    const items = loadInbox();
    items.unshift({
      id: `seller-${Date.now()}`,
      module: uploadModule.value,
      org,
      analyst: uploadAnalyst.value.trim(),
      materialDate: uploadDate.value,
      fileName: uploadFile.files?.[0]?.name || "粘贴文本",
      text: text.slice(0, 20000),
      extracted,
      status: "pending",
      uploadedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
    });
    saveInbox(items);
    uploadForm.reset();
    uploadExtractPreview.hidden = true;
    uploadExtractJson.value = "";
    uploadExtractStatus.textContent = "";
    delete uploadExtractStatus.dataset.state;
    renderInbox();
    showToast(extracted ? "已保存（含提取内容），待人工采纳" : "已保存原文，待提取与采纳");
  });

  function summarizeExtracted(item) {
    const ex = item.extracted;
    if (!ex) return "未提取（仅保存原文）";
    if (item.module === "survey") return ex.tone ? `调研基调：${ex.tone}` : `提取 ${(ex.items || []).length} 家公司`;
    if (item.module === "viewpoint") return ex.claim || "—";
    if (item.module === "target" || item.module === "forecast") return `提取 ${(ex.rows || []).length} 行预测`;
    if (item.module === "sentiment") return `提取 ${(ex.items || []).length} 条舆情`;
    return "";
  }

  function renderInbox() {
    refreshStorageUsage();
    const items = loadInbox();
    const pending = items.filter(item => item.status === "pending").length;
    const adopted = items.filter(item => item.status === "adopted").length;
    uploadInboxCount.textContent = `${items.length} 条 · ${pending} 待核验 · ${adopted} 已采纳`;
    if (!items.length) {
      inboxList.innerHTML = `<li class="ann-empty">收件箱为空。上传材料并提取后，在这里核验与采纳。</li>`;
      return;
    }
    inboxList.innerHTML = items.map(item => {
      const mod = SELLER_MODULES[item.module] || { label: item.module, target: "" };
      const statusTag = item.status === "adopted"
        ? `<span class="review-result is-confirmed">已采纳</span>`
        : `<span class="review-result is-pending">待核验</span>`;
      return `<li class="review-item inbox-item">
        <div class="review-head">
          <span class="review-type">${escapeHtml(mod.label)} → ${escapeHtml(mod.target)}</span>
          <time class="mono">${escapeHtml(item.materialDate || item.uploadedAt)}</time>
          ${statusTag}
        </div>
        <strong>${escapeHtml(item.org)}${item.analyst ? ` · ${escapeHtml(item.analyst)}` : ""}：${escapeHtml(item.fileName)}</strong>
        <p class="inbox-summary">${escapeHtml(summarizeExtracted(item))}</p>
        ${item.extracted ? `<details class="inbox-detail"><summary>查看提取内容</summary><pre>${escapeHtml(JSON.stringify(item.extracted, null, 2))}</pre></details>` : ""}
        <footer>
          <span>上传于 ${escapeHtml(item.uploadedAt)}</span>
          <span class="review-controls">
            ${item.extracted ? `<button type="button" data-inbox-adopt="${escapeHtml(item.id)}">${item.status === "adopted" ? "撤销采纳" : "采纳到前端"}</button>` : ""}
            <button type="button" data-inbox-reextract="${escapeHtml(item.id)}">重新提取</button>
            <button type="button" data-inbox-delete="${escapeHtml(item.id)}">删除</button>
          </span>
        </footer>
      </li>`;
    }).join("");
  }

  inboxList.addEventListener("click", async event => {
    const adoptBtn = event.target.closest("[data-inbox-adopt]");
    const delBtn = event.target.closest("[data-inbox-delete]");
    const reBtn = event.target.closest("[data-inbox-reextract]");
    if (!adoptBtn && !delBtn && !reBtn) return;
    const id = adoptBtn ? adoptBtn.dataset.inboxAdopt : (delBtn ? delBtn.dataset.inboxDelete : reBtn.dataset.inboxReextract);
    const items = loadInbox();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;
    if (delBtn) {
      const removed = items.splice(index, 1)[0];
      const wasAdopted = removed.status === "adopted";
      saveInbox(items);
      const reviews = loadCustomReviews();
      const linked = reviews.findIndex(r => r.linkedInboxId === removed.id);
      if (linked !== -1) { reviews.splice(linked, 1); saveCustomReviews(reviews); renderReviewList(); }
      renderInbox();
      if (wasAdopted) renderSellerBlocks();
      showToast("已删除该材料");
      return;
    }
    if (adoptBtn) {
      items[index].status = items[index].status === "adopted" ? "pending" : "adopted";
      saveInbox(items);
      if (items[index].module === "viewpoint") syncReviewFromViewpoint(items[index]);
      renderInbox();
      renderSellerBlocks();
      const reviewHint = items[index].module === "viewpoint" && items[index].status === "adopted" ? "，已生成复盘跟踪条目" : "";
      showToast((items[index].status === "adopted" ? `已采纳，进入${SELLER_MODULES[items[index].module].target}` : "已撤销采纳，复盘条目同步移除") + reviewHint);
      return;
    }
    if (!llmConfigured()) { showToast("请先在「模型配置」页接入大模型"); return; }
    reBtn.disabled = true;
    reBtn.textContent = "提取中…";
    try {
      const raw = await extractWithLlm(items[index].text || "", items[index].module, items[index]);
      const { data: normalized, warnings } = normalizeExtraction(items[index].module, raw);
      items[index].extracted = normalized;
      saveInbox(items);
      renderInbox();
      if (items[index].status === "adopted") renderSellerBlocks();
      showToast(warnings.length ? `提取完成，请核对：${warnings.join("、")}` : "重新提取完成");
    } catch (error) {
      renderInbox();
      showToast(`提取失败：${error.name === "AbortError" ? "请求超时（120s）" : error.message}`);
    }
  });

  function bindGotoUpload(block) {
    block.querySelectorAll("[data-goto-upload]").forEach(btn => btn.addEventListener("click", () => setPage("upload")));
  }

  /* 卖方观点采纳 → 首页复盘历史自动生成「验证中」条目，撤销/删除时同步移除 */
  function syncReviewFromViewpoint(item) {
    const reviews = loadCustomReviews();
    const existing = reviews.findIndex(r => r.linkedInboxId === item.id);
    if (item.status === "adopted") {
      if (existing !== -1) return;
      const ex = item.extracted || {};
      reviews.push({
        id: `review-${item.id}`,
        custom: true,
        autoReview: true,
        linkedInboxId: item.id,
        scope: "industry",
        date: item.materialDate || item.uploadedAt.slice(0, 10),
        source: `${item.org}（卖方上传）`,
        type: "卖方观点",
        claim: ex.claim || item.fileName,
        basis: (ex.arguments || []).join("；"),
        verifyBy: ex.changes ? `跟踪边际变化：${ex.changes}` : "待设定验证指标",
        result: "pending",
        outcome: "",
        lesson: ""
      });
      saveCustomReviews(reviews);
      renderReviewList();
    } else if (existing !== -1) {
      reviews.splice(existing, 1);
      saveCustomReviews(reviews);
      renderReviewList();
    }
  }

  function sellerBlockHead(count) {
    return `<div class="seller-block-head">
      <span class="status-tag demo">卖方上传</span><strong>已采纳 ${count} 份材料</strong>
      <span class="micro-note">大模型提取 · 未经独立核验 · 与内置数据分列</span>
      <button class="text-button" type="button" data-goto-upload>管理材料 →</button>
    </div>`;
  }

  function sellerMetaLine(item) {
    return [item.org, item.analyst, item.materialDate ? `材料 ${item.materialDate}` : ""].filter(Boolean).join(" · ");
  }

  function renderSellerBlocks() {
    const adopted = loadInbox().filter(item => item.status === "adopted" && item.extracted);
    renderSurveyBlock(adopted.filter(item => item.module === "survey"));
    renderViewpointBlock(adopted.filter(item => item.module === "viewpoint"));
    renderTargetBlock(adopted.filter(item => item.module === "target"));
    renderForecastBlock(adopted.filter(item => item.module === "forecast"));
    renderSentimentBlock(adopted.filter(item => item.module === "sentiment"));
  }

  function renderSurveyBlock(items) {
    const block = document.getElementById("seller-survey-block");
    if (!items.length) { block.hidden = true; block.innerHTML = ""; return; }
    block.hidden = false;
    block.innerHTML = sellerBlockHead(items.length) + items.map(item => {
      const ex = item.extracted;
      const rows = (ex.items || []).map(r => `<tr><th scope="row">${escapeHtml(r.company || "—")}</th><td>${escapeHtml(r.inventory || "—")}</td><td>${escapeHtml(r.sellthrough || "—")}</td><td>${escapeHtml(r.payment || "—")}</td><td>${escapeHtml(r.policy || "—")}</td><td>${escapeHtml(r.priceNote || "—")}</td><td>${escapeHtml(r.summary || "—")}</td></tr>`).join("");
      return `<article class="panel seller-panel">
        <div class="panel-topline"><span class="eyebrow">${escapeHtml(sellerMetaLine(item))}</span><b class="track-state demo-badge">卖方上传</b></div>
        ${ex.tone ? `<p class="seller-tone">调研基调：${escapeHtml(ex.tone)}${ex.period ? `（${escapeHtml(ex.period)}）` : ""}</p>` : ""}
        <div class="company-compare-scroll" tabindex="0" aria-label="卖方调研提取表，可横向滑动">
          <table class="band-table survey-table">
            <thead><tr><th scope="col">公司</th><th scope="col">库存</th><th scope="col">动销</th><th scope="col">回款</th><th scope="col">渠道政策</th><th scope="col">周度价格</th><th scope="col">调研要点</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="7">提取内容为空</td></tr>`}</tbody>
          </table>
        </div>
        <footer class="micro-note">材料：${escapeHtml(item.fileName)} · 大模型提取，未经独立核验</footer>
      </article>`;
    }).join("");
    bindGotoUpload(block);
  }

  function renderViewpointBlock(items) {
    const block = document.getElementById("seller-viewpoint-block");
    if (!items.length) { block.hidden = true; block.innerHTML = ""; return; }
    block.hidden = false;
    block.innerHTML = sellerBlockHead(items.length) + `<div class="viewpoint-grid">` + items.map(item => {
      const ex = item.extracted;
      const args = (ex.arguments || []).map(a => `<li>${escapeHtml(a)}</li>`).join("");
      const risks = (ex.risks || []).map(r => `<li>${escapeHtml(r)}</li>`).join("");
      return `<article class="panel viewpoint-card seller-panel">
        <div class="panel-topline"><span class="mono">${escapeHtml(item.materialDate || item.uploadedAt.slice(0, 10))}</span><b class="track-state demo-badge">卖方上传</b></div>
        <h3>${escapeHtml(item.org)}${ex.title ? `：${escapeHtml(ex.title)}` : ""}${ex.rating ? `（${escapeHtml(ex.rating)}）` : ""}</h3>
        <p>${escapeHtml(ex.claim || "")}</p>
        ${args ? `<div class="seller-sub"><span>主要论据</span><ul>${args}</ul></div>` : ""}
        ${risks ? `<div class="seller-sub"><span>风险提示</span><ul>${risks}</ul></div>` : ""}
        ${ex.changes ? `<p class="seller-tone">边际变化：${escapeHtml(ex.changes)}</p>` : ""}
        <footer class="micro-note">${escapeHtml(sellerMetaLine(item))} · 未经独立核验</footer>
      </article>`;
    }).join("") + `</div>`;
    bindGotoUpload(block);
  }

  function renderTargetBlock(items) {
    const block = document.getElementById("seller-target-block");
    const rows = items.flatMap(item => (item.extracted.rows || []).map(r => ({ ...r, org: item.org, date: item.materialDate || item.uploadedAt.slice(0, 10) })));
    if (!rows.length) { block.hidden = true; block.innerHTML = ""; return; }
    block.hidden = false;
    block.innerHTML = sellerBlockHead(items.length) + `<div class="panel seller-panel band-table-wrap">
      <div class="company-compare-scroll" tabindex="0" aria-label="卖方目标价提取表，可横向滑动">
        <table class="band-table">
          <thead><tr><th scope="col">机构</th><th scope="col">日期</th><th scope="col">公司</th><th scope="col">评级</th><th scope="col">目标价</th><th scope="col">较现价空间</th><th scope="col">核心逻辑</th></tr></thead>
          <tbody>${rows.map(r => `<tr><th scope="row">${escapeHtml(r.org)}</th><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.company || "—")}</td><td>${escapeHtml(r.rating || "—")}</td><td>${escapeHtml(r.targetPrice || "—")}</td><td>${escapeHtml(r.upside || "—")}</td><td>${escapeHtml(r.logic || "—")}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="blueprint-note">以上为卖方材料经大模型提取的真实数据，按机构与材料日期分列，与 DEMO 示例表不混算。</p>
    </div>`;
    bindGotoUpload(block);
  }

  function renderForecastBlock(items) {
    const block = document.getElementById("seller-forecast-block");
    const rows = items.flatMap(item => (item.extracted.rows || []).map(r => ({ ...r, org: item.org, date: item.materialDate || item.uploadedAt.slice(0, 10) })));
    if (!rows.length) { block.hidden = true; block.innerHTML = ""; return; }
    block.hidden = false;
    block.innerHTML = sellerBlockHead(items.length) + `<div class="panel seller-panel band-table-wrap">
      <div class="company-compare-scroll" tabindex="0" aria-label="卖方盈利预测提取表，可横向滑动">
        <table class="band-table">
          <thead><tr><th scope="col">机构</th><th scope="col">日期</th><th scope="col">公司</th><th scope="col">预测年份</th><th scope="col">收入</th><th scope="col">收入同比</th><th scope="col">归母净利</th><th scope="col">净利同比</th></tr></thead>
          <tbody>${rows.map(r => `<tr><th scope="row">${escapeHtml(r.org)}</th><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.company || "—")}</td><td>${escapeHtml(r.period || "—")}</td><td>${escapeHtml(r.revenue || "—")}</td><td>${escapeHtml(r.revenueYoY || "—")}</td><td>${escapeHtml(r.profit || "—")}</td><td>${escapeHtml(r.profitYoY || "—")}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p class="blueprint-note">以上为卖方材料经大模型提取的真实数据，按机构与材料日期分列，与 DEMO 示例表不混算。</p>
    </div>`;
    bindGotoUpload(block);
  }

  function renderSentimentBlock(items) {
    const block = document.getElementById("seller-sentiment-block");
    const entries = items.flatMap(item => (item.extracted.items || []).map(r => ({ ...r, org: item.org, fileName: item.fileName })));
    if (!entries.length) { block.hidden = true; block.innerHTML = ""; return; }
    block.hidden = false;
    block.innerHTML = sellerBlockHead(items.length) + `<div class="panel seller-panel">
      <ul class="track-list">${entries.map(e => `<li>
        <strong>${escapeHtml(e.kind || "观点")} · ${escapeHtml(e.who || e.org)}（${escapeHtml(e.date || "—")}）</strong>
        <span>${escapeHtml(e.summary || "")}</span>
        <small class="micro-note">来源：${escapeHtml(e.org)} · ${escapeHtml(e.fileName)}${e.sentiment ? ` · 倾向：${escapeHtml(e.sentiment)}` : ""}${e.companies?.length ? ` · 涉及：${e.companies.map(escapeHtml).join("、")}` : ""}</small>
      </li>`).join("")}</ul>
    </div>`;
    bindGotoUpload(block);
  }

  /* ---------- 数据备份与恢复（材料上传页 04） ---------- */
  const storageUsage = document.getElementById("storage-usage");

  function refreshStorageUsage() {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        bytes += key.length + (localStorage.getItem(key) || "").length;
      }
    } catch (_) { /* storage may be disabled */ }
    const kb = Math.round(bytes / 1024);
    storageUsage.textContent = `本地存储用量约 ${kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`}（上限约 5 MB）`;
    storageUsage.classList.toggle("is-warn", bytes > 4 * 1024 * 1024);
  }

  document.getElementById("backup-export").addEventListener("click", () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      llmConfig: loadLlmConfig(),
      reviews: loadCustomReviews(),
      inbox: loadInbox()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `baijiu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast(`已导出：${payload.reviews.length} 条复盘 · ${payload.inbox.length} 份材料`);
  });

  const backupImportInput = document.getElementById("backup-import-input");
  document.getElementById("backup-import-btn").addEventListener("click", () => backupImportInput.click());
  backupImportInput.addEventListener("change", async () => {
    const file = backupImportInput.files?.[0];
    backupImportInput.value = "";
    if (!file) return;
    let payload;
    try { payload = JSON.parse(await file.text()); }
    catch (_) { showToast("备份文件不是有效的 JSON"); return; }
    if (!payload || typeof payload !== "object" || (!Array.isArray(payload.reviews) && !Array.isArray(payload.inbox) && !payload.llmConfig)) {
      showToast("备份文件结构不识别");
      return;
    }
    if (!window.confirm(`导入将覆盖本机现有的模型配置、复盘记录与收件箱（备份时间：${payload.exportedAt || "未知"}）。继续？`)) return;
    try {
      if (payload.llmConfig) localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify(payload.llmConfig));
      else localStorage.removeItem(LLM_STORAGE_KEY);
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(payload.reviews || []));
      localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(payload.inbox || []));
    } catch (_) { showToast("写入失败：本地存储空间不足"); return; }
    fillLlmForm(loadLlmConfig());
    syncLlmStatus();
    renderReviewList();
    renderInbox();
    renderSellerBlocks();
    refreshStorageUsage();
    showToast("导入完成，所有模块已刷新");
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

  function dynamicSearchItems() {
    const items = [];
    (localData.announcements?.items || []).slice(0, 40).forEach(a => {
      items.push({ page: "sentiment", code: "ANN", title: a.title, note: `${a.company} · ${a.date} · 巨潮公告` });
    });
    loadCustomReviews().forEach(r => {
      items.push({ page: "home", code: "REVIEW", title: String(r.claim || "").slice(0, 40), note: `${r.source || "手动记录"} · ${r.date} · ${REVIEW_RESULT_META[r.result]?.label || ""}`.trim() });
    });
    loadInbox().forEach(i => {
      items.push({ page: "upload", code: "INBOX", title: `${i.org}：${i.fileName}`, note: `${SELLER_MODULES[i.module]?.label || i.module} · ${i.status === "adopted" ? "已采纳" : "待核验"} · ${i.materialDate || i.uploadedAt}` });
    });
    return items;
  }

  function renderSearch(query = "") {
    const normalized = query.trim().toLowerCase();
    const results = searchIndex.concat(dynamicSearchItems()).filter(item => !normalized || `${item.title} ${item.note}`.toLowerCase().includes(normalized));
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

  const mobileMoreToggle = document.getElementById("mobile-more-toggle");
  const mobileMoreMenu = document.getElementById("mobile-more-menu");
  mobileMoreToggle.addEventListener("click", () => {
    const open = mobileMoreMenu.hidden;
    mobileMoreMenu.hidden = !open;
    mobileMoreToggle.setAttribute("aria-expanded", String(open));
  });

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
  themeToggle.addEventListener("change", () => { setTheme(themeToggle.checked); renderReviewChart(); if (!eventsChartWrap.hidden) { renderEventsChart(); renderEventsFin(); renderEventsSupply(); } renderProductionScene(); });
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
      else if (mobileMoreMenu && !mobileMoreMenu.hidden) { mobileMoreMenu.hidden = true; mobileMoreToggle.setAttribute("aria-expanded", "false"); }
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
  renderStageSignal();
  renderProductionScene();
  renderShakeout();
  renderListedOverview();
  renderAnnouncements();
  renderReviewList();
  renderEvents();
  renderProductStructure();
  renderChannelTable("channel-research-tbody", ["maotai", "wuliangye", "guojiao", "fenjiu", "yanghe", "gujing", "jinshiyuan"]);
  renderChannelTable("channel-compare-tbody", companyOrder);
  renderMarketData();
  renderInterimCR6();
  renderGujingTracking();
  renderMediaSources();
  renderMaotaiSplit();
  renderTargetPrice();
  renderForecast();
  renderTradingActivity();
  renderResearchReports();
  renderViewpoints();
  setPage(pageMeta[initialPage] ? initialPage : "home", false);
  fillLlmForm(loadLlmConfig());
  syncLlmStatus();
  syncDataDates();
  renderInbox();
  renderSellerBlocks();
  refreshStorageUsage();
  setScenario("repair");
  selectCompany(selectedCompany);
  setCompanyView(currentCompanyView);
  updateChartFilters();
  bindSuggestionButtons();
  setElementInert(aiPanel, true);
  setElementInert(drawer, true);
  syncSidebarInert();
})();
