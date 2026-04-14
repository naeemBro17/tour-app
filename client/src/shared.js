import React from 'react';

// ─── Theme ────────────────────────────────────────────────────────────────────
export function getTheme() {
  return localStorage.getItem('ts_theme') || 'dark';
}
export function setTheme(t) {
  localStorage.setItem('ts_theme', t);
  document.documentElement.setAttribute('data-theme', t);
}
export function initTheme() {
  const t = getTheme();
  document.documentElement.setAttribute('data-theme', t);
  return t;
}

// ─── Global Styles ────────────────────────────────────────────────────────────
export const STYLES = `
*{box-sizing:border-box;margin:0;padding:0}

:root {
  --font: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
--mono: 'Inter', sans-serif;
}

/* ── Dark theme (default) ── */
:root, [data-theme="dark"] {
  --bg:           #0f0f13;
  --surface:      #18181f;
  --card:         #1e1e27;
  --border:       #2a2a36;
  --accent:       #f0a500;
  --accent2:      #ffbe3d;
  --green:        #30c970;
  --red:          #ff4560;
  --blue:         #4a9eff;
  --text:         #e9e9f0;
  --text2:        #a0a0b8;
  --muted:        #6a6a82;
  --shadow:       rgba(0,0,0,0.35);
  --fab-shadow:   rgba(240,165,0,0.3);
  --overlay:      rgba(0,0,0,0.82);
  --locked-bg:    rgba(240,165,0,0.06);
  --locked-border:rgba(240,165,0,0.25);
}

/* ── Light theme ── */
[data-theme="light"] {
  --bg:           #f5f5f7;
  --surface:      #ffffff;
  --card:         #ffffff;
  --border:       #e2e2ea;
  --accent:       #c87800;
  --accent2:      #f0a500;
  --green:        #1a9a52;
  --red:          #d02848;
  --blue:         #1a6ad0;
  --text:         #1a1a2e;
  --text2:        #48486a;
  --muted:        #8a8aa8;
  --shadow:       rgba(0,0,0,0.07);
  --fab-shadow:   rgba(200,120,0,0.22);
  --overlay:      rgba(0,0,0,0.5);
  --locked-bg:    rgba(200,120,0,0.06);
  --locked-border:rgba(200,120,0,0.22);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  transition: background 0.25s, color 0.25s;
}

.app { max-width: 480px; margin: 0 auto; min-height: 100vh; padding-bottom: 90px; }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 13px 20px; border-radius: 14px; border: none;
  cursor: pointer; font-family: var(--font); font-size: 15px;
  font-weight: 600; transition: all 0.2s ease;
}
.btn-primary {
  background: var(--accent); color: #fff;
  width: 100%; justify-content: center;
}
.btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 16px var(--fab-shadow); }
.btn-primary:active { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
.btn-danger { background: rgba(208,40,72,0.1); color: var(--red); border: 1px solid rgba(208,40,72,0.25); }
.btn-danger:hover { background: rgba(208,40,72,0.17); }
.btn-end { background: var(--locked-bg); color: var(--accent); border: 1px solid var(--locked-border); }
.btn-end:hover { background: rgba(240,165,0,0.14); }
.btn-sm  { padding: 8px 14px; font-size: 13px; border-radius: 10px; }
.btn-xs  { padding: 5px 10px; font-size: 12px; border-radius: 8px; }

/* ── Layout ── */
.page { padding: 24px 20px; }
.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
  color: var(--muted); text-transform: uppercase; margin-bottom: 14px;
}

/* ── Forms ── */
.field { margin-bottom: 16px; }
.field label {
  display: block; font-size: 11px; font-weight: 600;
  letter-spacing: 0.07em; color: var(--muted);
  text-transform: uppercase; margin-bottom: 7px;
}
.field input, .field select {
  width: 100%; background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 13px 16px; color: var(--text);
  font-family: var(--font); font-size: 15px; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field input:focus, .field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(240,165,0,0.1);
}
.field select {
  appearance: none; cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236a6a82' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
}
.row { display: flex; gap: 10px; }
.row .field { flex: 1; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 7px 14px; border-radius: 100px;
  border: 1px solid var(--border); font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; background: var(--surface); color: var(--text2);
}
.chip:hover { border-color: var(--accent); color: var(--accent); }
.chip.active { background: var(--accent); color: #fff; border-color: var(--accent); font-weight: 600; }

/* ── Overlay / Modal ── */
.overlay {
  position: fixed; inset: 0; background: var(--overlay);
  z-index: 100; display: flex; align-items: flex-end;
  justify-content: center; animation: fadeIn 0.2s ease;
}
.modal {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 24px 24px 0 0; padding: 28px 24px 40px;
  width: 100%; max-width: 480px; max-height: 92vh;
  overflow-y: auto; animation: slideUp 0.28s ease;
  box-shadow: 0 -8px 40px var(--shadow);
}
.modal-title { font-size: 19px; font-weight: 700; margin-bottom: 22px; }
.cancel-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-family: var(--font); font-size: 14px; margin-top: 12px;
  width: 100%; text-align: center; padding: 10px; transition: color 0.15s;
}
.cancel-btn:hover { color: var(--text); }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(36px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

/* ── Home ── */
.logo { display: flex; align-items: center; gap: 11px; margin-bottom: 44px; }
.logo-icon {
  width: 40px; height: 40px; background: var(--accent); border-radius: 11px;
  display: grid; place-items: center; color: #fff; font-size: 19px;
}
.logo-name { font-size: 21px; font-weight: 700; }
.logo-name span { color: var(--accent); }
.home-title { font-size: 30px; font-weight: 700; line-height: 1.15; margin-bottom: 8px; }
.home-sub { color: var(--text2); font-size: 15px; margin-bottom: 32px; line-height: 1.5; }
.tour-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 16px;
  padding: 16px 18px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 1px 4px var(--shadow);
}
.tour-card:hover { border-color: var(--accent); transform: translateX(3px); }
.tour-card:active { transform: translateX(1px); }
.tour-card-name { font-weight: 600; font-size: 15px; }
.tour-card-meta { font-size: 12px; color: var(--muted); margin-top: 3px; }
.tour-ended-badge {
  font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 100px;
  background: var(--locked-bg); color: var(--accent);
  border: 1px solid var(--locked-border); margin-left: 8px; vertical-align: middle;
}

/* ── Tour Header ── */
.tour-header { padding: 20px 20px 0; }
.back-btn {
  display: flex; align-items: center; gap: 6px; color: var(--muted);
  font-size: 14px; font-weight: 500; background: none; border: none;
  cursor: pointer; margin-bottom: 20px; transition: color 0.15s; padding: 0;
}
.back-btn:hover { color: var(--text); }
.tour-name { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
.share-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.share-link {
  font-family: var(--mono); font-size: 11px; color: var(--muted);
  background: var(--surface); padding: 8px 12px; border-radius: 10px;
  border: 1px solid var(--border); flex: 1; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.copy-btn {
  padding: 8px 12px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; cursor: pointer; color: var(--muted);
  display: grid; place-items: center; transition: all 0.2s;
}
.copy-btn:hover { color: var(--accent); border-color: var(--accent); }

/* ── Locked banner ── */
.locked-banner {
  margin: 12px 20px 0;
  background: var(--locked-bg); border: 1px solid var(--locked-border);
  border-radius: 12px; padding: 11px 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.locked-banner-text { font-size: 13px; color: var(--accent); font-weight: 500; }
.reopen-btn {
  font-size: 12px; color: var(--muted); background: none; border: none;
  cursor: pointer; font-family: var(--font); padding: 4px 8px;
  border-radius: 6px; transition: all 0.15s; white-space: nowrap;
}
.reopen-btn:hover { color: var(--text); background: var(--border); }

/* ── Stats ── */
.stats-bar { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; padding: 16px 20px; }
.stat-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 16px;
  padding: 14px 14px 16px; box-shadow: 0 1px 4px var(--shadow);
}
.stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.07em; color: var(--muted); text-transform: uppercase; margin-bottom: 6px; }
.stat-value { font-size: 16px; font-weight: 700; font-family: var(--mono); }
.gold  { color: var(--accent); }
.green { color: var(--green); }
.red   { color: var(--red);   }

/* ── Tabs ── */
.tab-bar { display: flex; padding: 0 20px; border-bottom: 1px solid var(--border); }
.tab {
  padding: 11px 14px; font-size: 13px; font-weight: 600; cursor: pointer;
  border: none; background: none; color: var(--muted);
  border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s;
}
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-content { padding: 18px 20px; }

/* ── Members ── */
.member-row {
  display: flex; align-items: center; background: var(--card);
  border: 1px solid var(--border); border-radius: 14px;
  padding: 13px 15px; margin-bottom: 8px; box-shadow: 0 1px 3px var(--shadow);
}
.avatar {
  width: 36px; height: 36px; border-radius: 10px; display: grid;
  place-items: center; font-weight: 700; font-size: 14px;
  margin-right: 12px; flex-shrink: 0;
}
.member-name { font-weight: 600; font-size: 15px; }
.member-stats { font-size: 12px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
.balance-pill { font-family: var(--mono); font-size: 13px; font-weight: 600; padding: 4px 11px; border-radius: 100px; white-space: nowrap; }
.pill-pos  { background: rgba(48,201,112,0.12); color: var(--green); }
.pill-neg  { background: rgba(255,69,96,0.12);  color: var(--red);   }
.pill-zero { background: var(--surface); color: var(--muted); border: 1px solid var(--border); }

/* ── Feed ── */
.feed-item { display: flex; gap: 12px; margin-bottom: 10px; }
.feed-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
.dot-deposit { background: var(--green); }
.dot-expense { background: var(--red); }
.feed-body {
  flex: 1; background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 13px 14px; box-shadow: 0 1px 3px var(--shadow);
}
.feed-head { display: flex; justify-content: space-between; align-items: flex-start; }
.feed-title { font-weight: 600; font-size: 14px; }
.feed-meta { font-size: 11px; color: var(--muted); margin-top: 3px; line-height: 1.4; }
.feed-amount { font-family: var(--mono); font-size: 15px; font-weight: 700; margin-top: 8px; }
.feed-tag {
  display: inline-block; font-size: 10px; padding: 2px 7px; border-radius: 100px;
  background: var(--surface); color: var(--muted); border: 1px solid var(--border);
  margin-left: 6px; font-family: var(--mono); vertical-align: middle;
}
.del-btn { background: none; border: none; color: var(--muted); cursor: pointer; padding: 2px; flex-shrink: 0; transition: color 0.15s; }
.del-btn:hover { color: var(--red); }

/* ── Settlement ── */
.settle-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 14px 16px; margin-bottom: 8px; display: flex; align-items: center;
  gap: 10px; flex-wrap: wrap; box-shadow: 0 1px 3px var(--shadow);
}
.settle-from { font-weight: 600; color: var(--red); font-size: 14px; }
.settle-to   { font-weight: 600; color: var(--green); font-size: 14px; }
.settle-amt  { font-family: var(--mono); font-weight: 700; color: var(--accent); margin-left: auto; font-size: 15px; }

/* ── FAB ── */
.fab {
  position: fixed; bottom: 28px; right: calc(50% - 220px);
  width: 56px; height: 56px; border-radius: 18px; background: var(--accent);
  color: #fff; border: none; cursor: pointer; display: grid; place-items: center;
  box-shadow: 0 6px 24px var(--fab-shadow); z-index: 50;
  transition: all 0.2s ease; font-size: 26px; font-weight: 700;
}
.fab:hover  { transform: scale(1.07); }
.fab:active { transform: scale(0.97); }
@media(max-width:480px) { .fab { right: 20px; } }

/* ── Split rows ── */
.split-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.split-toggle {
  width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border);
  cursor: pointer; display: grid; place-items: center; background: none;
  transition: all 0.15s; flex-shrink: 0; color: #fff;
}
.split-toggle.on { background: var(--accent); border-color: var(--accent); }
.split-name { flex: 1; font-size: 14px; font-weight: 500; }
.split-input {
  width: 90px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 10px; color: var(--text);
  font-family: var(--mono); font-size: 14px; outline: none; transition: border-color 0.2s;
}
.split-input:focus { border-color: var(--accent); }

/* ── Info/Warn boxes ── */
.info-box {
  background: rgba(240,165,0,0.07); border: 1px solid rgba(240,165,0,0.2);
  border-radius: 12px; padding: 11px 14px; font-size: 13px; color: var(--accent);
  margin-bottom: 14px; font-family: var(--mono); line-height: 1.5;
}
.warn-box {
  background: rgba(208,40,72,0.07); border: 1px solid rgba(208,40,72,0.22);
  border-radius: 12px; padding: 11px 14px; font-size: 13px; color: var(--red);
  margin-bottom: 14px; line-height: 1.5;
}
.overspend-box {
  background: rgba(255,69,96,0.07); border: 1px solid rgba(255,69,96,0.25);
  border-radius: 12px; padding: 11px 14px; font-size: 13px; color: var(--red);
  margin-bottom: 14px; line-height: 1.6;
}

/* ── Toast ── */
.toast {
  position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
  background: var(--text); color: var(--bg);
  padding: 10px 22px; border-radius: 100px; font-size: 13px; font-weight: 600;
  z-index: 200; white-space: nowrap; animation: toastAnim 2.8s forwards;
  pointer-events: none; box-shadow: 0 4px 16px var(--shadow);
}
@keyframes toastAnim {
  0%   { opacity:0; transform:translateX(-50%) translateY(8px); }
  12%  { opacity:1; transform:translateX(-50%) translateY(0); }
  80%  { opacity:1; }
  100% { opacity:0; }
}

/* ── Loading ── */
.spinner { display: flex; align-items: center; justify-content: center; height: 200px; color: var(--muted); font-size: 14px; }
.dot-spin { display: inline-block; width: 7px; height: 7px; background: var(--accent); border-radius: 50%; margin-right: 8px; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }

/* ── Misc ── */
.empty { text-align: center; padding: 48px 0; color: var(--muted); }
.empty-icon { font-size: 38px; margin-bottom: 12px; }
.empty p { font-size: 14px; line-height: 1.5; }
.add-method-row { display: flex; gap: 8px; margin-top: 8px; }
.add-method-input {
  flex: 1; background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 10px 14px; color: var(--text);
  font-family: var(--font); font-size: 14px; outline: none;
}
.danger-zone { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); }
.connection-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 6px; flex-shrink: 0; }
.connected    { background: var(--green); }
.disconnected { background: var(--muted); }

/* ── Theme toggle ── */
.theme-toggle {
  position: fixed; top: 18px; right: 18px; z-index: 60;
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--surface); cursor: pointer; display: grid; place-items: center;
  color: var(--text2); transition: all 0.2s; box-shadow: 0 2px 8px var(--shadow);
  font-size: 15px;
}
.theme-toggle:hover { border-color: var(--accent); color: var(--accent); }

/* ── Locked banner ── */
.locked-banner {
  margin: 12px 20px 0;
  background: var(--locked-bg); border: 1px solid var(--locked-border);
  border-radius: 12px; padding: 11px 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.locked-banner-text { font-size: 13px; color: var(--accent); font-weight: 500; }
.reopen-btn {
  font-size: 12px; color: var(--muted); background: none; border: none;
  cursor: pointer; font-family: var(--font); padding: 4px 8px;
  border-radius: 6px; transition: all 0.15s; white-space: nowrap;
}
.reopen-btn:hover { color: var(--text); background: var(--border); }

/* ── Final summary card ── */
.final-summary {
  background: var(--card); border: 1px solid var(--locked-border);
  border-radius: 20px; margin: 16px 20px; padding: 20px;
  box-shadow: 0 2px 12px var(--shadow);
}
.final-summary h2 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.final-summary p  { font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.5; }
.final-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const fmt = n => '৳' + Number(n || 0).toFixed(2);
export const COLORS = ['#f0a500','#30c970','#4a9eff','#e05a00','#8b5cf6','#f87171','#10b981','#60a5fa','#fb923c','#e879f9'];

// ─── Icon ────────────────────────────────────────────────────────────────────
export function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

export const ICONS = {
  home:     'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  arrow:    'M5 12h14 M12 5l7 7-7 7',
  check:    'M20 6L9 17l-5-5',
  trash:    'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  copy:     'M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.912 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z',
  plus:     'M12 5v14 M5 12h14',
  refresh:  'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  lock:     'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  unlock:   'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 9.9-1',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  sun:      'M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 6a6 6 0 0 0 0 12 6 6 0 0 0 0-12z',
  moon:     'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  flag:     'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7',
};

// ─── Toast ───────────────────────────────────────────────────────────────────
export function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}
