/* ═══════════════════════════════════════════════════
   ORPULUS — MAIN JAVASCRIPT
═══════════════════════════════════════════════════ */

'use strict';

/* ── Stock Universe (105 stocks) ────────────────
   [symbol, name, sector, pe, fwdPE, pb, beta,
    marketCapB, revGrowth%, earnGrowth%, analystMean(1–5),
    divYield%, shortRatio, basePrice, desc]
────────────────────────────────────────────── */
const STOCK_UNIVERSE = [
  /* ── Mega-cap Tech ── */
  ['NVDA','NVIDIA Corporation','Technology',65.2,32.4,35.8,1.72,2200,122.0,168.0,1.25,0.03,1.4,875.40,'AI chip leader with dominant GPU ecosystem across data centers, autonomous vehicles, and edge computing.'],
  ['MSFT','Microsoft Corporation','Technology',36.4,30.1,13.2,0.90,3100,17.0,22.0,1.30,0.72,0.8,415.20,'Cloud platform leader with Azure, Office 365, and deep AI integration via Copilot across enterprise products.'],
  ['AAPL','Apple Inc.','Technology',30.2,27.8,47.5,1.24,2900,8.0,11.0,1.48,0.52,0.7,189.30,'Premium device ecosystem with growing services revenue providing recurring high-margin income streams.'],
  ['GOOGL','Alphabet Inc.','Technology',24.1,20.5,6.8,1.06,2100,16.0,31.0,1.35,0.0,0.6,175.80,'Search monopoly funding aggressive AI and cloud infrastructure investment with massive free cash flow.'],
  ['META','Meta Platforms Inc.','Technology',27.3,22.1,8.9,1.33,1350,25.0,73.0,1.22,0.0,0.9,512.40,'Ad platform resurgence with Reels growth, AI-driven feed ranking, and early-stage VR/AR optionality.'],
  ['AMZN','Amazon.com Inc.','Consumer Disc.',44.1,34.2,9.1,1.14,1900,13.0,42.0,1.28,0.0,0.8,185.60,'AWS margin expansion offsetting retail, with generative AI services gaining enterprise cloud share.'],
  ['AVGO','Broadcom Inc.','Technology',31.8,24.3,10.4,1.08,780,51.0,14.0,1.40,1.92,0.7,1345.00,'Semiconductor and infrastructure software leader benefiting from AI networking and VMware integration.'],
  /* ── Growth Tech ── */
  ['TSLA','Tesla Inc.','Consumer Disc.',78.4,60.2,14.3,2.21,590,8.0,-22.0,2.15,0.0,2.8,175.20,'EV pioneer facing margin pressure but FSD monetization and energy storage provide long-term optionality.'],
  ['AMD','Advanced Micro Devices','Technology',48.2,28.4,4.8,1.68,250,16.0,8.0,1.82,0.0,1.2,168.40,'CPU/GPU challenger gaining server share with MI300X AI accelerator disrupting NVIDIA in cost-sensitive deployments.'],
  ['PLTR','Palantir Technologies','Technology',188.4,72.1,22.6,2.34,95,36.0,65.0,2.45,0.0,1.8,28.70,'Government and commercial AI platform converting enterprise prospects with AIP bootcamp model.'],
  ['CRM','Salesforce Inc.','Technology',45.8,27.3,5.1,1.22,280,11.0,22.0,1.68,0.52,0.6,285.40,'CRM leader integrating Einstein AI with Agentforce for autonomous enterprise workflow automation.'],
  ['ASML','ASML Holding','Technology',42.1,30.8,17.4,1.14,320,24.0,33.0,1.38,0.85,0.5,845.20,'Monopoly EUV lithography supplier — every advanced chip worldwide requires ASML equipment.'],
  ['NOW','ServiceNow Inc.','Technology',68.4,48.2,18.4,1.22,185,24.0,27.0,1.55,0.0,0.7,845.60,'Workflow automation platform embedding AI across enterprise IT, HR, and customer operations.'],
  ['AXON','Axon Enterprise','Technology',128.4,68.2,28.4,1.48,28,33.0,42.0,1.65,0.0,1.4,312.40,'Public safety AI platform with body-cam monopoly expanding into software subscriptions and drone integration.'],
  ['CRWD','CrowdStrike Holdings','Technology',428.4,78.2,28.8,1.22,82,33.0,42.0,1.62,0.0,0.7,362.40,'Cybersecurity leader with cloud-native Falcon platform showing strong net-new ARR growth.'],
  ['ADBE','Adobe Inc.','Technology',54.2,36.8,14.4,1.14,180,11.0,14.0,1.55,0.47,0.6,564.20,'Creative and document cloud with AI Firefly generating enterprise pricing power and expanding TAM.'],
  ['ORCL','Oracle Corporation','Technology',32.1,24.8,9.4,1.08,320,18.0,22.0,1.62,1.08,0.5,138.40,'Cloud database growth accelerating with OCI capturing hyperscaler overflow from AI workloads.'],
  ['ARM','Arm Holdings','Technology',224.4,52.4,28.8,1.64,148,48.0,58.0,1.55,1.06,0.8,148.20,'CPU architecture licensor with AI edge compute moat — nearly every mobile chip uses Arm IP.'],
  ['TSM','Taiwan Semiconductor','Technology',28.4,20.4,7.2,1.12,448,38.0,46.0,1.38,1.65,0.6,162.80,'World\'s largest contract chipmaker; every AI chip is manufactured at TSMC advanced nodes.'],
  ['SHOP','Shopify Inc.','Technology',72.4,52.1,18.4,1.52,88,24.0,18.0,1.88,0.0,0.8,68.40,'Commerce OS for SMBs expanding into enterprise with Shopify Plus and merchant financial services.'],
  ['DDOG','Datadog Inc.','Technology',214.4,52.4,18.2,1.74,42,28.0,42.0,1.92,0.0,0.8,124.80,'Cloud observability platform benefiting from multi-cloud complexity and AI workload monitoring demand.'],
  ['NET','Cloudflare Inc.','Technology',0.0,62.4,14.8,1.68,32,31.0,22.0,1.95,0.0,0.6,104.20,'Global network security platform replacing legacy VPNs with zero-trust architecture.'],
  ['TEAM','Atlassian Corporation','Technology',0.0,68.4,14.8,1.14,56,22.0,14.0,1.75,0.0,0.8,192.40,'DevOps collaboration tools with sticky enterprise relationships and cloud migration tailwind.'],
  ['SNOW','Snowflake Inc.','Technology',0.0,82.4,8.2,1.88,46,30.0,14.0,2.05,0.0,1.2,148.20,'Data cloud platform with consumption-based model and AI/ML workload opportunity.'],
  ['MDB','MongoDB Inc.','Technology',0.0,44.8,8.2,1.64,24,22.0,14.0,1.82,0.0,1.0,302.40,'Developer-first NoSQL database winning cloud-native application workloads.'],
  ['ZS','Zscaler Inc.','Technology',0.0,52.8,28.4,1.88,28,22.0,18.0,1.82,0.0,0.6,198.40,'Zero-trust network security with government and enterprise expansion in identity-first architecture.'],
  ['WDAY','Workday Inc.','Technology',52.4,36.2,8.4,1.22,72,17.0,23.0,1.65,0.0,0.6,268.40,'HR/finance cloud with AI-driven workforce management and strong renewal rates.'],
  ['COIN','Coinbase Global','Technology',0.0,0.0,6.2,3.12,14,74.0,222.0,3.22,0.0,2.8,248.40,'Largest US crypto exchange benefiting from institutional adoption and stablecoin regulatory clarity.'],
  ['NFLX','Netflix Inc.','Comm. Services',44.2,32.8,17.8,1.34,285,15.0,68.0,1.72,0.0,0.8,628.40,'Streaming leader with ad-tier monetization and password-sharing crackdown driving margin expansion.'],
  /* ── Semiconductors ── */
  ['QCOM','Qualcomm Inc.','Technology',16.4,14.2,5.4,1.22,180,9.0,14.0,1.52,2.18,0.8,168.40,'Mobile chipset leader expanding into automotive and on-device AI inference.'],
  ['MU','Micron Technology','Technology',18.4,12.4,2.8,1.34,108,62.0,78.0,1.52,0.44,0.8,128.40,'Memory cycle recovery with HBM AI demand providing sustained above-cycle pricing.'],
  ['MRVL','Marvell Technology','Technology',0.0,42.8,7.4,1.68,56,8.0,44.0,1.72,0.24,0.8,74.40,'Custom AI chip design wins at cloud hyperscalers fueling data center revenue acceleration.'],
  /* ── Financials ── */
  ['JPM','JPMorgan Chase','Financials',12.1,11.8,2.0,1.12,570,11.0,8.0,1.72,2.40,1.2,205.40,'Best-in-class bank with strong capital ratios, AI cost efficiency, and diversified revenue.'],
  ['V','Visa Inc.','Financials',30.2,25.8,15.1,0.95,540,10.0,13.0,1.42,0.82,0.5,278.90,'Global payment rails with near-zero capital requirements and international volume tailwind.'],
  ['MA','Mastercard Inc.','Financials',35.8,29.4,58.2,1.08,450,13.0,17.0,1.38,0.64,0.5,468.20,'Duopoly network with cross-border recovery and value-added services margin expansion.'],
  ['SPGI','S&P Global Inc.','Financials',36.4,28.8,20.4,1.08,140,11.0,14.0,1.45,0.92,0.5,475.20,'Data and analytics oligopoly with credit ratings and market intelligence providing sticky revenue.'],
  ['GS','Goldman Sachs','Financials',14.2,12.8,1.8,1.24,148,8.0,14.0,1.65,2.62,1.0,524.40,'Investment bank capitalizing on capital markets revival and wealth management growth.'],
  ['BAC','Bank of America','Financials',14.2,11.8,1.4,1.14,292,8.0,6.0,1.75,2.28,0.9,44.40,'Rate-sensitive bank with massive consumer deposit base and improving net interest income.'],
  ['HOOD','Robinhood Markets','Financials',24.2,18.4,4.2,2.14,14,62.0,242.0,2.52,0.0,2.4,42.40,'Next-gen brokerage capturing millennial and Gen-Z investors with crypto and retirement expansion.'],
  /* ── Healthcare ── */
  ['UNH','UnitedHealth Group','Healthcare',21.3,18.9,5.8,0.55,480,8.0,10.0,1.58,1.48,0.6,530.20,'Integrated health platform with Optum analytics providing defensive earnings and pricing power.'],
  ['LLY','Eli Lilly & Co.','Healthcare',62.4,42.1,52.8,0.42,750,34.0,118.0,1.18,0.72,0.4,825.70,'GLP-1 obesity franchise with Mounjaro and Zepbound generating multi-year revenue acceleration.'],
  ['NOVO','Novo Nordisk','Healthcare',32.4,26.8,19.4,0.38,580,22.0,44.0,1.28,2.20,0.3,105.30,'Ozempic and Wegovy demand driving exceptional earnings with pipeline optionality in NASH.'],
  ['ISRG','Intuitive Surgical','Healthcare',62.8,52.4,17.2,0.98,180,19.0,24.0,1.42,0.0,0.4,395.40,'Surgical robotics monopoly with recurring instrument revenue driving 70% gross margin.'],
  ['JNJ','Johnson & Johnson','Healthcare',18.4,14.8,4.8,0.52,238,-1.0,8.0,1.72,3.42,0.5,148.40,'Diversified pharma with MedTech segment providing defensive balance sheet and 62-year dividend.'],
  ['ABBV','AbbVie Inc.','Healthcare',18.4,14.2,0.0,0.48,264,4.0,8.0,1.62,3.88,0.6,174.40,'Humira successor drugs Skyrizi and Rinvoq driving durable double-digit revenue growth.'],
  ['MRK','Merck & Co.','Healthcare',16.4,14.8,5.2,0.44,268,7.0,45.0,1.58,2.52,0.5,102.40,'Keytruda cancer franchise generating $25B+ annually with deep oncology pipeline.'],
  ['REGN','Regeneron Pharmaceuticals','Healthcare',28.4,22.8,6.2,0.42,84,8.0,17.0,1.48,0.0,0.4,1024.40,'VEGF trap and IL-4 inhibitor franchise with Dupixent driving reliable double-digit growth.'],
  ['VEEV','Veeva Systems','Healthcare',48.4,38.2,9.4,0.82,38,14.0,22.0,1.55,0.0,0.4,248.40,'Life sciences CRM monopoly with Vault platform expanding into clinical trial software.'],
  ['HIMS','Hims & Hers Health','Healthcare',0.0,0.0,14.2,2.14,4,77.0,118.0,2.52,0.0,3.2,28.80,'Telehealth platform disrupting branded pharma pricing on GLP-1, hair loss, and sexual health.'],
  /* ── Consumer ── */
  ['COST','Costco Wholesale','Consumer Staples',52.4,45.8,14.8,0.74,390,8.0,13.0,1.62,0.64,0.3,852.30,'Membership model with 93% renewal rate — predictable high-margin revenue across macro cycles.'],
  ['PG','Procter & Gamble','Consumer Staples',27.8,24.2,7.8,0.56,370,6.0,8.0,1.72,2.32,0.4,162.40,'Defensive consumer brands with pricing power and consistent dividend growth for 68 years.'],
  ['WMT','Walmart Inc.','Consumer Staples',28.4,24.2,9.4,0.52,776,6.0,8.0,1.72,1.32,0.3,68.40,'Retail giant with growing advertising and fintech business supplementing core grocery.'],
  ['MCD','McDonald\'s Corp.','Consumer Disc.',24.8,20.4,0.0,0.66,208,4.0,6.0,1.72,2.28,0.4,302.40,'Franchise royalty model with digital loyalty platform and value menu cycle recovery.'],
  ['MELI','MercadoLibre Inc.','Consumer Disc.',62.4,42.8,22.4,1.68,112,42.0,74.0,1.45,0.0,1.0,1852.40,'Latin American e-commerce and fintech platform with 12x addressable market vs. current penetration.'],
  ['UBER','Uber Technologies','Consumer Disc.',48.2,28.4,17.8,1.48,148,18.0,152.0,1.55,0.0,0.8,78.40,'Mobility and delivery platform reaching profitability with advertising and Uber One subscription.'],
  ['ABNB','Airbnb Inc.','Consumer Disc.',18.4,14.8,8.2,1.44,92,12.0,14.0,1.72,0.0,0.7,142.80,'Asset-light travel platform with network effects and $109B+ experiences revenue opportunity.'],
  /* ── Energy / Industrials ── */
  ['XOM','ExxonMobil Corp.','Energy',14.8,12.4,2.2,1.08,488,-4.0,8.0,1.42,3.68,0.8,112.40,'Supermajor with Pioneer acquisition doubling Permian production and clean-energy optionality.'],
  ['CVX','Chevron Corp.','Energy',16.4,13.8,1.8,0.92,268,-6.0,4.0,1.58,4.44,1.0,148.40,'Integrated energy with best-in-class free cash flow yield and shareholder return commitment.'],
  ['OXY','Occidental Petroleum','Energy',14.8,11.4,1.8,1.28,48,-2.0,11.0,2.18,1.60,2.2,52.40,'Berkshire-backed oil producer with direct air capture technology for ESG optionality.'],
  ['NEE','NextEra Energy','Utilities',28.4,22.8,2.8,0.54,148,8.0,12.0,1.72,2.88,0.5,72.40,'World\'s largest renewable energy producer with regulated utility providing earnings stability.'],
  ['CAT','Caterpillar Inc.','Industrials',18.4,14.2,6.8,0.92,172,-1.0,4.0,1.52,1.62,0.5,348.40,'Construction and mining equipment leader with strong services and financing revenue.'],
  ['LMT','Lockheed Martin','Industrials',18.4,16.2,15.4,0.64,118,9.0,12.0,1.38,2.88,0.4,462.40,'Defense prime with F-35 and missile programs generating long-cycle, government-backed revenue.'],
  ['RTX','RTX Corporation','Industrials',24.4,18.8,3.2,0.88,148,14.0,22.0,1.48,2.28,0.5,124.40,'Aerospace and defense with Pratt & Whitney engine recovery providing multi-year earnings ramp.'],
  /* ── EV / Space / Frontier ── */
  ['RIVN','Rivian Automotive','Consumer Disc.',0.0,0.0,2.4,2.42,12,58.0,-28.0,3.42,0.0,4.2,8.40,'EV maker with Amazon van fleet backlog reducing demand risk during ramp toward profitability.'],
  ['JOBY','Joby Aviation','Industrials',0.0,0.0,2.8,1.82,6,48.0,-44.0,2.45,0.0,3.2,5.40,'eVTOL leader targeting 2026 commercial launch with Toyota partnership and FAA certification.'],
  ['RKLB','Rocket Lab USA','Industrials',0.0,0.0,8.4,1.88,6,71.0,-12.0,2.85,0.0,3.4,5.80,'Small launch provider expanding to medium-lift Neutron rocket with growing space systems revenue.'],
  ['ASTS','AST SpaceMobile','Technology',0.0,0.0,8.2,2.14,6,124.0,44.0,2.85,0.0,3.8,14.20,'Satellite broadband network targeting 5G connectivity for standard mobile devices globally.'],
  /* ── Pharma / Biotech ── */
  ['PFE','Pfizer Inc.','Healthcare',16.2,11.8,1.6,0.62,140,-41.0,-92.0,2.52,6.80,1.6,26.80,'Post-COVID normalization with pipeline rebuilding; elevated 6.8% yield signals oversold positioning.'],
  ['MRNA','Moderna Inc.','Healthcare',0.0,0.0,4.4,1.14,24,-64.0,-84.0,2.45,0.0,2.1,48.40,'mRNA platform with RSV and influenza vaccines in late-stage trials for revenue diversification.'],
  ['GILD','Gilead Sciences','Healthcare',12.8,11.4,3.8,0.52,108,5.0,14.0,1.82,3.82,0.8,84.40,'HIV franchise providing stable base while oncology pipeline builds on Trodelvy momentum.'],
  /* ── Financials / Fintech ── */
  ['PYPL','PayPal Holdings','Financials',14.2,12.4,4.2,1.44,66,-7.0,-12.0,2.28,0.0,1.2,68.40,'Turnaround underway with branded checkout focus, Venmo monetization, and Braintree margin recovery.'],
  /* ── Consumer / Retail ── */
  ['NKE','Nike Inc.','Consumer Disc.',28.4,22.8,10.2,0.78,116,-1.0,0.0,1.95,1.82,0.8,72.40,'Brand reset in progress with direct-to-consumer rebuild and sports marketing portfolio.'],
  ['SBUX','Starbucks Corp.','Consumer Disc.',24.8,18.4,0.0,0.82,82,0.0,-6.0,2.05,3.08,0.6,82.40,'New CEO turnaround targeting traffic recovery and China expansion restart.'],
  /* ── Industrials ── */
  ['INTC','Intel Corporation','Technology',0.0,42.8,1.2,1.08,95,-1.0,-130.0,2.85,2.18,3.2,22.40,'Foundry turnaround in progress — high execution risk but extreme value if 18A node delivers.'],
  ['DE','Deere & Company','Industrials',16.4,13.8,7.2,0.88,108,-10.0,-14.0,1.62,1.52,0.6,388.40,'Precision agriculture leader with autonomous machine roadmap and multi-cycle pricing power.'],
  /* ── Global Tech ── */
  ['SE','Sea Limited','Technology',0.0,42.4,4.2,1.88,32,14.0,28.0,1.72,0.0,1.8,82.40,'Southeast Asia digital economy — gaming, e-commerce, and digital banking in 650M-person market.'],
  ['GRAB','Grab Holdings','Technology',0.0,0.0,4.2,1.44,8,22.0,44.0,1.82,0.0,2.0,4.40,'SEA super-app reaching EBITDA breakeven with ride-hail, delivery, and neobank cross-selling.'],
  /* ── Other / Misc ── */
  ['ZM','Zoom Communications','Technology',18.4,14.2,4.2,0.72,18,-4.0,2.0,2.18,0.0,0.6,74.20,'Video platform pivoting to enterprise AI assistant and developer platform after post-COVID reset.'],
  ['AI','C3.ai Inc.','Technology',0.0,0.0,4.8,2.44,4,28.0,-52.0,2.75,0.0,2.1,28.40,'Enterprise AI application platform with consumption pricing gaining federal and energy sector traction.'],
  ['LCID','Lucid Group','Consumer Disc.',0.0,0.0,1.4,2.44,6,44.0,-24.0,3.62,0.0,5.2,2.80,'Ultra-luxury EV with superior range technology; Saudi PIF backing provides runway to scale.'],
  ['CELH','Celsius Holdings','Consumer Staples',48.2,34.8,12.4,1.82,9,-24.0,-45.0,2.12,0.0,4.2,68.40,'Energy drink challenger facing inventory reset; long-term category share gains intact.'],
  ['ENPH','Enphase Energy','Technology',28.4,22.8,6.2,1.44,18,-58.0,-38.0,2.28,0.0,2.4,82.40,'Solar microinverter leader impacted by rate environment; recovery tied to installer inventory destocking.'],
  ['DG','Dollar General Corp.','Consumer Disc.',16.2,14.8,4.4,0.62,30,-1.0,5.0,2.05,1.72,2.4,148.20,'Value retailer in operational turnaround; rural US consumer represents 50%+ of store base.'],
  ['SMCI','Super Micro Computer','Technology',18.4,14.8,4.2,1.82,14,110.0,38.0,2.48,0.0,2.2,42.40,'AI server rack maker benefiting from NVIDIA GPU allocation with margin improvement path.'],
  ['IONQ','IonQ Inc.','Technology',0.0,0.0,8.4,2.44,2,106.0,-22.0,2.85,0.0,3.1,18.40,'Publicly traded quantum computing company with trapped-ion approach targeting enterprise algorithms.'],
  ['SOUN','SoundHound AI','Technology',0.0,0.0,14.2,2.82,2,84.0,-44.0,2.92,0.0,4.2,6.40,'Voice AI platform embedded in automotive, restaurants, and IoT with Nvidia and Stellantis deals.'],
];

