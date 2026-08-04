/* ————— helpers ————— */
const $ = s => document.querySelector(s);
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const bullet = (id, size) => `<span class="bullet${size ? ' ' + size : ''}" style="background:${LINES[id].color};color:${LINES[id].ink}">${id}</span>`;
const bullets = ids => ids.map(l => bullet(l)).join(' ');
const ends = id => LINES[id].termini.map(esc).join(' ↔ ');

const STATION_NAMES = Object.keys(STATIONS);
const stationsOn = id => STATION_NAMES.filter(n => STATIONS[n].includes(id));

/* terminus name -> [line ids] */
const TERMINI = {};
LINE_IDS.forEach(id => LINES[id].termini.forEach(t => (TERMINI[t] = TERMINI[t] || []).push(id)));

/* ————— language ————— */
const T = {
  en: {
    eyebrow: 'Le jeu du métro',
    lede: 'Three or more players, one screen. Pass it around and guess your way across the Paris Métro — lines, landmarks, termini, and the stations in between.',
    lblPlayers: 'Players (3–8)', namePh: 'Name', add: 'Add',
    lblRounds: 'Rounds each', lblSpeed: 'Seconds per question', lblMode: 'How you answer',
    modeMc: 'Multiple choice', modeMixed: 'Mixed — a bit of both', modeTyped: 'Type the answer (hard)',
    modeNote: {
      mc: 'Four options, one right. 100 points a question.',
      mixed: 'Roughly half typed, half multiple choice.',
      typed: 'No options — type it yourself. 150 points a question, and near-enough spelling counts.'
    },
    start: 'Start the game',
    need: n => `Add ${n} more player${n > 1 ? 's' : ''} — this game needs at least 3.`,
    ready: (p, r) => `${p} players, ${r} rounds each. Allons-y.`,
    cheat: 'Look at the line cheat sheet →',
    foot: 'Network as of mid-2024: 16 lines, lines 11 and 14 extended, line 4 out to Bagneux.<br>Grand Paris Express (15–18) not included.',
    passTo: 'Pass the phone to', imReady: "I'm ready",
    roundOf: (a, b) => `Round ${a} of ${b}`, pts: n => `${n} pts`,
    roundShort: (a, b) => `Round ${a}/${b}`,
    tagTyped: 'Typed', tagMc: 'Choice',
    typedPhLine: 'Line number', typedPhStation: 'Station name', typedPhNumber: 'A number',
    submit: 'Answer', giveUp: 'I give up',
    good: 'Correct !', bad: 'Non.', timeout: 'Temps écoulé !',
    gain: (n, base, sp) => `+${n} pts <span class="sub">(${base} base${sp ? ` + ${sp} speed` : ''})</span>`,
    zero: '+0 pts',
    standings: 'Standings', next: 'Next player',
    terminusLabel: 'Terminus', wins: n => `${n} wins`, tie: n => `Dead heat: ${n}`,
    right: (c, t) => `${c}/${t} right`, again: 'Play again',
    sheetTitle: 'The 16 lines', sheetSub: 'Termini and station counts. Read it before you play, not during.',
    stations: n => `${n} stations`, close: 'Close',
    kinds: {
      landmark: 'Landmark → line', station: 'Station → line', count: 'Line → station count',
      terminus: 'Terminus → line', odd: 'Odd one out', hub: 'Interchange',
      colour: 'Colour', name: 'Name a station'
    },
    qLandmark: p => `Which line takes you to <em>${p}</em>?`,
    nLandmark: 'Closest métro station counts.',
    xLandmark: (p, s, l) => `${p} → <strong>${s}</strong>, on line ${l}.`,
    qStation: s => `Which line serves <em>${s}</em>?`,
    nStationMc: n => `It's an interchange — ${n} lines stop here, but only one is listed.`,
    nStationTyped: 'Any line that stops here counts.',
    xStation: s => `<strong>${s}</strong> is served by`,
    qCount: id => `How many stations are there on line ${id}?`,
    xCount: (id, n) => `Line ${id} has <strong>${n} stations</strong>.`,
    qTerminus: t => `<em>${t}</em> is the end of the line. Which line?`,
    nTerminus: "Careful — it's a terminus for more than one line.",
    xTerminus: t => `<strong>${t}</strong> is a terminus of`,
    qOdd: id => `Which of these is <em>not</em> on line ${id}?`,
    xOdd: (s, id) => `<strong>${s}</strong> is not on line ${id}. It's on`,
    qHub: (a, b) => `Where can you change between ${a} and ${b}?`,
    nHubTyped: 'One station. Near-enough spelling counts.',
    qColour: sw => `On the map, which line is ${sw} this colour?`,
    xColour: (id, e) => `That's line ${id}, ${e}.`,
    qName: id => `Name any station on line ${id}.`,
    nName: 'Any one of them counts. Near-enough spelling is fine.',
    xName: (id, n, e) => `Line ${id} runs ${e} — ${n} stations to choose from.`,
    egAccepted: 'You could have said'
  },
  fr: {
    eyebrow: 'Le jeu du métro',
    lede: "Trois joueurs ou plus, un seul écran. On se passe le téléphone et on devine son chemin dans le métro parisien : lignes, monuments, terminus et tout ce qu'il y a entre les deux.",
    lblPlayers: 'Joueurs (3 à 8)', namePh: 'Prénom', add: 'Ajouter',
    lblRounds: 'Manches par joueur', lblSpeed: 'Secondes par question', lblMode: 'Façon de répondre',
    modeMc: 'Choix multiple', modeMixed: 'Mélangé — un peu des deux', modeTyped: 'Réponse à écrire (difficile)',
    modeNote: {
      mc: 'Quatre propositions, une bonne. 100 points par question.',
      mixed: 'À peu près la moitié à écrire, la moitié en choix multiple.',
      typed: "Pas de propositions : on écrit. 150 points par question, et l'orthographe approximative passe."
    },
    start: 'Commencer la partie',
    need: n => `Encore ${n} joueur${n > 1 ? 's' : ''} — il en faut au moins 3.`,
    ready: (p, r) => `${p} joueurs, ${r} manches chacun. Allons-y.`,
    cheat: "Voir l'antisèche des lignes →",
    foot: "Réseau à la mi-2024 : 16 lignes, lignes 11 et 14 prolongées, ligne 4 jusqu'à Bagneux.<br>Le Grand Paris Express (15 à 18) n'est pas inclus.",
    passTo: 'Passe le téléphone à', imReady: 'Je suis prêt',
    roundOf: (a, b) => `Manche ${a} sur ${b}`, pts: n => `${n} pts`,
    roundShort: (a, b) => `Manche ${a}/${b}`,
    tagTyped: 'À écrire', tagMc: 'Choix',
    typedPhLine: 'Numéro de ligne', typedPhStation: 'Nom de la station', typedPhNumber: 'Un nombre',
    submit: 'Répondre', giveUp: "Je donne ma langue au chat",
    good: 'Correct !', bad: 'Non.', timeout: 'Temps écoulé !',
    gain: (n, base, sp) => `+${n} pts <span class="sub">(${base} de base${sp ? ` + ${sp} de rapidité` : ''})</span>`,
    zero: '+0 pt',
    standings: 'Classement', next: 'Joueur suivant',
    terminusLabel: 'Terminus', wins: n => `${n} gagne`, tie: n => `Ex æquo : ${n}`,
    right: (c, t) => `${c}/${t} bonnes`, again: 'Rejouer',
    sheetTitle: 'Les 16 lignes', sheetSub: "Terminus et nombre de stations. À lire avant la partie, pas pendant.",
    stations: n => `${n} stations`, close: 'Fermer',
    kinds: {
      landmark: 'Monument → ligne', station: 'Station → ligne', count: 'Ligne → nombre de stations',
      terminus: 'Terminus → ligne', odd: "L'intrus", hub: 'Correspondance',
      colour: 'Couleur', name: 'Citez une station'
    },
    qLandmark: p => `Quelle ligne dessert <em>${p}</em> ?`,
    nLandmark: 'On compte la station de métro la plus proche.',
    xLandmark: (p, s, l) => `${p} → <strong>${s}</strong>, sur la ligne ${l}.`,
    qStation: s => `Quelle ligne passe par <em>${s}</em> ?`,
    nStationMc: n => `C'est une correspondance : ${n} lignes s'y arrêtent, mais une seule est proposée.`,
    nStationTyped: "N'importe quelle ligne qui s'y arrête compte.",
    xStation: s => `<strong>${s}</strong> est desservie par`,
    qCount: id => `Combien de stations compte la ligne ${id} ?`,
    xCount: (id, n) => `La ligne ${id} compte <strong>${n} stations</strong>.`,
    qTerminus: t => `<em>${t}</em> est un terminus. De quelle ligne ?`,
    nTerminus: "Attention : c'est un terminus pour plusieurs lignes.",
    xTerminus: t => `<strong>${t}</strong> est un terminus des lignes`,
    qOdd: id => `Laquelle de ces stations n'est <em>pas</em> sur la ligne ${id} ?`,
    xOdd: (s, id) => `<strong>${s}</strong> n'est pas sur la ligne ${id}. Elle est sur`,
    qHub: (a, b) => `Où peut-on changer entre ${a} et ${b} ?`,
    nHubTyped: "Une seule station. L'orthographe approximative passe.",
    qColour: sw => `Sur le plan, quelle ligne a ${sw} cette couleur ?`,
    xColour: (id, e) => `C'est la ligne ${id}, ${e}.`,
    qName: id => `Citez une station de la ligne ${id}.`,
    nName: "N'importe laquelle compte. L'orthographe approximative passe.",
    xName: (id, n, e) => `La ligne ${id} va de ${e} — ${n} stations au choix.`,
    egAccepted: 'On acceptait par exemple'
  }
};
let LANG = 'en';
const t = k => T[LANG][k];

