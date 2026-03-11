/* ═══════════════════════════════════════════════════
   Streaming Analytics Dashboard — Client Logic
   Simulated API responses with mock JSON data
   ═══════════════════════════════════════════════════ */

// ── Chart.js Global Defaults ──
Chart.defaults.color = '#9399b2';
Chart.defaults.borderColor = 'rgba(42,45,62,.6)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.display = false;
Chart.defaults.animation.duration = 800;
Chart.defaults.animation.easing = 'easeOutQuart';

// ── Color Palette ──
const COLORS = {
    blue: '#7aa2f7', purple: '#bb9af7', green: '#9ece6a',
    orange: '#ff9e64', red: '#f7768e', cyan: '#7dcfff',
    pink: '#f5a0e1', yellow: '#e0af68',
};

function alpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

// ══════════════════════════════════════════════════
//  Mock API Data
// ══════════════════════════════════════════════════
const API = {
    overview: {
        '24h': { users: 12847, videos: 3412, sessions: 48920, events: 312450, trends: { users: '+12.4%', videos: '+3.1%', sessions: '+8.7%', events: '+15.2%' } },
        '7d':  { users: 14230, videos: 3520, sessions: 142800, events: 982100, trends: { users: '+5.8%', videos: '+2.4%', sessions: '+6.1%', events: '+9.3%' } },
        '30d': { users: 15890, videos: 3687, sessions: 589400, events: 4120000, trends: { users: '+18.2%', videos: '+7.9%', sessions: '+22.5%', events: '+31.0%' } },
    },
    trending: {
        '24h': { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], views: [14520, 12340, 9870, 8430, 7210] },
        '7d':  { labels: ['Stranger Things S5', 'Dark Forest', 'The Crown S6', 'Night Sky', 'Code Breaker'], views: [89200, 76400, 72100, 58900, 51200] },
        '30d': { labels: ['Stranger Things S5', 'The Crown S6', 'Night Sky', 'Dark Forest', 'Ocean Deep'], views: [342100, 298700, 267400, 245600, 198300] },
    },
    abandonment: {
        '24h': { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], rates: [0.18, 0.25, 0.42, 0.31, 0.56] },
        '7d':  { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], rates: [0.15, 0.22, 0.38, 0.28, 0.52] },
        '30d': { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], rates: [0.12, 0.20, 0.35, 0.26, 0.48] },
    },
    watchtime: {
        '24h': { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], seconds: [2840, 2310, 1780, 2120, 1240] },
        '7d':  { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], seconds: [2920, 2450, 1890, 2200, 1380] },
        '30d': { labels: ['Stranger Things S5', 'The Crown S6', 'Dark Forest', 'Code Breaker', 'Ocean Deep'], seconds: [3010, 2580, 2020, 2350, 1520] },
    },
    engagement: {
        '24h': [
            { userId: 'USR-4821', sessions: 14, watchTime: '4h 32m', completion: 87, score: 92 },
            { userId: 'USR-1037', sessions: 11, watchTime: '3h 48m', completion: 79, score: 84 },
            { userId: 'USR-7293', sessions: 9,  watchTime: '3h 12m', completion: 72, score: 76 },
            { userId: 'USR-5518', sessions: 8,  watchTime: '2h 55m', completion: 68, score: 71 },
            { userId: 'USR-2046', sessions: 7,  watchTime: '2h 18m', completion: 61, score: 63 },
            { userId: 'USR-8812', sessions: 6,  watchTime: '1h 52m', completion: 54, score: 55 },
            { userId: 'USR-3340', sessions: 5,  watchTime: '1h 30m', completion: 48, score: 47 },
            { userId: 'USR-6671', sessions: 4,  watchTime: '1h 05m', completion: 39, score: 38 },
        ],
        '7d': [
            { userId: 'USR-4821', sessions: 42, watchTime: '14h 12m', completion: 89, score: 94 },
            { userId: 'USR-1037', sessions: 35, watchTime: '11h 35m', completion: 81, score: 86 },
            { userId: 'USR-7293', sessions: 28, watchTime: '9h 48m',  completion: 74, score: 78 },
            { userId: 'USR-5518', sessions: 24, watchTime: '8h 20m',  completion: 70, score: 73 },
            { userId: 'USR-2046', sessions: 21, watchTime: '7h 05m',  completion: 63, score: 65 },
            { userId: 'USR-8812', sessions: 17, watchTime: '5h 42m',  completion: 56, score: 57 },
            { userId: 'USR-3340', sessions: 14, watchTime: '4h 30m',  completion: 50, score: 49 },
            { userId: 'USR-6671', sessions: 10, watchTime: '3h 15m',  completion: 41, score: 40 },
        ],
        '30d': [
            { userId: 'USR-4821', sessions: 128, watchTime: '48h 32m', completion: 91, score: 96 },
            { userId: 'USR-1037', sessions: 104, watchTime: '38h 18m', completion: 83, score: 88 },
            { userId: 'USR-7293', sessions: 87,  watchTime: '31h 05m', completion: 76, score: 80 },
            { userId: 'USR-5518', sessions: 72,  watchTime: '25h 40m', completion: 72, score: 75 },
            { userId: 'USR-2046', sessions: 63,  watchTime: '21h 12m', completion: 65, score: 67 },
            { userId: 'USR-8812', sessions: 51,  watchTime: '17h 38m', completion: 58, score: 59 },
            { userId: 'USR-3340', sessions: 42,  watchTime: '13h 50m', completion: 52, score: 51 },
            { userId: 'USR-6671', sessions: 31,  watchTime: '10h 25m', completion: 43, score: 42 },
        ],
    },
    churn: {
        '24h': [
            { userId: 'USR-9182', lastActivity: '23 hours ago', sessions: 3,  completion: 41, risk: 'High' },
            { userId: 'USR-4456', lastActivity: '18 hours ago', sessions: 4,  completion: 38, risk: 'High' },
            { userId: 'USR-2044', lastActivity: '14 hours ago', sessions: 5,  completion: 63, risk: 'Medium' },
            { userId: 'USR-7731', lastActivity: '10 hours ago', sessions: 7,  completion: 55, risk: 'Medium' },
            { userId: 'USR-8821', lastActivity: '4 hours ago',  sessions: 12, completion: 88, risk: 'Low' },
            { userId: 'USR-1190', lastActivity: '2 hours ago',  sessions: 15, completion: 91, risk: 'Low' },
        ],
        '7d': [
            { userId: 'USR-9182', lastActivity: '6 days ago',  sessions: 3,  completion: 35, risk: 'High' },
            { userId: 'USR-4456', lastActivity: '5 days ago',  sessions: 5,  completion: 42, risk: 'High' },
            { userId: 'USR-6671', lastActivity: '5 days ago',  sessions: 4,  completion: 39, risk: 'High' },
            { userId: 'USR-2044', lastActivity: '3 days ago',  sessions: 8,  completion: 58, risk: 'Medium' },
            { userId: 'USR-7731', lastActivity: '2 days ago',  sessions: 11, completion: 64, risk: 'Medium' },
            { userId: 'USR-8821', lastActivity: '1 day ago',   sessions: 18, completion: 82, risk: 'Low' },
            { userId: 'USR-1190', lastActivity: '12 hours ago', sessions: 22, completion: 89, risk: 'Low' },
        ],
        '30d': [
            { userId: 'USR-9182', lastActivity: '28 days ago', sessions: 3,  completion: 29, risk: 'High' },
            { userId: 'USR-4456', lastActivity: '24 days ago', sessions: 5,  completion: 36, risk: 'High' },
            { userId: 'USR-6671', lastActivity: '21 days ago', sessions: 7,  completion: 40, risk: 'High' },
            { userId: 'USR-3340', lastActivity: '18 days ago', sessions: 10, completion: 48, risk: 'High' },
            { userId: 'USR-2044', lastActivity: '12 days ago', sessions: 14, completion: 61, risk: 'Medium' },
            { userId: 'USR-7731', lastActivity: '8 days ago',  sessions: 19, completion: 67, risk: 'Medium' },
            { userId: 'USR-8821', lastActivity: '4 days ago',  sessions: 26, completion: 85, risk: 'Low' },
            { userId: 'USR-1190', lastActivity: '2 days ago',  sessions: 34, completion: 92, risk: 'Low' },
        ],
    },
};