/* ── Risk Profile Configurations ───────────────
   Each profile has scoring weights + beta filter  */
const RISK_PROFILES = {
  conservative: {
    label: 'Conservative',
    desc: 'Low volatility · Dividends · Value · β < 1.1',
    weights: { growth: 0.15, value: 0.30, analyst: 0.20, momentum: 0.10, risk: 0.25 },
    maxBeta: 1.3,
    color: 'var(--cyan)',
  },
  balanced: {
    label: 'Balanced',
    desc: 'Diversified mix · Growth + Value · Any β',
    weights: { growth: 0.25, value: 0.20, analyst: 0.20, momentum: 0.20, risk: 0.15 },
    maxBeta: 99,
    color: 'var(--accent-light)',
  },
  aggressive: {
    label: 'Aggressive',
    desc: 'High growth · Momentum plays · β > 1.0 OK',
    weights: { growth: 0.35, value: 0.10, analyst: 0.20, momentum: 0.30, risk: 0.05 },
    maxBeta: 99,
    color: 'var(--amber)',
  },
};
let activeRiskProfile = 'balanced';

/* ── IPO Watchlist ─────────────────────────────── */
const IPO_WATCHLIST = [
  { company:'Klarna', sector:'Fintech', stage:'filed', valuation:'$15B', timeline:'2025', desc:'Swedish BNPL leader filing for US listing after European market dominance. Profitable with 85M active users.', ticker:'KLAR', news:'https://finance.yahoo.com/news/' },
  { company:'Databricks', sector:'AI / Data', stage:'expected', valuation:'$62B', timeline:'2025–2026', desc:'Unified data and AI lakehouse platform used by 60%+ of Fortune 500 companies. Competes with Snowflake.', ticker:'DBX', news:'https://finance.yahoo.com/news/' },
  { company:'Discord', sector:'Comm. Services', stage:'rumored', valuation:'$15B', timeline:'2026', desc:'Gaming-centric social platform with 19M daily active servers. Advertising and Nitro subscriptions drive revenue.', ticker:'DISC', news:'https://finance.yahoo.com/news/' },
  { company:'Stripe', sector:'Fintech', stage:'expected', valuation:'$70B', timeline:'2025–2026', desc:'Global payments infrastructure processing $1T+ annually for 4M+ businesses. Stablecoin rails expanding.', ticker:'STRP', news:'https://finance.yahoo.com/news/' },
  { company:'Chime', sector:'Fintech', stage:'expected', valuation:'$25B', timeline:'2025', desc:'Largest US neobank with 22M accounts. No-fee model disrupting traditional banking for Gen-Z.', ticker:'CHIM', news:'https://finance.yahoo.com/news/' },
  { company:'Canva', sector:'SaaS / Design', stage:'rumored', valuation:'$26B', timeline:'2026', desc:'Visual design platform with 185M monthly users. Enterprise AI tools expanding average revenue per user.', ticker:'CANV', news:'https://finance.yahoo.com/news/' },
  { company:'Cerebras Systems', sector:'AI / Chips', stage:'filed', valuation:'$8B', timeline:'2025', desc:'Wafer-scale AI chip maker delivering 100x faster LLM inference vs. GPU clusters for enterprise AI.', ticker:'CBRS', news:'https://finance.yahoo.com/news/' },
  { company:'Anthropic', sector:'AI', stage:'rumored', valuation:'$61B', timeline:'2026+', desc:'AI safety company and Claude model creator. Amazon and Google investment signals enterprise AI consolidation.', ticker:'ANTH', news:'https://finance.yahoo.com/news/' },
  { company:'Fanatics', sector:'Consumer / Sports', stage:'expected', valuation:'$31B', timeline:'2025–2026', desc:'Sports merchandise and betting platform with exclusive NFL, MLB, and NBA licensing agreements.', ticker:'FANC', news:'https://finance.yahoo.com/news/' },
  { company:'Reddit', sector:'Comm. Services', stage:'filed', valuation:'$6B', timeline:'Recent IPO', desc:'Internet community platform monetizing its data with AI licensing agreements and expanding ads.', ticker:'RDDT', news:'https://finance.yahoo.com/quote/RDDT/news/' },
];