/* ————— fuzzy answer matching ————— */
const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const norm = s => strip(String(s)).toLowerCase()
  .replace(/\bst\b/g, 'saint')
  .replace(/[^a-z0-9]+/g, '');

function lev(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 3) return 9;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/* station / free text: forgiving */
const matchesText = accept => raw => {
  const v = norm(raw);
  if (!v) return false;
  return accept.some(a => {
    const w = norm(a);
    return v === w || lev(v, w) <= (w.length <= 7 ? 1 : w.length <= 14 ? 2 : 3);
  });
};

/* line ids: "12", "ligne 12", "line 12", "3 bis", "L3bis" */
const matchesLine = ids => raw => {
  let v = norm(raw).replace(/^(ligne|line|l)/, '');
  return ids.includes(v);
};

const matchesNumber = n => raw => {
  const m = String(raw).match(/-?\d+/);
  return !!m && +m[0] === n;
};

/* ————— question generators —————
   { kind, prompt, note, choices[], answer, explain, typed?:{ph, check, note} } */

function qLandmark() {
  const [en, fr, station, line] = rnd(LANDMARKS);
  const place = esc(LANG === 'fr' ? fr : en);
  const served = STATIONS[station];
  const wrong = sample(LINE_IDS.filter(l => !served.includes(l)), 3);
  const opts = shuffle([line, ...wrong]);
  return {
    kind: 'landmark',
    prompt: t('qLandmark')(place),
    note: t('nLandmark'),
    choices: opts.map(l => bullet(l, 'big')),
    answer: opts.indexOf(line),
    explain: t('xLandmark')(place, esc(station), line),
    typed: { ph: 'typedPhLine', check: matchesLine(served), note: t('nLandmark') }
  };
}

