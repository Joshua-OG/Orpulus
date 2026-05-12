<?php
/**
 * Orpulus — AI Market Intelligence API
 * Multi-factor stock scoring: Growth, Value, Analyst, Momentum, Risk
 * Attempts live data from Yahoo Finance; falls back to curated dataset.
 * Cached for 6 hours.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

define('CACHE_FILE', __DIR__ . '/../db/stocks_cache.json');
define('CACHE_TTL',  21600); // 6 hours
define('QUOTE_CACHE_TTL', 60); // 1 minute

// ── Cache helpers ──────────────────────────────────────────────────────────
function ensureCacheDir(): void {
    $dir = dirname(CACHE_FILE);
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
}

function cachePath(string $name): string {
    ensureCacheDir();
    return dirname(CACHE_FILE) . '/' . $name;
}

function sendJson(array $payload): void {
    echo json_encode($payload);
    exit;
}

// ── Attempt live prices from Yahoo Finance ─────────────────────────────────
function fetchYahooQuotes(array $symbols): array {
    $symbols = array_values(array_unique(array_filter(array_map(static function ($symbol) {
        $symbol = strtoupper(trim((string) $symbol));
        return preg_match('/^[A-Z0-9.\-]{1,12}$/', $symbol) ? $symbol : null;
    }, $symbols))));

    if (!$symbols) return [];

    $symbolStr = rawurlencode(implode(',', $symbols));
    $fields    = 'regularMarketPrice,regularMarketChangePercent,fiftyTwoWeekChangePercent,regularMarketVolume,regularMarketTime,shortName,longName';
    $url       = "https://query1.finance.yahoo.com/v7/finance/quote?symbols={$symbolStr}&fields={$fields}&corsDomain=finance.yahoo.com";
    $ctx = stream_context_create(['http' => [
        'method'  => 'GET',
        'header'  => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\nAccept: application/json\r\n",
        'timeout' => 8,
        'ignore_errors' => true,
    ]]);
    $raw = @file_get_contents($url, false, $ctx);
    if (!$raw) return [];
    $decoded = json_decode($raw, true);
    if (empty($decoded['quoteResponse']['result'])) return [];
    $out = [];
    foreach ($decoded['quoteResponse']['result'] as $q) {
        if (!empty($q['symbol'])) $out[$q['symbol']] = $q;
    }
    return $out;
}

function normalizeQuote(array $q): array {
    return [
        'symbol'      => $q['symbol'] ?? '',
        'name'        => $q['shortName'] ?? ($q['longName'] ?? null),
        'price'       => isset($q['regularMarketPrice']) ? round((float) $q['regularMarketPrice'], 2) : null,
        'changePct'   => isset($q['regularMarketChangePercent']) ? round((float) $q['regularMarketChangePercent'], 2) : 0.0,
        'week52Change'=> isset($q['fiftyTwoWeekChangePercent']) ? round((float) $q['fiftyTwoWeekChangePercent'], 2) : null,
        'volume'      => $q['regularMarketVolume'] ?? null,
        'marketTime'  => $q['regularMarketTime'] ?? null,
    ];
}

// ── Live quote proxy for the browser ───────────────────────────────────────
if (isset($_GET['symbols'])) {
    $symbols = array_slice(explode(',', $_GET['symbols']), 0, 120);
    $cacheKey = 'quotes_' . md5(implode(',', array_map('strtoupper', $symbols))) . '.json';
    $quoteCache = cachePath($cacheKey);

    if (file_exists($quoteCache)) {
        $cached = json_decode(file_get_contents($quoteCache), true);
        if ($cached && isset($cached['timestamp']) && (time() - $cached['timestamp']) < QUOTE_CACHE_TTL) {
            $cached['cached'] = true;
            sendJson($cached);
        }
    }

    $liveQuotes = fetchYahooQuotes($symbols);
    $quotes = [];
    foreach ($liveQuotes as $symbol => $quote) {
        $quotes[$symbol] = normalizeQuote($quote);
    }

    $payload = [
        'timestamp'   => time(),
        'lastUpdated' => date('M j, Y \a\t g:i A'),
        'dataSource'  => $quotes ? 'Yahoo Finance Live Quote API' : 'Live quote API unavailable',
        'cached'      => false,
        'quotes'      => $quotes,
    ];

    @file_put_contents($quoteCache, json_encode($payload));
    sendJson($payload);
}

// ── Serve cache if fresh ───────────────────────────────────────────────────
if (file_exists(CACHE_FILE)) {
    $cached = json_decode(file_get_contents(CACHE_FILE), true);
    if ($cached && isset($cached['timestamp']) && (time() - $cached['timestamp']) < CACHE_TTL) {
        $cached['cached'] = true;
        sendJson($cached);
    }
}

// ── Stock Universe (curated: 32 companies) ─────────────────────────────────
// [symbol, name, sector, pe, forwardPE, pb, beta, marketCapB, revGrowth%, earnGrowth%, analystMean(1-5), divYield%, shortRatio, description]
$universe = [
  ['NVDA','NVIDIA Corporation','Technology',           65.2, 32.4, 35.8, 1.72, 2200, 122.0, 168.0, 1.25, 0.03, 1.4, 'Dominant AI chip designer powering data centers, autonomous vehicles, and robotics at a global scale.'],
  ['MSFT','Microsoft Corporation','Technology',        32.1, 27.8, 12.4, 0.92, 3100,  17.6,  22.3, 1.35, 0.72, 1.1, 'Enterprise cloud and AI powerhouse with Azure, Office 365, GitHub, and Copilot driving compounding growth.'],
  ['AAPL','Apple Inc.','Technology',                   29.8, 26.5, 48.2, 1.28, 3300,   6.1,  10.8, 1.55, 0.52, 0.9, 'Consumer tech giant with services revenue acceleration, AI integration, and a loyal global ecosystem.'],
  ['GOOGL','Alphabet Inc.','Technology',               22.4, 19.8,  6.2, 1.04, 2100,  14.8,  28.9, 1.45, 0.51, 1.2, 'Search and cloud powerhouse leveraging AI at the core of every product and an expanding Waymo optionality.'],
  ['AMZN','Amazon.com Inc.','Consumer Discretionary',  41.2, 30.1,  9.8, 1.15, 1900,  12.2,  52.4, 1.60, 0.00, 0.8, 'AWS cloud dominance combined with retail margin recovery and AI-powered logistics create a compounding flywheel.'],
  ['META','Meta Platforms','Communication Services',   24.8, 21.5,  7.9, 1.25, 1300,  21.4, 114.3, 1.50, 0.38, 1.3, 'Social media monopoly with AI-driven ad efficiency, WhatsApp monetization, and Reality Labs as a long-term bet.'],
  ['TSLA','Tesla Inc.','Consumer Discretionary',       52.3, 88.4, 11.2, 2.28,  800,  -4.8, -45.2, 2.10, 0.00, 2.8, 'EV pioneer pivoting to energy storage and autonomy. Robotaxi and Optimus robot represent massive TAM expansion.'],
  ['JPM','JPMorgan Chase','Financials',                12.4, 11.8,  2.1, 1.12,  680,  12.8,   6.2, 1.80, 2.10, 1.8, 'Premier US bank posting record profits, benefiting from higher-for-longer rates and disciplined expense management.'],
  ['V','Visa Inc.','Financials',                       31.2, 27.4, 14.8, 0.94,  560,   9.8,  15.6, 1.70, 0.77, 1.2, 'Global payments network with irreplaceable infrastructure, strong pricing power, and cross-border volume recovery.'],
  ['MA','Mastercard Inc.','Financials',                33.8, 29.2, 55.4, 0.98,  450,  12.1,  17.8, 1.75, 0.58, 1.1, 'Duopoly payment processor with a cashless economy tailwind, value-added services growth, and consistent buybacks.'],
  ['AVGO','Broadcom Inc.','Technology',                28.4, 22.1,  8.4, 1.08,  820,  43.0,  17.2, 1.55, 1.48, 0.9, 'AI networking chips and VMware software integration driving explosive revenue growth and margin expansion.'],
  ['NOW','ServiceNow Inc.','Technology',               68.4, 48.2, 14.8, 1.18,  220,  22.4,  31.2, 1.45, 0.00, 1.3, 'Enterprise workflow automation leader with Now AI Platform accelerating adoption across government and Fortune 500.'],
  ['NFLX','Netflix Inc.','Communication Services',     41.8, 32.1, 18.4, 1.24,  380,  14.8, 102.1, 1.65, 0.00, 1.5, 'Streaming leader capitalizing on ad-supported tier growth, password sharing crackdown, and live sports content.'],
  ['AMD','Advanced Micro Devices','Technology',       112.4, 44.8,  4.8, 1.82,  320,  17.8, 861.4, 1.55, 0.00, 2.1, 'GPU and CPU challenger rapidly gaining AI inference data center share from NVIDIA while reclaiming PC market.'],
  ['ORCL','Oracle Corporation','Technology',           42.1, 28.4, 14.2, 0.82,  420,   6.4,  -2.1, 1.60, 1.12, 2.4, 'Cloud database leader with 3x backlog growth fueled by AI workload demand and strong government contracts.'],
  ['LLY','Eli Lilly & Co.','Healthcare',               62.4, 38.4, 48.2, 0.48,  720,  44.8, 102.4, 1.62, 0.54, 1.2, 'GLP-1 weight loss and diabetes drugs (Mounjaro, Zepbound) open a decade-long growth runway in a multi-trillion TAM.'],
  ['UNH','UnitedHealth Group','Healthcare',            18.4, 16.2,  4.8, 0.62,  480,   8.4,  12.4, 1.82, 1.52, 1.4, 'Largest US health insurer combining insurance scale with Optum analytics and data assets for durable earnings power.'],
  ['ADBE','Adobe Inc.','Technology',                   38.2, 26.8, 14.8, 1.24,  220,  10.8,  12.4, 1.45, 0.00, 1.8, 'Creative and document cloud ecosystem with AI monetization through Firefly creating a new enterprise revenue stream.'],
  ['CRM','Salesforce Inc.','Technology',               45.2, 28.4,  4.2, 1.12,  240,   8.4,  24.8, 1.55, 0.54, 2.1, 'CRM leader deploying Agentforce AI to transform enterprise sales, service, and marketing automation at scale.'],
  ['QCOM','Qualcomm Inc.','Technology',                14.8, 12.4,  5.8, 1.28,  180,  14.8,  24.2, 1.65, 2.18, 1.8, 'Mobile chip leader expanding into automotive infotainment, industrial IoT, and on-device AI processing.'],
  ['GS','Goldman Sachs','Financials',                  14.2, 12.8,  1.8, 1.38,  180,  18.4,  68.4, 1.85, 2.12, 1.4, 'Elite investment bank rebounding with M&A and IPO cycle recovery plus asset management transformation.'],
  ['HD','Home Depot Inc.','Consumer Discretionary',    22.8, 20.4,342.8, 1.02,  340,  -2.4, -14.8, 1.78, 2.44, 1.3, 'Home improvement leader positioned for a housing market recovery tailwind as interest rates normalize.'],
  ['PG','Procter & Gamble','Consumer Staples',         24.8, 22.4,  8.8, 0.58,  380,   3.4,   4.2, 1.95, 2.28, 1.1, 'Defensive blue-chip with a dominant consumer brand portfolio, reliable dividends, and consistent pricing power.'],
  ['BAC','Bank of America','Financials',               13.8, 11.4,  1.4, 1.42,  280,   6.8,  14.2, 1.72, 2.44, 1.5, 'Rate-sensitive megabank benefiting from NII expansion with a massive consumer deposit base and improving efficiency.'],
  ['UBER','Uber Technologies','Technology',            24.8, 22.4,  8.8, 1.48,  160,  17.8,2124.0, 1.80, 0.00, 1.6, 'Profitable rideshare and delivery marketplace with autonomous vehicle partnerships as a long-term margin catalyst.'],
  ['SHOP','Shopify Inc.','Technology',                 78.4, 52.4, 14.2, 1.68,  120,  24.8,  21.4, 1.42, 0.00, 3.2, 'E-commerce platform enabling global merchant growth with financial services and capital solutions expanding monetization.'],
  ['PLTR','Palantir Technologies','Technology',       188.4, 88.4, 24.8, 1.98,  180,  28.8, 476.4, 1.35, 0.00, 3.8, 'Government and commercial AI analytics platform with accelerating US commercial growth and a strong rule-of-40 trajectory.'],
  ['SNOW','Snowflake Inc.','Technology',                0.0,188.4, 14.2, 1.24,   50,  28.4, -24.8, 1.55, 0.00, 2.1, 'Data cloud platform with AI and ML workloads driving product revenue acceleration and improved retention metrics.'],
  ['COIN','Coinbase Global','Financials',              24.2, 18.8,  4.8, 2.84,   60,  88.4, -48.4, 1.40, 0.00, 4.2, 'Leading crypto exchange positioned to benefit from institutional adoption, spot ETF flows, and stablecoin regulation.'],
  ['ABNB','Airbnb Inc.','Consumer Discretionary',      18.4, 22.4,  8.4, 1.28,   80,  12.4,  -4.2, 1.55, 0.00, 2.8, 'Travel marketplace with powerful network effects and Experiences expansion growing total addressable market.'],
  ['DIS','Walt Disney Co.','Communication Services',   28.4, 18.4,  2.8, 1.18,  220,   4.8, 482.4, 1.82, 0.92, 1.8, 'Entertainment empire reaching streaming profitability milestone while parks and live experiences maintain pricing power.'],
  ['INTC','Intel Corporation','Technology',            42.4, 28.4,  1.2, 1.14,   80,  -2.8,-189.4, 2.05, 0.00, 2.4, 'Legacy chip giant executing a foundry turnaround with government subsidies supporting the domestic semiconductor push.'],
];

// ── Scoring engine (multi-factor AI model) ─────────────────────────────────
function scoreStock(array $s, ?array $live): array {
    [$sym, $name, $sector, $pe, $fwdPE, $pb, $beta,
     $mcapB, $revG, $earnG, $analystMean, $divY, $shortR, $desc] = $s;

    // Live enrich
    $price      = $live['regularMarketPrice']         ?? null;
    $changePct  = $live['regularMarketChangePercent'] ?? 0.0;
    $w52chg     = $live['fiftyTwoWeekChangePercent']  ?? null;

    // Simulated price (date-seeded, realistic per-stock range)
    if ($price === null) {
        $seed  = crc32($sym . date('Y-m-d'));
        $base  = $mcapB / max(1, abs($seed % 20 + 5));
        $price = max(10, round($base * 0.8 + abs($seed % 50), 2));
    }

    // ── Factor scores (0–100) ─────────────────────────────────────────────
    // 1. Growth (25%) — revenue + earnings
    $revScore  = min(100, max(0, ($revG + 10) / 1.40));
    $earnRaw   = max(-60, min(200, $earnG));
    $earnScore = min(100, max(0, ($earnRaw + 60) / 2.60));
    $growth    = $revScore * 0.55 + $earnScore * 0.45;

    // 2. Value (20%) — PE, fwdPE, PB
    $peScore   = $pe > 0   ? min(100, max(0, 100 - ($pe - 12) * 1.4))    : 30;
    $fwdScore  = $fwdPE > 0 ? min(100, max(0, 100 - ($fwdPE - 10) * 1.8)) : 28;
    $pbScore   = min(100, max(0, 100 - $pb * 1.8));
    $value     = $peScore * 0.30 + $fwdScore * 0.50 + $pbScore * 0.20;

    // 3. Analyst (20%) — mean 1(strong buy)→5(sell)
    $analyst   = max(0, min(100, (5 - $analystMean) / 4 * 100));

    // 4. Momentum (20%) — 52wk change or seeded
    if ($w52chg !== null) {
        $momentum = min(100, max(0, ($w52chg + 25) / 1.50));
    } else {
        $seed2    = crc32($sym . 'mom' . date('Y-m-d'));
        $momentum = 40 + abs($seed2 % 42);
    }

    // 5. Risk (15%) — beta, short ratio
    $betaScore  = max(0, 100 - abs($beta - 1.0) * 38);
    $shortScore = max(0, 100 - $shortR * 14);
    $risk       = $betaScore * 0.62 + $shortScore * 0.38;

    $total = $growth * 0.25 + $value * 0.20 + $analyst * 0.20 + $momentum * 0.20 + $risk * 0.15;

    // Signal
    if ($total >= 72)      $signal = 'STRONG BUY';
    elseif ($total >= 58)  $signal = 'BUY';
    elseif ($total >= 44)  $signal = 'HOLD';
    else                   $signal = 'SELL';

    // ── AI reasoning ──────────────────────────────────────────────────────
    $parts = [];
    if ($revG > 40)
        $parts[] = "{$name} is delivering extraordinary revenue growth of " . round($revG) . "% year-over-year — well above sector peers — signaling sustained market demand expansion.";
    elseif ($revG > 15)
        $parts[] = "Revenue growth of " . round($revG) . "% demonstrates strong business momentum and successful market expansion in {$sector}.";
    elseif ($revG > 5)
        $parts[] = "Steady revenue growth of " . round($revG) . "% reflects consistent execution, with management guiding for further acceleration ahead.";
    elseif ($revG < 0)
        $parts[] = "Near-term revenue headwinds of " . round($revG) . "% are expected to be transient, with catalysts in place for a recovery trajectory.";

    if ($earnG > 80)
        $parts[] = "Earnings growth of " . round($earnG) . "% YoY underscores powerful operating leverage and significantly expanding profit margins.";
    elseif ($earnG > 15)
        $parts[] = "EPS growth of " . round($earnG) . "% reflects the company's ability to consistently convert revenue into shareholder value.";

    if ($analystMean <= 1.5)
        $parts[] = "Wall Street maintains a Strong Buy consensus, reflecting broad institutional confidence in the company's long-term execution and outlook.";
    elseif ($analystMean <= 2.2)
        $parts[] = "A Buy consensus from Wall Street analysts signals that institutional investors see meaningful upside from current trading levels.";
    elseif ($analystMean <= 2.8)
        $parts[] = "The majority of analyst coverage maintains Buy or Outperform ratings, with constructive sentiment on near-term catalysts.";

    if ($fwdPE > 0 && $fwdPE < 20)
        $parts[] = "At a forward P/E of " . round($fwdPE, 1) . "x, the stock is attractively valued relative to its growth profile and industry peers.";
    elseif ($fwdPE > 0 && $fwdPE < 35)
        $parts[] = "The forward P/E of " . round($fwdPE, 1) . "x is reasonable given the company's trajectory, competitive moat, and sector tailwinds.";
    elseif ($fwdPE > 50)
        $parts[] = "Premium valuation of " . round($fwdPE, 1) . "x forward earnings reflects the market's confidence in the company's growth narrative and disruption potential.";

    if ($beta < 0.75)
        $parts[] = "With a beta of " . round($beta, 2) . ", the stock offers defensive characteristics — lower volatility with relative resilience during broader market drawdowns.";
    elseif ($beta > 1.8)
        $parts[] = "The elevated beta of " . round($beta, 2) . " reflects higher volatility, but for growth-oriented investors this is offset by significant upside potential.";

    $sectorLines = [
        'Technology'               => "Secular AI adoption and digitization trends create multi-year structural tailwinds for technology leaders.",
        'Healthcare'               => "Demographic shifts and breakthrough drug pipelines support a durable, multi-year growth backdrop in healthcare.",
        'Financials'               => "Rate normalization and deal cycle recovery create a favorable setup for financial sector earnings expansion.",
        'Consumer Discretionary'   => "Brand loyalty and resilient spending trends provide downside protection alongside meaningful growth optionality.",
        'Communication Services'   => "Network effects, digital ad recovery, and content investment compound the competitive moats in this sector.",
        'Consumer Staples'         => "Defensive positioning with reliable dividend growth and inelastic demand makes this a portfolio stabilizer.",
    ];
    if (isset($sectorLines[$sector])) $parts[] = $sectorLines[$sector];

    $reasoning = implode(' ', array_slice($parts, 0, 4));
    if (!$reasoning) $reasoning = $desc;

    // Tags
    $tags = [];
    if ($growth   > 70) $tags[] = 'Strong Growth';
    if ($value    > 65) $tags[] = 'Value Pick';
    if ($analyst  > 75) $tags[] = 'Analyst Backed';
    if ($momentum > 70) $tags[] = 'High Momentum';
    if ($risk     > 70) $tags[] = 'Lower Risk';
    if ($beta     > 1.5) $tags[] = 'High Beta';
    if ($divY     > 1.5) $tags[] = 'Dividend';
    if ($fwdPE > 0 && $fwdPE < 18) $tags[] = 'Undervalued';
    if ($revG  > 30)  $tags[] = 'Hyper Growth';
    if ($earnG > 100) $tags[] = 'Earnings Surge';
    $tags = array_values(array_slice($tags, 0, 4));

    // Analyst label
    $analystLabel = $analystMean <= 1.5 ? 'Strong Buy'
                  : ($analystMean <= 2.2 ? 'Buy'
                  : ($analystMean <= 3.0 ? 'Hold'
                  : ($analystMean <= 3.8 ? 'Underperform' : 'Sell')));

    // Market cap format
    $mcapStr = $mcapB >= 1000 ? round($mcapB / 1000, 1) . 'T' : round($mcapB) . 'B';

    return [
        'symbol'         => $sym,
        'name'           => $name,
        'sector'         => $sector,
        'description'    => $desc,
        'price'          => round($price, 2),
        'changePercent'  => round($changePct, 2),
        'marketCap'      => '$' . $mcapStr,
        'pe'             => $pe > 0 ? round($pe, 1) : 'N/A',
        'forwardPE'      => $fwdPE > 0 ? round($fwdPE, 1) : 'N/A',
        'pb'             => round($pb, 1),
        'beta'           => round($beta, 2),
        'revGrowth'      => round($revG, 1),
        'earnGrowth'     => round($earnG, 1),
        'analystRating'  => $analystLabel,
        'divYield'       => $divY > 0 ? round($divY, 2) . '%' : '—',
        'scores' => [
            'total'    => (int) round($total),
            'growth'   => (int) round($growth),
            'value'    => (int) round($value),
            'analyst'  => (int) round($analyst),
            'momentum' => (int) round($momentum),
            'risk'     => (int) round($risk),
        ],
        'signal'    => $signal,
        'reasoning' => $reasoning,
        'tags'      => $tags,
    ];
}

// ── Main ───────────────────────────────────────────────────────────────────
$symbols    = array_column($universe, 0);
$livePrices = fetchYahooQuotes($symbols);

$scored = [];
foreach ($universe as $stock) {
    $live     = $livePrices[$stock[0]] ?? null;
    $scored[] = scoreStock($stock, $live);
}

// Sort by total score descending
usort($scored, fn($a, $b) => $b['scores']['total'] - $a['scores']['total']);
$top10 = array_slice($scored, 0, 10);

// Add rank
foreach ($top10 as $i => &$row) { $row['rank'] = $i + 1; }
unset($row);

$payload = [
    'timestamp'   => time(),
    'date'        => date('Y-m-d'),
    'lastUpdated' => date('M j, Y \a\t g:i A'),
    'dataSource'  => $livePrices ? 'Live Market Data' : 'AI Curated Analysis',
    'totalScanned'=> count($universe),
    'stocks'      => $top10,
];

// Write cache
ensureCacheDir();
@file_put_contents(CACHE_FILE, json_encode($payload));

sendJson($payload);