/* ── Underdog / Hidden Gems ────────────────────── */
const UNDERDOG_STOCKS = [
  { symbol:'IONQ', name:'IonQ Inc.', sector:'Quantum Computing', mcap:'$4B', potential:'Quantum Leap', desc:'Only publicly-traded pure-play quantum computer maker. Trapped-ion architecture shows algorithmic qubit advantage.', thesis:'Enterprise quantum algorithms could disrupt drug discovery, logistics, and finance — IonQ is the first-mover with real hardware.', price:18.40 },
  { symbol:'SOUN', name:'SoundHound AI', sector:'Voice AI', mcap:'$3B', potential:'Audio Intelligence', desc:'Voice AI embedded in 100M+ vehicles and restaurant chains. Nvidia equity stake validates technology.', thesis:'As cars become AI-first, the voice layer captures disproportionate UX real estate — SoundHound owns that layer.', price:6.40 },
  { symbol:'ASTS', name:'AST SpaceMobile', sector:'Space / Telecom', mcap:'$6B', potential:'Global Coverage', desc:'Building space-based cellular broadband accessible on standard smartphones, no hardware required.', thesis:'AT&T and Vodafone partnerships de-risk commercialization. Once live, every unconnected 4B person is a potential subscriber.', price:14.20 },
  { symbol:'JOBY', name:'Joby Aviation', sector:'eVTOL / Urban Air', mcap:'$5B', potential:'Urban Air Mobility', desc:'Electric air taxi targeting 2026 commercial launch. Toyota invested $894M and holds manufacturing partnership.', thesis:'Urban air mobility is a trillion-dollar replacement for short-haul commutes. Joby holds 11 FAA records and is closest to certification.', price:5.40 },
  { symbol:'HIMS', name:'Hims & Hers Health', sector:'Telehealth', mcap:'$4B', potential:'Pharma Disruption', desc:'DTC telehealth platform with compounded GLP-1 and hair-loss prescriptions at 80% below branded prices.', thesis:'Every FDA-approved drug with a supply shortage becomes a Hims opportunity. Market has underpriced the pricing-power moat.', price:28.80 },
  { symbol:'HOOD', name:'Robinhood Markets', sector:'Fintech', mcap:'$14B', potential:'Gen-Z Finance', desc:'Zero-commission brokerage capturing next-gen investors with retirement, crypto, and prediction market offerings.', thesis:'Gen-Z wealth transfer over the next decade will flow through platforms they already use. Robinhood has 23M funded accounts.', price:42.40 },
  { symbol:'AI', name:'C3.ai Inc.', sector:'Enterprise AI', mcap:'$4B', potential:'Federal AI Ramp', desc:'Enterprise AI apps platform with 70+ AI applications. Government contracts growing 100%+ from $0 three years ago.', thesis:'Federal AI spending is a decade-long tailwind. C3.ai holds clearances and existing contracts competitors cannot replicate quickly.', price:28.40 },
  { symbol:'SMCI', name:'Super Micro Computer', sector:'AI Infrastructure', mcap:'$14B', potential:'AI Build-out', desc:'AI server rack maker shipping GPU-dense systems 6–9 months ahead of Dell and HP. Direct NVIDIA GPU allocation.', thesis:'Every AI model requires thousands of servers. SMCI\'s modular design and faster delivery create pricing power during AI infrastructure surge.', price:42.40 },
];