function qStationLine() {
  const st = rnd(STATION_NAMES);
  const served = STATIONS[st];
  const line = rnd(served);
  const wrong = sample(LINE_IDS.filter(l => !served.includes(l)), 3);
  const opts = shuffle([line, ...wrong]);
  return {
    kind: 'station',
    prompt: t('qStation')(esc(st)),
    note: served.length > 1 ? t('nStationMc')(served.length) : null,
    choices: opts.map(l => bullet(l, 'big')),
    answer: opts.indexOf(line),
    explain: `${t('xStation')(esc(st))} ${bullets(served)}`,
    typed: { ph: 'typedPhLine', check: matchesLine(served), note: served.length > 1 ? t('nStationTyped') : null }
  };
}

function qCount() {
  const id = rnd(LINE_IDS.filter(l => LINES[l].count > 8));
  const n = LINES[id].count;
  const set = new Set([n]);
  while (set.size < 4) {
    const d = n + (Math.random() < .5 ? -1 : 1) * (1 + Math.floor(Math.random() * 6));
    if (d > 2) set.add(d);
  }
  const opts = shuffle([...set]);
  return {
    kind: 'count',
    prompt: t('qCount')(id),
    note: ends(id),
    choices: opts.map(v => `<span class="num">${v}</span>`),
    answer: opts.indexOf(n),
    explain: t('xCount')(id, n),
    typed: { ph: 'typedPhNumber', check: matchesNumber(n), note: ends(id) }
  };
}

