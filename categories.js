// ═══════════════════════════════════════════════════════
// CATEGORIES.JS — Config-driven Exam & Subject System
// DataMinds Test Series
// ═══════════════════════════════════════════════════════

const EXAM_CATEGORIES = [
  { id: 'bpsc-tre', label: 'BPSC TRE 4.0', icon: '🎓', color: '#FF6B35', active: true },
  { id: 'ssc-steno', label: 'SSC Steno', icon: '📝', color: '#3498DB', active: false },
  { id: 'ssc-cgl', label: 'SSC CGL', icon: '📊', color: '#2ECC71', active: false },
  { id: 'ssc-chsl', label: 'SSC CHSL', icon: '📋', color: '#9B59B6', active: false },
  { id: 'railway', label: 'Railway', icon: '🚂', color: '#E74C3C', active: false },
  { id: 'bihar-police', label: 'Bihar Police', icon: '🛡️', color: '#1ABC9C', active: false },
  { id: 'banking', label: 'Banking', icon: '🏦', color: '#F39C12', active: false },
  { id: 'upsc', label: 'UPSC', icon: '🏛️', color: '#8E44AD', active: false },
  { id: 'cuet', label: 'CUET', icon: '🎯', color: '#E67E22', active: false },
];

const SUBJECT_MAP = {
  'bpsc-tre': [
    { id: 'cs', label: 'Computer Science', icon: '💻', active: true },
    { id: 'math', label: 'Mathematics', icon: '📐', active: false },
    { id: 'reasoning', label: 'Reasoning', icon: '🧠', active: false },
    { id: 'gs', label: 'General Studies', icon: '🌍', active: false },
    { id: 'hindi', label: 'Hindi', icon: '📖', active: false },
    { id: 'english', label: 'English', icon: '🔤', active: false },
  ],
  'ssc-steno': [
    { id: 'gi', label: 'General Intelligence', icon: '🧩', active: false },
    { id: 'english', label: 'English', icon: '🔤', active: false },
    { id: 'ga', label: 'General Awareness', icon: '🌐', active: false },
  ],
  'ssc-cgl': [
    { id: 'reasoning', label: 'Reasoning', icon: '🧠', active: false },
    { id: 'english', label: 'English', icon: '🔤', active: false },
    { id: 'ga', label: 'General Awareness', icon: '🌐', active: false },
    { id: 'math', label: 'Quantitative Aptitude', icon: '📐', active: false },
  ],
};

// Test type sections
const TEST_SECTIONS = [
  { id: 'topic', label: '📚 Topic-wise', desc: 'Practice by topic' },
  { id: 'full', label: '📋 Full Mock', desc: 'Complete test series' },
  { id: 'pyq', label: '🗂️ PYQ', desc: 'Previous Year Questions' },
];

// Difficulty config
const DIFFICULTY = {
  easy:   { label: 'Easy',   color: '#2ECC71', bg: 'rgba(46,204,113,0.15)' },
  medium: { label: 'Medium', color: '#F39C12', bg: 'rgba(243,156,18,0.15)' },
  hard:   { label: 'Hard',   color: '#E74C3C', bg: 'rgba(231,76,60,0.15)'  },
};

// Premium test IDs (tests that require payment)
const PREMIUM_TEST_IDS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// Static attempt counts for display
const TEST_ATTEMPT_COUNTS = {
  1: 1243, 2: 987, 3: 876, 4: 743, 5: 698,
  6: 521, 7: 489, 8: 412, 9: 398, 10: 356,
  11: 312, 12: 287, 13: 245, 14: 223, 15: 198,
  16: 176, 17: 154, 18: 143, 19: 132, 20: 121,
};

// Ratings
const TEST_RATINGS = {
  1: 4.8, 2: 4.7, 3: 4.9, 4: 4.6, 5: 4.8,
  6: 4.7, 7: 4.6, 8: 4.8, 9: 4.5, 10: 4.7,
  11: 4.6, 12: 4.8, 13: 4.7, 14: 4.6, 15: 4.9,
  16: 4.7, 17: 4.8, 18: 4.6, 19: 4.7, 20: 4.8,
};

// Difficulty per test
const TEST_DIFFICULTY = {
  1: 'easy', 2: 'easy', 3: 'medium', 4: 'medium', 5: 'medium',
  6: 'medium', 7: 'hard', 8: 'hard', 9: 'medium', 10: 'hard',
  11: 'easy', 12: 'medium', 13: 'hard', 14: 'medium', 15: 'hard',
  16: 'easy', 17: 'medium', 18: 'hard', 19: 'medium', 20: 'hard',
};

// Bookmarked tests (stored in localStorage)
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('dm_bookmarks') || '[]'); } catch { return []; }
}
function toggleBookmark(testId) {
  const bm = getBookmarks();
  const idx = bm.indexOf(testId);
  if (idx === -1) bm.push(testId); else bm.splice(idx, 1);
  localStorage.setItem('dm_bookmarks', JSON.stringify(bm));
  return idx === -1; // true = added
}
function isBookmarked(testId) { return getBookmarks().includes(testId); }

// Premium unlocked tests
function getUnlockedTests() {
  try { return JSON.parse(localStorage.getItem('dm_unlocked') || '[]'); } catch { return []; }
}
function unlockTest(testId) {
  const ul = getUnlockedTests();
  if (!ul.includes(testId)) ul.push(testId);
  localStorage.setItem('dm_unlocked', JSON.stringify(ul));
}
function isUnlocked(testId) {
  if (!PREMIUM_TEST_IDS.includes(testId)) return true;
  return getUnlockedTests().includes(testId);
}
function isPremium(testId) { return PREMIUM_TEST_IDS.includes(testId); }

// ── PYQ Test configs (Test ID 101+) ──
// TEST_DIFFICULTY, TEST_RATINGS, TEST_ATTEMPT_COUNTS for PYQ tests
TEST_DIFFICULTY[101] = 'medium';
TEST_RATINGS[101]    = 4.9;
TEST_ATTEMPT_COUNTS[101] = 0;
