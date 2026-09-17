const NODES = [
  { id: 1, title: '架構推理', detail: '邊界、狀態所有權、SSOT、UDF 與取捨' },
  { id: 2, title: 'Compose Runtime', detail: 'stability、skippable/restartable、snapshot、recomposition' },
  { id: 3, title: 'Compose Effects', detail: 'LaunchedEffect、DisposableEffect、SideEffect、produceState、keys' },
  { id: 4, title: 'Coroutine 執行語義', detail: 'dispatcher、suspension、structured concurrency、blocking' },
  { id: 5, title: 'Coroutine 失敗模型', detail: 'exception propagation、SupervisorJob、handler、cancellation' },
  { id: 6, title: 'Flow、Channel 與背壓', detail: 'cold/hot、StateFlow、SharedFlow、replay、buffer、overflow' },
  { id: 7, title: 'Coroutine／Flow 面試推理', detail: '輸出順序、競速、例外、取消、測試時鐘' },
  { id: 8, title: '資料一致性', detail: 'repository、offline-first、同步、衝突、重試、冪等' },
  { id: 9, title: '即時通訊系統', detail: 'framing、重連狀態機、heartbeat、排序、去重、TLS' },
  { id: 10, title: '模組化與建置工程', detail: 'Gradle graph、API/implementation、convention plugins' },
  { id: 11, title: '測試策略', detail: 'fake/mock、測試分層、可重現併發、UI/整合測試' },
  { id: 12, title: '效能與可觀測性', detail: 'startup、jank、memory、battery、Macrobenchmark、tracing' },
  { id: 13, title: 'Lifecycle 與平台限制', detail: 'process death、SavedState、WorkManager、背景限制' },
  { id: 14, title: '安全與發布', detail: 'TLS、credential、secret、release risk、rollback' },
  { id: 15, title: 'KMP 深化', detail: 'expect/actual、共享邊界、平台差異、發版策略' },
  { id: 16, title: '高階工程決策', detail: '需求、約束、失敗模式與長期技術取捨' }
];

const DIMENSIONS = [
  ['understanding', '概念理解'],
  ['application', '應用'],
  ['argument', '論證重建'],
  ['comparison', '比較與批判']
];

const DEFAULT_STATE = {
  version: 1,
  learner: { goal: '中高階 Android 工程能力', background: '約 3 年 Android/Kotlin 實務經驗' },
  nodes: Object.fromEntries(NODES.map(node => [node.id, {
    ...Object.fromEntries(DIMENSIONS.map(([key]) => [key, 0])), status: '待診斷', lastEvidence: null
  }])),
  history: [
    { timestamp: '2026-09-16T00:00:00Z', title: 'ImmutableList 與內容相等性', correct: null, independent: null, eventCount: 0, provenance: 'imported-progress-record', note: '曾討論 List、ImmutableList、stable 與 equality；需要後續 transfer 驗證。' },
    { timestamp: '2026-09-16T00:00:00Z', title: 'Function body execution 與 recomposition', correct: null, independent: null, eventCount: 0, provenance: 'imported-progress-record', note: '已記錄 function execution、recomposition 與 skip 的主要混淆。' },
    { timestamp: '2026-09-16T00:00:00Z', title: 'State read tracking 與多個 scope', correct: true, independent: null, eventCount: 0, provenance: 'imported-progress-record', note: '能判斷多個 scope 讀取同一個 count.value 時都會被 invalidate。' },
    { timestamp: '2026-09-17T00:00:00Z', title: '父層 recomposition 與 Title skip', correct: true, independent: null, eventCount: 0, provenance: 'imported-progress-record', note: 'Title 參數 stable 且未改變時可 skip；仍需 strong skipping transfer 驗證。' }
  ],
  unresolved: ['strong skipping 與 unstable collection 的差異', 'snapshot read tracking', 'Compose Effects', 'Coroutine error handling 與 Flow backpressure']
};

DEFAULT_STATE.nodes[2] = { understanding: 4, application: 4, argument: 4, comparison: 4, status: '基本掌握，待 transfer 驗證', lastEvidence: '2026-09-17' };

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem('adaptive-mastery-tutor-state'));
    return stored ? { ...structuredClone(DEFAULT_STATE), ...stored, nodes: { ...structuredClone(DEFAULT_STATE.nodes), ...(stored.nodes || {}) } } : structuredClone(DEFAULT_STATE);
  } catch { return structuredClone(DEFAULT_STATE); }
}

