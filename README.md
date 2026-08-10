# Correspondance

A pass-the-phone guessing game about the Paris Métro, for 3–8 players. One screen, no server, no build step, no dependencies.

**Play it:** https://quiz-metro.com

## Three ways to play

**One phone, passed around.** Add players, pick the length and the clock, then pass the phone. Each player gets their own question and the screen shows what was right along with the running standings. Works with no internet at all — useful when you're actually underground.

**Everyone on their own phone.** The host starts a room and gets a 4-letter code and a shareable link. Everyone else opens the same page, taps *Join a room* and types the code — or just follows the link, which fills the code in for them. Then every player sees the same question at the same moment on their own screen, answers race in, and the leaderboard updates between questions. Up to 10 players.

**Crossword.** Pick **Mini** (five clues, short answers, a couple of minutes) or the **Full grid** (eight clues, longer names). Answers are station names, clued from the same data — "Closest station to the Musée d'Orsay (9)", "Change here between lines 4 and 10 (5)", "Terminus of line 8 (6)". Tap a square or a clue, type, and check your work. **Hint** fills one letter of the word you're on. A new grid every time, so it never runs out.

Highest score at the terminus wins.

## How scoring works

- **Multiple choice** — four options, 100 points a question
- **Type the answer** — no options, 150 points, and near-enough spelling counts
- **Mixed** — roughly half of each

Answering fast is worth up to 50 extra points. The game plays in **English or French** — toggle at the top right; your choice is remembered.

## Question types

| Type | Example |
|---|---|
| Landmark → line | Which line takes you to the Moulin Rouge? |
| Station → line | Which line serves Marx Dormoy? |
| Line → station count | How many stations on line 7? |
| Terminus → line | *Boulogne–Pont de Saint-Cloud* is the end of which line? |
| Odd one out | Which of these is *not* on line 4? |
| Interchange | Where can you change between 6 and 9? |
| Colour | Name the line from its colour on the map |
| Name a station | Name any station on line 12 *(typed rounds only)* |

Typed answers are matched forgivingly: accents, hyphens and apostrophes are ignored, `st` expands to `saint`, and one or two typos are tolerated depending on the length of the name. Every genuinely correct answer counts — ask where lines 8 and 9 meet and all five of their shared stations are accepted.

## How the live rooms work

There is no game server. The host's browser is the referee: it generates the questions, keeps the answers to itself, scores what comes in and broadcasts the room state a few times a second. Every other phone is a thin client that renders what it's told and sends back an answer. Nothing is stored anywhere — close the tab and the room is gone.

Messages travel over [Supabase Realtime](https://supabase.com/docs/guides/realtime) broadcast channels. `net.js` speaks the Phoenix channel protocol straight over a WebSocket in about 70 lines, so the game still has no dependencies and the single-file build works unchanged. `config.js` holds the project ref and anon key — both public values, and that project has no tables and no data behind them.

Consequences worth knowing:

- **The host holds the game.** If the host closes the tab, the room ends and everyone is told so. Players who drop can rejoin with the same code and pick up the current question.
- **Scoring trusts the client's stopwatch.** Each phone reports how long it took, clamped to the question's time limit. Fine among friends; not something to bet on.
- **A page that blocks outbound WebSockets** (a strict CSP, a captive network) falls back gracefully: the room screen explains the situation and offers the pass-the-phone game instead.

## How the crossword is built

`crossword.js` generates a fresh grid on every visit rather than shipping stored puzzles. It seeds a word across the middle, then repeatedly tries to place another station crossing an existing letter, rejecting any position that would butt two words together or create an accidental two-letter word sideways. It builds a batch of candidate grids and keeps the most compact one, because a 15-wide grid leaves unplayably small squares on a phone.

There is no dense 5×5 mini, and there cannot be: the network has three single-word stations of four letters and twelve of five. The mini is a small open grid of five short answers instead.

Answers are single-word stations only, stripped to A–Z — `Châtelet` becomes `CHATELET`. Clues are ranked: landmark, then terminus, then interchange. Stations with none of those make for guess-work clues, so they're used at most twice per grid and in practice never appear.

## The data

`data.js` holds the whole network: 16 lines with their official RATP colours, termini and station counts, 296 stations mapped to the lines that serve them, and 40 landmarks in both languages.

Network state is **mid-2024** — line 11 extended to Rosny–Bois-Perrier, line 14 to Saint-Denis–Pleyel ↔ Aéroport d'Orly, line 4 out to Bagneux–Lucie Aubrac. Grand Paris Express lines 15–18 are deliberately excluded.

The station list is curated rather than exhaustive: it covers every terminus, every interchange and the well-known stops, but not all ~308 stations. That only narrows the question pool — it never produces a wrong answer, because the per-line station *counts* are the real network figures, not counts of this file.

Adding a station is one line:

```js
"Ledru-Rollin": ["8"],
```

## Running it

Open `index.html` in a browser. That's it — the pass-the-phone game needs nothing else. Live rooms additionally need the page served over http(s) and outbound WebSockets allowed.

To serve it locally instead:

```bash
python3 -m http.server 4321
```

`dist/correspondance.html` is the same game inlined into one file you can email or open from a USB stick. Regenerate it after editing:

```bash
python3 build.py
```

## Changing things

New to GitHub? [CONTRIBUTING.md](CONTRIBUTING.md) walks through accessing, editing and committing entirely in the browser — no installs.

## Licence

MIT — see [LICENSE](LICENSE).
