// ═══════════════════════════════════════════════════════
// DataMinds Admin Panel — admin.js
// ═══════════════════════════════════════════════════════

const API_URL = 'https://dataminds-backend.onrender.com';

// Test titles map
const TEST_TITLES = {
  1: "Arrays & Basic Concepts",
  2: "Linked Lists - Basics",
  3: "Stacks - Theory & Applications",
  4: "Queues & Circular Queues",
  5: "Binary Trees - Fundamentals",
  6: "BST & AVL Trees",
  7: "Heaps & Priority Queues",
  8: "Graphs - Basics & Representation",
  9: "Sorting Algorithms",
  10: "Searching Algorithms",
  11: "Hashing & Hash Tables",
  12: "Dynamic Programming - Basics",
  13: "Dynamic Programming - Advanced",
  14: "Greedy Algorithms",
  15: "String Algorithms",
  16: "String Data Structures & Algorithms",
  17: "Advanced Tree Structures",
  18: "Complexity Analysis",
  19: "Mixed PYQ - BPSC & STET Special",
  20: "Final Grand Test"
};
let ADMIN_TOKEN = localStorage.getItem('dm_admin_token') || '';
let currentEditId = null;
let currentTestId = null;
let uploadData = [];
let allUsers = [];

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  if (ADMIN_TOKEN) {
    showApp();
  }
});

// ── AUTH ──
async function doAdminLogin() {
  const pass = document.getElementById('admin-pass').value.trim();
  if (!pass) return;
  const btn = document.querySelector('.login-btn');
  btn.textContent = 'Logging in...'; btn.disabled = true;
  try {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    const data = await res.json();
    if (data.success) {
      ADMIN_TOKEN = data.token;
      localStorage.setItem('dm_admin_token', ADMIN_TOKEN);
      showApp();
    } else {
      document.getElementById('login-err').style.display = 'block';
    }
  } catch {
    document.getElementById('login-err').textContent = 'Server error. Is backend running?';
    document.getElementById('login-err').style.display = 'block';
  }
  btn.textContent = '🔐 Login to Admin Panel'; btn.disabled = false;
}

function showApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'block';
  loadAnalytics();
  buildTestSelector();
}

function doLogout() {
  localStorage.removeItem('dm_admin_token');
  ADMIN_TOKEN = '';
  location.reload();
}

// ── SECTIONS ──
function showSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  event?.currentTarget?.classList.add('active');
  if (name === 'analytics') loadAnalytics();
  if (name === 'questions') buildTestSelector();
  if (name === 'users') loadUsers();
  if (name === 'payments') loadPayments();
}