// ── Filter multipliers (simulate data changes when filters are applied) ──
const FILTER_MULTIPLIERS = {
    device: { all: 1.0, mobile: 0.42, desktop: 0.35, tablet: 0.13, smarttv: 0.10 },
    category: { all: 1.0, drama: 0.30, scifi: 0.25, action: 0.28, documentary: 0.17 },
};

// ── Live Activity Feed pool ──
const LIVE_FEED_POOL = [
    { user: 'USR-8821', action: 'started watching', video: 'Dark Forest', type: 'started' },
    { user: 'USR-2044', action: 'paused', video: 'Code Breaker', type: 'paused' },
    { user: 'USR-9182', action: 'completed', video: 'Ocean Deep', type: 'completed' },
    { user: 'USR-3390', action: 'seeked forward in', video: 'The Crown S6', type: 'seeked' },
    { user: 'USR-4821', action: 'resumed', video: 'Stranger Things S5', type: 'resumed' },
    { user: 'USR-1037', action: 'started watching', video: 'Night Sky', type: 'started' },
    { user: 'USR-7293', action: 'exited', video: 'Dark Forest', type: 'exited' },
    { user: 'USR-5518', action: 'paused', video: 'Ocean Deep', type: 'paused' },
    { user: 'USR-6671', action: 'completed', video: 'Stranger Things S5', type: 'completed' },
    { user: 'USR-2046', action: 'seeked backward in', video: 'Code Breaker', type: 'seeked' },
    { user: 'USR-8812', action: 'started watching', video: 'The Crown S6', type: 'started' },
    { user: 'USR-3340', action: 'resumed', video: 'Night Sky', type: 'resumed' },
    { user: 'USR-4456', action: 'saw ad during', video: 'Dark Forest', type: 'ad' },
    { user: 'USR-1190', action: 'clicked ad in', video: 'Ocean Deep', type: 'ad' },
    { user: 'USR-7731', action: 'completed', video: 'Code Breaker', type: 'completed' },
    { user: 'USR-2288', action: 'started watching', video: 'Stranger Things S5', type: 'started' },
    { user: 'USR-5543', action: 'exited', video: 'The Crown S6', type: 'exited' },
    { user: 'USR-9182', action: 'paused', video: 'Night Sky', type: 'paused' },
];

