/* Mots croisés — a crossword whose answers are métro stations.
   Grids are generated fresh each time from the station list, and the clues
   are written from the same data the quiz uses: lines served, termini and
   landmarks. No stored puzzles, so it never runs out. */

Object.assign(T.en, {
  homeCross: 'Crossword', homeCrossSub: 'Fill in station names from their clues. Alone or over someone’s shoulder.',
  crossTitle: 'Mots croisés', crossAcross: 'Across', crossDown: 'Down',
  crossCheck: 'Check', crossReveal: 'Reveal answer', crossNew: 'New grid',
  crossDone: 'Solved. Every station in place.',
  crossWrong: n => `${n} letter${n === 1 ? '' : 's'} wrong.`,
  crossAllRight: 'Everything you’ve filled in is right — keep going.',
  crossEmpty: 'Nothing filled in yet.',
  crossHint: 'Accents and hyphens are dropped: Châtelet is CHATELET.',
  clueLandmark: p => `Closest station to ${p}`,
  clueTerminus: l => `Terminus of line ${l}`,
  clueHub: (a, b) => `Change here between lines ${a} and ${b}`,
  clueLine: (l, e) => `A stop on line ${l} — ${e}`,
  clueLetters: n => `(${n})`
});

Object.assign(T.fr, {
  homeCross: 'Mots croisés', homeCrossSub: 'Retrouve les stations à partir des définitions. Seul ou à plusieurs.',
  crossTitle: 'Mots croisés', crossAcross: 'Horizontalement', crossDown: 'Verticalement',
  crossCheck: 'Vérifier', crossReveal: 'Voir la réponse', crossNew: 'Nouvelle grille',
  crossDone: 'Résolu. Toutes les stations à leur place.',
  crossWrong: n => `${n} lettre${n === 1 ? '' : 's'} fausse${n === 1 ? '' : 's'}.`,
  crossAllRight: 'Tout ce qui est rempli est juste — continue.',
  crossEmpty: 'Rien de rempli pour l’instant.',
  crossHint: 'Les accents et les traits d’union sautent : Châtelet devient CHATELET.',
  clueLandmark: p => `La station la plus proche de ${p}`,
  clueTerminus: l => `Terminus de la ligne ${l}`,
  clueHub: (a, b) => `Correspondance entre les lignes ${a} et ${b}`,
  clueLine: (l, e) => `Une station de la ligne ${l} — ${e}`,
  clueLetters: n => `(${n})`
});

/* ————— the answer pool ————— */
const plain = s => strip(s).toUpperCase().replace(/[^A-Z]/g, '');