// ── API HELPER ──
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN,
      'Authorization': ADMIN_TOKEN
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${path}`, opts);
  if (res.status === 401) {
    doLogout();
    throw new Error('Unauthorized — Wrong admin password');
  }
  const data = await res.json();
  return data;
}

// ── TOAST ──
function toast(msg, type = 'success') {
  const t = document.getElementById('admin-toast');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type]||'✅'}</span> ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── ANALYTICS ──
async function loadAnalytics() {
  try {
    const data = await api('/api/admin/analytics');
    const s = data.stats;
    document.getElementById('stat-users').textContent = s.total_users || 0;
    document.getElementById('stat-attempts').textContent = s.total_attempts || 0;
    document.getElementById('stat-accuracy').textContent = (s.avg_accuracy || 0) + '%';
    document.getElementById('stat-revenue').textContent = '₹' + (s.total_revenue / 100 || 0);

    const tbody = document.getElementById('test-stats-body');
    if (!s.test_stats || s.test_stats.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text3)">No test attempts yet</td></tr>';
      return;
    }
    tbody.innerHTML = s.test_stats.map(t => `
      <tr>
        <td><strong>Test ${t.test_id}</strong></td>
        <td><span class="badge badge-blue">${t.attempts}</span></td>
        <td>${Math.round(t.avg_score || 0)}/20</td>
        <td>
          <span class="badge ${t.avg_acc >= 60 ? 'badge-green' : t.avg_acc >= 40 ? 'badge-yellow' : 'badge-red'}">
            ${Math.round(t.avg_acc || 0)}%
          </span>
        </td>
      </tr>`).join('');
  } catch (err) {
    toast('Failed to load analytics: ' + err.message, 'error');
  }
}

// ── TEST SELECTOR ──
async function buildTestSelector() {
  const container = document.getElementById('test-selector');
  container.innerHTML = '';

  // Get question summary
  let summary = {};
  try {
    const data = await api('/api/admin/questions-summary');
    if (data.summary) {
      data.summary.forEach(s => summary[s.test_id] = parseInt(s.count));
    }
  } catch {}

  for (let i = 1; i <= 20; i++) {
    const hasQ = summary[i] > 0;
    const btn = document.createElement('button');
    btn.className = 'test-btn' + (hasQ ? ' has-q' : '') + (currentTestId === i ? ' active' : '');
    btn.innerHTML = `T${i}<br><small>${hasQ ? summary[i] + 'q' : 'empty'}</small>`;
    btn.onclick = () => loadTestQuestions(i);
    container.appendChild(btn);
  }
}

async function loadTestQuestions(testId) {
  currentTestId = testId;

  // Update selector UI
  document.querySelectorAll('.test-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === testId);
  });

  document.getElementById('questions-card').style.display = 'block';
  document.getElementById('questions-card-title').textContent = `Test ${testId} Questions`;
  document.getElementById('del-test-btn').style.display = 'inline-flex';
  document.getElementById('questions-tbody').innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3)">Loading...</td></tr>';

  try {
    const data = await api(`/api/admin/questions/${testId}`);
    const qs = data.questions || [];
    document.getElementById('q-count-badge').textContent = `${qs.length} questions in Test ${testId}`;

    if (qs.length === 0) {
      document.getElementById('questions-tbody').innerHTML = `
        <tr><td colspan="5" style="text-align:center;padding:32px">
          <div style="color:var(--text3)">No questions yet. <a href="#" onclick="openAddQuestion()" style="color:var(--accent)">Add one →</a></div>
        </td></tr>`;
      return;
    }

    document.getElementById('questions-tbody').innerHTML = qs.map(q => `
      <tr>
        <td><strong>${q.question_no}</strong></td>
        <td style="max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${q.q}">${q.q}</td>
        <td><span class="badge badge-green">${['A','B','C','D'][q.correct]}</span></td>
        <td><span class="badge ${q.difficulty === 'Easy' ? 'badge-green' : q.difficulty === 'Hard' ? 'badge-red' : 'badge-yellow'}">${q.difficulty}</span></td>
        <td style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="openEditQuestion(${q.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${q.id}, ${q.question_no})">🗑️</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    toast('Failed to load questions', 'error');
  }
}

// ── DELETE TEST QUESTIONS ──
async function deleteTestQuestions() {
  if (!currentTestId) return;
  if (!confirm(`Delete ALL questions for Test ${currentTestId}? This cannot be undone!`)) return;
  try {
    await api(`/api/admin/questions/test/${currentTestId}`, 'DELETE');
    toast(`All questions in Test ${currentTestId} deleted!`, 'success');
    loadTestQuestions(currentTestId);
    buildTestSelector();
  } catch (err) {
    toast('Delete failed: ' + err.message, 'error');
  }
}

// ── DELETE SINGLE QUESTION ──
async function deleteQuestion(id, qNo) {
  if (!confirm(`Delete Question ${qNo}?`)) return;
  try {
    await api(`/api/admin/questions/${id}`, 'DELETE');
    toast('Question deleted!', 'success');
    loadTestQuestions(currentTestId);
    buildTestSelector();
  } catch (err) {
    toast('Delete failed', 'error');
  }
}

// ── ADD/EDIT QUESTION MODAL ──
function openAddQuestion() {
  currentEditId = null;
  document.getElementById('q-modal-title').textContent = '➕ Add New Question';
  document.getElementById('save-q-btn').textContent = '💾 Add Question';
  clearQForm();
  if (currentTestId) document.getElementById('q-test-id').value = currentTestId;
  document.getElementById('q-modal').style.display = 'flex';
}

async function openEditQuestion(id) {
  currentEditId = id;
  document.getElementById('q-modal-title').textContent = '✏️ Edit Question';
  document.getElementById('save-q-btn').textContent = '💾 Update Question';
  try {
    const data = await api(`/api/admin/question/${id}`);
    const q = data.question;
    document.getElementById('q-test-id').value = q.test_id;
    document.getElementById('q-no').value = q.question_no;
    document.getElementById('q-text').value = q.q;
    document.getElementById('opt-0').value = q.options[0] || '';
    document.getElementById('opt-1').value = q.options[1] || '';
    document.getElementById('opt-2').value = q.options[2] || '';
    document.getElementById('opt-3').value = q.options[3] || '';
    document.querySelectorAll('input[name="correct-opt"]').forEach(r => r.checked = parseInt(r.value) === q.correct);
    document.getElementById('q-topic').value = q.topic || '';
    document.getElementById('q-difficulty').value = q.difficulty || 'Medium';
    document.getElementById('q-explanation').value = q.explanation || '';
    document.getElementById('q-modal').style.display = 'flex';
  } catch {
    toast('Failed to load question', 'error');
  }
}

