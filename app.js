// ═══════════════════════════════════════════════════════
// APP.JS — Upgraded DataMinds (v2.0)
// ═══════════════════════════════════════════════════════

let currentTestId    = null;
let currentQIndex    = 0;
let answers          = [];
let skipped          = [];
let timerInterval    = null;
let timeLeft         = 0;
let totalTime        = 20 * 60; // will be set dynamically per test
let timeTaken        = 0;
let currentFilter    = 'all';
let currentSection   = 'topic';
let currentCategory  = 'bpsc-tre';
let currentSubject   = 'cs';
let searchQuery      = '';
let difficultyFilter = 'all';
let premiumFilter    = 'all';

// ── LOAD DB QUESTIONS for tests with empty questions array ──
async function loadDBQuestions(testId) {
  try {
    const res = await fetch(`${typeof API_URL !== 'undefined' ? API_URL : 'https://dataminds-backend.onrender.com'}/api/questions/${testId}`);
    const data = await res.json();
    if (data.success && data.questions && data.questions.length > 0) {
      return data.questions.map(q => ({
        q: q.q,
        opts: q.options,
        ans: q.correct,
        tag: q.topic || 'General',
        exp: q.explanation || ''
      }));
    }
  } catch(e) { console.warn('DB questions load failed:', e); }
  return null;
}

// Override openTestIntro to load DB questions if needed
const _origOpenTestIntro = typeof openTestIntro !== 'undefined' ? openTestIntro : null;

async function openTestIntroWithDB(testId) {
  const test = ALL_TESTS.find(t => t.id === testId);
  if (test && (!test.questions || test.questions.length === 0)) {
    showToast('Loading questions... ⏳');
    const dbQuestions = await loadDBQuestions(testId);
    if (dbQuestions && dbQuestions.length > 0) {
      test.questions = dbQuestions;
      // Update totalQuestions to actual count from DB
      if (!test.totalQuestions || test.totalQuestions !== dbQuestions.length) {
        test.totalQuestions = dbQuestions.length;
      }
      showToast(`✅ ${dbQuestions.length} questions loaded!`);
    } else {
      showToast('❌ No questions found for this test!', 'error');
      return;
    }
  }
  openTestIntro(testId);
}

function loadResults() {
  if (typeof getUserResults === 'function') return getUserResults();
  try { return JSON.parse(localStorage.getItem('dm_results') || '{}'); } catch { return {}; }
}
function saveResults(results, testId) {
  // Save to backend if we have the specific test result
  if (typeof saveUserResults === 'function') {
    if (testId && results[testId]) {
      const r = results[testId];
      const newResult = {
        test_id:    parseInt(testId),
        score:      r.score || 0,
        total:      r.total || 20,
        wrong:      r.wrong || 0,
        skipped:    r.skipped || 0,
        accuracy:   r.accuracy || 0,
        time_taken: r.timeTaken || r.time_taken || 0,
        answers:    r.answers || []
      };
      return saveUserResults(results, newResult);
    }
    return saveUserResults(results, null);
  }
  localStorage.setItem('dm_results', JSON.stringify(results));
}

// ── CATEGORY BAR ──
function renderCategoryBar() {
  const bar = document.getElementById('category-bar');
  if (!bar) return;
  bar.innerHTML = EXAM_CATEGORIES.map(cat => `
    <button class="cat-chip ${cat.id === currentCategory ? 'cat-active' : ''} ${!cat.active ? 'cat-coming' : ''}"
      onclick="${cat.active ? `switchCategory('${cat.id}')` : `showToast('🔜 ${cat.label} coming soon!')`}"
      style="${cat.id === currentCategory ? `border-color:${cat.color};color:${cat.color}` : ''}">
      <span>${cat.icon}</span><span>${cat.label}</span>
      ${!cat.active ? '<span class="soon-tag">Soon</span>' : ''}
    </button>`).join('');
}

function switchCategory(catId) {
  currentCategory = catId;
  const subjects = SUBJECT_MAP[catId] || [];
  currentSubject = subjects.find(s => s.active)?.id || subjects[0]?.id || 'cs';
  renderCategoryBar(); renderSubjectBar(); renderTests(currentFilter);
}

// ── SUBJECT BAR ──
function renderSubjectBar() {
  const bar = document.getElementById('subject-bar');
  if (!bar) return;
  const subjects = SUBJECT_MAP[currentCategory] || [];
  if (!subjects.length) { bar.style.display='none'; return; }
  bar.style.display = '';
  bar.innerHTML = subjects.map(sub => `
    <button class="subj-chip ${sub.id===currentSubject?'subj-active':''} ${!sub.active?'subj-coming':''}"
      onclick="${sub.active ? `switchSubject('${sub.id}')` : `showToast('🔜 ${sub.label} coming soon!')`}">
      ${sub.icon} ${sub.label}${!sub.active?'<span class="soon-tag">Soon</span>':''}
    </button>`).join('');
}

function switchSubject(subId) {
  currentSubject = subId; renderSubjectBar(); renderTests(currentFilter);
}

// ── SECTION TABS ──
function renderSectionTabs() {
  const tabs = document.getElementById('section-tabs');
  if (!tabs) return;
  tabs.innerHTML = TEST_SECTIONS.map(sec => `
    <button class="section-tab ${sec.id===currentSection?'section-tab-active':''}" onclick="switchSection('${sec.id}')">
      ${sec.label}
    </button>`).join('');
}

function switchSection(secId) {
  currentSection = secId; renderSectionTabs();
  if (secId === 'topic') { renderTests(currentFilter); return; }
  const grid = document.getElementById('tests-grid');
  if (!grid) return;
  grid.innerHTML = `<div class="coming-soon-state">
    <div class="cs-icon">${secId==='full'?'📋':'🗂️'}</div>
    <h3>${secId==='full'?'Full Length Mock Tests':'Previous Year Questions'}</h3>
    <p>Coming soon! High-quality ${secId==='full'?'full-length mock tests':'PYQ papers'} being prepared.</p>
    <button class="btn-primary-sm" onclick="switchSection('topic')">← Back to Topic Tests</button>
  </div>`;
}