function saveState(state) { localStorage.setItem('adaptive-mastery-tutor-state', JSON.stringify(state)); }
function average(scores) { return DIMENSIONS.reduce((sum, [key]) => sum + Number(scores[key] || 0), 0) / DIMENSIONS.length; }
function nodeScore(nodeState) { return Math.round(average(nodeState) * 20); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch])); }
function formatDate(value) { return value ? new Date(value).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }) : '—'; }
function statusClass(status) { return status.includes('掌握') ? 'ready' : status.includes('進行') ? 'progress' : status.includes('待') ? 'locked' : 'warn'; }

function renderShell() {
  const page = document.body.dataset.page || '';
  document.querySelectorAll('[data-nav]').forEach(link => link.classList.toggle('active', link.dataset.nav === page));
  const year = document.querySelector('[data-year]'); if (year) year.textContent = new Date().getFullYear();
}

function renderMasteryRows(container, nodeState) {
  container.innerHTML = DIMENSIONS.map(([key, label]) => {
    const value = Number(nodeState[key] || 0);
    return `<div class="mastery-row"><span>${label}</span><div class="bar"><span style="width:${value * 20}%"></span></div><strong>${value}/5</strong></div>`;
  }).join('');
}

function renderMap(container, state) {
  container.innerHTML = NODES.map(node => {
    const current = state.nodes[node.id];
    const score = nodeScore(current);
    const status = current.status || '待診斷';
    const href = node.id === 2 ? 'lesson-compose-runtime.html' : `#node-${node.id}`;
    return `<a class="node" href="${href}">
      <span class="node-index">${node.id}</span>
      <span><span class="node-title">${node.title}</span><span class="node-detail">${node.detail}</span></span>
      <span class="node-score"><span class="status ${statusClass(status)}">${escapeHtml(status)}</span><div class="bar"><span style="width:${score}%"></span></div><small>${score}% evidence</small></span>
    </a>`;
  }).join('');
}

function renderDashboard() {
  const state = loadState();
  const node2 = state.nodes[2];
  const averageMap = NODES.reduce((sum, node) => sum + nodeScore(state.nodes[node.id]), 0) / NODES.length;
  const learned = NODES.filter(node => nodeScore(state.nodes[node.id]) >= 60).length;
  const progress = document.querySelector('[data-dashboard-progress]');
  if (!progress) return;
  document.querySelector('[data-map-coverage]').textContent = `${learned}/${NODES.length}`;
  document.querySelector('[data-evidence-average]').textContent = `${Math.round(averageMap)}%`;
  document.querySelector('[data-history-count]').textContent = state.history.length;
  renderMasteryRows(document.querySelector('[data-dashboard-mastery]'), node2);
  renderMap(document.querySelector('[data-dashboard-map]'), state);
  const unresolved = document.querySelector('[data-unresolved]');
  unresolved.innerHTML = state.unresolved.map(item => `<li>${escapeHtml(item)}</li>`).join('');
}

function renderMapPage() {
  const state = loadState();
  const target = document.querySelector('[data-full-map]');
  if (target) renderMap(target, state);
}

function renderHistory() {
  const state = loadState();
  const target = document.querySelector('[data-history]');
  if (!target) return;
  if (!state.history.length) { target.innerHTML = '<div class="empty">尚無提交紀錄。完成第一個互動 lesson 後，這裡會顯示 evidence。</div>'; return; }
  target.innerHTML = `<div class="table-wrap"><table><thead><tr><th>時間</th><th>任務</th><th>結果</th><th>來源</th><th>事件</th></tr></thead><tbody>${state.history.slice().reverse().map(item => { const imported = item.provenance === 'imported-progress-record'; const result = item.correct === null ? '待 transfer 驗證' : item.correct ? '正確' : '需修正'; const note = item.note ? '<div class="muted">' + escapeHtml(item.note) + '</div>' : ''; return `<tr><td>${formatDate(item.timestamp)}</td><td>${escapeHtml(item.title)}${note}</td><td><span class="status ${item.correct === null ? 'progress' : item.correct ? 'ready' : 'warn'}">${result}</span></td><td>${imported ? '既有進度匯入' : item.independent ? '獨立作答' : '有協助'}</td><td>${item.eventCount} events</td></tr>`; }).join('')}</tbody></table></div>`;
}

function init() {
  renderShell(); renderDashboard(); renderMapPage(); renderHistory();
}

window.TUTOR = { NODES, DIMENSIONS, loadState, saveState, nodeScore, renderMasteryRows, formatDate, escapeHtml, init };
document.addEventListener('DOMContentLoaded', init);
