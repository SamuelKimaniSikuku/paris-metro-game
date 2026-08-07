/* Live rooms — everyone on their own phone.
   The host's browser is the referee: it generates questions, holds the answers,
   scores what comes in and broadcasts the room state. Players' phones are thin
   clients. Everything rides on broadcast messages; nothing is stored anywhere. */

Object.assign(T.en, {
  ledeHome: 'Guess your way across the Paris Métro — lines, landmarks, termini, and the stations in between. Three ways to play.',
  homeSolo: 'One phone, passed around', homeSoloSub: 'No internet needed. Take turns on this screen.',
  homeLive: 'Everyone on their own phone', homeLiveSub: 'Share a code, answer at the same time, race for the points.',
  create: 'Start a room', join: 'Join a room', joinCode: 'Room code', yourName: 'Your name',
  back: '← Back', joinGo: 'Join', connecting: 'Connecting…',
  lobbyCode: 'Room code', lobbyShare: 'Share…', lobbyCopied: 'Copied',
  lobbyCopy: 'Copy link', lobbySelect: 'Select it and copy',
  lobbyWho: 'In the room', lobbyWait: 'Waiting for the host to start…',
  lobbyHint: 'Others open the same page, tap “Join a room”, and type this code.',
  startLive: 'Start the game', needTwo: 'You need at least 2 players.',
  youHost: 'You’re the host', youHostSub: 'Keep this page open — the room lives here. Start when everyone’s in.',
  resumed: 'Back in your room.',
  qOf: (a, b) => `Question ${a} of ${b}`,
  answered: (a, b) => `${a} of ${b} answered`,
  waiting: 'Answer locked in. Waiting for the others…',
  timeUp: 'Time.', youGot: 'You', nobody: 'Nobody got it.',
  everyone: 'Everyone got it.', someGot: n => `${n} got it.`,
  nextQ: 'Next question', endGame: 'End the game', hostLeft: 'The host has left the room.',
  reconnecting: 'Connection lost — reconnecting…',
  offline: 'Live rooms need a connection. The pass-the-phone game works offline.',
  liveRounds: 'Questions', hostBadge: 'Host', you: 'you',
  leave: 'Leave the room', roomFull: 'That room is full.',
  finalTitle: 'Final standings', playAgainLive: 'Play again, same room',
  lastAnswer: 'Last question', winsBy: (n, p) => `${n} wins by ${p} point${p === 1 ? '' : 's'}`,
  perfect: 'a clean sweep', dropped: n => `${n} left the room.`,
  localTitle: 'This link only works on this computer',
  localBody: 'You’re on a local copy of the game. Nobody else can open a localhost link. Host the room from the real site instead:',
  localGo: 'Open the real site',
  noRoom: "No room with that code — check it and try again, or the host hasn't started one yet."
});