// ── ADVANCED FILTERS ──
function renderAdvancedFilters() {
  const bar = document.getElementById('advanced-filters');
  if (!bar) return;
  bar.innerHTML = `
    <div class="filter-group">
      <span class="filter-label">Difficulty:</span>
      ${['all','easy','medium','hard'].map(d=>`<button class="filter-chip ${difficultyFilter===d?'filter-active':''}" onclick="setDiffFilter('${d}')">${d==='all'?'All':DIFFICULTY[d]?.label||d}</button>`).join('')}
    </div>
    <div class="filter-group">
      <span class="filter-label">Type:</span>
      ${['all','free','premium'].map(p=>`<button class="filter-chip ${premiumFilter===p?'filter-active':''}" onclick="setPremiumFilter('${p}')">${p==='all'?'All':p==='free'?'🆓 Free':'🔒 Premium'}</button>`).join('')}
    </div>
    <div class="filter-group">
      <span class="filter-label">Status:</span>
      ${[['all','All'],['attempted','✓ Done'],['unattempted','⭕ New'],['bookmarked','🔖 Saved']].map(([v,l])=>`<button class="filter-chip ${currentFilter===v?'filter-active':''}" onclick="filterTests('${v}')">${l}</button>`).join('')}
    </div>`;
}

function setDiffFilter(val) { difficultyFilter=val; renderAdvancedFilters(); renderTests(currentFilter); }
function setPremiumFilter(val) { premiumFilter=val; renderAdvancedFilters(); renderTests(currentFilter); }

// ── RENDER TESTS ──
function renderTests(filter='all') {
  currentFilter = filter;
  if (currentSection !== 'topic') return;
  const results   = loadResults();
  const grid      = document.getElementById('tests-grid');
  if (!grid) return;
  grid.innerHTML  = '';
  const bookmarks = getBookmarks();

  let list = ALL_TESTS.filter(t => {
    const attempted  = !!results[t.id];
    const bookmarked = bookmarks.includes(t.id);
    const diff       = TEST_DIFFICULTY[t.id] || 'medium';
    const premium    = isPremium(t.id);
    if (filter==='attempted'   && !attempted)  return false;
    if (filter==='unattempted' &&  attempted)  return false;
    if (filter==='bookmarked'  && !bookmarked) return false;
    if (difficultyFilter!=='all' && diff!==difficultyFilter) return false;
    if (premiumFilter==='free'    &&  premium) return false;
    if (premiumFilter==='premium' && !premium) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q);
    }
    return true;
  });

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state">
      <div class="es-icon">${filter==='bookmarked'?'🔖':filter==='attempted'?'📝':'🔍'}</div>
      <h3>${filter==='bookmarked'?'No bookmarks yet':filter==='attempted'?'No tests attempted yet':'No tests found'}</h3>
      <p>${filter==='bookmarked'?'Bookmark tests to find them quickly.':filter==='attempted'?'Start your first test now!':'Try adjusting filters.'}</p>
      <button class="btn-primary-sm" onclick="filterTests('all');setDiffFilter('all');setPremiumFilter('all')">Show All Tests</button>
    </div>`; return;
  }

  list.forEach((test, idx) => {
    const res        = results[test.id];
    const attempted  = !!res;
    const score      = attempted ? res.score : 0;
    const total      = test.totalQuestions || test.questions.length;
    const pct        = attempted ? Math.round((score/total)*100) : 0;
    const diff       = TEST_DIFFICULTY[test.id] || 'medium';
    const premium    = isPremium(test.id);
    const unlocked   = isUnlocked(test.id);
    const bookmarked = isBookmarked(test.id);
    const attempts   = TEST_ATTEMPT_COUNTS[test.id] || 100;
    const rating     = TEST_RATINGS[test.id] || 4.5;
    const isNew      = test.id <= 3 && !attempted;
    const diffCfg    = DIFFICULTY[diff];

    const card = document.createElement('div');
    card.className = `test-card ${premium && !unlocked ? 'test-card-locked' : ''} card-animate`;
    card.style.animationDelay = `${idx * 0.04}s`;
    card.innerHTML = `
      <div class="card-top">
        <div class="card-number ${attempted?'attempted-num':''}">${test.id<10?'0'+test.id:test.id}</div>
        <div class="card-info">
          <div class="card-title">${test.icon} ${test.title}</div>
          <div class="card-subtitle">${test.subtitle}</div>
        </div>
        <div class="card-badges">
          ${isNew?'<span class="badge-new-tag">NEW</span>':''}
          ${premium&&!unlocked?'<span class="badge-premium">🔒 PRO</span>':''}
          ${attempted?'<span class="card-status-badge badge-done">✓ Done</span>':''}
          <button class="bookmark-btn ${bookmarked?'bookmarked':''}" onclick="handleBookmark(event,${test.id})">${bookmarked?'🔖':'🏷️'}</button>
        </div>
      </div>
      <div class="card-tags">
        <span class="diff-badge" style="background:${diffCfg.bg};color:${diffCfg.color}">${diffCfg.label}</span>
        <span class="meta-item"><span class="meta-icon">❓</span>${total} Qs</span>
        <span class="meta-item"><span class="meta-icon">⏱️</span>${test.timeLimit||20} Min</span>
        <span class="meta-item"><span class="meta-icon">👥</span>${attempts.toLocaleString()}</span>
        <span class="meta-item"><span class="meta-icon">⭐</span>${rating}</span>
      </div>
      <div class="card-footer">
        <div class="score-preview">
          ${attempted?`<div class="score-bar-wrap"><div class="score-bar-fill ${pct>=60?'good':pct>=40?'ok':'low'}" style="width:${pct}%"></div></div><span class="score-text ${pct>=60?'good':''}">${score}/${total} (${pct}%)</span>`:'<span class="score-text muted">Not attempted</span>'}
        </div>
        ${premium&&!unlocked
          ?`<button class="btn-unlock" onclick="openPaymentModal(${test.id})">🔓 Unlock ₹99</button>`
          :`<button class="btn-${attempted?'reattempt':'start'}" onclick="(typeof openTestIntroWithDB!=='undefined'&&(!ALL_TESTS.find(t=>t.id===${test.id})?.questions?.length)?openTestIntroWithDB:openTestIntro)(${test.id})">${attempted?'↩ Re-Attempt':'▶ Start Test'}</button>`}
      </div>`;
    grid.appendChild(card);
  });
}

function handleBookmark(e, testId) {
  e.stopPropagation();
  const added = toggleBookmark(testId);
  showToast(added ? '🔖 Bookmarked!' : '🗑️ Bookmark removed');
  renderTests(currentFilter);
}

function filterTests(type) { currentFilter=type; renderAdvancedFilters(); renderTests(type); }
function searchTests(query) { searchQuery=query; renderTests(currentFilter); }

// ── PAYMENT MODAL ──
function openPaymentModal(testId) {
  const test = ALL_TESTS.find(t=>t.id===testId);
  const existing = document.getElementById('payment-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className='payment-overlay'; overlay.id='payment-overlay';
  overlay.innerHTML=`<div class="payment-modal">
    <button class="modal-close-btn" onclick="document.getElementById('payment-overlay').remove()">✕</button>
    <div class="payment-header">
      <div class="payment-icon">🔓</div>
      <h2>Unlock Premium Test</h2>
      <p>${test.icon} ${test.title}</p>
    </div>
    <div class="payment-benefits">
      <div class="benefit-item">✅ Lifetime access to this test</div>
      <div class="benefit-item">✅ Detailed solutions & explanations</div>
      <div class="benefit-item">✅ Performance analytics</div>
      <div class="benefit-item">✅ Leaderboard ranking</div>
    </div>
    <div class="payment-price">
      <span class="price-original">₹199</span>
      <span class="price-final">₹99</span>
      <span class="price-tag">50% OFF</span>
    </div>
    <button class="btn-pay" onclick="initiatePayment(${testId})">💳 Pay ₹99 — Unlock Now</button>
    <div class="payment-note">🔒 Secure payment via Razorpay · UPI / Card / NetBanking</div>
    <div style="margin-top:12px;text-align:center">
      <button class="btn-ghost-sm" onclick="document.getElementById('payment-overlay').remove()">Maybe later</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