/* single-word names only: "SAINTGERMAINDESPRES" is nobody's idea of fun */
const CROSS_POOL = STATION_NAMES
  .filter(n => !/[\s\-–']/.test(n))
  .map(n => ({ name: n, letters: plain(n) }))
  .filter(w => w.letters.length >= 4 && w.letters.length <= 10);

/* landmark > terminus > interchange > plain. Anything but "plain" gives the
   solver something to actually reason from. */
function clueKind(name) {
  if (LANDMARKS.some(l => l[2] === name)) return 'landmark';
  if (TERMINI[name]) return 'terminus';
  if (STATIONS[name].length > 1) return 'hub';
  return 'plain';
}

function clueFor(name) {
  switch (clueKind(name)) {
    case 'landmark': {
      const land = LANDMARKS.find(l => l[2] === name);
      return t('clueLandmark')(LANG === 'fr' ? land[1] : land[0]);
    }
    case 'terminus': return t('clueTerminus')(TERMINI[name][0]);
    case 'hub': return t('clueHub')(STATIONS[name][0], STATIONS[name][1]);
    /* naming the line's two ends turns a shrug into something you can picture */
    default: return t('clueLine')(STATIONS[name][0], ends(STATIONS[name][0]));
  }
}

/* strong clues first, and only a couple of weak ones per grid */
const STRONG = CROSS_POOL.filter(w => clueKind(w.name) !== 'plain');
const PLAIN = CROSS_POOL.filter(w => clueKind(w.name) === 'plain');
const MAX_PLAIN = 2;

/* ————— generation ————— */
const SIZE = 15;

function blankGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function fits(grid, letters, r, c, dir) {
  const dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
  const end = { r: r + dr * (letters.length - 1), c: c + dc * (letters.length - 1) };
  if (r < 0 || c < 0 || end.r >= SIZE || end.c >= SIZE) return false;

  /* the cells just before and just after the word must be empty */
  const before = { r: r - dr, c: c - dc };
  const after = { r: end.r + dr, c: end.c + dc };
  for (const p of [before, after]) {
    if (p.r >= 0 && p.c >= 0 && p.r < SIZE && p.c < SIZE && grid[p.r][p.c]) return false;
  }

  let crossings = 0;
  for (let i = 0; i < letters.length; i++) {
    const rr = r + dr * i, cc = c + dc * i;
    const cur = grid[rr][cc];
    if (cur) {
      if (cur !== letters[i]) return false;
      crossings++;
      continue;
    }
    /* an empty cell must not sit alongside another word, or we'd create
       accidental two-letter words running the other way */
    const sides = dir === 'A' ? [[rr - 1, cc], [rr + 1, cc]] : [[rr, cc - 1], [rr, cc + 1]];
    for (const [sr, sc] of sides) {
      if (sr >= 0 && sc >= 0 && sr < SIZE && sc < SIZE && grid[sr][sc]) return false;
    }
  }
  return crossings > 0;
}

function put(grid, letters, r, c, dir) {
  const dr = dir === 'D' ? 1 : 0, dc = dir === 'A' ? 1 : 0;
  for (let i = 0; i < letters.length; i++) grid[r + dr * i][c + dc * i] = letters[i];
}

function generatePuzzle(target = 9) {
  const grid = blankGrid();
  const entries = [];
  const pool = shuffle(STRONG).concat(shuffle(PLAIN));
  let plainUsed = 0;

  const seed = shuffle(STRONG).find(w => w.letters.length >= 6 && w.letters.length <= 9) || pool[0];
  const r0 = Math.floor(SIZE / 2), c0 = Math.floor((SIZE - seed.letters.length) / 2);
  put(grid, seed.letters, r0, c0, 'A');
  entries.push({ ...seed, r: r0, c: c0, dir: 'A' });

  for (const w of pool) {
    if (entries.length >= target) break;
    if (entries.some(e => e.name === w.name)) continue;
    const weak = clueKind(w.name) === 'plain';
    if (weak && plainUsed >= MAX_PLAIN) continue;

    const spots = [];
    for (const e of entries) {
      const dir = e.dir === 'A' ? 'D' : 'A';
      for (let i = 0; i < w.letters.length; i++) {
        for (let j = 0; j < e.letters.length; j++) {
          if (w.letters[i] !== e.letters[j]) continue;
          const er = e.r + (e.dir === 'D' ? j : 0), ec = e.c + (e.dir === 'A' ? j : 0);
          const r = dir === 'D' ? er - i : er;
          const c = dir === 'A' ? ec - i : ec;
          if (fits(grid, w.letters, r, c, dir)) spots.push({ r, c, dir });
        }
      }
    }
    if (!spots.length) continue;
    const s = rnd(spots);
    put(grid, w.letters, s.r, s.c, s.dir);
    entries.push({ ...w, r: s.r, c: s.c, dir: s.dir });
    if (weak) plainUsed++;
  }
  return entries.length >= 5 ? { grid, entries } : null;
}

/* crop to the used area and number the starting squares */
function layout(puz) {
  let minR = SIZE, maxR = -1, minC = SIZE, maxC = -1;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (puz.grid[r][c]) {
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    }
  }
  const rows = maxR - minR + 1, cols = maxC - minC + 1;
  const solution = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => puz.grid[r + minR][c + minC]));
  const entries = puz.entries.map(e => ({ ...e, r: e.r - minR, c: e.c - minC }));

  entries.sort((a, b) => a.r - b.r || a.c - b.c);
  let n = 0;
  const numAt = {};
  entries.forEach(e => {
    const key = e.r + ',' + e.c;
    if (!numAt[key]) numAt[key] = ++n;
    e.num = numAt[key];
    e.cells = Array.from({ length: e.letters.length }, (_, i) => ({
      r: e.r + (e.dir === 'D' ? i : 0), c: e.c + (e.dir === 'A' ? i : 0)
    }));
  });
  return { rows, cols, solution, entries, numAt };
}