Object.assign(T.fr, {
  ledeHome: 'On devine son chemin dans le métro parisien : lignes, monuments, terminus et tout ce qu’il y a entre les deux. Trois façons de jouer.',
  homeSolo: 'Un seul téléphone, qu’on se passe', homeSoloSub: 'Sans connexion. Chacun son tour sur cet écran.',
  homeLive: 'Chacun sur son téléphone', homeLiveSub: 'On partage un code, on répond en même temps, au plus rapide.',
  create: 'Créer une partie', join: 'Rejoindre une partie', joinCode: 'Code de la partie', yourName: 'Ton prénom',
  back: '← Retour', joinGo: 'Rejoindre', connecting: 'Connexion…',
  lobbyCode: 'Code de la partie', lobbyShare: 'Partager…', lobbyCopied: 'Copié',
  lobbyCopy: 'Copier le lien', lobbySelect: 'Sélectionne-le et copie-le',
  lobbyWho: 'Dans la partie', lobbyWait: 'On attend que l’hôte lance la partie…',
  lobbyHint: 'Les autres ouvrent la même page, appuient sur « Rejoindre une partie » et tapent ce code.',
  startLive: 'Lancer la partie', needTwo: 'Il faut au moins 2 joueurs.',
  youHost: 'C’est toi l’hôte', youHostSub: 'Garde cette page ouverte — la partie vit ici. Lance quand tout le monde est là.',
  resumed: 'De retour dans ta partie.',
  qOf: (a, b) => `Question ${a} sur ${b}`,
  answered: (a, b) => `${a} sur ${b} ont répondu`,
  waiting: 'Réponse enregistrée. On attend les autres…',
  timeUp: 'Terminé.', youGot: 'Toi', nobody: 'Personne ne l’a trouvée.',
  everyone: 'Tout le monde l’a trouvée.', someGot: n => `${n} l’ont trouvée.`,
  nextQ: 'Question suivante', endGame: 'Terminer la partie', hostLeft: 'L’hôte a quitté la partie.',
  reconnecting: 'Connexion perdue — reconnexion…',
  offline: 'Les parties en ligne demandent une connexion. Le jeu à un seul téléphone marche hors ligne.',
  liveRounds: 'Questions', hostBadge: 'Hôte', you: 'toi',
  leave: 'Quitter la partie', roomFull: 'Cette partie est complète.',
  finalTitle: 'Classement final', playAgainLive: 'Rejouer, même partie',
  lastAnswer: 'Dernière question', winsBy: (n, p) => `${n} gagne de ${p} point${p === 1 ? '' : 's'}`,
  perfect: 'un sans-faute', dropped: n => `${n} a quitté la partie.`,
  localTitle: 'Ce lien ne marche que sur cet ordinateur',
  localBody: 'Tu es sur une copie locale du jeu. Personne d’autre ne peut ouvrir un lien localhost. Crée plutôt la partie depuis le vrai site :',
  localGo: 'Ouvrir le vrai site',
  noRoom: 'Aucune partie avec ce code — vérifie-le, ou l’hôte n’a pas encore créé la partie.'
});

const MAX_PLAYERS = 10;
const REVEAL_MS = 3200;

/* A room hosted from a dev copy hands out links nobody else can reach. */
const IS_LOCAL = location.protocol === 'file:'
  || ['localhost', '127.0.0.1', '::1', ''].includes(location.hostname);

const M = {
  net: null, code: '', isHost: false, me: { id: '', name: '' },
  phase: 'idle',            // idle | lobby | question | reveal | final | lost
  players: [],              // [{id,name,score,correct,host}]
  rounds: 8, seconds: 25, mode: 'mixed',
  qIndex: 0, q: null, qid: 0, qView: null,
  endsAt: 0, answers: {}, results: null, answeredCount: 0,
  myAnswer: null, tick: null, hostTimer: null, beat: null, watch: null,
  lastSync: 0, notice: ''
};

function myId() {
  let id = null;
  try { id = sessionStorage.getItem('corr.id'); } catch (e) { /* private mode */ }
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    try { sessionStorage.setItem('corr.id', id); } catch (e) { /* private mode */ }
  }
  return id;
}

/* ————— connection ————— */
function connect(code, onOpen) {
  M.code = code;
  M.me.id = myId();
  M.net = joinRoom(code, {
    onOpen: () => {
      /* clear only connection chatter — keep messages like "back in your room" */
      if (M.notice === t('connecting') || M.notice === t('reconnecting')) M.notice = '';
      onOpen && onOpen();
      renderLive();
    },
    onDrop: () => { M.notice = t('reconnecting'); renderLive(); },
    onUnreachable: () => { M.net = null; M.phase = 'unreachable'; renderLive(); },
    onMessage: handleMessage
  });
}

function leaveRoom() {
  /* a host walking out ends the room — say so, don't leave players hanging */
  if (M.net) { M.net.send(M.isHost ? 'closed' : 'bye', { id: M.me.id }); M.net.close(); }
  clearInterval(M.tick); clearTimeout(M.hostTimer); clearInterval(M.beat); clearInterval(M.watch);
  M.net = null; M.phase = 'idle'; M.players = []; M.isHost = false;
  forgetRoom();
  show('home');
}