function closeQModal() {
  document.getElementById('q-modal').style.display = 'none';
  currentEditId = null;
}

function clearQForm() {
  ['q-test-id','q-no','q-text','opt-0','opt-1','opt-2','opt-3','q-topic','q-explanation'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.querySelectorAll('input[name="correct-opt"]').forEach(r => r.checked = false);
  document.getElementById('q-difficulty').value = 'Medium';
}

async function saveQuestion() {
  const testId = parseInt(document.getElementById('q-test-id').value);
  const qNo = parseInt(document.getElementById('q-no').value);
  const qText = document.getElementById('q-text').value.trim();
  const opts = [0,1,2,3].map(i => document.getElementById('opt-' + i).value.trim());
  const correctEl = document.querySelector('input[name="correct-opt"]:checked');
  const topic = document.getElementById('q-topic').value.trim();
  const difficulty = document.getElementById('q-difficulty').value;
  const explanation = document.getElementById('q-explanation').value.trim();

  if (!testId || !qNo || !qText || opts.some(o => !o) || !correctEl) {
    toast('Please fill all fields and select correct answer', 'warning');
    return;
  }

  const payload = {
    test_id: testId, question_no: qNo, q: qText,
    options: opts, correct: parseInt(correctEl.value),
    topic, difficulty, explanation
  };

  try {
    if (currentEditId) {
      await api(`/api/admin/questions/${currentEditId}`, 'PUT', payload);
      toast('Question updated! ✅', 'success');
    } else {
      await api('/api/admin/questions', 'POST', payload);
      toast('Question added! ✅', 'success');
    }
    closeQModal();
    loadTestQuestions(testId);
    buildTestSelector();
  } catch (err) {
    toast('Save failed: ' + err.message, 'error');
  }
}

// ── BULK UPLOAD ──
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone').classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error('Must be an array');
        uploadData = data;
        showUploadPreview(file.name, data);
      } catch (err) {
        toast('Invalid JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        uploadData = rows.map(r => ({
          test_id: parseInt(r.test_id),
          question_no: parseInt(r.question_no),
          q: String(r.q || ''),
          options: [String(r.option_a||''), String(r.option_b||''), String(r.option_c||''), String(r.option_d||'')],
          correct: parseInt(r.correct || 0),
          explanation: String(r.explanation || ''),
          topic: String(r.topic || ''),
          difficulty: String(r.difficulty || 'Medium')
        }));
        showUploadPreview(file.name, uploadData);
      } catch (err) {
        toast('Invalid Excel file: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    toast('Only .json and .xlsx files supported', 'error');
  }
}

function showUploadPreview(filename, data) {
  document.getElementById('upload-preview').style.display = 'block';
  document.getElementById('upload-filename').textContent = '📄 ' + filename;
  document.getElementById('upload-count').textContent = `${data.length} questions found`;
  const tests = [...new Set(data.map(q => q.test_id))].sort((a,b)=>a-b);
  document.getElementById('upload-sample').textContent = `Tests: ${tests.join(', ')} | Sample: "${(data[0]?.q||'').substring(0,60)}..."`;
}

function clearUpload() {
  uploadData = [];
  document.getElementById('upload-preview').style.display = 'none';
  document.getElementById('file-input').value = '';
}

async function doUpload(replace = false) {
  if (!uploadData.length) return;

  document.getElementById('upload-progress-wrap').style.display = 'block';
  document.getElementById('upload-prog').style.width = '10%';
  document.getElementById('upload-status').textContent = `Uploading ${uploadData.length} questions...`;

  try {
    const data = await api('/api/admin/questions/bulk', 'POST', { questions: uploadData, replace });
    document.getElementById('upload-prog').style.width = '100%';
    document.getElementById('upload-status').textContent = `✅ Done! ${data.inserted} inserted, ${data.skipped} skipped`;
    toast(`Upload complete! ${data.inserted} questions added.`, 'success');
    clearUpload();
    buildTestSelector();
    setTimeout(() => {
      document.getElementById('upload-progress-wrap').style.display = 'none';
    }, 3000);
  } catch (err) {
    toast('Upload failed: ' + err.message, 'error');
    document.getElementById('upload-prog').style.width = '0%';
    document.getElementById('upload-status').textContent = '❌ Upload failed';
  }
}

// ── USERS ──
async function loadUsers() {
  try {
    const data = await api('/api/admin/users');
    allUsers = data.users || [];
    renderUsers(allUsers);
  } catch {
    toast('Failed to load users', 'error');
  }
}

function filterUsers(query) {
  const q = query.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.fname?.toLowerCase().includes(q) ||
    u.lname?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.state?.toLowerCase().includes(q)
  );
  renderUsers(filtered);
}