function qTerminus() {
  const term = rnd(Object.keys(TERMINI));
  const line = rnd(TERMINI[term]);
  const wrong = sample(LINE_IDS.filter(l => !TERMINI[term].includes(l)), 3);
  const opts = shuffle([line, ...wrong]);
  return {
    kind: 'terminus',
    prompt: t('qTerminus')(esc(term)),
    note: TERMINI[term].length > 1 ? t('nTerminus') : null,
    choices: opts.map(l => bullet(l, 'big')),
    answer: opts.indexOf(line),
    explain: `${t('xTerminus')(esc(term))} ${bullets(TERMINI[term])}`,
    typed: { ph: 'typedPhLine', check: matchesLine(TERMINI[term]), note: null }
  };
}

/* multiple choice only — there is no single typed answer for "the odd one" */
function qOddOne() {
  const id = rnd(LINE_IDS.filter(l => stationsOn(l).length >= 6));
  const on = sample(stationsOn(id), 3);
  const off = rnd(STATION_NAMES.filter(n => !STATIONS[n].includes(id)));
  const opts = shuffle([...on, off]);
  return {
    kind: 'odd',
    prompt: t('qOdd')(id),
    note: null,
    choices: opts.map(n => `<span class="stn">${esc(n)}</span>`),
    answer: opts.indexOf(off),
    explain: `${t('xOdd')(esc(off), id)} ${bullets(STATIONS[off])}`
  };
}

function qInterchange() {
  const hub = rnd(STATION_NAMES.filter(n => STATIONS[n].length >= 2));
  const [a, b] = sample(STATIONS[hub], 2);
  const wrong = sample(STATION_NAMES.filter(n => !(STATIONS[n].includes(a) && STATIONS[n].includes(b))), 3);
  const opts = shuffle([hub, ...wrong]);
  /* other stations serving both lines are equally correct when typed */
  const alsoRight = STATION_NAMES.filter(n => STATIONS[n].includes(a) && STATIONS[n].includes(b));
  return {
    kind: 'hub',
    prompt: t('qHub')(bullet(a), bullet(b)),
    note: null,
    choices: opts.map(n => `<span class="stn">${esc(n)}</span>`),
    answer: opts.indexOf(hub),
    explain: `<strong>${esc(hub)}</strong> — ${bullets(STATIONS[hub])}`,
    typed: { ph: 'typedPhStation', check: matchesText(alsoRight), note: t('nHubTyped') }
  };
}

function qColour() {
  const pool = LINE_IDS.filter(l => l !== '7bis'); // 6 and 7bis share a green
  const id = rnd(pool);
  const wrong = sample(pool.filter(l => l !== id), 3);
  const opts = shuffle([id, ...wrong]);
  const sw = `<span class="swatch" style="background:${LINES[id].color}"></span>`;
  const same = LINE_IDS.filter(l => LINES[l].color === LINES[id].color);
  return {
    kind: 'colour',
    prompt: t('qColour')(sw),
    note: null,
    choices: opts.map(l => `<span class="num">${l}</span>`),
    answer: opts.indexOf(id),
    explain: t('xColour')(id, ends(id)),
    typed: { ph: 'typedPhLine', check: matchesLine(same), note: null }
  };
}

