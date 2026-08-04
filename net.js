/* Minimal Supabase Realtime client — broadcast only.
   Speaks the Phoenix channel protocol directly over a WebSocket so the game
   stays dependency-free and keeps working as a single inlined file. */

function joinRoom(code, handlers) {
  const topic = 'realtime:metro-' + code;
  const url = `wss://${SUPABASE_REF}.supabase.co/realtime/v1/websocket`
    + `?apikey=${encodeURIComponent(SUPABASE_ANON_KEY)}&vsn=1.0.0`;

  let ws = null, ref = 0, beat = null, retry = 0, closed = false, joined = false;
  let everJoined = false, failures = 0;
  const queue = [];

  const nextRef = () => String(++ref);

  function push(msg) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
    else queue.push(msg);
  }

  function connect() {
    if (closed) return;
    joined = false;
    ws = new WebSocket(url);

    ws.onopen = () => {
      push({
        topic, event: 'phx_join', ref: nextRef(),
        payload: { config: { broadcast: { self: false, ack: false }, presence: { key: '' }, private: false } }
      });
      clearInterval(beat);
      beat = setInterval(() => push({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: nextRef() }), 25000);
    };

    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch (_) { return; }

      if (m.event === 'phx_reply' && m.topic === topic) {
        if (m.payload && m.payload.status === 'ok') {
          if (!joined) {
            joined = true; everJoined = true; retry = 0; failures = 0;
            while (queue.length) ws.send(JSON.stringify(queue.shift()));
            handlers.onOpen && handlers.onOpen();
          }
        } else if (!joined) {
          handlers.onError && handlers.onError('join refused');
        }
        return;
      }
      if (m.event === 'broadcast' && m.payload && m.payload.type === 'broadcast') {
        handlers.onMessage && handlers.onMessage(m.payload.event, m.payload.payload || {});
      }
    };

    ws.onclose = () => {
      clearInterval(beat);
      if (closed) return;
      /* never connected at all — no network, or a page CSP that blocks wss */
      if (!everJoined && ++failures >= 3) {
        closed = true;
        handlers.onUnreachable && handlers.onUnreachable();
        return;
      }
      handlers.onDrop && handlers.onDrop();
      retry = Math.min(retry + 1, 6);
      setTimeout(connect, 400 * retry * retry);   // 0.4s, 1.6s, 3.6s … capped
    };

    ws.onerror = () => { try { ws.close(); } catch (_) {} };
  }

  connect();

  return {
    send(event, payload) {
      push({ topic, event: 'broadcast', ref: nextRef(), payload: { type: 'broadcast', event, payload } });
    },
    get live() { return joined; },
    close() { closed = true; clearInterval(beat); try { ws && ws.close(); } catch (_) {} }
  };
}

/* room codes: no vowels (no accidental words), no I/O/0/1 lookalikes */
const CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ23456789';
const makeCode = () => Array.from({ length: 4 }, () =>
  CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');