function renderUsers(users) {
  const tbody = document.getElementById('users-tbody');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3)">No users found</td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <strong style="cursor:pointer;color:var(--accent)" onclick="showUserTests(${u.id}, '${u.fname} ${u.lname||''}')">
          ${u.fname} ${u.lname || ''}
        </strong>
      </td>
      <td style="color:var(--text3)">${u.email}</td>
      <td><span class="badge badge-blue">${u.state || 'N/A'}</span></td>
      <td style="font-size:12px;color:var(--text3)">${u.exam_target || 'N/A'}</td>
      <td style="font-size:12px;color:var(--text3)">${new Date(u.created_at).toLocaleDateString('en-IN')}</td>
      <td>
        <span class="badge badge-orange" style="cursor:pointer" onclick="showUserTests(${u.id}, '${u.fname} ${u.lname||''}')">
          ${u.test_count || 0} tests 👁️
        </span>
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id}, '${u.fname}')">🗑️</button>
      </td>
    </tr>`).join('');
}

// ── Show user test history ──
async function showUserTests(userId, userName) {
  try {
    const data = await api(`/api/admin/user-results/${userId}`);
    const results = data.results || [];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.onclick = e => { if(e.target===modal) modal.remove(); };

    const rows = results.length === 0
      ? '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text3)">No tests attempted yet</td></tr>'
      : results.map(r => {
          const pct = Math.round((r.score/r.total)*100);
          const color = pct>=60?'badge-green':pct>=40?'badge-yellow':'badge-red';
          return `<tr>
            <td><strong>${TEST_TITLES[r.test_id] || "Test " + r.test_id}</strong><br><small style="color:var(--text3);font-size:11px">Test ${r.test_id}</small></td>
            <td><span class="badge ${color}">${r.score}/${r.total}</span></td>
            <td>${r.wrong || 0}</td>
            <td>${r.skipped || 0}</td>
            <td><span class="badge ${color}">${r.accuracy}%</span></td>
            <td style="font-size:12px;color:var(--text3)">${r.attempted_at ? new Date(r.attempted_at).toLocaleDateString('en-IN') : 'N/A'}</td>
          </tr>`;
        }).join('');

    const totalScore = results.reduce((s,r)=>s+(r.score||0),0);
    const avgAcc = results.length ? Math.round(results.reduce((s,r)=>s+(r.accuracy||0),0)/results.length) : 0;

    modal.innerHTML = `
      <div class="modal-box" style="max-width:700px">
        <div class="modal-header">
          <h3>📊 ${userName} — Test History</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div class="modal-body" style="padding:0">
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px 20px;border-bottom:1px solid var(--border)">
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:800;color:var(--accent)">${results.length}</div>
              <div style="font-size:11px;color:var(--text3);text-transform:uppercase">Tests Done</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:800;color:var(--success)">${totalScore}</div>
              <div style="font-size:11px;color:var(--text3);text-transform:uppercase">Total Score</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:24px;font-weight:800;color:var(--info)">${avgAcc}%</div>
              <div style="font-size:11px;color:var(--text3);text-transform:uppercase">Avg Accuracy</div>
            </div>
          </div>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Score</th>
                <th>Wrong</th>
                <th>Skipped</th>
                <th>Accuracy</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    document.body.appendChild(modal);
  } catch(err) {
    toast('Failed to load: ' + err.message, 'error');
  }
}

async function deleteUser(id, name) {
  if (!confirm(`Delete user "${name}"? This will delete all their results too!`)) return;
  try {
    await api(`/api/admin/users/${id}`, 'DELETE');
    toast(`User "${name}" deleted`, 'success');
    loadUsers();
  } catch {
    toast('Delete failed', 'error');
  }
}

// ── PAYMENTS ──
async function loadPayments() {
  try {
    const data = await api('/api/admin/payments');
    const payments = data.payments || [];
    const tbody = document.getElementById('payments-tbody');
    if (!payments.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:32px">No payments yet. Set up Razorpay to start collecting payments.</td></tr>';
      return;
    }
    tbody.innerHTML = payments.map(p => `
      <tr>
        <td><strong>${p.fname} ${p.lname || ''}</strong><br><small style="color:var(--text3)">${p.email}</small></td>
        <td>Test ${p.test_id}</td>
        <td><strong style="color:var(--success)">₹${(p.amount/100).toFixed(0)}</strong></td>
        <td><span class="badge ${p.status === 'paid' ? 'badge-green' : 'badge-red'}">${p.status}</span></td>
        <td style="font-size:12px;color:var(--text3)">${p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : 'N/A'}</td>
      </tr>`).join('');
  } catch {
    toast('Failed to load payments', 'error');
  }
}