/* typed only — pointless as multiple choice */
function qNameStation() {
  const id = rnd(LINE_IDS.filter(l => stationsOn(l).length >= 5));
  const on = stationsOn(id);
  return {
    kind: 'name',
    prompt: t('qName')(id),
    note: t('nName'),
    typedOnly: true,
    explain: t('xName')(id, LINES[id].count, ends(id)),
    examples: sample(on, 3),
    typed: { ph: 'typedPhStation', check: matchesText(on), note: t('nName') }
  };
}

/* line bullets and numbers are small enough to sit two-up; station names are not */
const SHORT_CHOICES = ['landmark', 'station', 'terminus', 'colour', 'count'];
const twoUp = kind => SHORT_CHOICES.includes(kind) ? ' class="twoup"' : '';

const GENERATORS = [qLandmark, qStationLine, qCount, qTerminus, qOddOne, qInterchange, qColour];
const TYPED_GENERATORS = GENERATORS.filter(g => g !== qOddOne).concat([qNameStation, qNameStation]);

/* ————— game state ————— */
const G = {
  players: [], rounds: 5, seconds: 25, mode: 'mixed',
  round: 0, turn: 0, q: null, isTyped: false,
  timer: null, left: 0, locked: false, seen: new Set()
};

function nextQuestion() {
  const typed = G.mode === 'typed' || (G.mode === 'mixed' && Math.random() < .5);
  const pool = typed ? TYPED_GENERATORS : GENERATORS;
  for (let i = 0; i < 40; i++) {
    const q = rnd(pool)();
    const key = q.kind + '|' + q.prompt;
    if (!G.seen.has(key)) { G.seen.add(key); G.isTyped = typed || !!q.typedOnly; return q; }
  }
  const q = rnd(pool)();
  G.isTyped = typed || !!q.typedOnly;
  return q;
}

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $('#' + id).classList.add('on');
}

/* ————— language wiring ————— */
const LANG_HOOKS = [];   /* live.js registers here so its screens retranslate too */

function applyLang(lang) {
  LANG = lang;
  try { localStorage.setItem('corr.lang', lang); } catch (e) { /* private mode */ }
  document.documentElement.lang = lang;
  document.querySelectorAll('.langs button').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

  $('#eyebrowTitle').textContent = t('eyebrow');
  $('#eyebrowTitle2').textContent = t('eyebrow');
  $('#lede').textContent = t('lede');
  /* #lede2 belongs to the home screen — live.js owns those strings */
  $('#lblPlayers').textContent = t('lblPlayers');
  $('#pname').placeholder = t('namePh');
  $('#add').textContent = t('add');
  $('#lblRounds').textContent = t('lblRounds');
  $('#lblSpeed').textContent = t('lblSpeed');
  $('#lblMode').textContent = t('lblMode');
  const mo = $('#mode').options;
  mo[0].textContent = t('modeMc'); mo[1].textContent = t('modeMixed'); mo[2].textContent = t('modeTyped');
  $('#modeNote').textContent = t('modeNote')[$('#mode').value];
  $('#start').textContent = t('start');
  $('#foot').innerHTML = t('foot');
  $('#foot2').innerHTML = t('foot');
  $('#passEyebrow').textContent = t('passTo');
  $('#ready').textContent = t('imReady');
  $('#typedSubmit').textContent = t('submit');
  $('#typedGiveUp').textContent = t('giveUp');
  $('#standingsLabel').textContent = t('standings');
  $('#next').textContent = t('next');
  $('#finalEyebrow').textContent = t('terminusLabel');
  $('#again').textContent = t('again');
  $('#sheetTitle').textContent = t('sheetTitle');
  $('#sheetSub').textContent = t('sheetSub');
  $('#closeSheet').textContent = t('close');
  document.querySelectorAll('[data-sheet]').forEach(b => b.textContent = t('cheat'));
  buildSheet();
  renderPlayers();
  LANG_HOOKS.forEach(fn => fn());
}

/* ————— setup ————— */
const PALETTE = ['#FFCE00', '#C04191', '#6EC4E8', '#83C491', '#F28E42', '#62259D', '#D5C900', '#0064B0'];