function handleMessage(event, p) {
  if (M.isHost) {
    if (event === 'hello') {
      const known = M.players.find(x => x.id === p.id);
      if (known) { known.lastSeen = Date.now(); return; }   /* just a heartbeat */
      if (M.players.length >= MAX_PLAYERS) { M.net.send('full', { id: p.id }); return; }
      M.players.push({
        id: p.id, name: String(p.name || '?').slice(0, 18),
        score: 0, correct: 0, host: false, lastSeen: Date.now()
      });
      broadcastSync();
      renderLive();
    } else if (event === 'answer') {
      takeAnswer(p);
    } else if (event === 'bye') {
      M.players = M.players.filter(x => x.id !== p.id);
      delete M.answers[p.id];
      broadcastSync(); renderLive();
      closeIfEveryoneAnswered();
    }
    return;
  }

  /* player side */
  if (event === 'sync') applySync(p);
  else if (event === 'reveal') applyReveal(p);
  else if (event === 'closed') { M.phase = 'lost'; M.notice = t('hostLeft'); renderLive(); }
  else if (event === 'full' && p.id === M.me.id) { M.notice = t('roomFull'); M.phase = 'idle'; renderLive(); show('online'); }
}

/* ————— host: broadcasting ————— */
function publicPlayers() {
  return M.players.map(p => ({ id: p.id, name: p.name, score: p.score, correct: p.correct, host: p.host }));
}

function broadcastSync() {
  if (!M.isHost || !M.net) return;
  M.net.send('sync', {
    phase: M.phase, players: publicPlayers(),
    qIndex: M.qIndex, rounds: M.rounds,
    q: M.qView, remaining: Math.max(0, M.endsAt - Date.now()),
    seconds: M.seconds, answeredCount: M.answeredCount
  });
}

function applySync(p) {
  M.lastSync = Date.now();
  const wasQid = M.qView && M.qView.qid;
  M.phase = p.phase; M.players = p.players || []; M.qIndex = p.qIndex;
  M.rounds = p.rounds; M.seconds = p.seconds; M.answeredCount = p.answeredCount || 0;
  M.qView = p.q || null;
  M.endsAt = Date.now() + (p.remaining || 0);
  if (M.qView && M.qView.qid !== wasQid) { M.myAnswer = null; M.results = null; }
  renderLive();
}

/* ————— host: the round loop ————— */
function startLive() {
  if (M.players.length < 2) return;
  M.rounds = +($('#lvRounds') || {}).value || 8;
  M.seconds = +($('#lvSpeed') || {}).value || 25;
  M.mode = ($('#lvMode') || {}).value || 'mixed';
  M.qIndex = 0;
  M.players.forEach(p => { p.score = 0; p.correct = 0; });
  G.seen.clear();
  askLive();
}

function askLive() {
  G.mode = M.mode;
  G.seconds = M.seconds;
  M.q = nextQuestion();
  M.qid = ++M.qIndex;
  M.answers = {}; M.answeredCount = 0; M.results = null; M.myAnswer = null;
  M.phase = 'question';
  M.endsAt = Date.now() + M.seconds * 1000;
  M.qView = {
    qid: M.qid, kind: M.q.kind, prompt: M.q.prompt,
    note: G.isTyped ? M.q.typed.note : M.q.note,
    choices: G.isTyped ? null : M.q.choices,
    isTyped: G.isTyped, ph: G.isTyped ? M.q.typed.ph : null
  };
  broadcastSync();
  renderLive();
  clearTimeout(M.hostTimer);
  M.hostTimer = setTimeout(closeQuestion, M.seconds * 1000 + 300);
}

/* Liveness is two separate questions, and conflating them is a trap.
   Phones throttle timers to a crawl when the screen locks or the player
   switches apps, so a quiet heartbeat does NOT mean someone has left.
   QUIET_MS: stop *waiting* on them, so the round can end.
   GONE_MS:  actually drop them from the room. Deliberately much longer. */
const QUIET_MS = 15000;
const GONE_MS = 60000;

const seenRecently = p => p.host || !p.lastSeen || Date.now() - p.lastSeen < QUIET_MS;

/* players the round is still legitimately waiting on */
function waitingOn() {
  return M.players.filter(p => !M.answers[p.id] && seenRecently(p));
}