const FEED_ICONS = {
    started:   '▶',
    paused:    '⏸',
    completed: '✓',
    seeked:    '⏩',
    resumed:   '↺',
    exited:    '✕',
    ad:        '📢',
};

// ══════════════════════════════════════════════════
//  Simulated fetch helper
// ══════════════════════════════════════════════════
function fetchAPI(endpoint, range) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(API[endpoint][range]), 150 + Math.random() * 250);
    });
}

// ── State ──
let currentRange = '24h';
let currentDevice = 'all';
let currentCategory = 'all';
let charts = {};
let feedInterval = null;

// ── Number Formatting ──
function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)    return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
}

// ── Animated Counter ──
function animateValue(element, end, duration = 600) {
    const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const range = end - start;
    const startTime = performance.now();
    function step(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + range * eased);
        element.textContent = formatNum(current);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ── Apply filter multiplier to a number ──
function applyFilters(value) {
    return Math.round(value * FILTER_MULTIPLIERS.device[currentDevice] * FILTER_MULTIPLIERS.category[currentCategory]);
}

// ══════════════════════════════════════════════════
//  Section 1: Platform Overview
// ══════════════════════════════════════════════════
async function loadOverview(range) {
    const data = await fetchAPI('overview', range);
    animateValue(document.getElementById('metric-users'),    applyFilters(data.users));
    animateValue(document.getElementById('metric-videos'),   applyFilters(data.videos));
    animateValue(document.getElementById('metric-sessions'), applyFilters(data.sessions));
    animateValue(document.getElementById('metric-events'),   applyFilters(data.events));
    document.getElementById('trend-users').textContent    = data.trends.users;
    document.getElementById('trend-videos').textContent   = data.trends.videos;
    document.getElementById('trend-sessions').textContent = data.trends.sessions;
    document.getElementById('trend-events').textContent   = data.trends.events;
}

// ══════════════════════════════════════════════════
//  Section 2: Trending Videos Chart
// ══════════════════════════════════════════════════
async function loadTrending(range) {
    const data = await fetchAPI('trending', range);
    const filtered = data.views.map(v => applyFilters(v));
    const gradientColors = [COLORS.blue, COLORS.purple, COLORS.cyan, COLORS.green, COLORS.orange];

    if (charts.trending) {
        charts.trending.data.labels = data.labels;
        charts.trending.data.datasets[0].data = filtered;
        charts.trending.update();
        return;
    }

    const ctx = document.getElementById('trendingChart').getContext('2d');
    charts.trending = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Views', data: filtered,
                backgroundColor: gradientColors.map(c => alpha(c, 0.8)),
                borderColor: gradientColors, borderWidth: 2,
                borderRadius: 8, borderSkipped: false,
            }],
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 2.6,
            plugins: { tooltip: { backgroundColor: '#1c1f2e', titleColor: '#e8eaf0', bodyColor: '#9399b2', borderColor: '#2a2d3e', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: (ctx) => `  ${ctx.parsed.y.toLocaleString()} views` } } },
            scales: { x: { grid: { display: false }, ticks: { font: { weight: 500 } } }, y: { grid: { color: 'rgba(42,45,62,.4)' }, ticks: { callback: (v) => formatNum(v) } } },
        },
    });
}