function renderPlayers() {
  $('#players').innerHTML = G.players.map((p, i) =>
    `<li><span class="dot" style="background:${p.color}"></span>${esc(p.name)}<button class="x" data-i="${i}" aria-label="${esc(p.name)}">×</button></li>`
  ).join('');
  $('#start').disabled = G.players.length < 3;
  $('#hint').textContent = G.players.length < 3
    ? t('need')(3 - G.players.length)
    : t('ready')(G.players.length, +$('#rounds').value);
}

function addPlayer() {
  const name = $('#pname').value.trim();
  if (!name || G.players.length >= 8) return;
  G.players.push({ name, score: 0, correct: 0, color: PALETTE[G.players.length % PALETTE.length] });
  $('#pname').value = '';
  $('#pname').focus();
  renderPlayers();
}

/* ————— turn flow ————— */
function startGame() {
  G.round = 0; G.turn = 0; G.seen.clear();
  G.players.forEach(p => { p.score = 0; p.correct = 0; });
  G.rounds = +$('#rounds').value;
  G.seconds = +$('#speed').value;
  G.mode = $('#mode').value;
  passScreen();
}

function passScreen() {
  const p = G.players[G.turn];
  $('#passName').textContent = p.name;
  $('#passName').style.color = p.color;
  $('#passMeta').textContent = `${t('roundOf')(G.round + 1, G.rounds)} · ${t('pts')(p.score)}`;
  show('pass');
}

function askQuestion() {
  const p = G.players[G.turn];
  G.q = nextQuestion();
  G.locked = false;
  G.left = G.seconds;

  $('#qWho').textContent = p.name;
  $('#qWho').style.color = p.color;
  $('#qKind').textContent = t('kinds')[G.q.kind];
  $('#qMode').textContent = G.isTyped ? t('tagTyped') : t('tagMc');
  $('#qRound').textContent = t('roundShort')(G.round + 1, G.rounds);
  $('#qText').innerHTML = G.q.prompt;

  const note = G.isTyped ? G.q.typed.note : G.q.note;
  $('#qNote').innerHTML = note || '';
  $('#qNote').style.display = note ? '' : 'none';

  if (G.isTyped) {
    $('#choices').innerHTML = '';
    $('#typed').hidden = false;
    $('#typedInput').value = '';
    $('#typedInput').placeholder = t(G.q.typed.ph);
    $('#typedInput').disabled = false;
    $('#typedSubmit').disabled = false;
  } else {
    $('#typed').hidden = true;
    $('#choices').className = SHORT_CHOICES.includes(G.q.kind) ? 'twoup' : '';
    $('#choices').innerHTML = G.q.choices.map((c, i) =>
      `<button class="choice" data-i="${i}">${c}</button>`).join('');
  }

  $('#bar').style.transition = 'none';
  $('#bar').style.width = '100%';
  show('question');
  requestAnimationFrame(() => {
    $('#bar').style.transition = `width ${G.seconds}s linear`;
    $('#bar').style.width = '0%';
  });
  if (G.isTyped) $('#typedInput').focus();

  clearInterval(G.timer);
  $('#clock').textContent = G.left;
  G.timer = setInterval(() => {
    G.left--;
    $('#clock').textContent = Math.max(G.left, 0);
    if (G.left <= 0) resolve(false, true);
  }, 1000);
}

/* multiple choice */
function answer(i) {
  if (G.locked) return;
  const ok = i === G.q.answer;
  document.querySelectorAll('.choice').forEach((b, j) => {
    b.disabled = true;
    if (j === G.q.answer) b.classList.add('right');
    else if (j === i) b.classList.add('wrong');
  });
  resolve(ok, i === -1);
}

/* typed */
function submitTyped(gaveUp) {
  if (G.locked) return;
  const raw = $('#typedInput').value;
  const ok = !gaveUp && !!raw.trim() && G.q.typed.check(raw);
  $('#typedInput').disabled = true;
  $('#typedSubmit').disabled = true;
  resolve(ok, false);
}