async function initiatePayment(testId) {
  const test = ALL_TESTS.find(t=>t.id===testId);
  showToast('⏳ Initializing payment...');
  try {
    const res = await fetch(`${typeof API_URL!=='undefined'?API_URL:''}/api/payment/create-order`,{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
      body:JSON.stringify({test_id:testId,amount:9900})
    });
    if(!res.ok) throw new Error('failed');
    const {order_id,key_id} = await res.json();
    const options = {
      key:key_id,amount:9900,currency:'INR',name:'DataMinds',
      description:`Unlock: ${test.title}`,order_id,
      handler:async(response)=>{await verifyPayment(response,testId);},
      theme:{color:'#FF6B35'},modal:{ondismiss:()=>showToast('Payment cancelled')}
    };
    new Razorpay(options).open();
  } catch(err) {
    showToast('⚠️ Unlocking for demo...');
    setTimeout(()=>{
      unlockTest(testId);
      document.getElementById('payment-overlay')?.remove();
      renderTests(currentFilter);
      showToast('✅ Test unlocked! (Demo mode)');
    },1500);
  }
}

async function verifyPayment(response, testId) {
  try {
    const res = await fetch(`${typeof API_URL!=='undefined'?API_URL:''}/api/payment/verify`,{
      method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${getToken()}`},
      body:JSON.stringify({...response,test_id:testId})
    });
    if(res.ok){unlockTest(testId);document.getElementById('payment-overlay')?.remove();renderTests(currentFilter);showToast('✅ Payment successful!');}
  } catch{showToast('❌ Verification failed');}
}

// ── TEST INTRO ──
function openTestIntro(testId) {
  currentTestId = testId;
  const test=ALL_TESTS.find(t=>t.id===testId), results=loadResults(), prev=results[testId];
  const diff=TEST_DIFFICULTY[testId]||'medium', diffCfg=DIFFICULTY[diff];
  const modal=document.getElementById('modal-overlay'), content=document.getElementById('modal-content');
  content.innerHTML=`<div class="intro-screen">
    <button class="modal-close-btn" onclick="closeModal()">✕</button>
    <div class="intro-header">
      <div class="intro-icon">${test.icon}</div>
      <div class="intro-header-info">
        <h2>${test.title}</h2><p>${test.subtitle} | BPSC TRE 4.0 + Bihar STET</p>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <span class="diff-badge" style="background:${diffCfg.bg};color:${diffCfg.color}">${diffCfg.label}</span>
          <span class="diff-badge" style="background:rgba(255,255,255,0.05);color:var(--text-secondary)">⭐ ${TEST_RATINGS[testId]||4.5}</span>
          <span class="diff-badge" style="background:rgba(255,255,255,0.05);color:var(--text-secondary)">👥 ${(TEST_ATTEMPT_COUNTS[testId]||100).toLocaleString()} attempts</span>
        </div>
      </div>
    </div>
    <div class="intro-body">
      ${prev?`<div class="prev-attempt-banner"><span>📊 Previous:</span><strong>${prev.score}/${prev.total} (${Math.round(prev.score/prev.total*100)}%)</strong><span style="color:var(--text-muted)">· ${prev.date}</span></div>`:''}
      <div class="intro-stats-row">
        <div class="istat"><div class="istat-val">${test.totalQuestions||test.questions?.length||20}</div><div class="istat-lbl">Questions</div></div>
        <div class="istat"><div class="istat-val">${test.timeLimit||20}</div><div class="istat-lbl">Minutes</div></div>
        <div class="istat"><div class="istat-val">+${test.perCorrect||1}</div><div class="istat-lbl">Per Correct</div></div>
        <div class="istat"><div class="istat-val">${test.negative||0}</div><div class="istat-lbl">Negative</div></div>
      </div>
      <div class="intro-rules">
        <h3>📋 Exam Instructions</h3>
        <div class="rule-item"><div class="rule-dot"></div><span>${test.totalQuestions || test.questions?.length || 20} MCQs from topic: <strong>${test.topic}</strong></span></div>
        <div class="rule-item"><div class="rule-dot"></div><span>Timer starts when you click 'Begin Test'</span></div>
        <div class="rule-item"><div class="rule-dot"></div><span>Each correct: <strong>+1 mark</strong>. No negative marking.</span></div>
        <div class="rule-item"><div class="rule-dot"></div><span>Based on <strong>BPSC TRE 1.0/2.0/3.0/4.0</strong> PYQ patterns</span></div>
      </div>
      <div class="intro-footer">
        <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="btn-begin" onclick="startTest(${testId})">▶ Begin Test</button>
      </div>
    </div>
  </div>`;
  modal.classList.remove('hidden'); document.body.style.overflow='hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow='';
  if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
}

// ── QUIZ ENGINE (unchanged core) ──
function startTest(testId) {
  currentTestId=testId; currentQIndex=0;
  const test=ALL_TESTS.find(t=>t.id===testId);
  answers=new Array(test.questions.length).fill(-1);
  skipped=new Array(test.questions.length).fill(false);
  // Set time dynamically based on test config
  const _test = ALL_TESTS.find(t=>t.id===testId);
  totalTime = (_test?.timeLimit || 20) * 60;
  timeLeft=totalTime; renderQuizScreen(); startTimer();
}

function renderQuizScreen() {
  const test=ALL_TESTS.find(t=>t.id===currentTestId), q=test.questions[currentQIndex], n=test.questions.length;
  const content=document.getElementById('modal-content');
  const timerClass=timeLeft<120?'danger':timeLeft<300?'warning':'';
  const mins=Math.floor(timeLeft/60).toString().padStart(2,'0'), secs=(timeLeft%60).toString().padStart(2,'0');
  const answered=answers.filter(a=>a!==-1).length;
  const palette=test.questions.map((_,i)=>{
    let cls='';
    if(i===currentQIndex) cls='q-current';
    else if(answers[i]!==-1) cls='q-answered';
    else if(skipped[i]) cls='q-skipped';
    return `<div class="q-dot ${cls}" onclick="goToQuestion(${i})">${i+1}</div>`;
  }).join('');
  const is5Opts = q.opts.length === 5;
  const optionsHTML=q.opts.map((opt,i)=>`
    <div class="option-item ${answers[currentQIndex]===i?'selected':''} ${is5Opts?'opt-5':'opt-4'}" onclick="selectOption(${i})">
      <div class="option-label">${String.fromCharCode(65+i)}</div><div class="option-text">${opt}</div>
    </div>`).join('');
  const isLast=currentQIndex===n-1;
  content.innerHTML=`<div class="quiz-screen">
    <div class="quiz-topbar">
      <div class="quiz-title-wrap"><div class="quiz-title">${test.icon} ${test.title}</div></div>
      <div class="quiz-timer ${timerClass}" id="quiz-timer"><span class="timer-icon">⏱</span><span id="timer-display">${mins}:${secs}</span></div>
    </div>
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${((currentQIndex+1)/n)*100}%"></div></div>
    <div class="mobile-palette-bar">
      <span class="q-number-m">Q${currentQIndex+1}/${n}</span>
      <button class="mobile-palette-toggle" onclick="toggleMobilePalette()">📋 Palette (${answered}/${n})</button>
    </div>
    <div class="quiz-body">
      <div class="quiz-main">
        <div class="question-header"><span class="q-number">Q${currentQIndex+1} <span style="color:var(--text-muted)">/ ${n}</span></span><span class="q-tag">${q.tag}</span></div>
        <div class="question-text">${q.q}</div>
        <div class="options-list" id="options-list">${optionsHTML}</div>
      </div>
      <div class="quiz-sidebar" id="quiz-sidebar">
        <div class="sidebar-header-row"><div class="sidebar-title">Question Palette</div><button class="sidebar-close-mobile" onclick="toggleMobilePalette()">✕</button></div>
        <div class="q-palette">${palette}</div>
        <div class="sidebar-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#FF6B35"></div>Current</div>
          <div class="legend-item"><div class="legend-dot" style="background:rgba(46,204,113,0.5);border:1px solid #2ECC71"></div>Answered</div>
          <div class="legend-item"><div class="legend-dot" style="background:rgba(243,156,18,0.3);border:1px solid #F39C12"></div>Skipped</div>
          <div class="legend-item"><div class="legend-dot" style="background:#2A2F50"></div>Not Visited</div>
        </div>
        <div class="sidebar-submit-section">
          <div class="answered-count">Answered: <strong style="color:var(--success)">${answered}</strong> / ${n}</div>
          <button class="btn-submit-test" onclick="confirmSubmit()">✓ Submit Test</button>
        </div>
      </div>
    </div>
    <div class="quiz-footer">
      <div class="quiz-footer-info">Question ${currentQIndex+1} of ${n}</div>
      <div class="quiz-footer-btns">
        ${currentQIndex>0?`<button class="btn-cancel" onclick="prevQuestion()">← Prev</button>`:''}
        <button class="btn-skip" onclick="skipQuestion()">Skip →</button>
        ${isLast?`<button class="btn-submit-test" onclick="confirmSubmit()">Submit ✓</button>`:`<button class="btn-next" onclick="nextQuestion()">Next →</button>`}
      </div>
    </div>
  </div>`;
}

function toggleMobilePalette(){const s=document.getElementById('quiz-sidebar');if(s)s.classList.toggle('palette-open');}

function selectOption(optIdx){
  answers[currentQIndex]=optIdx;
  const test=ALL_TESTS.find(t=>t.id===currentTestId),q=test.questions[currentQIndex],n=test.questions.length;
  const answered=answers.filter(a=>a!==-1).length;
  const optsList=document.getElementById('options-list');
  if(optsList) {
    const is5=q.opts.length===5;
    optsList.innerHTML=q.opts.map((opt,i)=>`<div class="option-item ${answers[currentQIndex]===i?'selected':''} ${is5?'opt-5':'opt-4'}" onclick="selectOption(${i})"><div class="option-label">${String.fromCharCode(65+i)}</div><div class="option-text">${opt}</div></div>`).join('');
  }
  const palette=document.querySelector('.q-palette');
  if(palette) palette.innerHTML=test.questions.map((_,i)=>{let cls='';if(i===currentQIndex)cls='q-current';else if(answers[i]!==-1)cls='q-answered';else if(skipped[i])cls='q-skipped';return `<div class="q-dot ${cls}" onclick="goToQuestion(${i})">${i+1}</div>`;}).join('');
  const ac=document.querySelector('.answered-count');if(ac)ac.innerHTML=`Answered: <strong style="color:var(--success)">${answered}</strong> / ${n}`;
  const mb=document.querySelector('.mobile-palette-toggle');if(mb)mb.textContent=`📋 Palette (${answered}/${n})`;
}

function nextQuestion(){const test=ALL_TESTS.find(t=>t.id===currentTestId);if(currentQIndex<test.questions.length-1){currentQIndex++;renderQuizScreen();}}
function prevQuestion(){if(currentQIndex>0){currentQIndex--;renderQuizScreen();}}
function skipQuestion(){skipped[currentQIndex]=true;const test=ALL_TESTS.find(t=>t.id===currentTestId);if(currentQIndex<test.questions.length-1)currentQIndex++;renderQuizScreen();}
function goToQuestion(idx){currentQIndex=idx;const s=document.getElementById('quiz-sidebar');if(s)s.classList.remove('palette-open');renderQuizScreen();}

function confirmSubmit(){
  const test=ALL_TESTS.find(t=>t.id===currentTestId);
  const answered=answers.filter(a=>a!==-1).length,unanswered=test.questions.length-answered;
  if(unanswered>0){
    const o=document.createElement('div');o.className='confirm-overlay';o.style.zIndex='6000';
    o.innerHTML=`<div class="confirm-box"><h3>⚠️ Submit Test?</h3><p>You have <strong style="color:var(--warning)">${unanswered} unanswered</strong> question(s).</p><div class="confirm-btns"><button class="btn-outline-sm" onclick="this.closest('.confirm-overlay').remove()">Continue</button><button class="btn-auth-submit" style="max-width:160px" onclick="this.closest('.confirm-overlay').remove();submitTest()">Submit Anyway</button></div></div>`;
    document.body.appendChild(o);
  } else { submitTest(); }
}

function startTimer(){
  if(timerInterval)clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    timeLeft--;
    const el=document.getElementById('timer-display'),wrap=document.getElementById('quiz-timer');
    if(el){el.textContent=`${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`;if(wrap)wrap.className='quiz-timer'+(timeLeft<120?' danger':timeLeft<300?' warning':'');}
    if(timeLeft<=0){clearInterval(timerInterval);submitTest(true);}
  },1000);
}

function submitTest(autoSubmit=false){
  if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
  timeTaken=totalTime-timeLeft;
  const test=ALL_TESTS.find(t=>t.id===currentTestId);
  let score=0;test.questions.forEach((q,i)=>{if(answers[i]===q.ans)score++;});
  const wrong=answers.filter((a,i)=>a!==-1&&a!==test.questions[i].ans).length;
  const skippedCount=answers.filter(a=>a===-1).length;
  const attempted=answers.filter(a=>a!==-1).length;
  const accuracy=attempted>0?Math.round((score/attempted)*100):0;
  const results=loadResults();
  results[test.id]={score,total:test.questions.length,timeTaken,accuracy,wrong,skipped:skippedCount,date:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),answers:[...answers]};
  saveResults(results, test.id);
  const rank=Math.max(1,Math.round(85*(1-score/test.questions.length))),totalStudents=85,percentile=Math.round(((totalStudents-rank)/totalStudents)*100);
  renderResultScreen(test,score,wrong,skippedCount,accuracy,rank,totalStudents,percentile);
  renderTests(currentFilter);document.body.style.overflow='hidden';
}

function renderResultScreen(test,score,wrong,skippedParam,accuracy,rank,totalStudents,percentile){
  const timeMins=Math.floor(timeTaken/60).toString().padStart(2,'0'),timeSecs=(timeTaken%60).toString().padStart(2,'0');
  const totalMins=Math.floor(totalTime/60).toString().padStart(2,'0'),totalSecs=(totalTime%60).toString().padStart(2,'0');
  const C=2*Math.PI*25,rankFill=((totalStudents-rank)/totalStudents)*C,pctFill=(percentile/100)*C,accFill=(accuracy/100)*C;
  const scorePct=Math.round((score/test.questions.length)*100);
  const performLabel=scorePct>=80?'🏆 Excellent!':scorePct>=60?'👍 Good Job!':scorePct>=40?'📚 Keep Practicing':'💪 Needs Improvement';
  document.getElementById('modal-content').innerHTML=`<div class="result-screen">
    <div class="result-header">
      <div><div class="result-header-badge">📊 Overall Performance Summary</div><h2 class="result-title">${test.icon} ${test.title}</h2><p class="result-sub">Attempted: ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p></div>
      <button class="btn-back modal-close-btn" onclick="closeModal()">✕</button>
    </div>
    <div class="result-body">
      <div class="score-card-big"><div class="score-circle"><span class="sc-big">${score}</span><span class="sc-small">/${test.questions.length}</span></div><div class="score-card-info"><h3>${score}.0 <span>| ${test.questions.length}</span></h3><p>Your Score</p><div class="perf-label">${performLabel}</div></div></div>
      <div class="time-card"><div class="time-icon">⏱</div><div class="time-vals"><h3>${timeMins}:${timeSecs} <span>| ${totalMins}:${totalSecs}</span></h3><p>Time Spent</p></div></div>
      <div class="stats-trio">
        <div class="trio-card ring-rank"><div class="trio-ring"><svg viewBox="0 0 60 60" width="60" height="60"><circle class="trio-ring-bg" cx="30" cy="30" r="25"/><circle class="trio-ring-fill" cx="30" cy="30" r="25" stroke-dasharray="${C}" stroke-dashoffset="${C-rankFill}"/></svg><div class="trio-val">${rank}</div></div><div class="trio-main" style="color:var(--gold)">${rank} <span class="trio-total">| ${totalStudents}</span></div><div class="trio-lbl">Your Rank</div></div>
        <div class="trio-card ring-pct"><div class="trio-ring"><svg viewBox="0 0 60 60" width="60" height="60"><circle class="trio-ring-bg" cx="30" cy="30" r="25"/><circle class="trio-ring-fill" cx="30" cy="30" r="25" stroke-dasharray="${C}" stroke-dashoffset="${C-pctFill}"/></svg><div class="trio-val">${percentile}%</div></div><div class="trio-main" style="color:var(--danger)">${percentile} <span class="trio-total">| 100</span></div><div class="trio-lbl">Percentile</div></div>
        <div class="trio-card ring-acc"><div class="trio-ring"><svg viewBox="0 0 60 60" width="60" height="60"><circle class="trio-ring-bg" cx="30" cy="30" r="25"/><circle class="trio-ring-fill" cx="30" cy="30" r="25" stroke-dasharray="${C}" stroke-dashoffset="${C-accFill}"/></svg><div class="trio-val">${accuracy}%</div></div><div class="trio-main" style="color:var(--info)">${accuracy} <span class="trio-total">| 100</span></div><div class="trio-lbl">Accuracy</div></div>
      </div>
      <div class="result-action-row"><button class="btn-share" onclick="shareResult()">⬆ Share</button><button class="btn-reattempt-big" onclick="startTest(${test.id})">↩ Re-Attempt</button></div>
      <div class="sectional-summary">
        <div class="section-title-bar"><h3>Sectional Summary</h3></div>
        <div class="breakdown-row"><div class="bdown-card bdown-correct"><div class="bdown-num">${score}</div><div class="bdown-lbl">Correct</div></div><div class="bdown-card bdown-wrong"><div class="bdown-num">${wrong}</div><div class="bdown-lbl">Wrong</div></div><div class="bdown-card bdown-skip"><div class="bdown-num">${skippedParam}</div><div class="bdown-lbl">Skipped</div></div></div>
      </div>
      <button class="view-sol-btn" onclick="viewSolutions(${test.id})">📖 View Solutions</button>
    </div>
  </div>`;
}

function viewSolutions(testId){
  const test=ALL_TESTS.find(t=>t.id===testId),results=loadResults(),res=results[testId];
  const userAnsArr=res?res.answers:answers;
  let solHTML='';
  test.questions.forEach((q,i)=>{
    const ua=userAnsArr[i];let badge='sol-skip-badge',badgeTxt='Skipped';
    if(ua!==-1&&ua!==undefined){if(ua===q.ans){badge='sol-correct-badge';badgeTxt='✓ Correct';}else{badge='sol-wrong-badge';badgeTxt='✗ Wrong';}}
    const optsHTML=q.opts.map((opt,j)=>{let cls='';if(j===q.ans)cls='sol-correct-opt';else if(j===ua&&ua!==q.ans)cls='sol-wrong-opt';return `<div class="sol-opt ${cls}"><span class="sol-opt-label">${String.fromCharCode(65+j)}.</span>${opt}</div>`;}).join('');
    solHTML+=`<div class="sol-item"><div class="sol-q-header"><span class="sol-q-num">Q${i+1}</span><span class="sol-result-badge ${badge}">${badgeTxt}</span><span class="q-tag">${q.tag}</span></div><div class="sol-q-text">${q.q}</div><div class="sol-options">${optsHTML}</div><div class="sol-explanation"><div class="sol-exp-title">💡 Explanation</div>${q.exp}</div></div>`;
  });
  document.getElementById('modal-content').innerHTML=`<div class="solutions-screen"><div class="sol-header"><h2>📖 Solutions — ${test.title}</h2><button class="btn-back" onclick="goBackToResult(${testId})">← Back</button></div>${solHTML}<div style="padding:24px 0;display:flex;gap:12px;justify-content:center;"><button class="btn-reattempt-big" onclick="startTest(${testId})">↩ Re-Attempt</button><button class="btn-share" onclick="closeModal()">✕ Close</button></div></div>`;
}

function goBackToResult(testId){
  const test=ALL_TESTS.find(t=>t.id===testId),results=loadResults(),res=results[testId];
  if(res){timeTaken=res.timeTaken||0;const rank=Math.max(1,Math.round(85*(1-res.score/res.total)));renderResultScreen(test,res.score,res.wrong,res.skipped,res.accuracy,rank,85,Math.round(((85-rank)/85)*100));}
}

function shareResult(){
  const test=ALL_TESTS.find(t=>t.id===currentTestId),results=loadResults(),res=results[currentTestId];
  const txt=`📊 DataMinds Result\n${test?test.title:'Test'}\nScore: ${res?.score||0}/${res?.total||20}\nAccuracy: ${res?.accuracy||0}%\n🎯 BPSC TRE 4.0 Prep!\n#DataMinds #BPSC_TRE4`;
  if(navigator.share)navigator.share({title:'DataMinds Result',text:txt}).catch(()=>copyToClipboard(txt));else copyToClipboard(txt);
}
function copyToClipboard(text){
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>showToast('✅ Copied!'));
  else{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('✅ Copied!');}
}

// ── INIT ──
document.addEventListener('DOMContentLoaded',()=>{
  renderCategoryBar(); renderSubjectBar(); renderSectionTabs(); renderAdvancedFilters();
  const overlay=document.getElementById('modal-overlay');
  if(overlay){
    overlay.addEventListener('click',(e)=>{
      if(e.target===overlay){
        if(timerInterval){
          const o=document.createElement('div');o.className='confirm-overlay';o.style.zIndex='6000';
          o.innerHTML=`<div class="confirm-box"><h3>⚠️ Exit Test?</h3><p>Answers will be lost. Exit anyway?</p><div class="confirm-btns"><button class="btn-outline-sm" onclick="this.closest('.confirm-overlay').remove()">Stay</button><button class="btn-danger-sm" onclick="this.closest('.confirm-overlay').remove();closeModal()">Exit</button></div></div>`;
          document.body.appendChild(o);
        }else{closeModal();}
      }
    });
  }
  document.addEventListener('keydown',(e)=>{
    if(!overlay||overlay.classList.contains('hidden'))return;
    if(e.key==='ArrowRight'||e.key==='n')nextQuestion();
    if(e.key==='ArrowLeft'||e.key==='p')prevQuestion();
    if(e.key==='1'||e.key==='a')selectOption(0);
    if(e.key==='2'||e.key==='b')selectOption(1);
    if(e.key==='3'||e.key==='c')selectOption(2);
    if(e.key==='4'||e.key==='d')selectOption(3);
  });
});

// ═══════════════════════════════════════════════════════
// PROFESSIONAL UI — Sidebar + New Cards (v3.0)
// ═══════════════════════════════════════════════════════

let sidebarFilter = 'all';
let sidebarDiff   = 'all';
let sidebarType   = 'all';

function buildProUI() {
  const testsSection = document.getElementById('section-tests');
  if (!testsSection) return;

  // Replace inner content with new layout
  const existingContent = testsSection.querySelector('.content-area');
  const heroBanner = testsSection.querySelector('.hero-banner');

  // Build new layout
  testsSection.innerHTML = `
    ${heroBanner ? heroBanner.outerHTML : ''}
    <div class="tests-layout">
      <!-- SIDEBAR -->
      <aside class="tests-sidebar" id="pro-sidebar">
        <div class="sidebar-section-title">Browse Tests</div>
        <div class="sidebar-link active" id="sbl-all" onclick="setSidebarFilter('all')">
          <span class="sl-icon">📝</span> All Tests <span class="sl-count" id="sc-all">20</span>
        </div>
        <div class="sidebar-link" id="sbl-attempted" onclick="setSidebarFilter('attempted')">
          <span class="sl-icon">✅</span> Completed <span class="sl-count" id="sc-attempted">0</span>
        </div>
        <div class="sidebar-link" id="sbl-unattempted" onclick="setSidebarFilter('unattempted')">
          <span class="sl-icon">⭕</span> Not Attempted <span class="sl-count" id="sc-unattempted">20</span>
        </div>
        <div class="sidebar-link" id="sbl-bookmarked" onclick="setSidebarFilter('bookmarked')">
          <span class="sl-icon">🔖</span> Saved <span class="sl-count" id="sc-bookmarked">0</span>
        </div>
        <div class="sidebar-link" id="sbl-free" onclick="setSidebarFilter('free')">
          <span class="sl-icon">🆓</span> Free Tests <span class="sl-count">5</span>
        </div>
        <div class="sidebar-link" id="sbl-premium" onclick="setSidebarFilter('premium')">
          <span class="sl-icon">🔒</span> Premium <span class="sl-count">15</span>
        </div>

        <div class="sidebar-section-title">Difficulty</div>
        <div class="sidebar-diff-item active" id="sdiff-all" onclick="setSidebarDiff('all')">
          <div class="sdiff-dot" style="background:var(--text-muted)"></div> All Levels
        </div>
        <div class="sidebar-diff-item" id="sdiff-easy" onclick="setSidebarDiff('easy')">
          <div class="sdiff-dot" style="background:#10B981"></div> Easy
        </div>
        <div class="sidebar-diff-item" id="sdiff-medium" onclick="setSidebarDiff('medium')">
          <div class="sdiff-dot" style="background:#F59E0B"></div> Medium
        </div>
        <div class="sidebar-diff-item" id="sdiff-hard" onclick="setSidebarDiff('hard')">
          <div class="sdiff-dot" style="background:#EF4444"></div> Hard
        </div>
      </aside>

      <!-- CONTENT -->
      <div class="tests-content">
        <!-- TOP BAR -->
        <div class="content-topbar">
          <div class="content-tabs">
            <button class="ctab active" id="ctab-topic" onclick="switchProSection('topic')">📚 Topic-wise</button>
            <button class="ctab" id="ctab-full" onclick="switchProSection('full')">📋 Full Mock</button>
            <button class="ctab" id="ctab-pyq" onclick="switchProSection('pyq')">🗂️ PYQ</button>
          </div>
          <div class="content-search">
            <input type="text" placeholder="Search tests..." oninput="proSearch(this.value)" id="pro-search">
          </div>
        </div>

        <!-- RESULTS COUNT -->
        <div class="results-bar">
          <div class="results-count" id="results-count">Showing <strong>20</strong> tests</div>
        </div>

        <!-- GRID -->
        <div class="tests-grid-new" id="pro-tests-grid"></div>
      </div>
    </div>
  `;

  renderProTests();
  updateSidebarCounts();
}

function setSidebarFilter(f) {
  sidebarFilter = f;
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
  document.getElementById('sbl-' + f)?.classList.add('active');
  renderProTests();
}

function setSidebarDiff(d) {
  sidebarDiff = d;
  document.querySelectorAll('.sidebar-diff-item').forEach(el => el.classList.remove('active'));
  document.getElementById('sdiff-' + d)?.classList.add('active');
  renderProTests();
}

function switchProSection(sec) {
  document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
  document.getElementById('ctab-' + sec)?.classList.add('active');
  currentSection = sec;

  if (sec !== 'topic') {
    const grid = document.getElementById('pro-tests-grid');
    if (grid) grid.innerHTML = `
      <div class="coming-soon-pro">
        <div class="cs-icon">${sec === 'full' ? '📋' : '🗂️'}</div>
        <h3>${sec === 'full' ? 'Full Length Mock Tests' : 'Previous Year Questions'}</h3>
        <p>Coming soon! We're preparing high-quality ${sec === 'full' ? 'full-length mock tests' : 'PYQ papers'} for you.</p>
        <button class="btn-primary-sm" onclick="switchProSection('topic')">← Back to Topic Tests</button>
      </div>`;
    return;
  }
  renderProTests();
}

let proSearchQuery = '';
function proSearch(q) { proSearchQuery = q; renderProTests(); }

function renderProTests() {
  const grid = document.getElementById('pro-tests-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const results   = loadResults();
  const bookmarks = getBookmarks();

  let list = ALL_TESTS.filter(t => {
    const attempted  = !!results[t.id];
    const bookmarked = bookmarks.includes(t.id);
    const diff       = TEST_DIFFICULTY[t.id] || 'medium';
    const premium    = isPremium(t.id);

    if (sidebarFilter === 'attempted'   && !attempted)  return false;
    if (sidebarFilter === 'unattempted' &&  attempted)  return false;
    if (sidebarFilter === 'bookmarked'  && !bookmarked) return false;
    if (sidebarFilter === 'free'        &&  premium)    return false;
    if (sidebarFilter === 'premium'     && !premium)    return false;
    if (sidebarDiff !== 'all' && diff !== sidebarDiff)  return false;
    if (proSearchQuery) {
      const q = proSearchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q);
    }
    return true;
  });

  // Update count
  const countEl = document.getElementById('results-count');
  if (countEl) countEl.innerHTML = `Showing <strong>${list.length}</strong> test${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state-pro">
        <div class="es-icon">🔍</div>
        <h3>No tests found</h3>
        <p>Try adjusting your filters or search query.</p>
        <button class="btn-primary-sm" onclick="setSidebarFilter('all');setSidebarDiff('all');document.getElementById('pro-search').value='';proSearch('')">Clear Filters</button>
      </div>`;
    return;
  }

  list.forEach((test, idx) => {
    const res        = results[test.id];
    const attempted  = !!res;
    const score      = attempted ? res.score : 0;
    const total      = test.totalQuestions || test.questions.length;
    const pct        = attempted ? Math.round((score / total) * 100) : 0;
    const diff       = TEST_DIFFICULTY[test.id] || 'medium';
    const premium    = isPremium(test.id);
    const unlocked   = isUnlocked(test.id);
    const bookmarked = isBookmarked(test.id);
    const attempts   = TEST_ATTEMPT_COUNTS[test.id] || 100;
    const rating     = TEST_RATINGS[test.id] || 4.5;
    const isNew      = test.id <= 3 && !attempted;
    const scoreFillClass = pct >= 60 ? 'good' : pct >= 40 ? 'ok' : 'low';

    const card = document.createElement('div');
    card.className = `test-card-pro ${premium && !unlocked ? 'locked' : ''}`;
    card.style.animationDelay = `${idx * 0.03}s`;

    card.innerHTML = `
      <div class="tcp-strip ${diff}"></div>
      <div class="tcp-body">
        <div class="tcp-header">
          <div class="tcp-num ${attempted ? 'attempted' : ''}">${test.id < 10 ? '0' + test.id : test.id}</div>
          <div class="tcp-title-wrap">
            <div class="tcp-title">${test.icon} ${test.title}</div>
            <div class="tcp-subtitle">${test.subtitle}</div>
          </div>
          <div class="tcp-badges">
            ${isNew ? '<span class="tcp-badge-new">NEW</span>' : ''}
            ${premium && !unlocked ? '<span class="tcp-badge-pro">PRO</span>' : ''}
            ${attempted ? '<span class="tcp-badge-done">✓ Done</span>' : ''}
            <button class="tcp-bookmark" onclick="proBookmark(event,${test.id})">${bookmarked ? '🔖' : '🏷️'}</button>
          </div>
        </div>

        <div class="tcp-meta">
          <span class="tcp-diff ${diff}">${diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
          <span class="tcp-info">❓ ${total} Qs</span>
          <span class="tcp-info">⏱ ${test.timeLimit||20} Min</span>
          <span class="tcp-info">👥 ${attempts.toLocaleString()}</span>
        </div>

        ${attempted ? `
          <div class="tcp-score-section">
            <div class="tcp-score-bar"><div class="tcp-score-fill ${scoreFillClass}" style="width:${pct}%"></div></div>
            <div class="tcp-score-text ${pct >= 60 ? 'good' : ''}">Score: ${score}/${total} (${pct}%)</div>
          </div>` : `<div class="tcp-not-attempted" style="color:var(--text-secondary);font-size:12px;font-style:italic">⭕ Not attempted yet</div>`}
      </div>

      <div class="tcp-footer">
        <div>
          <div class="tcp-rating">⭐ ${rating}</div>
        </div>
        ${premium && !unlocked
          ? `<button class="tcp-btn tcp-btn-unlock" onclick="openPaymentModal(${test.id})">🔓 Unlock ₹99</button>`
          : `<button class="tcp-btn ${attempted ? 'tcp-btn-retry' : 'tcp-btn-start'}" onclick="(typeof openTestIntroWithDB!=='undefined'&&(!ALL_TESTS.find(t=>t.id===${test.id})?.questions?.length)?openTestIntroWithDB:openTestIntro)(${test.id})">
              ${attempted ? '↩ Re-Attempt' : '▶ Start Test'}
            </button>`}
      </div>
    `;
    grid.appendChild(card);
  });
}

function proBookmark(e, testId) {
  e.stopPropagation();
  const added = toggleBookmark(testId);
  showToast(added ? '🔖 Bookmarked!' : 'Bookmark removed');
  renderProTests();
  updateSidebarCounts();
}

function updateSidebarCounts() {
  const results   = loadResults();
  const bookmarks = getBookmarks();
  const attempted = ALL_TESTS.filter(t => !!results[t.id]).length;
  const sc = document.getElementById('sc-all');        if (sc) sc.textContent = ALL_TESTS.length;
  const sa = document.getElementById('sc-attempted');  if (sa) sa.textContent = attempted;
  const su = document.getElementById('sc-unattempted');if (su) su.textContent = ALL_TESTS.length - attempted;
  const sb = document.getElementById('sc-bookmarked'); if (sb) sb.textContent = bookmarks.length;
}

// Override showAppSection to build pro UI
const _origShowAppSection = typeof showAppSection === 'function' ? showAppSection : null;

// Hook into DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Build pro UI after auth loads
  const origOnLoginSuccess = window.onLoginSuccess;
  setTimeout(() => {
    const appWrapper = document.getElementById('app-wrapper');
    if (appWrapper) {
      const observer = new MutationObserver(() => {
        if (appWrapper.style.display !== 'none') {
          buildProUI();
          observer.disconnect();
        }
      });
      observer.observe(appWrapper, { attributes: true, attributeFilter: ['style'] });
    }
  }, 100);
});
