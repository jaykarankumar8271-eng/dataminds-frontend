// ═══════════════════════════════════════════════════════
// AUTH.JS — MySQL Backend Connected
// SarkariMockTest Test Series
// ═══════════════════════════════════════════════════════

// ══ BACKEND URL — Railway deploy ke baad yahan apna URL daalo ══
const API_URL = 'https://dataminds-backend.onrender.com'; // TODO: Update to your Render URL
// Example: const API_URL = 'https://dataminds-production.up.railway.app';

// ── TOKEN ──
const TOKEN_KEY = 'dm_token';
const USER_KEY  = 'dm_user';
function getToken()       { return localStorage.getItem(TOKEN_KEY); }
function setToken(t)      { localStorage.setItem(TOKEN_KEY, t); }
function clearToken()     { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
function getStoredUser()  { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }
function setStoredUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }

// ── API HELPER ──
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  try {
    const res  = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
  } catch (err) {
    throw new Error(err.message || 'Network error');
  }
}

// ── INIT ──
async function authInit() {
  const token = getToken();
  const user  = getStoredUser();
  if (token && user) {
    try {
      const data = await apiCall('/api/profile');
      onLoginSuccess(data.user, false, true);
      return;
    } catch { clearToken(); }
  }
  document.getElementById('auth-wrapper').style.display = 'block';
  document.getElementById('app-wrapper').style.display  = 'none';
  showPage('page-landing');
}