function resolve(ok, timedOut) {
  if (G.locked) return;
  G.locked = true;
  clearInterval(G.timer);
  $('#bar').style.transition = 'none';

  const p = G.players[G.turn];
  const base = G.isTyped ? 150 : 100;
  const bonus = ok ? Math.round(50 * Math.max(G.left, 0) / G.seconds) : 0;
  const gained = ok ? base + bonus : 0;
  p.score += gained;
  if (ok) p.correct++;

  setTimeout(() => {
    $('#verdict').textContent = timedOut ? t('timeout') : ok ? t('good') : t('bad');
    $('#verdict').className = 'verdict ' + (ok ? 'good' : 'bad');
    let ex = G.q.explain;
    if (G.q.examples) ex += ` <span style="color:var(--dim)">${t('egAccepted')} ${G.q.examples.map(esc).join(', ')}.</span>`;
    $('#explain').innerHTML = ex;
    $('#gain').innerHTML = ok ? t('gain')(gained, base, bonus) : t('zero');
    $('#standings').innerHTML = G.players
      .map((pl, idx) => ({ pl, idx }))
      .sort((a, b) => b.pl.score - a.pl.score)
      .map(({ pl, idx }) => `<li${idx === G.turn ? ' class="me"' : ''}><span class="dot" style="background:${pl.color}"></span>${esc(pl.name)}<b>${pl.score}</b></li>`)
      .join('');
    show('result');
  }, G.isTyped ? 180 : 550);
}

function advance() {
  G.turn++;
  if (G.turn >= G.players.length) { G.turn = 0; G.round++; }
  if (G.round >= G.rounds) return finish();
  passScreen();
}

function finish() {
  const ranked = [...G.players].sort((a, b) => b.score - a.score);
  const top = ranked[0].score;
  const winners = ranked.filter(p => p.score === top);
  $('#winner').textContent = winners.length > 1
    ? t('tie')(winners.map(w => w.name).join(' & '))
    : t('wins')(ranked[0].name);
  $('#podium').innerHTML = ranked.map((p, i) =>
    `<li><span class="rank">${i + 1}</span><span class="dot" style="background:${p.color}"></span>
     <span class="nm">${esc(p.name)}</span>
     <span class="det">${t('right')(p.correct, G.rounds)}</span><b>${p.score}</b></li>`).join('');
  show('final');
}

/* ————— cheat sheet ————— */
function buildSheet() {
  $('#sheet').innerHTML = LINE_IDS.map(id =>
    `<div class="row">${bullet(id, 'big')}
      <div><div class="tm">${ends(id)}</div>
      <div class="ct">${t('stations')(LINES[id].count)}</div></div></div>`).join('');
}

/* ————— wiring ————— */
document.querySelectorAll('.langs button').forEach(b => b.onclick = () => applyLang(b.dataset.lang));
$('#add').onclick = addPlayer;
$('#pname').addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(); });
$('#players').addEventListener('click', e => {
  const b = e.target.closest('.x'); if (!b) return;
  G.players.splice(+b.dataset.i, 1); renderPlayers();
});
$('#rounds').onchange = renderPlayers;
$('#mode').onchange = () => { $('#modeNote').textContent = t('modeNote')[$('#mode').value]; };
$('#start').onclick = startGame;
$('#ready').onclick = askQuestion;
$('#choices').addEventListener('click', e => {
  const b = e.target.closest('.choice'); if (b) answer(+b.dataset.i);
});
$('#typedSubmit').onclick = () => submitTyped(false);
$('#typedGiveUp').onclick = () => submitTyped(true);
$('#typedInput').addEventListener('keydown', e => { if (e.key === 'Enter') submitTyped(false); });
$('#next').onclick = advance;
$('#again').onclick = () => { show('setup'); renderPlayers(); };
document.querySelectorAll('[data-sheet]').forEach(el => el.onclick = () => $('#modal').classList.add('on'));
$('#closeSheet').onclick = () => $('#modal').classList.remove('on');
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').classList.remove('on'); });

let saved = null;
try { saved = localStorage.getItem('corr.lang'); } catch (e) { /* private mode */ }
applyLang(saved === 'fr' || saved === 'en' ? saved : (navigator.language || '').startsWith('fr') ? 'fr' : 'en');