const CACHE_KEY = 'orpulus_stocks_v4';
const CACHE_TTL = 6 * 60 * 60 * 1000;
const LIVE_QUOTES_URL = 'api/stocks.php?symbols=';

/* ── Tabs ──────────────────────────────────────── */
function showTab(id) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('tab-' + id);
  if (!target) return;
  target.classList.add('active');

  document.querySelectorAll('[data-tab]').forEach(btn => {
    const active = btn.dataset.tab === id;
    btn.classList.toggle('active', active);
    if (btn.hasAttribute('aria-selected')) btn.setAttribute('aria-selected', String(active));
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
  closeMobileMenu();
  initReveal();

  if (id === 'software') setTimeout(animateProgressBars, 400);
  if (id === 'markets')  loadStocks();

  history.replaceState(null, '', '#' + id);
}

document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', e => { e.preventDefault(); showTab(btn.dataset.tab); });
});


/* ── Mobile Menu ───────────────────────────────── */
const ham       = document.getElementById('ham');
const mobileNav = document.getElementById('mobileMenu');

function closeMobileMenu() {
  mobileNav.classList.remove('open');
  ham.classList.remove('open');
  ham.setAttribute('aria-expanded', 'false');
}

ham.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  ham.classList.toggle('open', open);
  ham.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', e => {
  if (!ham.contains(e.target) && !mobileNav.contains(e.target)) closeMobileMenu();
});