// ══════════════════════════════════════════════════
//  Section 3: Video Abandonment Rate
// ══════════════════════════════════════════════════
async function loadAbandonment(range) {
    const data = await fetchAPI('abandonment', range);
    const barColors = data.rates.map(r => r > 0.4 ? COLORS.red : r > 0.25 ? COLORS.orange : COLORS.green);

    if (charts.abandonment) {
        charts.abandonment.data.labels = data.labels;
        charts.abandonment.data.datasets[0].data = data.rates.map(r => +(r * 100).toFixed(1));
        charts.abandonment.data.datasets[0].backgroundColor = barColors.map(c => alpha(c, 0.75));
        charts.abandonment.data.datasets[0].borderColor = barColors;
        charts.abandonment.update();
        return;
    }

    const ctx = document.getElementById('abandonmentChart').getContext('2d');
    charts.abandonment = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{ label: 'Abandonment Rate', data: data.rates.map(r => +(r * 100).toFixed(1)), backgroundColor: barColors.map(c => alpha(c, 0.75)), borderColor: barColors, borderWidth: 2, borderRadius: 8, borderSkipped: false }],
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 1.8,
            plugins: { tooltip: { backgroundColor: '#1c1f2e', titleColor: '#e8eaf0', bodyColor: '#9399b2', borderColor: '#2a2d3e', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: (ctx) => `  ${ctx.parsed.y}% abandoned` } } },
            scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { max: 100, grid: { color: 'rgba(42,45,62,.4)' }, ticks: { callback: (v) => v + '%' } } },
        },
    });
}

// ══════════════════════════════════════════════════
//  Section 4: Average Watch Time
// ══════════════════════════════════════════════════
async function loadWatchtime(range) {
    const data = await fetchAPI('watchtime', range);

    if (charts.watchtime) {
        charts.watchtime.data.labels = data.labels;
        charts.watchtime.data.datasets[0].data = data.seconds;
        charts.watchtime.update();
        return;
    }

    const ctx = document.getElementById('watchtimeChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.clientHeight || 300);
    gradient.addColorStop(0, alpha(COLORS.cyan, 0.3));
    gradient.addColorStop(1, alpha(COLORS.cyan, 0.02));

    charts.watchtime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{ label: 'Avg Watch Time', data: data.seconds, borderColor: COLORS.cyan, backgroundColor: gradient, borderWidth: 3, pointBackgroundColor: COLORS.cyan, pointBorderColor: '#1c1f2e', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, fill: true, tension: 0.4 }],
        },
        options: {
            responsive: true, maintainAspectRatio: true, aspectRatio: 1.8,
            plugins: { tooltip: { backgroundColor: '#1c1f2e', titleColor: '#e8eaf0', bodyColor: '#9399b2', borderColor: '#2a2d3e', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: (ctx) => { const m = Math.floor(ctx.parsed.y / 60); const s = ctx.parsed.y % 60; return `  ${m}m ${s}s`; } } } },
            scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: 'rgba(42,45,62,.4)' }, ticks: { callback: (v) => Math.floor(v / 60) + 'm' } } },
        },
    });
}

// ══════════════════════════════════════════════════
//  Section 5: User Engagement Table
// ══════════════════════════════════════════════════
async function loadEngagement(range) {
    const data = await fetchAPI('engagement', range);
    const tbody = document.getElementById('engagement-tbody');
    tbody.innerHTML = data.map(row => {
        const tier = row.score >= 75 ? 'high' : row.score >= 50 ? 'medium' : 'low';
        const bc = row.completion >= 75 ? COLORS.green : row.completion >= 50 ? COLORS.orange : COLORS.red;
        return `<tr>
            <td><span class="user-id">${row.userId}</span></td>
            <td>${row.sessions}</td>
            <td><span class="watch-time">${row.watchTime}</span></td>
            <td><div class="completion-cell"><div class="completion-bar"><div class="completion-fill" style="width:${row.completion}%;background:${bc}"></div></div><span class="completion-text" style="color:${bc}">${row.completion}%</span></div></td>
            <td><span class="engagement-badge engagement-${tier}">${row.score}</span></td>
        </tr>`;
    }).join('');
}