/* ————— state ————— */
const X = { rows: 0, cols: 0, solution: [], entries: [], numAt: {}, letters: {}, active: null, cell: null };

/* Generation is cheap, so make several and keep the tightest — a 15-wide grid
   leaves ~17px squares on a small phone, which is unplayable. */
function newPuzzle() {
  let best = null;
  for (let i = 0; i < 25; i++) {
    const puz = generatePuzzle(8);
    if (!puz) continue;
    const L = layout(puz);
    const span = Math.max(L.rows, L.cols);
    if (span > 12) continue;
    if (!best || span < best.span || (span === best.span && L.entries.length > best.L.entries.length)) {
      best = { L, span };
    }
  }
  if (!best) {                       /* nothing compact turned up — take any */
    let puz = null;
    for (let i = 0; i < 40 && !puz; i++) puz = generatePuzzle(7);
    if (!puz) return;
    best = { L: layout(puz) };
  }
  Object.assign(X, best.L, { letters: {}, active: null, cell: null });
  X.active = X.entries[0];
  X.cell = { ...X.active.cells[0] };
  renderCross();
}

const key = (r, c) => r + ',' + c;
const isBlock = (r, c) => !X.solution[r] || !X.solution[r][c];

function entriesAt(r, c) {
  return X.entries.filter(e => e.cells.some(p => p.r === r && p.c === c));
}

function selectCell(r, c, toggle) {
  if (isBlock(r, c)) return;
  const here = entriesAt(r, c);
  if (toggle && X.cell && X.cell.r === r && X.cell.c === c && here.length > 1) {
    X.active = here.find(e => e !== X.active) || X.active;
  } else if (!here.includes(X.active)) {
    X.active = here[0];
  }
  X.cell = { r, c };
  renderCross();
  $('#crossInput').focus();
}

function step(delta) {
  if (!X.active || !X.cell) return;
  const idx = X.active.cells.findIndex(p => p.r === X.cell.r && p.c === X.cell.c);
  const next = X.active.cells[idx + delta];
  if (next) X.cell = { ...next };
}

function typeLetter(ch) {
  if (!X.cell) return;
  X.letters[key(X.cell.r, X.cell.c)] = ch;
  step(1);
  renderCross();
}

function backspace() {
  if (!X.cell) return;
  const k = key(X.cell.r, X.cell.c);
  if (X.letters[k]) delete X.letters[k];
  else { step(-1); delete X.letters[key(X.cell.r, X.cell.c)]; }
  renderCross();
}

/* ————— rendering ————— */
function renderCross() {
  const g = $('#crossGrid');
  if (!g || !X.rows) return;
  g.style.setProperty('--cols', X.cols);
  const activeCells = new Set((X.active ? X.active.cells : []).map(p => key(p.r, p.c)));

  let html = '';
  for (let r = 0; r < X.rows; r++) {
    for (let c = 0; c < X.cols; c++) {
      if (isBlock(r, c)) { html += '<div class="xc block"></div>'; continue; }
      const k = key(r, c);
      const num = X.numAt[k];
      const cls = ['xc'];
      if (activeCells.has(k)) cls.push('inword');
      if (X.cell && X.cell.r === r && X.cell.c === c) cls.push('here');
      if (X.marks && X.marks[k]) cls.push(X.marks[k]);
      html += `<div class="${cls.join(' ')}" data-r="${r}" data-c="${c}">${
        num ? `<b>${num}</b>` : ''}${X.letters[k] || ''}</div>`;
    }
  }
  g.innerHTML = html;

  const list = dir => X.entries.filter(e => e.dir === dir)
    .sort((a, b) => a.num - b.num)
    .map(e => `<li${e === X.active ? ' class="on"' : ''} data-num="${e.num}" data-dir="${e.dir}">
      <span class="n">${e.num}</span>
      <span>${esc(clueFor(e.name))} <span class="len">${t('clueLetters')(e.letters.length)}</span></span></li>`)
    .join('');
  $('#crossAcross').innerHTML = list('A');
  $('#crossDown').innerHTML = list('D');
  $('#crossAcrossLbl').textContent = t('crossAcross');
  $('#crossDownLbl').textContent = t('crossDown');

  const cur = $('#crossCurrent');
  if (cur) cur.textContent = X.active ? clueFor(X.active.name) + ' ' + t('clueLetters')(X.active.letters.length) : '';
}