// ── PAGE NAVIGATION ──
function showPage(pageId) {
  document.querySelectorAll('.auth-page').forEach(p => p.style.display = 'none');
  const page = document.getElementById(pageId);
  if (page) { page.style.display = 'flex'; page.scrollTop = 0; }
  ['register-error','login-error','forgot-error','forgot-msg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// ── REGISTER ──
async function doRegister() {
  const fname   = document.getElementById('reg-fname').value.trim();
  const lname   = document.getElementById('reg-lname').value.trim();
  const email   = document.getElementById('reg-email').value.trim().toLowerCase();
  const phone   = document.getElementById('reg-phone').value.trim();
  const state   = document.getElementById('reg-state').value;
  const exam    = document.getElementById('reg-exam').value;
  const pass    = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const terms   = document.getElementById('reg-terms').checked;
  const errEl   = document.getElementById('register-error');
  const btn     = document.querySelector('#page-register .btn-auth-submit');
  const showErr = (msg) => { errEl.textContent = msg; errEl.style.display = 'block'; };

  if (!fname)  return showErr('Please enter your first name.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr('Please enter a valid email address.');
  if (!phone || !/^\d{10}$/.test(phone)) return showErr('Please enter a valid 10-digit mobile number.');
  if (!state)  return showErr('Please select your state.');
  if (pass.length < 6) return showErr('Password must be at least 6 characters.');
  if (pass !== confirm) return showErr('Passwords do not match.');
  if (!terms)  return showErr('Please accept the Terms of Service.');

  btn.disabled = true; errEl.style.display = 'none'; showLoginLoading(btn);
  try {
    const data = await apiCall('/api/register', 'POST', { fname, lname, email, phone, state, exam_target: exam, password: pass });
    setToken(data.token); setStoredUser(data.user);
    onLoginSuccess(data.user, true, true);
  } catch (err) { showErr(err.message); }
  finally { hideLoginLoading(btn, 'Create Account →'); }
}

// ── LOGIN ──
async function doLogin() {
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const pass     = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;
  const errEl    = document.getElementById('login-error');
  const btn      = document.querySelector('#page-login .btn-auth-submit');
  const showErr  = (msg) => { errEl.textContent = msg; errEl.style.display = 'block'; };

  if (!email) return showErr('Please enter your email address.');
  if (!pass)  return showErr('Please enter your password.');

  btn.disabled = true; errEl.style.display = 'none'; showLoginLoading(btn);
  try {
    const data = await apiCall('/api/login', 'POST', { email, password: pass });
    if (remember) { setToken(data.token); setStoredUser(data.user); }
    onLoginSuccess(data.user, false, remember);
  } catch (err) { showErr(err.message); }
  finally { hideLoginLoading(btn, 'Log In →'); }
}

// ── FORGOT PASSWORD ──
async function doForgotPassword() {
  const email = document.getElementById('forgot-email').value.trim().toLowerCase();
  const errEl = document.getElementById('forgot-error');
  const msgEl = document.getElementById('forgot-msg');
  const btn   = document.querySelector('#page-forgot .btn-auth-submit');
  errEl.style.display = 'none';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = 'Please enter a valid email.'; errEl.style.display = 'block'; return;
  }
  btn.textContent = 'Sending...'; btn.disabled = true;
  try {
    const data = await apiCall('/api/forgot-password', 'POST', { email });
    msgEl.innerHTML = `✅ ${data.message}`; msgEl.style.display = 'block';
  } catch (err) { errEl.textContent = err.message; errEl.style.display = 'block'; }
  finally { btn.textContent = 'Send Reset Link →'; btn.disabled = false; }
}

// ── LOGOUT ──
function doLogout() {
  clearToken();
  document.getElementById('app-wrapper').style.display  = 'none';
  document.getElementById('auth-wrapper').style.display = 'block';
  if (typeof timerInterval !== 'undefined' && timerInterval) clearInterval(timerInterval);
  showPage('page-landing');
  showToast('Logged out successfully');
}

// ── ON LOGIN SUCCESS ──
function onLoginSuccess(user, isNew = false, remember = true) {
  if (remember) setStoredUser(user);
  document.getElementById('auth-wrapper').style.display = 'none';
  document.getElementById('app-wrapper').style.display  = 'block';
  const initials = (user.fname[0] + (user.lname ? user.lname[0] : '')).toUpperCase();
  document.getElementById('header-avatar').textContent   = initials;
  document.getElementById('header-username').textContent = user.fname;
  document.getElementById('dropdown-avatar').textContent = initials;
  document.getElementById('dropdown-name').textContent   = `${user.fname} ${user.lname || ''}`;
  document.getElementById('dropdown-email').textContent  = user.email;
  showAppSection('tests');
  renderTests('all');
  if (isNew) showToast(`🎉 Welcome to SarkariMockTest, ${user.fname}!`);
  else       showToast(`Welcome back, ${user.fname}! 🎯`);
}

// ── CURRENT USER ──
function getCurrentUser() { return getStoredUser(); }

// ── RESULTS ──
async function getUserResults() {
  try {
    const data = await apiCall('/api/results');
    return data.results || {};
  } catch {
    try { return JSON.parse(localStorage.getItem('dm_results_local') || '{}'); } catch { return {}; }
  }
}

async function saveUserResults(results, newResult = null) {
  localStorage.setItem('dm_results_local', JSON.stringify(results));
  if (newResult) {
    try { await apiCall('/api/results', 'POST', newResult); }
    catch (err) { console.warn('Backend save failed:', err.message); }
  }
}

// ── PROFILE ──
function loadProfileForm() {
  const user = getStoredUser(); if (!user) return;
  document.getElementById('edit-fname').value = user.fname || '';
  document.getElementById('edit-lname').value = user.lname || '';
  document.getElementById('edit-phone').value = user.phone || '';
  document.getElementById('edit-state').value = user.state || 'Bihar';
  document.getElementById('edit-exam').value  = user.exam_target || 'BPSC TRE 4.0';
  const initials = (user.fname[0] + (user.lname ? user.lname[0] : '')).toUpperCase();
  document.getElementById('profile-avatar-big').textContent    = initials;
  document.getElementById('profile-fullname').textContent      = `${user.fname} ${user.lname || ''}`;
  document.getElementById('profile-email-display').textContent = user.email;
  document.getElementById('profile-exam-badge').textContent    = user.exam_target || 'BPSC TRE 4.0';
}

async function saveProfile() {
  const fname = document.getElementById('edit-fname').value.trim();
  const lname = document.getElementById('edit-lname').value.trim();
  const phone = document.getElementById('edit-phone').value.trim();
  const state = document.getElementById('edit-state').value;
  const exam  = document.getElementById('edit-exam').value;
  const msgEl = document.getElementById('profile-update-msg');
  if (!fname) { showToast('Please enter your first name'); return; }
  try {
    const data = await apiCall('/api/profile', 'PUT', { fname, lname, phone, state, exam_target: exam });
    setStoredUser(data.user);
    const initials = (fname[0] + (lname ? lname[0] : '')).toUpperCase();
    document.getElementById('header-avatar').textContent    = initials;
    document.getElementById('header-username').textContent  = fname;
    document.getElementById('dropdown-avatar').textContent  = initials;
    document.getElementById('dropdown-name').textContent    = `${fname} ${lname}`;
    document.getElementById('profile-avatar-big').textContent = initials;
    document.getElementById('profile-fullname').textContent   = `${fname} ${lname}`;
    document.getElementById('profile-exam-badge').textContent = exam;
    msgEl.textContent = '✅ Profile updated!'; msgEl.style.display = 'block';
    showToast('Profile saved! ✅');
    setTimeout(() => msgEl.style.display = 'none', 3000);
  } catch (err) { showToast('Error: ' + err.message); }
}

async function changePassword() {
  const newPass = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-new-password').value;
  if (newPass.length < 6) return showToast('Password must be at least 6 characters');
  if (newPass !== confirm) return showToast('Passwords do not match');
  try {
    await apiCall('/api/change-password', 'PUT', { new_password: newPass });
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    showToast('Password updated! 🔒');
  } catch (err) { showToast('Error: ' + err.message); }
}

function confirmDeleteAccount() {
  showConfirm('Delete Account?', 'This will permanently delete your account and all results.', async () => {
    try {
      await apiCall('/api/account', 'DELETE');
      clearToken();
      document.getElementById('app-wrapper').style.display  = 'none';
      document.getElementById('auth-wrapper').style.display = 'block';
      showPage('page-register');
      showToast('Account deleted');
    } catch (err) { showToast('Error: ' + err.message); }
  });
}

// renderLeaderboard and renderDashboard are in dashboard_lb.js
// ── APP SECTIONS ──
function showAppSection(section) {
  ['tests','dashboard','leaderboard','profile'].forEach(s => {
    const el = document.getElementById('section-'+s); if(el) el.style.display = s===section?'block':'none';
    const bn = document.getElementById('bn-'+s); if(bn) bn.classList.toggle('bn-active', s===section);
  });
  document.querySelectorAll('.desktop-nav a').forEach(a=>a.classList.remove('nav-active'));
  const navLinks = document.querySelectorAll('.desktop-nav a');
  const navMap = {tests:0,dashboard:1,leaderboard:2};
  if(navMap[section]!==undefined && navLinks[navMap[section]]) navLinks[navMap[section]].classList.add('nav-active');
  if(section==='dashboard')   renderDashboard();
  if(section==='leaderboard') renderLeaderboard();
  if(section==='profile')     loadProfileForm();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ── UI HELPERS ──
function toggleUserMenu() { const dd=document.getElementById('user-dropdown'); dd.style.display=dd.style.display==='none'?'block':'none'; }
function closeUserMenu()  { document.getElementById('user-dropdown').style.display='none'; }
document.addEventListener('click',(e)=>{ if(!e.target.closest('#user-menu-trigger')&&!e.target.closest('#user-dropdown')) closeUserMenu(); });
function toggleMobileMenu() { document.getElementById('mobile-nav').classList.toggle('open'); document.getElementById('hamburger-btn').classList.toggle('open'); }
function togglePwd(inputId,btn) { const input=document.getElementById(inputId); if(input.type==='password'){input.type='text';btn.textContent='🙈';}else{input.type='password';btn.textContent='👁';} }
let toastTimer;
function showToast(msg,duration=3000) { const t=document.getElementById('toast-notification'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),duration); }
function showConfirm(title,msg,onConfirm) {
  const overlay=document.createElement('div'); overlay.className='confirm-overlay';
  overlay.innerHTML=`<div class="confirm-box"><h3>${title}</h3><p>${msg}</p><div class="confirm-btns"><button class="btn-outline-sm" onclick="this.closest('.confirm-overlay').remove()">Cancel</button><button class="btn-danger-sm" id="confirm-yes-btn">Yes, Delete</button></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#confirm-yes-btn').onclick=()=>{overlay.remove();onConfirm();};
}
document.addEventListener('keydown',(e)=>{
  if(e.key==='Enter'){
    const lp=document.getElementById('page-login'); const fp=document.getElementById('page-forgot');
    if(lp&&lp.style.display!=='none') doLogin();
    if(fp&&fp.style.display!=='none') doForgotPassword();
  }
});
document.addEventListener('DOMContentLoaded', authInit);

// ═══════════════════════════════════════════════════════
// LOADING UI — Smart loading with server wake-up message
// ═══════════════════════════════════════════════════════

function showLoginLoading(btn) {
  btn.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:10px;justify-content:center">
      <span class="auth-spinner"></span>
      <span id="loading-msg-text">Connecting...</span>
    </span>`;

  // After 3 seconds, show server wake-up message
  btn._loadingTimer1 = setTimeout(() => {
    const msgEl = document.getElementById('loading-msg-text');
    if (msgEl) msgEl.textContent = 'Server starting up...';
  }, 3000);

  // After 8 seconds, show patience message
  btn._loadingTimer2 = setTimeout(() => {
    const msgEl = document.getElementById('loading-msg-text');
    if (msgEl) msgEl.textContent = 'Almost there...';
    // Also show info banner
    showServerWakeUpBanner();
  }, 8000);
}

function hideLoginLoading(btn, originalText) {
  clearTimeout(btn._loadingTimer1);
  clearTimeout(btn._loadingTimer2);
  btn.innerHTML = originalText;
  btn.disabled = false;
  hideServerWakeUpBanner();
}

function showServerWakeUpBanner() {
  const existing = document.getElementById('server-wakeup-banner');
  if (existing) return;
  const banner = document.createElement('div');
  banner.id = 'server-wakeup-banner';
  banner.style.cssText = `
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    background:#1E2535; border:1px solid rgba(255,107,53,0.3);
    border-radius:12px; padding:14px 20px; z-index:9999;
    display:flex; align-items:center; gap:12px;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:slideUp .3s ease; max-width:340px; width:90%;
  `;
  banner.innerHTML = `
    <span style="font-size:20px">⏳</span>
    <div>
      <div style="font-size:13px;font-weight:600;color:#F0F4FF;margin-bottom:2px">
        Server is waking up...
      </div>
      <div style="font-size:12px;color:#94A3B8">
        Free server starts in ~15 sec. Please wait!
      </div>
    </div>
  `;
  document.body.appendChild(banner);
}

function hideServerWakeUpBanner() {
  document.getElementById('server-wakeup-banner')?.remove();
}

// Add spinner CSS dynamically
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  .auth-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
`;
document.head.appendChild(spinnerStyle);

// ── PRE-WARM SERVER on page load ──
// Ping server silently when user lands on login/register page
// So server is already awake when they click login
function prewarmServer() {
  fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {});
}

// Start prewarming when auth pages are visible
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(prewarmServer, 1000); // ping after 1 second of page load
});
