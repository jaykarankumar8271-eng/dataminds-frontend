// ═══════════════════════════════════════════════════════
// DASHBOARD_LB.JS — Professional Dashboard + Leaderboard
// Real-time data from backend
// ═══════════════════════════════════════════════════════

let lbCurrentFilter = 'alltime';

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
async function renderDashboard() {
  const section = document.getElementById('section-dashboard');
  if (!section) return;

  section.innerHTML = `
    <div class="dash-wrap" id="dash-inner">
      <div style="text-align:center;padding:60px 20px;color:var(--text-secondary)">
        <div style="font-size:32px;margin-bottom:12px">⏳</div>
        <p>Loading your dashboard...</p>
      </div>
    </div>`;

  try {
    // Force fresh from backend
    let results = {};
    try {
      const data = await apiCall('/api/results');
      results = data.results || {};
      // Also update local cache
      localStorage.setItem('dm_results_local', JSON.stringify(results));
    } catch {
      try { results = JSON.parse(localStorage.getItem('dm_results_local') || '{}'); } catch {}
    }
    const vals = Object.values(results);
    const total = vals.length;

    // ── COMPUTE STATS ──
    const totalScore   = vals.reduce((s,r) => s + (r.score||0), 0);
    const avgAcc       = total ? Math.round(vals.reduce((s,r) => s + (r.accuracy||0), 0) / total) : 0;
    const bestScore    = total ? Math.max(...vals.map(r => r.score||0)) : 0;
    const totalTimeSec = vals.reduce((s,r) => s + (r.time_taken||r.timeTaken||0), 0);
    const totalTimeMins = Math.round(totalTimeSec / 60);

    // Topic analysis
    const topicStats = {};
    if (typeof ALL_TESTS !== 'undefined') {
      ALL_TESTS.forEach(t => {
        const r = results[t.id];
        if (r) {
          const pct = Math.round((r.score / r.total) * 100);
          topicStats[t.topic] = { score: r.score, total: r.total, pct, icon: t.icon };
        }
      });
    }
    const topicEntries = Object.entries(topicStats).sort((a,b) => b[1].pct - a[1].pct);
    const strongTopics = topicEntries.filter(([,d]) => d.pct >= 70).slice(0, 4);
    const weakTopics   = topicEntries.filter(([,d]) => d.pct < 50).slice(0, 4);
    const avgTopics    = topicEntries.filter(([,d]) => d.pct >= 50 && d.pct < 70).slice(0, 3);

    // Recent results sorted by date
    const recentEntries = Object.entries(results)
      .sort((a,b) => new Date(b[1].date||0) - new Date(a[1].date||0))
      .slice(0, 6);

    const inner = document.getElementById('dash-inner');
    if (!inner) return;

    // ── RENDER ──
    inner.innerHTML = `
      <!-- WELCOME ROW -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <div>
          <h2 style="font-size:22px;font-weight:800;color:var(--text-primary);margin:0 0 4px">
            Welcome back, ${getStoredUser()?.fname || 'Student'} 👋
          </h2>
          <p style="font-size:13px;color:var(--text-muted);margin:0">
            ${total === 0 ? "You haven't taken any tests yet. Start your first test!" : `You've completed ${total} test${total > 1 ? 's' : ''} so far. Keep it up!`}
          </p>
        </div>
        <button class="btn-primary-sm" onclick="showAppSection('tests')">📝 Take a Test →</button>
      </div>

      <!-- STATS GRID -->
      <div class="dash-stats-grid">
        <div class="dsg-card">
          <div class="dsg-icon orange">📝</div>
          <div><div class="dsg-val">${total}</div><div class="dsg-lbl">Tests Done</div></div>
        </div>
        <div class="dsg-card">
          <div class="dsg-icon green">🎯</div>
          <div><div class="dsg-val">${avgAcc}%</div><div class="dsg-lbl">Avg Accuracy</div></div>
        </div>
        <div class="dsg-card">
          <div class="dsg-icon blue">🏅</div>
          <div><div class="dsg-val">${bestScore}<span style="font-size:16px;color:var(--text-muted)">/20</span></div><div class="dsg-lbl">Best Score</div></div>
        </div>
        <div class="dsg-card">
          <div class="dsg-icon yellow">⏱️</div>
          <div><div class="dsg-val">${totalTimeMins}<span style="font-size:16px;color:var(--text-muted)">m</span></div><div class="dsg-lbl">Time Spent</div></div>
        </div>
      </div>

      <!-- MAIN GRID -->
      <div class="dash-grid">

        <!-- RECENT RESULTS -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3>📋 Recent Tests</h3>
            <span>${total} total</span>
          </div>
          <div class="dash-card-body" style="padding:8px 12px">
            ${total === 0 ? `
              <div class="dash-empty">
                <div class="dash-empty-icon">📝</div>
                <p>No tests attempted yet.</p>
                <button class="btn-primary-sm" onclick="showAppSection('tests')">Start First Test →</button>
              </div>` :
              recentEntries.map(([tid, r]) => {
                const test = typeof ALL_TESTS !== 'undefined' ? ALL_TESTS.find(t => t.id == tid) : null;
                const pct  = Math.round((r.score / r.total) * 100);
                const color = pct >= 60 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
                return `
                  <div class="dri-item" onclick="openTestIntro(${tid})">
                    <div class="dri-num">${test ? test.icon : '📝'}</div>
                    <div class="dri-info">
                      <div class="dri-title">${test ? test.title : 'Test #' + tid}</div>
                      <div class="dri-date">${r.date || 'Recently'}</div>
                    </div>
                    <div class="dri-score">
                      <div class="dri-score-val" style="color:${color}">${r.score}/${r.total}</div>
                      <div class="dri-acc">${r.accuracy || 0}% acc</div>
                    </div>
                  </div>`;
              }).join('')
            }
          </div>
        </div>

        <!-- TOPIC PROGRESS -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3>📈 Topic-wise Progress</h3>
            <span>${topicEntries.length} topics</span>
          </div>
          <div class="dash-card-body">
            ${topicEntries.length === 0 ? `
              <div class="dash-empty">
                <div class="dash-empty-icon">📊</div>
                <p>Complete tests to see progress.</p>
              </div>` :
              topicEntries.slice(0, 8).map(([topic, d]) => {
                const color = d.pct >= 60 ? '#10B981' : d.pct >= 40 ? '#F59E0B' : '#EF4444';
                return `
                  <div class="perf-bar-item">
                    <div class="perf-bar-row">
                      <span class="perf-topic">${d.icon || '📌'} ${topic}</span>
                      <span class="perf-pct" style="color:${color}">${d.score}/${d.total} (${d.pct}%)</span>
                    </div>
                    <div class="perf-bar-bg">
                      <div class="perf-bar-fill" style="width:${d.pct}%;background:${color}"></div>
                    </div>
                  </div>`;
              }).join('')
            }
          </div>
        </div>

        <!-- STRONG/WEAK TOPICS -->
        <div class="dash-card dash-card-full">
          <div class="dash-card-header">
            <h3>🎯 Strength Analysis</h3>
            <span>Based on your scores</span>
          </div>
          <div class="dash-card-body">
            ${topicEntries.length === 0 ? `
              <div class="dash-empty">
                <div class="dash-empty-icon">🎯</div>
                <p>Attempt tests to see your strong and weak areas.</p>
                <button class="btn-primary-sm" onclick="showAppSection('tests')">Start Testing →</button>
              </div>` : `
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;flex-wrap:wrap">
                <div>
                  <div style="font-size:12px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">💪 Strong Topics</div>
                  <div class="topic-tags">
                    ${strongTopics.length > 0
                      ? strongTopics.map(([t,d]) => `<span class="topic-tag strong">${d.icon||'✅'} ${t} (${d.pct}%)</span>`).join('')
                      : '<span style="font-size:12px;color:var(--text-muted)">Score 70%+ to appear here</span>'}
                  </div>
                </div>
                <div>
                  <div style="font-size:12px;font-weight:700;color:#F59E0B;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">📖 Average Topics</div>
                  <div class="topic-tags">
                    ${avgTopics.length > 0
                      ? avgTopics.map(([t,d]) => `<span class="topic-tag avg">${d.icon||'📌'} ${t} (${d.pct}%)</span>`).join('')
                      : '<span style="font-size:12px;color:var(--text-muted)">Score 50-69% to appear here</span>'}
                  </div>
                </div>
                <div>
                  <div style="font-size:12px;font-weight:700;color:#EF4444;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">⚠️ Needs Work</div>
                  <div class="topic-tags">
                    ${weakTopics.length > 0
                      ? weakTopics.map(([t,d]) => `<span class="topic-tag weak">${d.icon||'❗'} ${t} (${d.pct}%)</span>`).join('')
                      : '<span style="font-size:12px;color:var(--text-muted)">Score below 50% to appear here</span>'}
                  </div>
                </div>
              </div>`
            }
          </div>
        </div>

      </div><!-- end dash-grid -->
    `;

  } catch (err) {
    console.error('Dashboard error:', err);
    const inner = document.getElementById('dash-inner');
    if (inner) inner.innerHTML = `
      <div class="dash-empty" style="padding:60px 20px">
        <div class="dash-empty-icon">⚠️</div>
        <p>Failed to load dashboard. Please refresh.</p>
        <button class="btn-primary-sm" onclick="renderDashboard()">Retry</button>
      </div>`;
  }
}

// ═══════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════
async function renderLeaderboard() {
  const container = document.getElementById('leaderboard-content');
  if (!container) return;

  container.innerHTML = `
    <div class="lb-wrap">
      <div class="lb-skeleton" style="text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:32px;margin-bottom:12px">🏆</div>
        <p>Loading leaderboard...</p>
      </div>
    </div>`;

  try {
    const data    = await apiCall('/api/leaderboard');
    const entries = data.leaderboard || [];
    const me      = entries.find(e => e.is_me);
    const top3    = entries.slice(0, 3);
    const rest    = entries.slice(3);

    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
    const podiumStyles = [
      { cls: 'silver', barCls: 'silver', rank: '🥈', crown: '' },
      { cls: 'gold',   barCls: 'gold',   rank: '🥇', crown: '👑' },
      { cls: 'bronze', barCls: 'bronze', rank: '🥉', crown: '' },
    ];
    const podiumMap = { 0: 0, 1: 1, 2: 2 };

    const podiumHTML = entries.length >= 3 ? `
      <div class="lb-podium">
        ${podiumOrder.map((entry, i) => {
          const style = podiumStyles[i];
          const avatarBg = entry.is_me ? 'var(--accent)' : `hsl(${(entry.name.charCodeAt(0)*37)%360},55%,40%)`;
          return `
            <div class="lb-pod-item">
              <div class="lb-pod-rank">${style.rank}</div>
              <div class="lb-pod-avatar ${style.cls}" style="background:${avatarBg}">
                ${style.crown ? `<div class="lb-pod-crown">${style.crown}</div>` : ''}
                ${entry.initials}
              </div>
              <div class="lb-pod-name">${entry.name}${entry.is_me ? ' (You)' : ''}</div>
              <div class="lb-pod-score">${entry.total_score} pts</div>
              <div class="lb-pod-bar ${style.barCls}">#${entry.rank}</div>
            </div>`;
        }).join('')}
      </div>` : '';

    // My rank banner
    const myRankHTML = me ? `
      <div class="lb-my-rank">
        <div class="lb-my-rank-icon">🎯</div>
        <div class="lb-my-rank-text">
          <strong>Your Current Rank</strong>
          <span>${me.total_tests} tests · ${me.total_score} pts · ${me.best_accuracy}% best accuracy</span>
        </div>
        <div class="lb-my-rank-val">#${me.rank}</div>
      </div>` : '';

    // Table rows
    const rowsHTML = entries.length === 0 ? `
      <div style="text-align:center;padding:40px;color:var(--text-muted)">
        <div style="font-size:40px;margin-bottom:12px">🏆</div>
        <p>No entries yet. Be the first!</p>
        <button class="btn-primary-sm" onclick="showAppSection('tests')">Take a Test →</button>
      </div>` :
      entries.map(e => {
        const rankCell = e.rank <= 3
          ? `<div class="lb-rank-cell top${e.rank}">${['🥇','🥈','🥉'][e.rank-1]}</div>`
          : `<div class="lb-rank-cell">${e.rank}</div>`;
        const avatarBg = e.is_me ? 'var(--accent)' : `hsl(${(e.name.charCodeAt(0)*37)%360},55%,40%)`;
        return `
          <div class="lb-row ${e.is_me ? 'lb-me' : ''}">
            ${rankCell}
            <div class="lb-user-cell">
              <div class="lb-av" style="background:${avatarBg}">${e.initials}</div>
              <div>
                <div class="lb-uname">${e.name}${e.is_me ? '<span class="lb-you-badge">You</span>' : ''}</div>
                <div class="lb-ustate">${e.state}</div>
              </div>
            </div>
            <div class="lb-cell">${e.total_tests}</div>
            <div class="lb-score-cell">${e.total_score}</div>
            <div class="lb-acc-cell">${e.best_accuracy}%</div>
          </div>`;
      }).join('');

    container.innerHTML = `
      <div class="lb-wrap">
        <div style="margin-bottom:20px">
          <h2 style="font-size:22px;font-weight:800;color:var(--text-primary);margin:0 0 4px">🏆 Leaderboard</h2>
          <p style="font-size:13px;color:var(--text-muted);margin:0">${entries.length} students competing · Updated in real-time</p>
        </div>

        ${podiumHTML}
        ${myRankHTML}

        <div class="lb-filters">
          <button class="lb-filter-btn active" onclick="setLbFilter('alltime',this)">🏆 All-time</button>
          <button class="lb-filter-btn" onclick="setLbFilter('bpsc',this)">🎓 BPSC TRE</button>
          <button class="lb-filter-btn" onclick="setLbFilter('stet',this)">📚 Bihar STET</button>
          <div class="lb-filter-sep"></div>
          <button class="lb-filter-btn" onclick="renderLeaderboard()" style="font-size:12px">🔄 Refresh</button>
        </div>

        <div class="lb-table" id="lb-table-body">
          <div class="lb-thead">
            <span>Rank</span>
            <span>Student</span>
            <span>Tests</span>
            <span>Score</span>
            <span>Accuracy</span>
          </div>
          ${rowsHTML}
        </div>

        ${!me && entries.length > 0 ? `
          <div style="text-align:center;margin-top:20px;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:12px">
            <p style="font-size:13px;color:var(--text-muted);margin:0 0 10px">Complete a test to appear on the leaderboard!</p>
            <button class="btn-primary-sm" onclick="showAppSection('tests')">Take a Test →</button>
          </div>` : ''}
      </div>`;

  } catch (err) {
    container.innerHTML = `
      <div class="lb-wrap">
        <div style="text-align:center;padding:60px 20px;color:var(--text-muted)">
          <div style="font-size:40px;margin-bottom:12px">⚠️</div>
          <p>Failed to load leaderboard.</p>
          <button class="btn-primary-sm" onclick="renderLeaderboard()">Retry</button>
        </div>
      </div>`;
  }
}

async function setLbFilter(filter, btn) {
  lbCurrentFilter = filter;
  document.querySelectorAll('.lb-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const tableBody = document.getElementById('lb-table-body');
  if (!tableBody) return;

  try {
    const data    = await apiCall('/api/leaderboard');
    let entries   = data.leaderboard || [];

    // Filter by exam
    if (filter === 'bpsc') {
      // Show all — backend doesn't filter yet, show note
      showToast('🔜 BPSC filter coming soon!');
      return;
    }
    if (filter === 'stet') {
      showToast('🔜 STET filter coming soon!');
      return;
    }

    // Re-render table with filtered data
    tableBody.innerHTML = `
      <div class="lb-thead">
        <span>Rank</span><span>Student</span><span>Tests</span><span>Score</span><span>Accuracy</span>
      </div>
      ${entries.map(e => {
        const rankCell = e.rank <= 3
          ? `<div class="lb-rank-cell top${e.rank}">${['🥇','🥈','🥉'][e.rank-1]}</div>`
          : `<div class="lb-rank-cell">${e.rank}</div>`;
        const avatarBg = e.is_me ? 'var(--accent)' : `hsl(${(e.name.charCodeAt(0)*37)%360},55%,40%)`;
        return `
          <div class="lb-row ${e.is_me ? 'lb-me' : ''}">
            ${rankCell}
            <div class="lb-user-cell">
              <div class="lb-av" style="background:${avatarBg}">${e.initials}</div>
              <div>
                <div class="lb-uname">${e.name}${e.is_me ? '<span class="lb-you-badge">You</span>' : ''}</div>
                <div class="lb-ustate">${e.state}</div>
              </div>
            </div>
            <div class="lb-cell">${e.total_tests}</div>
            <div class="lb-score-cell">${e.total_score}</div>
            <div class="lb-acc-cell">${e.best_accuracy}%</div>
          </div>`;
      }).join('')}`;
  } catch { showToast('Failed to filter'); }
}