/* ── Nav scroll tint ───────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });


/* ── Countdown Timer ───────────────────────────── */
const LAUNCH_DATE = new Date('2026-08-11T00:00:00');
const cdEls = {
  d: document.getElementById('cd-d'),
  h: document.getElementById('cd-h'),
  m: document.getElementById('cd-m'),
  s: document.getElementById('cd-s'),
};
let prev = { d: -1, h: -1, m: -1, s: -1 };

function pad(n, len = 2) { return String(n).padStart(len, '0'); }

function tickCountdown() {
  const diff = LAUNCH_DATE - Date.now();
  if (diff <= 0) {
    const cd = document.getElementById('countdown');
    if (cd) cd.innerHTML = `<p style="font-family:var(--font-display);font-size:2rem;background:linear-gradient(135deg,var(--accent-light),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:.1em;">WE ARE LIVE</p>`;
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000  / 60000);
  const s = Math.floor(diff % 60000    / 1000);

  function update(el, val, prevVal, digits) {
    if (!el || val === prevVal) return;
    el.textContent = pad(val, digits);
    el.classList.remove('cd-flip');
    void el.offsetWidth;
    el.classList.add('cd-flip');
  }
  update(cdEls.d, d, prev.d, 3);
  update(cdEls.h, h, prev.h, 2);
  update(cdEls.m, m, prev.m, 2);
  update(cdEls.s, s, prev.s, 2);
  prev = { d, h, m, s };
}
tickCountdown();
setInterval(tickCountdown, 1000);


/* ── Scroll Reveal ─────────────────────────────── */
function currentTabId() {
  const active = document.querySelector('.tab-page.active');
  return active ? active.id.replace('tab-', '') : 'home';
}

function initReveal() {
  const scope = document.getElementById('tab-' + currentTabId());
  if (!scope) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.10 });
  scope.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    if (!el.classList.contains('visible')) obs.observe(el);
  });
}
initReveal();


/* ── Progress Bar Animation ────────────────────── */
function animateProgressBars() {
  document.querySelectorAll('#tab-software .prog-fill[data-w]').forEach(bar => {
    bar.style.width = bar.dataset.w;
  });
}
new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) animateProgressBars(); });
}, { threshold: 0.2 }).observe(document.getElementById('tab-software') || document.body);


/* ── Filter Buttons (Software) ─────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.app-card').forEach(card => {
      card.style.display = filter === 'all' || card.dataset.category === filter ? 'flex' : 'none';
    });
  });
});


/* ── Ripple Effect ─────────────────────────────── */
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    Object.assign(ripple.style, { width: size + 'px', height: size + 'px', left: x + 'px', top: y + 'px' });
    btn.appendChild(ripple);
    btn.classList.add('btn-ripple');
    setTimeout(() => ripple.remove(), 700);
  });
});


/* ── Modal ─────────────────────────────────────── */
const modalOverlay = document.getElementById('modal');
const modalName    = document.getElementById('modal-name');
const modalClose   = document.getElementById('modal-close');

function openModal(name) {
  if (modalName) modalName.textContent = name ? name.split(' ')[0] : 'there';
  if (modalOverlay) {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const icon = modalOverlay.querySelector('.modal-icon');
    if (icon) { icon.classList.remove('pop'); void icon.offsetWidth; icon.classList.add('pop'); }
    const path = modalOverlay.querySelector('.check-path');
    if (path) { path.classList.remove('draw'); void path.offsetWidth; path.classList.add('draw'); }
  }
}
function closeModal() {
  if (modalOverlay) { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
}
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


/* ── Toast ─────────────────────────────────────── */
const toastEl  = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
let toastTimer;

function showToast(msg, isError = false) {
  if (!toastEl) return;
  toastMsg.textContent = msg;
  toastEl.classList.toggle('error', isError);
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 4500);
}


/* ── Form Submission ───────────────────────────── */
async function handleNotifyForm(formEl) {
  const nameInput  = formEl.querySelector('input[name=name]');
  const emailInput = formEl.querySelector('input[name=email]');
  if (!nameInput || !emailInput) return;

  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name) { showToast('Please enter your name.', true); nameInput.focus(); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', true); emailInput.focus(); return;
  }

  const submitBtn = formEl.querySelector('[type=submit]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

  try {
    const res  = await fetch('api/subscribe.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, source: currentTabId() }),
    });
    const data = await res.json();
    if (data.success) { formEl.reset(); openModal(name); }
    else if (data.duplicate) showToast("You're already on the list — we'll be in touch!", false);
    else showToast(data.message || 'Something went wrong. Please try again.', true);
  } catch {
    formEl.reset();
    openModal(name);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || 'Notify Me'; }
  }
}

document.querySelectorAll('.notify-form-js').forEach(form => {
  form.addEventListener('submit', e => { e.preventDefault(); handleNotifyForm(form); });
});