function checkGrid() {
  X.marks = {};
  let wrong = 0, filled = 0;
  for (let r = 0; r < X.rows; r++) for (let c = 0; c < X.cols; c++) {
    if (isBlock(r, c)) continue;
    const k = key(r, c);
    const v = X.letters[k];
    if (!v) continue;
    filled++;
    if (v === X.solution[r][c]) X.marks[k] = 'ok'; else { X.marks[k] = 'no'; wrong++; }
  }
  const done = !wrong && filled >= new Set(X.entries.flatMap(e => e.cells.map(p => key(p.r, p.c)))).size;
  $('#crossMsg').textContent = !filled ? t('crossEmpty')
    : done ? t('crossDone')
      : wrong ? t('crossWrong')(wrong) : t('crossAllRight');
  $('#crossMsg').className = 'crossmsg ' + (done ? 'good' : wrong ? 'bad' : '');
  renderCross();
}

function revealActive() {
  if (!X.active) return;
  X.active.cells.forEach((p, i) => { X.letters[key(p.r, p.c)] = X.active.letters[i]; });
  X.marks = {};
  renderCross();
}

/* ————— wiring ————— */
function crossLangRefresh() {
  $('#homeCross').innerHTML = `<span class="opt">${t('homeCross')}</span><span class="optsub">${t('homeCrossSub')}</span>`;
  $('#crossTitle').textContent = t('crossTitle');
  $('#crossHint').textContent = t('crossHint');
  $('#crossCheckBtn').textContent = t('crossCheck');
  $('#crossRevealBtn').textContent = t('crossReveal');
  $('#crossNewBtn').textContent = t('crossNew');
  $('#crossBack').textContent = t('back');
  if (X.rows) renderCross();
}
LANG_HOOKS.push(crossLangRefresh);
crossLangRefresh();

$('#homeCross').onclick = () => { show('cross'); if (!X.rows) newPuzzle(); else renderCross(); };
$('#crossBack').onclick = () => show('home');
$('#crossNewBtn').onclick = () => { X.marks = {}; $('#crossMsg').textContent = ''; newPuzzle(); };
$('#crossCheckBtn').onclick = checkGrid;
$('#crossRevealBtn').onclick = revealActive;

$('#crossGrid').addEventListener('click', e => {
  const cell = e.target.closest('.xc');
  if (!cell || cell.classList.contains('block')) return;
  selectCell(+cell.dataset.r, +cell.dataset.c, true);
});

document.querySelectorAll('#crossAcross, #crossDown').forEach(ul => {
  ul.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;
    const entry = X.entries.find(x => x.num === +li.dataset.num && x.dir === li.dataset.dir);
    if (!entry) return;
    X.active = entry;
    X.cell = { ...entry.cells[0] };
    renderCross();
    $('#crossInput').focus();
  });
});

/* one offscreen input drives the whole grid — it is what raises the phone
   keyboard, and it keeps letters flowing even when focus wanders */
$('#crossInput').addEventListener('keydown', e => {
  if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); renderCross(); return; }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); renderCross(); return; }
  if (e.key === 'Tab' || e.key === 'Enter') {
    e.preventDefault();
    const i = X.entries.indexOf(X.active);
    X.active = X.entries[(i + 1) % X.entries.length];
    X.cell = { ...X.active.cells[0] };
    renderCross();
  }
});

$('#crossInput').addEventListener('input', e => {
  const raw = e.target.value;
  e.target.value = '';
  const ch = plain(raw).slice(-1);
  if (ch) typeLetter(ch);
});
