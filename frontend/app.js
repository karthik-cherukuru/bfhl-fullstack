const API_BASE = 'https://bfhl-fullstack-wtta.onrender.com';

const EXAMPLE_INPUT = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->`;

const inputArea = document.getElementById('input-area');
const submitBtn = document.getElementById('submit-btn');
const exampleBtn = document.getElementById('example-btn');
const loadingEl = document.getElementById('loading');
const resultsEl = document.getElementById('results');
const errorBanner = document.getElementById('error-banner');
const timeoutWarning = document.getElementById('timeout-warning');

let timeoutHandle = null;

function parseInput(rawText) {
  return rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  exampleBtn.disabled = isLoading;
  loadingEl.classList.toggle('hidden', !isLoading);
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove('hidden');
}

function clearError() {
  errorBanner.textContent = '';
  errorBanner.classList.add('hidden');
}

function showTimeoutWarning() {
  timeoutWarning.textContent = 'Request is taking longer than expected (3s+).';
  timeoutWarning.classList.remove('hidden');
}

function clearTimeoutWarning() {
  timeoutWarning.textContent = '';
  timeoutWarning.classList.add('hidden');
}

async function callAPI(data) {
  const response = await fetch(`${API_BASE}/bfhl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });

  const responseText = await response.text();
  let parsed;
  try {
    parsed = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error('Malformed JSON received from API.');
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${responseText}`);
  }

  return parsed;
}

function renderTree(treeObj) {
  const rootEntries = Object.entries(treeObj);
  if (rootEntries.length === 0) {
    return '<div class="meta-text">No tree data</div>';
  }

  function nodeHtml(node, childrenObj) {
    const children = Object.entries(childrenObj || {});
    if (children.length === 0) {
      return `<li><span class="tree-node">${node}</span></li>`;
    }

    return `<li>
      <span class="tree-node">${node}</span>
      <ul>${children.map(([child, grandChildren]) => nodeHtml(child, grandChildren)).join('')}</ul>
    </li>`;
  }

  return `<div class="tree-view"><ul class="tree">${rootEntries
    .map(([root, childObj]) => nodeHtml(root, childObj))
    .join('')}</ul></div>`;
}

function renderResults(json) {
  const hierarchiesHtml = (json.hierarchies || [])
    .map((entry) => {
      const isCycle = entry.has_cycle === true;
      const badge = isCycle
        ? '<span class="pill pill-cycle">CYCLE</span>'
        : '<span class="pill pill-tree">TREE</span>';
      const depthPill = !isCycle ? `<span class="pill pill-depth">Depth: ${entry.depth}</span>` : '';

      const body = isCycle
        ? '<div class="cycle-note">♻️ Cycle detected in this connected component.</div>'
        : renderTree(entry.tree);

      return `<article class="result-card">
        <div class="hierarchy-header">
          <div class="root-tag">Root: ${entry.root}</div>
          <div>${badge} ${depthPill}</div>
        </div>
        ${body}
      </article>`;
    })
    .join('');

  const invalidSection = (json.invalid_entries || []).length
    ? `<article class="result-card">
        <h3>Invalid Entries</h3>
        <div class="meta-text">Entries rejected during validation</div>
        <div class="chips">${json.invalid_entries.map((item) => `<span class="chip">${String(item)}</span>`).join('')}</div>
      </article>`
    : '';

  const duplicateSection = (json.duplicate_edges || []).length
    ? `<article class="result-card">
        <h3>Duplicate Edges</h3>
        <div class="meta-text">Repeated valid edges counted once</div>
        <div class="chips">${json.duplicate_edges.map((item) => `<span class="chip">${item}</span>`).join('')}</div>
      </article>`
    : '';

  resultsEl.innerHTML = `
    <article class="result-card identity-grid">
      <div><strong>User ID:</strong> ${json.user_id || ''}</div>
      <div><strong>Email:</strong> ${json.email_id || ''}</div>
      <div><strong>Roll Number:</strong> ${json.college_roll_number || ''}</div>
    </article>

    <article class="result-card stats">
      <div class="stat-card">
        <div class="stat-label">🌳 Total Trees</div>
        <div class="stat-value">${json.summary?.total_trees ?? '-'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">🔄 Total Cycles</div>
        <div class="stat-value">${json.summary?.total_cycles ?? '-'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">👑 Largest Tree Root</div>
        <div class="stat-value">${json.summary?.largest_tree_root ?? ''}</div>
      </div>
    </article>

    ${hierarchiesHtml}
    ${invalidSection}
    ${duplicateSection}
  `;

  resultsEl.classList.remove('hidden');
}

submitBtn.addEventListener('click', async () => {
  clearError();
  clearTimeoutWarning();
  resultsEl.classList.add('hidden');
  resultsEl.innerHTML = '';

  const data = parseInput(inputArea.value);
  if (data.length === 0) {
    showError('Please enter at least one node string.');
    return;
  }

  timeoutHandle = setTimeout(showTimeoutWarning, 3000);
  setLoading(true);

  try {
    const response = await callAPI(data);
    renderResults(response);
  } catch (error) {
    showError(error.message || 'Unexpected error while calling API.');
  } finally {
    clearTimeout(timeoutHandle);
    setLoading(false);
  }
});

exampleBtn.addEventListener('click', () => {
  inputArea.value = EXAMPLE_INPUT;
  clearError();
  clearTimeoutWarning();
});