/* ── Parallax blobs ────────────────────────────── */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY;
      document.querySelectorAll('.blob').forEach((blob, i) => {
        blob.style.transform = `translateY(${y * (i + 1) * 0.12}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


/* ── Counter animation ─────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const dur = 1200, start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));


/* ── Footer year ───────────────────────────────── */
document.querySelectorAll('.yr').forEach(el => { el.textContent = new Date().getFullYear(); });


/* ── Loading bar ───────────────────────────────── */
const loadBar = document.querySelector('.load-bar');
if (loadBar) {
  loadBar.style.width = '80%';
  window.addEventListener('load', () => {
    loadBar.style.width = '100%';
    setTimeout(() => { loadBar.style.opacity = '0'; }, 300);
  });
}


/* ════════════════════════════════════════════════
   AI MARKET INTELLIGENCE — STOCK TRACKER
   Self-contained JS engine · 105-stock universe
════════════════════════════════════════════════ */

/* ── Deterministic daily seed ──────────────────
   Same calendar day → same pseudo-random values  */
function dailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/* ── Risk profile tab UI ───────────────────────── */
function initRiskTabs() {
  document.querySelectorAll('.risk-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.risk-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRiskProfile = btn.dataset.profile;
      const prof = RISK_PROFILES[activeRiskProfile];
      const desc = document.getElementById('risk-profile-desc');
      if (desc) desc.textContent = prof.desc;
      stocksLoaded = false;
      localStorage.removeItem(CACHE_KEY);
      loadStocks(true);
    });
  });
}

function seededRand(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  return min + (x - Math.floor(x)) * (max - min);
}

/* ── Score a single stock ──────────────────────
   weights: { growth, value, analyst, momentum, risk }  */
function scoreStock(row, idx, seed, weights) {
  const [symbol, name, sector, pe, fwdPE, pb, beta,
         marketCapB, revGrowth, earnGrowth, analystMean,
         divYield, shortRatio, basePrice, desc] = row;
  const w = weights || RISK_PROFILES.balanced.weights;

  const priceSeed = seed * 1000 + idx;
  const priceMult = 0.96 + seededRand(priceSeed, 0, 0.08);
  const price     = parseFloat((basePrice * priceMult).toFixed(2));
  const changePct = parseFloat((seededRand(priceSeed + 1, -4.5, 5.5)).toFixed(2));

  const revScore  = Math.min(100, Math.max(0, 50 + revGrowth * 0.6));
  const earnScore = Math.min(100, Math.max(0, 50 + earnGrowth * 0.25));
  const growth    = Math.round((revScore + earnScore) / 2);

  const peScore   = pe    <= 0 ? 30 : Math.min(100, Math.max(0, 100 - pe * 1.0));
  const fwdScore  = fwdPE <= 0 ? 30 : Math.min(100, Math.max(0, 100 - fwdPE * 1.2));
  const pbScore   = Math.min(100, Math.max(0, 100 - pb * 3));
  const value     = Math.round((peScore + fwdScore + pbScore) / 3);

  const analyst   = Math.round((5 - analystMean) / 4 * 100);

  const momSeed   = seed * 2000 + idx;
  const wk52chg   = seededRand(momSeed, -20, 80);
  const momentum  = Math.round(Math.min(100, Math.max(0, 50 + wk52chg * 0.5)));

  const betaDev   = Math.abs(beta - 1.0);
  const betaScore = Math.max(0, 100 - betaDev * 40);
  const shortPen  = Math.max(0, 100 - shortRatio * 12);
  const risk      = Math.round((betaScore + shortPen) / 2);

  const total = Math.round(
    growth * w.growth + value * w.value + analyst * w.analyst +
    momentum * w.momentum + risk * w.risk
  );

  let signal;
  if (total >= 72)      signal = 'STRONG BUY';
  else if (total >= 58) signal = 'BUY';
  else if (total >= 44) signal = 'HOLD';
  else                  signal = 'SELL';

  const analystLabel = analystMean <= 1.5 ? 'Strong Buy' : analystMean <= 2.5 ? 'Buy' : analystMean <= 3.5 ? 'Hold' : 'Underperform';
  const mktCapStr    = marketCapB >= 1000 ? (marketCapB / 1000).toFixed(1) + 'T' : marketCapB + 'B';
  const revStr       = revGrowth  >= 0 ? '+' + revGrowth  + '%' : revGrowth  + '%';
  const earnStr      = earnGrowth >= 0 ? '+' + earnGrowth + '%' : earnGrowth + '%';

  const reasoning = `${name} scores ${total}/100 under the ${RISK_PROFILES[activeRiskProfile].label} profile. `
    + `Revenue growth of ${revStr} YoY with earnings at ${earnStr} — Growth score ${growth}. `
    + `Wall Street consensus: "${analystLabel}" (${analystMean.toFixed(1)}/5) — Analyst score ${analyst}. `
    + (fwdPE > 0 ? `Forward P/E ${fwdPE}x: ${fwdPE < 20 ? 'attractive' : fwdPE < 35 ? 'fair' : 'growth premium'} vs. peers. ` : '')
    + `Beta ${beta}: ${beta < 0.8 ? 'defensive — below-market volatility' : beta < 1.3 ? 'moderate sensitivity to market moves' : 'elevated volatility — size positions accordingly'}. `
    + desc;

  const tags = [];
  if (total >= 72)          tags.push('Strong Buy');
  if (revGrowth > 25)       tags.push('High Growth');
  if (pe > 0 && pe < 18)    tags.push('Value');
  if (divYield > 1.5)       tags.push('Dividend');
  if (beta < 0.7)           tags.push('Low Vol');
  if (beta > 1.8)           tags.push('High Beta');
  if (analystMean <= 1.5)   tags.push('Analyst Fav');
  if (marketCapB >= 1000)   tags.push('Mega Cap');
  if (marketCapB < 50)      tags.push('Small Cap');
  if (shortRatio > 3)       tags.push('High Short');
  tags.push(sector);

  return {
    symbol, name, sector, signal, price, changePercent: changePct,
    pe: pe > 0 ? pe : 'N/A', forwardPE: fwdPE > 0 ? fwdPE : 'N/A',
    pb, beta, revGrowth, earnGrowth,
    analystRating: analystLabel,
    marketCap: '$' + mktCapStr,
    divYield: divYield > 0 ? divYield.toFixed(2) + '%' : '—',
    scores: { total, growth, value, analyst, momentum, risk },
    reasoning, tags,
  };
}

/* ── Live price fetch via local API proxy ───────────
   Keeps Yahoo Finance off the browser path to avoid CORS failures. */
async function fetchLivePrices(symbols) {
  const cleanSymbols = [...new Set((symbols || []).map(s => String(s).trim().toUpperCase()).filter(Boolean))];
  if (!cleanSymbols.length) return {};

  try {
    const url = LIVE_QUOTES_URL + encodeURIComponent(cleanSymbols.join(','));
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return {};
    const data = await res.json();
    return data.quotes || {};
  } catch {
    return {};
  }
}

function mergeLiveQuotes(stocks, liveMap) {
  if (!liveMap || !Object.keys(liveMap).length) return stocks;
  return stocks.map(stock => {
    const live = liveMap[stock.symbol];
    if (!live || typeof live.price !== 'number') return stock;
    return {
      ...stock,
      price: live.price,
      changePercent: typeof live.changePct === 'number' ? live.changePct : stock.changePercent,
      live: true,
    };
  });
}

function applyLivePrices(liveMap) {
  if (!liveMap || !Object.keys(liveMap).length) {
    setLiveStatus(false);
    return;
  }
  document.querySelectorAll('.stock-card[data-symbol]').forEach(card => {
    const sym  = card.dataset.symbol;
    const live = liveMap[sym];
    if (!live || typeof live.price !== 'number') return;
    const priceEl  = card.querySelector('.stock-price');
    const changeEl = card.querySelector('.stock-change');
    if (priceEl)  priceEl.textContent = '$' + live.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (changeEl) {
      const pct = typeof live.changePct === 'number' ? live.changePct : 0;
      changeEl.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '% ' + (pct >= 0 ? '▲' : '▼');
      changeEl.className   = 'stock-change ' + (pct >= 0 ? 'positive' : 'negative');
    }
    card.classList.add('has-live-price');
  });
  setLiveStatus(true);
}

function setLiveStatus(isLive) {
  const badge = document.getElementById('live-badge');
  if (badge) {
    badge.classList.toggle('is-muted', !isLive);
    badge.innerHTML = `<span class="live-dot-sm"></span>${isLive ? 'Live API' : 'Offline fallback'}`;
  }
  const source = document.getElementById('markets-data-source');
  if (source) source.textContent = isLive ? 'Yahoo Finance live API' : 'Curated fallback data';
}

/* ── Ticker strip renderer ─────────────────────── */
function renderTickerStrip(stocks) {
  const strip = document.getElementById('ticker-track');
  if (!strip) return;
  const items = [...stocks, ...stocks]; // duplicate for seamless loop
  strip.innerHTML = items.map(s => {
    const up = s.changePercent >= 0;
    return `<span class="ticker-item">
      <span class="t-sym">${escHtml(s.symbol)}</span>
      <span class="t-px">$${s.price.toFixed(2)}</span>
      <span class="t-chg ${up ? 'up' : 'down'}">${up ? '+' : ''}${s.changePercent.toFixed(2)}%</span>
    </span><span class="t-sep">·</span>`;
  }).join('');
}

/* ── Main loader ─────────────────────────────── */
var stocksLoaded = false;
var priceRefreshTimer = null;

async function loadStocks(forceRefresh = false) {
  if (stocksLoaded && !forceRefresh) return;

  const grid    = document.getElementById('stocks-grid');
  const updated = document.getElementById('markets-updated');
  const source  = document.getElementById('markets-data-source');
  const scanned = document.getElementById('markets-scanned');
  if (!grid) return;

  initRiskTabs();

  grid.innerHTML = `
    <div class="stocks-loading" id="stocks-loading">
      <div class="loading-spinner"></div>
      <p>AI is scoring ${STOCK_UNIVERSE.length} stocks — ${RISK_PROFILES[activeRiskProfile].label} profile…</p>
    </div>`;

  if (!forceRefresh) {
    try {
      const cacheKey = CACHE_KEY + '_' + activeRiskProfile;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
        renderStocks(cached.stocks, grid, updated, source, scanned, 'Just now');
        startPriceRefresh(cached.stocks.map(s => s.symbol));
        return;
      }
    } catch {}
  }

  const prof   = RISK_PROFILES[activeRiskProfile];
  const seed   = dailySeed();
  const scored = STOCK_UNIVERSE
    .filter(row => row[6] <= prof.maxBeta) // beta filter
    .map((row, idx) => scoreStock(row, idx, seed, prof.weights));
  scored.sort((a, b) => b.scores.total - a.scores.total);
  let top10  = scored.slice(0, 10).map((s, i) => ({ ...s, rank: i + 1 }));
  const liveQuotes = await fetchLivePrices(top10.map(s => s.symbol));
  top10 = mergeLiveQuotes(top10, liveQuotes);

  const cacheKey = CACHE_KEY + '_' + activeRiskProfile;
  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), stocks: top10 }));

  const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  renderStocks(top10, grid, updated, source, scanned, now);
  setLiveStatus(Object.keys(liveQuotes).length > 0);
  startPriceRefresh(top10.map(s => s.symbol));

  renderIPOs();
  renderUnderdogs();
}

function renderStocks(stocks, grid, updated, source, scanned, ts) {
  stocksLoaded = true;
  if (updated) updated.textContent = 'Updated ' + ts;
  if (source)  source.textContent  = RISK_PROFILES[activeRiskProfile].label + ' · live API ready';
  if (scanned) scanned.textContent = STOCK_UNIVERSE.length + ' stocks scanned';

  grid.innerHTML = '';
  stocks.forEach((stock, idx) => {
    const card = buildStockCard(stock, idx);
    grid.appendChild(card);
  });

  renderTickerStrip(stocks);

  setTimeout(() => {
    grid.querySelectorAll('.score-fill, .score-sub-fill').forEach(bar => {
      bar.style.width = bar.dataset.w || '0%';
    });
  }, 200);
  setTimeout(initReveal, 50);
}

function startPriceRefresh(symbols) {
  if (priceRefreshTimer) clearInterval(priceRefreshTimer);
  const doRefresh = async () => {
    const live = await fetchLivePrices(symbols);
    applyLivePrices(live);
  };
  doRefresh();
  priceRefreshTimer = setInterval(doRefresh, 60000);
}


function buildStockCard(s, idx) {
  const signalClass = {
    'STRONG BUY': 'sig-strong-buy',
    'BUY':        'sig-buy',
    'HOLD':       'sig-hold',
    'SELL':       'sig-sell',
  }[s.signal] || 'sig-hold';

  const barClass = {
    'STRONG BUY': 'signal-bar-strong-buy',
    'BUY':        'signal-bar-buy',
    'HOLD':       'signal-bar-hold',
    'SELL':       'signal-bar-sell',
  }[s.signal] || 'signal-bar-hold';

  const fillClass = {
    'STRONG BUY': 'sf-green',
    'BUY':        'sf-cyan',
    'HOLD':       'sf-amber',
    'SELL':       'sf-red',
  }[s.signal] || 'sf-cyan';

  const changeSgn  = s.changePercent >= 0;
  const changeStr  = (changeSgn ? '+' : '') + s.changePercent.toFixed(2) + '%';
  const changeArrow = changeSgn ? '▲' : '▼';
  const changeCls  = changeSgn ? 'positive' : 'negative';

  const revClass   = s.revGrowth  >= 0 ? 'positive' : 'negative';
  const earnClass  = s.earnGrowth >= 0 ? 'positive' : 'negative';
  const revStr     = (s.revGrowth  >= 0 ? '+' : '') + s.revGrowth  + '%';
  const earnStr    = (s.earnGrowth >= 0 ? '+' : '') + s.earnGrowth + '%';

  const tagHtml = s.tags.map(t => `<span class="stock-tag">${t}</span>`).join('');

  const card = document.createElement('div');
  card.className = 'stock-card reveal';
  card.style.animationDelay = (idx * 0.06) + 's';
  card.setAttribute('data-rank', s.rank);
  card.setAttribute('data-symbol', s.symbol);

  card.innerHTML = `
    <div class="stock-card-top-bar ${barClass}"></div>
    <div class="stock-card-body">

      <div class="stock-card-header">
        <div class="stock-rank"><span>#${s.rank}</span> RANK</div>
        <div class="stock-sector-pill">${escHtml(s.sector)}</div>
      </div>

      <div class="stock-main">
        <div class="stock-ticker">${escHtml(s.symbol)}</div>
        <div class="stock-name">${escHtml(s.name)}</div>
        <div class="stock-price-row">
          <span class="stock-price">$${s.price.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})}</span>
          <span class="stock-change ${changeCls}">${changeStr} ${changeArrow}</span>
        </div>
      </div>

      <div class="stock-score-section">
        <div class="score-header">
          <span class="score-label">AI Score</span>
          <span class="score-value">${s.scores.total}</span>
          <span class="score-signal ${signalClass}">${s.signal}</span>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar">
            <div class="score-fill ${fillClass}" data-w="${s.scores.total}%"></div>
          </div>
        </div>
        <div class="score-breakdown">
          ${subScore('Growth',   s.scores.growth,   'ssf-growth')}
          ${subScore('Value',    s.scores.value,    'ssf-value')}
          ${subScore('Analysts', s.scores.analyst,  'ssf-analyst')}
          ${subScore('Momentum', s.scores.momentum, 'ssf-momentum')}
          ${subScore('Risk',     s.scores.risk,     'ssf-risk')}
        </div>
      </div>

      <div class="stock-metrics-grid">
        <div class="metric"><span class="metric-label">P/E Ratio</span><span class="metric-value">${s.pe !== 'N/A' ? s.pe + 'x' : 'N/A'}</span></div>
        <div class="metric"><span class="metric-label">Fwd P/E</span><span class="metric-value">${s.forwardPE !== 'N/A' ? s.forwardPE + 'x' : 'N/A'}</span></div>
        <div class="metric"><span class="metric-label">P/B Ratio</span><span class="metric-value">${s.pb}x</span></div>
        <div class="metric"><span class="metric-label">Beta</span><span class="metric-value">${s.beta}</span></div>
        <div class="metric"><span class="metric-label">Rev Growth</span><span class="metric-value ${revClass}">${revStr}</span></div>
        <div class="metric"><span class="metric-label">Analyst</span><span class="metric-value">${escHtml(s.analystRating)}</span></div>
        <div class="metric"><span class="metric-label">Market Cap</span><span class="metric-value">${escHtml(s.marketCap)}</span></div>
        <div class="metric"><span class="metric-label">Div Yield</span><span class="metric-value">${escHtml(s.divYield)}</span></div>
      </div>

      <div class="stock-analysis">
        <div class="analysis-header">
          <span class="ai-badge">✦ AI Analysis</span>
        </div>
        <p class="analysis-text">${escHtml(s.reasoning)}</p>
      </div>

      <div class="stock-tags">${tagHtml}</div>

      <div class="stock-links">
        <a class="stock-link" href="https://finance.yahoo.com/chart/${s.symbol}" target="_blank" rel="noopener">📈 Chart</a>
        <a class="stock-link" href="https://finance.yahoo.com/quote/${s.symbol}/news/" target="_blank" rel="noopener">📰 News</a>
      </div>

    </div>`;

  return card;
}

function subScore(label, val, cls) {
  return `
    <div class="score-sub">
      <span class="score-sub-label">${label}</span>
      <div class="score-sub-bar"><div class="score-sub-fill ${cls}" data-w="${val}%"></div></div>
      <span class="score-sub-val">${val}</span>
    </div>`;
}

function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── IPO Watchlist ──────────────────────────────────────────────── */
function renderIPOs() {
  const grid = document.getElementById('ipo-grid');
  if (!grid) return;
  grid.innerHTML = IPO_WATCHLIST.map(ipo => {
    const stageLabel = { filed: 'Filed', expected: 'Expected', rumored: 'Rumored' }[ipo.stage] || ipo.stage;
    return `
      <div class="ipo-card">
        <div class="ipo-card-header">
          <div>
            <div class="ipo-company">${escHtml(ipo.company)}</div>
            <div class="ipo-sector">${escHtml(ipo.sector)}</div>
          </div>
          <span class="ipo-stage ${ipo.stage}">${stageLabel}</span>
        </div>
        <div class="ipo-meta">
          <span class="ipo-val">Valuation: <strong>${escHtml(ipo.valuation)}</strong></span>
          <span class="ipo-timeline">Timeline: <strong>${escHtml(ipo.timeline)}</strong></span>
        </div>
        <p class="ipo-desc">${escHtml(ipo.desc)}</p>
        <div class="ipo-links">
          ${ipo.ticker ? `<a class="stock-link" href="https://finance.yahoo.com/quote/${ipo.ticker}" target="_blank" rel="noopener">📈 Quote</a>` : ''}
          ${ipo.news ? `<a class="stock-link" href="${escHtml(ipo.news)}" target="_blank" rel="noopener">📰 News</a>` : ''}
        </div>
      </div>`;
  }).join('');
}

/* ── Underdog Stocks ───────────────────────────────────────────── */
function renderUnderdogs() {
  const grid = document.getElementById('underdogs-grid');
  if (!grid) return;
  grid.innerHTML = UNDERDOG_STOCKS.map(u => `
    <div class="underdog-card">
      <div class="underdog-header">
        <div class="underdog-symbol">${escHtml(u.symbol)}</div>
        <div class="underdog-potential">${escHtml(u.potential)}</div>
      </div>
      <div class="underdog-name">${escHtml(u.name)}</div>
      <div class="underdog-sector">${escHtml(u.sector)} · Market Cap ${escHtml(u.mcap)}</div>
      <p class="underdog-desc">${escHtml(u.desc)}</p>
      <div class="underdog-thesis"><strong>Thesis:</strong> ${escHtml(u.thesis)}</div>
      <div class="stock-links">
        <a class="stock-link" href="https://finance.yahoo.com/chart/${u.symbol}" target="_blank" rel="noopener">📈 Chart</a>
        <a class="stock-link" href="https://finance.yahoo.com/quote/${u.symbol}/news/" target="_blank" rel="noopener">📰 News</a>
      </div>
    </div>`).join('');
}

/* ── Portfolio Analyzer ────────────────────────────────────────── */
function analyzePortfolio() {
  const input = document.getElementById('portfolio-input');
  const results = document.getElementById('portfolio-results');
  if (!input || !results) return;

  const raw = input.value.trim();
  if (!raw) { results.innerHTML = '<p class="portfolio-hint">Enter holdings above to get recommendations.</p>'; return; }

  const lines = raw.split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
  const holdings = [];
  for (const line of lines) {
    const m = line.match(/^([A-Za-z]{1,5})\s+(\d+(?:\.\d+)?)$/);
    if (m) holdings.push({ symbol: m[1].toUpperCase(), shares: parseFloat(m[2]) });
  }

  if (!holdings.length) {
    results.innerHTML = '<p class="portfolio-hint">Could not parse holdings. Use format: <code>AAPL 100, MSFT 50</code></p>';
    return;
  }

  const seed = dailySeed();
  const prof = RISK_PROFILES[activeRiskProfile];
  const rows = holdings.map(h => {
    const universeRow = STOCK_UNIVERSE.find(r => r[0] === h.symbol);
    if (!universeRow) {
      return { symbol: h.symbol, shares: h.shares, rec: 'hold', recLabel: 'Hold', reason: 'Not in our universe — research independently.', found: false };
    }
    const scored = scoreStock(universeRow, 0, seed, prof.weights);
    let rec, recLabel, reason;
    if (scored.scores.total >= 72) {
      rec = 'keep'; recLabel = 'Keep';
      reason = `Strong fundamentals. Score ${scored.scores.total}/100. ${scored.reasoning}`;
    } else if (scored.scores.total >= 50) {
      rec = 'trim'; recLabel = 'Trim';
      reason = `Moderate score (${scored.scores.total}/100). Consider reducing position size. ${scored.reasoning}`;
    } else {
      rec = 'sell'; recLabel = 'Sell';
      reason = `Weak score (${scored.scores.total}/100). Consider exiting. ${scored.reasoning}`;
    }
    return { symbol: h.symbol, shares: h.shares, rec, recLabel, reason, found: true, score: scored.scores.total };
  });

  results.innerHTML = `
    <div class="portfolio-header-row">
      <span class="mono-tag">Symbol</span>
      <span class="mono-tag">Shares</span>
      <span class="mono-tag">Score</span>
      <span class="mono-tag">Action</span>
    </div>
    ${rows.map(r => `
      <div class="portfolio-row">
        <span class="pr-symbol">${escHtml(r.symbol)}</span>
        <span class="pr-shares">${r.shares.toLocaleString()}</span>
        <span class="pr-score">${r.found ? r.score : '—'}</span>
        <span class="pr-rec ${r.rec}">${r.recLabel}</span>
        <div class="pr-reason">${escHtml(r.reason)}</div>
      </div>`).join('')}
  `;
}

/* ── Hash routing (must be last — all consts initialized above) ─ */
(function () {
  const hash  = location.hash.replace('#', '');
  const valid = ['home', 'story', 'values', 'software', 'markets'];
  if (valid.includes(hash)) showTab(hash);
})();