function pruneAbsent() {
  if (!M.isHost) return false;
  const now = Date.now();
  const gone = M.players.filter(p => !p.host && p.lastSeen && now - p.lastSeen > GONE_MS);
  if (!gone.length) return false;
  gone.forEach(p => { delete M.answers[p.id]; });
  M.players = M.players.filter(p => !gone.includes(p));
  M.answeredCount = Object.keys(M.answers).length;
  M.notice = t('dropped')(gone.map(p => p.name).join(', '));
  setTimeout(() => { M.notice = ''; renderLive(); }, 5000);
  return true;
}

function closeIfEveryoneAnswered() {
  if (M.phase !== 'question') return;
  M.answeredCount = Object.keys(M.answers).length;
  if (waitingOn().length === 0) {
    clearTimeout(M.hostTimer);
    M.hostTimer = setTimeout(closeQuestion, 150);
  }
}

function takeAnswer(p) {
  const who = M.players.find(x => x.id === p.id);
  if (who) who.lastSeen = Date.now();   /* answering proves they're here */
  if (M.phase !== 'question' || p.qid !== M.qid || M.answers[p.id]) return;
  const limit = M.seconds * 1000;
  const elapsed = Math.min(Math.max(+p.elapsed || 0, 0), limit);
  const ok = M.qView.isTyped
    ? (typeof p.value === 'string' && p.value.trim() !== '' && M.q.typed.check(p.value))
    : p.value === M.q.answer;
  M.answers[p.id] = { ok, elapsed, value: p.value };
  M.answeredCount = Object.keys(M.answers).length;
  broadcastSync(); renderLive();
  closeIfEveryoneAnswered();
}

function closeQuestion() {
  if (M.phase !== 'question') return;
  const base = M.qView.isTyped ? 150 : 100;
  const limit = M.seconds * 1000;
  const results = M.players.map(pl => {
    const a = M.answers[pl.id];
    const ok = !!(a && a.ok);
    const gain = ok ? base + Math.round(50 * (1 - a.elapsed / limit)) : 0;
    pl.score += gain;
    if (ok) pl.correct++;
    return { id: pl.id, ok, gain, answered: !!a };
  });
  M.results = results;
  M.phase = M.qIndex >= M.rounds ? 'final' : 'reveal';
  const payload = {
    qid: M.qid, phase: M.phase, explain: M.q.explain,
    examples: M.q.examples || null,
    answerIndex: M.qView.isTyped ? null : M.q.answer,
    results, players: publicPlayers(), qIndex: M.qIndex, rounds: M.rounds
  };
  M.net && M.net.send('reveal', payload);
  renderLive();
  if (M.phase === 'reveal') {
    clearTimeout(M.hostTimer);
    M.hostTimer = setTimeout(askLive, REVEAL_MS);
  }
}

function applyReveal(p) {
  M.phase = p.phase; M.results = p.results; M.players = p.players;
  M.qIndex = p.qIndex; M.rounds = p.rounds;
  M.revealExplain = p.explain; M.revealExamples = p.examples;
  M.revealAnswer = p.answerIndex;
  renderLive();
}

/* ————— player: answering ————— */
function sendLiveAnswer(value) {
  if (M.myAnswer !== null || M.phase !== 'question') return;
  M.myAnswer = value;
  const elapsed = M.seconds * 1000 - Math.max(0, M.endsAt - Date.now());
  if (M.isHost) takeAnswer({ id: M.me.id, qid: M.qView.qid, value, elapsed });
  else M.net.send('answer', { id: M.me.id, qid: M.qView.qid, value, elapsed });
  renderLive();
}

/* ————— rendering ————— */
const nameOf = id => (M.players.find(p => p.id === id) || {}).name || '?';

function board(highlightMe) {
  return `<ul class="lb">${[...M.players].sort((a, b) => b.score - a.score).map((p, i) => {
    const r = M.results && M.results.find(x => x.id === p.id);
    const gain = r && r.gain ? `<span class="gainpill">+${r.gain}</span>` : '';
    return `<li${highlightMe && p.id === M.me.id ? ' class="me"' : ''}>
      <span class="rank">${i + 1}</span><span class="nm">${esc(p.name)}</span>${gain}<b>${p.score}</b></li>`;
  }).join('')}</ul>`;
}

