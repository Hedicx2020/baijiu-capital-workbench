window.WHITE_LIQUOR_RESEARCH = {
  schemaVersion: 1,
  synthesis: {
    asOf: "2026-08-15",
    type: "AI综合判断",
    confidence: "中低",
    stage: "修复信号出现，右侧仍待渠道确认",
    summary: "价格端出现局部改善，但主动补库、渠道现金流和库存去化尚未形成全行业一致证据。",
    supporting: [
      "截至8月15日，飞天原箱与普五近4周批价分别上涨约3.6%和5.5%，国窖1573同期持平。",
      "8月3日至9日周度调研表称多地动销同比扭转下降、批价企稳，但该判断尚未独立核验。"
    ],
    counter: [
      "普五与国窖1573批价仍低于表内出厂价，分别倒挂249元和125元。",
      "调研表显示五粮液、国窖、汾酒、洋河、古井、今世缘库存约1个月至4个月以上，回款进度明显分化。"
    ],
    next: "观察主动补库、库存持续下降、回款质量改善及主流批价能否跨区域持续企稳回升。"
  },
  viewpointTension: [
    {
      date: "2026-04-22",
      source: "国海证券行业报告",
      type: "报告判断",
      claim: "行业处于磨底期，2026Q2-H2进入淡季验证。",
      locator: "PDF p8-p10"
    },
    {
      date: "2026-08-09",
      source: "网页初步想法DOCX周度调研表",
      type: "周度点评，未独立核验",
      claim: "白酒板块已走出右侧拐点，多地动销同比扭转下降、批价企稳。",
      locator: "DOCX p1-p2"
    },
    {
      date: "2026-08-15",
      source: "酒企批价表-260815.xlsx",
      type: "价格数据",
      claim: "飞天原箱与普五近4周改善，国窖1573持平；价格信号仅构成部分验证。",
      locator: "周度表 A840:H840"
    }
  ],
  signals: [
    {
      key: "cashflow",
      name: "渠道现金流边际改善",
      status: "待确认",
      evidence: "回款进度区域与公司分化，尚无经销商主动加杠杆备货的统一证据。",
      source: "国海报告p9；DOCX周度调研表p2-p5"
    },
    {
      key: "restock",
      name: "经销商主动补库",
      status: "待确认",
      evidence: "现有材料多为打款、发货和库存描述，未形成主动补库的全行业确认。",
      source: "国海报告p9；DOCX周度调研表p2-p5"
    },
    {
      key: "price",
      name: "主流产品批价企稳回升",
      status: "部分确认",
      evidence: "飞天原箱和普五近4周上涨，国窖1573持平；普五和国窖仍倒挂。",
      source: "酒企批价表-260815.xlsx"
    }
  ],
  industryStats: [
    {
      name: "2025年白酒产量",
      value: "354.9万千升",
      note: "报告称较2016年峰值下降超过74%；2024年起统计进一步纳入配制酒，跨期口径需谨慎。",
      type: "历史事实/报告计算",
      date: "2025",
      source: "国海报告p10"
    },
    {
      name: "白酒CR6收入集中度",
      value: "约48%",
      note: "采用2024年收入；报告提出向80%以上提升属于未来情景，不是当前事实。",
      type: "历史事实",
      date: "2024",
      source: "国海报告p10-p11"
    },
    {
      name: "悦己消费占比",
      value: "37%",
      note: "2020年为29%；2025E为39%，预测值不可与历史事实混用。",
      type: "外部报告转引",
      date: "2024",
      source: "国海报告p14"
    },
    {
      name: "商务消费占比",
      value: "27%",
      note: "2020年为36%；消费场景结构继续向悦己迁移。",
      type: "外部报告转引",
      date: "2024",
      source: "国海报告p14"
    }
  ],
  consumptionMix: [
    { year: "2020", selfUse: 29, business: 36 },
    { year: "2021", selfUse: 32, business: 35 },
    { year: "2022", selfUse: 34, business: 32 },
    { year: "2023", selfUse: 35, business: 30 },
    { year: "2024", selfUse: 37, business: 27 },
    { year: "2025E", selfUse: 39, business: 25 }
  ],
  channelWeekly: {
    period: "2026-08-03至2026-08-09",
    source: "关于白酒行业研究网页demo的初步想法.docx 周度调研表",
    quality: "渠道调研/文字表，未独立核验；价格以8月15日Excel为当前主口径",
    companies: {
      maotai: {
        company: "贵州茅台",
        inventory: "飞天不足2周；非标库存低",
        sellThrough: "H1约+10%（Q1 +12%、Q2 +3%）；Q2出货同比20%+",
        payment: "7月已打款发货，进度约63%；年初至今发货节奏与去年持平，增速高2-3个百分点",
        policy: "非标代售；库存低于30%自动补货；i茅台调节供给",
        weeklyPriceText: "飞天原/散1700/1680、精品2340、生肖经典（散）1925、十五年4140、1935为670元，环比0/0/-20/0/-60/0（文字表口径，早于8月15日Excel）",
        takeaway: "提价后情绪平稳，批价趋稳、库存低",
        locator: "DOCX p2"
      },
      wuliangye: {
        company: "五粮液",
        inventory: "约1个月",
        sellThrough: "普五出货同比略降；截至6月20日八代五粮液双位数增长",
        payment: "多数运营商约70%；四川90%；华东回款60%、发货50%-55%",
        policy: "未来1-2个旺季重定价格锚；取消19元阶段性奖励",
        weeklyPriceText: "普五约730元（文字表口径，早于8月15日Excel）",
        takeaway: "出货分化，价格体系仍待修复",
        locator: "DOCX p2-p3"
      },
      guojiao: {
        company: "泸州老窖",
        inventory: "2个月以上",
        sellThrough: "短期高端销量承压",
        payment: "整体约40%；四川63%-64%；厂家发货40%-45%",
        policy: "坚持挺价；推出28度高光及小规格产品",
        weeklyPriceText: "国窖1573高度/低度/特曲（60版）840/630/410元，环比持平（文字表口径，高度与8月15日Excel冲突）",
        takeaway: "库存与回款仍需改善",
        locator: "DOCX p3"
      },
      fenjiu: {
        company: "山西汾酒",
        inventory: "约3-3.5M，原文单位待确认",
        sellThrough: "YTD预计10%+；1-5月省内-10%、省外微增",
        payment: "山东截至7月完成合同任务约65%，任务提升并非纯动销驱动",
        policy: "Q2不强制回款",
        weeklyPriceText: "青花30/20、老白汾15、玻汾为675/355/147/41元",
        takeaway: "改善能否延续取决于中秋",
        locator: "DOCX p3"
      },
      yanghe: {
        company: "洋河股份",
        inventory: "约2个月；老海之蓝基本去化完成",
        sellThrough: "YTD整体动销预计-15%；海之蓝换代表现较好",
        payment: "约40%",
        policy: "新总裁履职；产品换代",
        weeklyPriceText: "梦6+/水晶梦3/天之蓝/海之蓝为570/380/270/115元",
        takeaway: "库存改善，但梦之蓝仍不及预期",
        locator: "DOCX p3-p4"
      },
      gujing: {
        company: "古井贡酒",
        inventory: "全品类超过3个月",
        sellThrough: "Q2发货显著减少；强调抓动销",
        payment: "要求Q2末完成70%；销售口径完成全年62.7%",
        policy: "抓动销、去库存、稳价格；全国化更审慎",
        weeklyPriceText: "古20/16/8/5为470/305/200/100元",
        takeaway: "主动控货去库，等待终端验证",
        locator: "DOCX p4"
      },
      jinshiyuan: {
        company: "今世缘",
        inventory: "4个月以上",
        sellThrough: "Q2小幅提升；淡雅双位数增长；整体有望回正",
        payment: "6月中旬55%，预计月底60%",
        policy: "原表未提供独立政策字段",
        weeklyPriceText: "四开/对开/淡雅/V3为395/235/95/460元",
        takeaway: "动销边际改善，库存仍高",
        locator: "DOCX p4-p5"
      }
    }
  },
  companyFinancials: {
    dateNote: "收入为2024年；市值/股息率/PE为2026-04-17；现金口径日期分公司；报告25E/2026脚注存在冲突。",
    source: "国海报告p11、p20",
    companies: {
      maotai: { revenue2024: 1709.0, marketCap: 17622.4, dividendYield: 3.7, peTtm: 21, cash: 1507.9, avgPayout2224: 84.9 },
      wuliangye: { revenue2024: 891.8, marketCap: 3953.8, dividendYield: 5.1, peTtm: 14, cash: 1363.1, avgPayout2224: 61.7 },
      guojiao: { revenue2024: 312.0, marketCap: 1489.6, dividendYield: 5.7, peTtm: 12, cash: 324.5, avgPayout2224: 61.7 }
    }
  },
  framework2023: {
    source: "2023白酒研究框架：从优秀到卓越.pptx（华创证券，2023-08）",
    type: "历史研究框架档案",
    boundary: "方法论仍可复用；其中规模、批价、回款、库存等数值为2022-2023年口径，不代表当前，仅作历史对照。",
    industryNature: [
      { title: "先天优势", note: "文化绑定深厚，以消费心理定价而非成本加成；兼具快消品与高档消费品属性，量价均可驱动。", locator: "PPT S4" },
      { title: "穿越周期", note: "承压期需求韧性更强，复苏期修复更快；产业生命周期长于一般消费品。", locator: "PPT S4/S6" },
      { title: "时间的生意", note: "优质基酒扩产到投产需3-5年，陈放沉淀品牌；高资金占用形成难复制壁垒。", locator: "PPT S5" },
      { title: "后天努力", note: "营销与场景捆绑，社交属性与盈利工具属性优于其他高档消费品。", locator: "PPT S4" }
    ],
    eraEvolution: [
      { era: "80年代", factor: "计划管制", winner: "汾酒", note: "产能为王前夜，清香受益", locator: "PPT S11" },
      { era: "90年代", factor: "产能为王", winner: "五粮液", note: "痛点在生产力不足，浓香受益", locator: "PPT S11" },
      { era: "00年代", factor: "渠道为王", winner: "洋河", note: "痛点在打通终端，五粮液、老窖、洋河快速扩张", locator: "PPT S11" },
      { era: "10年代", factor: "品牌为王", winner: "茅台", note: "痛点在场景占位，名酒势起，集中度持续提升", locator: "PPT S11" }
    ],
    cycleReview: {
      golden: [
        "05-07年：经济和投资驱动，高端引领，茅五老窖收益率远超市场",
        "09-11年：4万亿后高端价格续升，地产酒崛起（洋河海之蓝、古井年份原浆等）",
        "11-12年：茅五价格飙升、渠道囤积，次高端发力，各路资金涌入"
      ],
      silver: [
        "15-17年：高端引领，品牌名酒回升",
        "19-20年：300-500元次高端渐成主力价格带（11-12年100-200元带的升级版）",
        "20年至今：茅台站上2000元，酱酒与600-800元新次高端爆发"
      ],
      lesson: "两轮传导规律一致：高端率先复苏，茅台打开价格天花板，中档与次高端锚定定位，叠加比价效应开启行业量价齐升。",
      newObservation: "近年业绩与批价周期波动性减弱，与地产/M2/CPI走势相关性分化，消费属性增强、周期性减弱。",
      locator: "PPT S12/S17"
    },
    priceBands2022: [
      { band: "高端", price: ">800元", size: "约2100亿", structure: "寡头垄断", channel: "团购>高端宴席>流通", brands: "茅台、五粮液、国窖1573、内参、复兴版", locator: "PPT S14" },
      { band: "中高端", price: "300-800元", size: "约900亿", structure: "拼盘模式/区域自立", channel: "团购>宴席>餐饮>商超", brands: "剑南春、梦之蓝、青花系列、古20/古16、红花郎、老窖特曲", locator: "PPT S14" },
      { band: "中低端", price: "100-300元", size: "约2100亿", structure: "区域自立", channel: "宴席>餐饮>商超>团购", brands: "古井、海之蓝、老白干、金种子、伊力特", locator: "PPT S14" },
      { band: "低端", price: "<100元", size: "约1500亿", structure: "类快消品，进入壁垒较低", channel: "全国流通渠道为主", brands: "玻汾、牛栏山、尖庄、老村长", locator: "PPT S14" }
    ],
    stockSelection: {
      formula: "牛股万能公式：景气周期 + 管理改善 + 产品聚焦高端化 + 渠道精细化 + 市场招商铺货 + 业绩持续兑现",
      logic: "景气周期选弹性，压力周期择确定；品牌 > 管理 > 外部渠道延伸行情",
      reversalStages: [
        { stage: "望闻问切", note: "内部管理/机制/战略开始改善，外部产品、价格、渠道体系尚未解决；财报收入利润减少、OWC扭转", locator: "PPT S34" },
        { stage: "由内而外", note: "战略执行、库存消化、价格理顺、渠道重塑，仍需大量费用投入；现金与收入好转、费用率高位", locator: "PPT S34" },
        { stage: "名闻天下", note: "渠道主动上门，费用推动变为外部拉动；业绩加速爆发，预期不断上调、估值高位", locator: "PPT S34" }
      ],
      locator: "PPT S34"
    },
    traversal2023: {
      boundary: "2023年中渠道调研口径，仅作历史对照，不代表当前",
      wuliangye: "五粮液以大经销商等战略合作伙伴平滑报表，守护千元品牌地位；当时口径：回款约75%、库存约1个月（未压货）、普五批价约940元。",
      guojiao: "泸州老窖以产品结构切换保持弹性，向下发力低度国窖与特曲保障渠道利润；当时口径：回款约70%、库存约2个月（略有压货）、国窖高度/低度批价约890/650元。",
      locator: "PPT S25"
    }
  },
  trackingSystem: {
    source: "2023框架PPT S33《白酒行业研究及跟踪指标一览》",
    tiers: [
      {
        tier: "长期指标",
        freq: "年度",
        source: "国家统计局、行业协会、测算",
        groups: [
          { name: "宏观消费", items: "GDP、CPI、M2、社零、PPI、人口结构、城镇化率、人均收入、地产" },
          { name: "白酒行业", items: "行业规模、产量、销量、人均饮酒量、吨价" },
          { name: "格局结构", items: "各价格带规模/量价/格局、各省市场体量与饮用量" }
        ],
        coverage: "部分接入：产量、CR6、消费场景为报告历史数据",
        covered: "partial"
      },
      {
        tier: "中期指标",
        freq: "季度",
        source: "公司公告、年报/季报、公司官网",
        groups: [
          { name: "目标", items: "五年目标及规划、年度目标规划" },
          { name: "现金", items: "回款、经营性现金流、合同负债、应收票据" },
          { name: "收入", items: "各单品规模、量价/区域/渠道类型拆分、归母净利润" },
          { name: "盈利", items: "毛利率、营业税金率、管理费用率、销售费用率（广告费）、净利率" },
          { name: "周转", items: "存货/库存商品、成品/半成品酒、存货周转率、资产周转率、ROE" },
          { name: "其他", items: "员工与销售人员数、经销商与终端网点数、产能利用率、产销率" }
        ],
        coverage: "待接入：当前仅有2024年收入与报告时点估值",
        covered: "none"
      },
      {
        tier: "短期指标",
        freq: "日/周度",
        source: "渠道调研",
        groups: [
          { name: "渠道跟踪", items: "出厂价/批价/终端价、回款、库存、动销、渠道政策" }
        ],
        coverage: "已接入：三价体系（Excel日/周/月度）+ 周度渠道调研（未独立核验）",
        covered: "full"
      }
    ],
    pitfallNote: "调研需注意四类偏差：口径误差、表述性误差、真实性误差、理解性误差。听其言、观其行，换位思考、逻辑推演。",
    locator: "PPT S33"
  },
  digitalBlueprint: {
    source: "茅台资本市场数字化建设汇报材料.pptx（服务白酒产业的数字化建设汇报）",
    type: "跟踪体系蓝图",
    capitalMarketModules: [
      { module: "产业分析", content: "宏观分析、长期趋势研判、中短期数据跟踪、调研情况", webMapping: "行业分析框架 + 核心数据跟踪", status: "已部分接入" },
      { module: "产业比较", content: "国内外企业的产品结构、品牌建设、渠道情况、财务状况对比", webMapping: "公司对比（三家公司同口径）", status: "已部分接入" },
      { module: "资本市场", content: "分析师观点/目标价/盈利预测、估值、交易活跃度、机构持仓、大宗交易、北上资金、质押两融", webMapping: "专家观点演化", status: "观点已接入，持仓与资金待接入" },
      { module: "舆情跟踪", content: "行业热点、精选公告、企业新闻、高管之声", webMapping: "观点演化-材料时间线", status: "待接入" },
      { module: "调研数据", content: "主要品类出厂价、一批价每周跟踪展示", webMapping: "核心数据跟踪-价格体系", status: "已接入" }
    ],
    industryChainTool: "产业链工具覆盖26家白酒上市企业、17000余家生产企业、22万余家下游渠道企业；企业画像含7大类45项信息，支持线索挖掘、风险预警（舆情/经营/司法）与政策跟踪。",
    locator: "数字化汇报 S2-S11"
  },
  priceBands: [
    { band: "超高端", price: "1500元以上", structure: "报告概括为茅台独占", type: "报告判断", source: "国海报告p12-p13" },
    { band: "高端", price: "800-1500元", structure: "五粮液约65%、国窖约12%、其他约23%", type: "报告转引", source: "国海报告p12-p13" },
    { band: "次高端", price: "300-800元", structure: "格局较分散", type: "报告判断", source: "国海报告p12-p13" },
    { band: "大众主流", price: "100-300元", structure: "渠道覆盖与终端渗透更重要", type: "报告判断", source: "国海报告p12-p13" },
    { band: "大众低线", price: "100元以下", structure: "文档价格带示意口径", type: "结构示例", source: "DOCX价格带示意表" }
  ],
  macroSources: {
    source: "关于白酒行业研究网页demo的初步想法.docx 第一部分",
    note: "白酒是顺周期行业，先关注能影响或代表消费者信心的宏观数据；以下为官方获取口径导航，数据本身待接入。",
    items: [
      { indicator: "GDP", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 国民经济核算 → 国内生产总值", freq: "季度" },
      { indicator: "CPI", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 价格指数 → 居民消费价格指数", freq: "月度" },
      { indicator: "M2", agency: "中国人民银行", entry: "pbc.gov.cn → 调查统计 → 统计数据 → 货币供应量", freq: "月度" },
      { indicator: "社零（社会消费品零售总额）", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 贸易和外经 → 社会消费品零售总额", freq: "月度" },
      { indicator: "PPI", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 价格指数 → 工业生产者出厂价格指数", freq: "月度" },
      { indicator: "人口结构", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 人口 → 人口数及构成；七普数据在 stats.gov.cn/tjsj/pcsj", freq: "年度" },
      { indicator: "城镇化率", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 人口 → 城镇/乡村人口；住建部亦有常住人口城镇化率", freq: "年度" },
      { indicator: "人均收入", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 人民生活 → 居民人均可支配收入", freq: "季度/年度" },
      { indicator: "地产", agency: "国家统计局", entry: "stats.gov.cn → 数据查询 → 固定资产投资 → 房地产开发投资、商品房销售面积/销售额", freq: "月度" }
    ]
  },
  industryDataSources: {
    source: "关于白酒行业研究网页demo的初步想法.docx 2.1行业数据",
    note: "另需增加两个模块：各价格带规模/量价/格局，以及安徽、江苏、四川、山东、河南等重点省市的规模/量价/格局（地级市GDP与人口取自政府官网，市场空间与格局用渠道调研，暂可参考云酒头条或酒业家）。",
    items: [
      { focus: "规模", metric: "规上白酒企业销售收入、利润总额、规上企业数量", source: "中国酒业协会年会/年度报告、协会×机构中期研究报告、国家统计局工企财务数据", freq: "年/半年" },
      { focus: "产量", metric: "白酒（折65度，商品量），万千升", source: "国家统计局月度工业生产数据、工信部酿酒行业运行情况", freq: "月/年" },
      { focus: "销量", metric: "无官方披露，采用CR6销量加和计算", source: "公司年报 / Wind", freq: "年" },
      { focus: "人均饮酒量", metric: "人均白酒消费量 ≈ 表观消费量 ÷ 常住人口", source: "产量/协会消费估算 + 统计局人口", freq: "年" },
      { focus: "吨价", metric: "吨价 = 销售收入 ÷ 销量；行业可用收入 ÷ 产量近似", source: "协会收入数据 ÷ 统计局产量；公司年报", freq: "年/半年" }
    ]
  },
  demoRequirements: {
    source: "关于白酒行业研究网页demo的初步想法.docx",
    type: "产品需求文档",
    points: [
      "高频数据前置：日/周度的三价、回款、库存、动销、渠道政策优先展示（Table1，与跟踪体系短期层一致）",
      "价格数据来源指引：五粮液普五、五粮液1618及25年以前茅台价格（不含生肖）参考茅粉鲁智深公众号，其他参考今日酒价",
      "行业研判：中长期趋势引用《从共荣到淘汰赛》深度报告周期复盘；短期趋势用外发点评或旭说食饮",
      "公司经营：A股+港股上市白酒公司总列表，单公司分供需销售、产品结构、渠道建设（渠道关系+提价汇总）、财务信息四节",
      "产业比较：财务信息参考Wind；经营规划含季度收入预测，销量与回款预测依赖渠道调研",
      "资本市场：导出各基金经理持仓；舆情跟踪：列出行业最新信息"
    ]
  },
  risks: [
    "政策、消费税及价格监管风险",
    "消费复苏不及预期",
    "批价持续波动并引起渠道及市场恐慌",
    "宏观流动性收缩",
    "酒企改革推进不及预期",
    "渠道库存重新累积、倒挂扩大或主动补库迟迟不出现"
  ],
  sources: [
    { id: "price", name: "酒企批价表-260815.xlsx", date: "2026-08-15", type: "价格数据库" },
    { id: "weekly", name: "关于白酒行业研究网页demo的初步想法.docx", date: "2026-08-09", type: "周度调研表/产品需求", sha256: "56339bb700e65a2bb0183d7a6cb421ea5e758acff818545e85c16334270ab911" },
    { id: "report", name: "从共荣到淘汰赛，寻找火炼的真金——白酒周.pdf", date: "2026-04-22", type: "券商行业报告", sha256: "00d442849515710cb3cd1ac972cc664c6e53a7e7f66c39ab9f11fcb01713b06c" },
    { id: "framework", name: "2023白酒研究框架：从优秀到卓越.pptx", date: "2023-08", type: "历史研究框架（华创）", note: "方法论复用；数值为2022-2023口径，仅作历史对照", sha256: "16b53b786b9f1732dd7fd63b728df3be6b07b21129524243d38d7c744f232818" },
    { id: "digital", name: "茅台资本市场数字化建设汇报材料.pptx", date: "未标注（汇报材料）", type: "跟踪体系蓝图", note: "定义资本市场与产业链跟踪的完整模块，网页据此标注接入状态", sha256: "9afe6e76b5f8558402f41a88f04c8ef76da54afc63d9960cee1a2757bbe66024" }
  ]
};