// ══════════════════════════════════════════════════
//  Section 6: Churn Risk Detection Table (enhanced)
// ══════════════════════════════════════════════════
async function loadChurn(range) {
    const data = await fetchAPI('churn', range);
    const tbody = document.getElementById('churn-tbody');
    tbody.innerHTML = data.map(row => {
        const rc = row.risk.toLowerCase();
        const bc = row.completion >= 75 ? COLORS.green : row.completion >= 50 ? COLORS.orange : COLORS.red;
        return `<tr>
            <td><span class="user-id">${row.userId}</span></td>
            <td><span class="last-activity">${row.lastActivity}</span></td>
            <td>${row.sessions}</td>
            <td><div class="completion-cell"><div class="completion-bar"><div class="completion-fill" style="width:${row.completion}%;background:${bc}"></div></div><span class="completion-text" style="color:${bc}">${row.completion}%</span></div></td>
            <td><span class="risk-badge risk-${rc}">${row.risk}</span></td>
        </tr>`;
    }).join('');
}

// ══════════════════════════════════════════════════
//  Live Activity Feed
// ══════════════════════════════════════════════════
function createFeedItem(entry, minutesAgo) {
    const icon = FEED_ICONS[entry.type] || '•';
    return `<div class="feed-item">
        <div class="feed-icon icon-${entry.type}">${icon}</div>
        <div class="feed-content">
            <div class="feed-text">
                <span class="feed-user">${entry.user}</span>
                <span class="feed-action"> ${entry.action} </span>
                <span class="feed-video">"${entry.video}"</span>
            </div>
            <div class="feed-time">${minutesAgo === 0 ? 'Just now' : minutesAgo + ' min ago'}</div>
        </div>
    </div>`;
}

function initLiveFeed() {
    const feedList = document.getElementById('feed-list');
    // Load initial batch
    const initial = [];
    for (let i = 0; i < 12; i++) {
        const entry = LIVE_FEED_POOL[i % LIVE_FEED_POOL.length];
        const minutes = i * 2 + Math.floor(Math.random() * 3);
        initial.push(createFeedItem(entry, minutes));
    }
    feedList.innerHTML = initial.join('');

    // Simulate new events arriving every 4 seconds
    let feedIndex = 12;
    feedInterval = setInterval(() => {
        const entry = LIVE_FEED_POOL[feedIndex % LIVE_FEED_POOL.length];
        feedIndex++;
        const newItem = document.createElement('div');
        newItem.innerHTML = createFeedItem(entry, 0);
        const itemEl = newItem.firstElementChild;
        feedList.insertBefore(itemEl, feedList.firstChild);

        // Update previous items' timestamps
        const feedItems = feedList.querySelectorAll('.feed-time');
        feedItems.forEach((el, idx) => {
            if (idx === 0) return;
            const prevMinutes = parseInt(el.textContent) || 0;
            const newMinutes = prevMinutes + Math.floor(Math.random() * 2) + 1;
            el.textContent = newMinutes + ' min ago';
        });

        // Limit to 20 items
        while (feedList.children.length > 20) {
            feedList.removeChild(feedList.lastChild);
        }
    }, 4000);
}

// ══════════════════════════════════════════════════
//  Load All Sections
// ══════════════════════════════════════════════════
async function loadDashboard(range) {
    await Promise.all([
        loadOverview(range),
        loadTrending(range),
        loadAbandonment(range),
        loadWatchtime(range),
        loadEngagement(range),
        loadChurn(range),
    ]);
}

// ══════════════════════════════════════════════════
//  Date Filter Interaction (nav pills)
// ══════════════════════════════════════════════════
document.getElementById('date-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn || btn.classList.contains('active')) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRange = btn.dataset.range;
    // Sync the time range dropdown
    document.getElementById('filter-time').value = currentRange;
    loadDashboard(currentRange);
});

// ══════════════════════════════════════════════════
//  Analytics Filters (dropdowns + apply button)
// ══════════════════════════════════════════════════
document.getElementById('filter-apply-btn').addEventListener('click', () => {
    currentDevice   = document.getElementById('filter-device').value;
    currentCategory = document.getElementById('filter-category').value;
    const timeVal   = document.getElementById('filter-time').value;

    // Sync nav pills with time dropdown
    if (timeVal !== currentRange) {
        currentRange = timeVal;
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.range === currentRange);
        });
    }
    loadDashboard(currentRange);
});

// Also sync time dropdown when nav pills change
document.getElementById('filter-time').addEventListener('change', (e) => {
    const range = e.target.value;
    currentRange = range;
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.range === currentRange);
    });
    loadDashboard(currentRange);
});

// ══════════════════════════════════════════════════
//  Init
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard(currentRange);
    initLiveFeed();
});