function renderLive() {
  const el = $('#liveBody');
  if (!el) return;

  /* The host syncs every 3s. Re-rendering the card on each one would replace
     the answer box mid-word — wiping what you typed and closing the keyboard.
     While the same question is still up, patch the one line that changes. */
  if (M.phase === 'question' && M.qView
      && el.dataset.qid === String(M.qView.qid)
      && el.dataset.locked === String(M.myAnswer !== null)) {
    const line = el.querySelector('#answeredLine');
    if (line) line.textContent = t('answered')(M.answeredCount, M.players.length);
    const note = el.querySelector('.notice');
    if (note) note.textContent = M.notice;
    return;
  }

  clearInterval(M.tick);
  el.dataset.qid = '';
  el.dataset.locked = '';
  const notice = M.notice ? `<p class="notice">${esc(M.notice)}</p>` : '';

  if (M.phase === 'lobby' || M.phase === 'idle') {
    const url = location.origin + location.pathname + '?room=' + M.code;
    el.innerHTML = `${notice}
      ${IS_LOCAL ? `<div class="localwarn">
        <strong>${t('localTitle')}</strong>
        <span>${t('localBody')}</span>
        <a class="gobtn" href="${esc(PUBLIC_URL)}">${t('localGo')}</a></div>` : ''}
      ${M.isHost && !IS_LOCAL ? `<div class="hostbanner">
        <strong>${t('youHost')}</strong><span>${t('youHostSub')}</span></div>` : ''}
      <div class="card center">
        <div class="eyebrow">${t('lobbyCode')}</div>
        <div class="code">${esc(M.code)}</div>
        <p class="dimtext">${esc(t('lobbyHint'))}</p>
        <input id="roomLink" type="text" readonly value="${esc(url)}">
        <div class="lobbybtns">
          <button id="copyBtn">${t('lobbyCopy')}</button>
          ${navigator.share ? `<button id="shareBtn">${t('lobbyShare')}</button>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:8px">${t('lobbyWho')} · ${M.players.length}</div>
        <ul class="lb">${M.players.map(p => `<li><span class="nm">${esc(p.name)}</span>
          <span class="det">${p.host ? t('hostBadge') : ''}${p.id === M.me.id ? (p.host ? ' · ' : '') + t('you') : ''}</span></li>`).join('')}</ul>
      </div>
      ${M.isHost
        ? `<button id="startLiveBtn" class="primary"${M.players.length < 2 ? ' disabled' : ''}>${t('startLive')}</button>
           ${M.players.length < 2 ? `<p class="dimtext center" style="margin:8px 0 0">${t('needTwo')}</p>` : ''}
           <div class="card">
             <div class="grid2" style="margin-top:0">
               <div><label for="lvRounds">${t('liveRounds')}</label>
                 <select id="lvRounds">${[5, 8, 12, 20].map(v => `<option${v === 8 ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
               <div><label for="lvSpeed">${t('lblSpeed')}</label>
                 <select id="lvSpeed">${[15, 25, 40, 60].map(v => `<option${v === 25 ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
             </div>
             <div class="stack"><label for="lvMode">${t('lblMode')}</label>
               <select id="lvMode">
                 <option value="mc">${t('modeMc')}</option>
                 <option value="mixed" selected>${t('modeMixed')}</option>
                 <option value="typed">${t('modeTyped')}</option>
               </select></div>
           </div>`
        : `<p class="dimtext center">${t('lobbyWait')}</p>`}
      <p class="center" style="margin-top:16px"><button class="ghost" id="leaveBtn">${t('leave')}</button></p>`;
    /* selecting the field is the fallback that always works, even where the
       clipboard API is blocked (insecure origin, permission denied, old browser) */
    const linkField = $('#roomLink');
    linkField.onclick = () => linkField.select();
    $('#copyBtn').onclick = async () => {
      const btn = $('#copyBtn');
      linkField.select();
      linkField.setSelectionRange(0, 999);
      let done = false;
      try { await navigator.clipboard.writeText(url); done = true; } catch (e) { /* fall through */ }
      if (!done) { try { done = document.execCommand('copy'); } catch (e) { /* fall through */ } }
      btn.textContent = done ? t('lobbyCopied') : t('lobbySelect');
      setTimeout(() => { btn.textContent = t('lobbyCopy'); }, 2500);
    };
    const sh = $('#shareBtn');
    if (sh) sh.onclick = async () => {
      try { await navigator.share({ title: 'Correspondance', url }); } catch (e) { /* dismissed */ }
    };
    const s = $('#startLiveBtn'); if (s) s.onclick = startLive;
    $('#leaveBtn').onclick = leaveRoom;
    return;
  }

  if (M.phase === 'question' && M.qView) {
    const q = M.qView;
    const done = M.myAnswer !== null;
    el.innerHTML = `${notice}
      <div class="card">
        <div class="qhead"><b>${t('qOf')(M.qIndex, M.rounds)}</b>
          <span>${t('kinds')[q.kind]}</span>
          <span class="tag">${q.isTyped ? t('tagTyped') : t('tagMc')}</span>
          <span id="clock2"></span></div>
        <div class="track"><div id="bar2"></div></div>
        <p id="qText">${q.prompt}</p>
        ${q.note ? `<p id="qNote">${q.note}</p>` : ''}
        ${done ? `<p class="waitmsg">${t('waiting')}</p>`
          : q.isTyped
            ? `<div id="typed2"><input id="typedInput2" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(t(q.ph))}">
               <button id="typedSubmit2" class="primary">${t('submit')}</button></div>`
            : `<div id="choices2"${twoUp(q.kind)}>${q.choices.map((c, i) => `<button class="choice" data-i="${i}">${c}</button>`).join('')}</div>`}
        <p class="dimtext center" id="answeredLine">${t('answered')(M.answeredCount, M.players.length)}</p>
      </div>`;

    const bar = $('#bar2'), clock = $('#clock2');
    const paint = () => {
      const left = Math.max(0, M.endsAt - Date.now());
      bar.style.width = (100 * left / (M.seconds * 1000)) + '%';
      clock.textContent = Math.ceil(left / 1000);
    };
    paint();
    M.tick = setInterval(paint, 100);
    el.dataset.qid = String(q.qid);
    el.dataset.locked = String(done);

    if (!done) {
      if (q.isTyped) {
        const go = () => sendLiveAnswer($('#typedInput2').value);
        $('#typedSubmit2').onclick = go;
        $('#typedInput2').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        $('#typedInput2').focus();
      } else {
        $('#choices2').addEventListener('click', e => {
          const b = e.target.closest('.choice');
          if (b) sendLiveAnswer(+b.dataset.i);
        });
      }
    }
    return;
  }

  if (M.phase === 'final') {
    const explain = M.isHost ? M.q.explain : M.revealExplain;
    const examples = M.isHost ? M.q.examples : M.revealExamples;
    const ranked = [...M.players].sort((a, b) => b.score - a.score);
    const top = ranked[0] ? ranked[0].score : 0;
    const winners = ranked.filter(p => p.score === top);
    const runnerUp = ranked.find(p => p.score < top);
    const headline = winners.length > 1
      ? t('tie')(winners.map(w => w.name).join(' & '))
      : runnerUp ? t('winsBy')(ranked[0].name, top - runnerUp.score) : t('wins')(ranked[0].name);

    el.innerHTML = `${notice}
      <div class="card">
        <div class="eyebrow">${t('finalTitle')}</div>
        <div id="winner">${esc(headline)}</div>
        <ul class="lb final">${ranked.map((p, i) => `<li${p.id === M.me.id ? ' class="me"' : ''}>
          <span class="rank">${i + 1}</span><span class="nm">${esc(p.name)}</span>
          <span class="det">${t('right')(p.correct, M.rounds)}</span><b>${p.score}</b></li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:8px">${t('lastAnswer')}</div>
        <p id="explain" style="margin:0">${explain}${examples ? ` <span style="color:var(--dim)">${t('egAccepted')} ${examples.map(esc).join(', ')}.</span>` : ''}</p>
      </div>
      ${M.isHost ? `<button class="primary" id="againLive">${t('playAgainLive')}</button>` : ''}
      <p class="center" style="margin-top:16px"><button class="ghost" id="leaveBtn2">${t('leave')}</button></p>`;
    const ag = $('#againLive');
    if (ag) ag.onclick = () => {
      M.players.forEach(p => { p.score = 0; p.correct = 0; });
      M.phase = 'lobby'; M.qIndex = 0; M.results = null; M.qView = null;
      G.seen.clear();
      broadcastSync(); renderLive();
    };
    $('#leaveBtn2').onclick = leaveRoom;
    return;
  }

  if (M.phase === 'reveal') {
    const explain = M.isHost ? M.q.explain : M.revealExplain;
    const examples = M.isHost ? M.q.examples : M.revealExamples;
    const mine = M.results && M.results.find(r => r.id === M.me.id);
    const got = M.results ? M.results.filter(r => r.ok).length : 0;
    const headline = got === 0 ? t('nobody')
      : got === M.players.length ? t('everyone') : t('someGot')(got);

    el.innerHTML = `${notice}
      <div class="card">
        ${mine ? `<p class="verdict ${mine.ok ? 'good' : 'bad'}">${mine.ok ? t('good') : t('bad')}</p>` : ''}
        <p id="explain">${explain}${examples ? ` <span style="color:var(--dim)">${t('egAccepted')} ${examples.map(esc).join(', ')}.</span>` : ''}</p>
        <p class="dimtext">${headline}</p>
      </div>
      <div class="card">
        <div class="eyebrow" style="margin-bottom:6px">${t('standings')}</div>
        ${board(true)}
      </div>
      ${M.isHost ? `<button class="primary" id="skipReveal">${t('nextQ')}</button>` : ''}
      <p class="dimtext center">${t('qOf')(M.qIndex, M.rounds)}</p>`;
    const sk = $('#skipReveal');
    if (sk) sk.onclick = () => { clearTimeout(M.hostTimer); askLive(); };
    return;
  }

  if (M.phase === 'unreachable') {
    el.innerHTML = `<div class="card center"><p class="dimtext">${t('offline')}</p></div>
      <button class="primary" id="offlineSolo">${t('homeSolo')}</button>
      <p class="center" style="margin-top:16px"><button class="ghost" id="leaveBtn4">${t('back')}</button></p>`;
    $('#offlineSolo').onclick = () => { M.phase = 'idle'; show('setup'); };
    $('#leaveBtn4').onclick = leaveRoom;
    return;
  }

  if (M.phase === 'lost') {
    el.innerHTML = `<div class="card center"><p class="verdict bad">${esc(M.notice)}</p>
      ${board(true)}</div>
      <button class="primary" id="leaveBtn3">${t('leave')}</button>`;
    $('#leaveBtn3').onclick = leaveRoom;
    return;
  }

  el.innerHTML = `<div class="card center"><p class="dimtext">${notice || t('connecting')}</p></div>`;
}

/* ————— remembering the room across a reload ————— */
function rememberRoom(code, name, host) {
  try { sessionStorage.setItem('corr.room', JSON.stringify({ code, name, host })); } catch (e) { /* private mode */ }
}
function forgetRoom() {
  try { sessionStorage.removeItem('corr.room'); } catch (e) { /* private mode */ }
}
function recallRoom() {
  try { return JSON.parse(sessionStorage.getItem('corr.room') || 'null'); } catch (e) { return null; }
}

/* ————— entry points ————— */
function hostRoom(name, code) {
  M.isHost = true;
  M.me.name = name;
  M.phase = 'lobby';
  M.players = [{ id: myId(), name, score: 0, correct: 0, host: true }];
  M.me.id = myId();
  code = code || makeCode();
  rememberRoom(code, name, true);
  connect(code, () => broadcastSync());
  clearInterval(M.beat);
  M.beat = setInterval(() => {
    if (!M.isHost) return;
    if (pruneAbsent()) renderLive();
    closeIfEveryoneAnswered();   /* re-check: someone may have just gone quiet */
    broadcastSync();
  }, 3000);
  show('live');
  renderLive();
}

function joinAs(code, name) {
  M.isHost = false;
  M.me.name = name;
  M.phase = 'idle';
  M.notice = t('connecting');
  rememberRoom(code, name, false);
  connect(code, () => M.net.send('hello', { id: M.me.id, name }));
  clearInterval(M.beat);
  M.beat = setInterval(() => { if (!M.isHost && M.net) M.net.send('hello', { id: M.me.id, name }); }, 4000);
  /* the host broadcasts every 3s — a long silence means it went away without saying so */
  M.lastSync = Date.now();
  clearInterval(M.watch);
  M.watch = setInterval(() => {
    const playing = ['lobby', 'question', 'reveal'].includes(M.phase);
    if (playing && Date.now() - M.lastSync > 14000) {
      M.phase = 'lost'; M.notice = t('hostLeft');
      clearInterval(M.watch); renderLive();
    }
  }, 2000);
  show('live');
  renderLive();
  setTimeout(() => {
    if (M.phase === 'idle') { M.notice = t('noRoom'); renderLive(); }
  }, 6000);
}

/* Coming back from a locked screen or another app: timers were throttled to
   near-nothing, so announce immediately rather than waiting for the next tick. */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !M.net) return;
  if (M.isHost) broadcastSync();
  else M.net.send('hello', { id: M.me.id, name: M.me.name });
});

/* the host tells the room when it closes the tab */
window.addEventListener('pagehide', () => {
  if (M.net && M.isHost) M.net.send('closed', {});
  else if (M.net) M.net.send('bye', { id: M.me.id });
});

/* ————— wiring ————— */
function liveLangRefresh() {
  $('#lede2').textContent = t('ledeHome');
  $('#homeSolo').innerHTML = `<span class="opt">${t('homeSolo')}</span><span class="optsub">${t('homeSoloSub')}</span>`;
  $('#homeLive').innerHTML = `<span class="opt">${t('homeLive')}</span><span class="optsub">${t('homeLiveSub')}</span>`;
  $('#lblYourName').textContent = t('yourName');
  $('#lblJoinCode').textContent = t('joinCode');
  $('#createBtn').textContent = t('create');
  $('#joinBtn').textContent = t('joinGo');
  $('#onlineBack').textContent = t('back');
  $('#homeBackFromSetup').textContent = t('back');
  if (M.net) {
    const el = $('#liveBody');
    if (el) el.dataset.qid = '';   /* a language change must redraw everything */
    renderLive();
  }
}
LANG_HOOKS.push(liveLangRefresh);
liveLangRefresh();   /* app.js already ran applyLang before this file loaded */

$('#homeSolo').onclick = () => show('setup');
$('#homeLive').onclick = () => { show('online'); $('#myName').focus(); };
$('#onlineBack').onclick = () => show('home');
$('#homeBackFromSetup').onclick = () => show('home');
$('#createBtn').onclick = () => {
  const n = $('#myName').value.trim() || 'Anon';
  hostRoom(n.slice(0, 18));
};
$('#joinBtn').onclick = () => {
  const n = $('#myName').value.trim() || 'Anon';
  const c = $('#roomCode').value.trim().toUpperCase();
  if (c.length !== 4) return;
  joinAs(c, n.slice(0, 18));
};
$('#roomCode').addEventListener('keydown', e => { if (e.key === 'Enter') $('#joinBtn').click(); });

/* deep link: ?room=XXXX drops you straight on the join form */
const roomParam = new URLSearchParams(location.search).get('room');
if (roomParam && /^[A-Z0-9]{4}$/i.test(roomParam)) {
  $('#roomCode').value = roomParam.toUpperCase();
  $('#online').classList.add('invited');
  show('online');
  setTimeout(() => $('#myName').focus(), 50);
} else {
  /* a reload shouldn't kill the room — pick up where this device left off.
     A host that reloads mid-game comes back in the lobby; players re-announce
     themselves every few seconds, so the roster rebuilds on its own. */
  const prev = recallRoom();
  if (prev && prev.code) {
    M.notice = t('resumed');
    if (prev.host) hostRoom(prev.name, prev.code);
    else joinAs(prev.code, prev.name);
  }
}
