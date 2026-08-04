# Correspondance

A pass-the-phone guessing game about the Paris Métro, for 3–8 players. One screen, no server, no build step, no dependencies.

**Play it:** https://samuelkimanisikuku.com/paris-metro-game/

## How it plays

Add players, pick the length and the clock, then pass the phone around. Each player gets a question, answers it, and the screen shows what was right along with the running standings. Highest score at the terminus wins.

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

## The data

`data.js` holds the whole network: 16 lines with their official RATP colours, termini and station counts, 296 stations mapped to the lines that serve them, and 40 landmarks in both languages.

Network state is **mid-2024** — line 11 extended to Rosny–Bois-Perrier, line 14 to Saint-Denis–Pleyel ↔ Aéroport d'Orly, line 4 out to Bagneux–Lucie Aubrac. Grand Paris Express lines 15–18 are deliberately excluded.

The station list is curated rather than exhaustive: it covers every terminus, every interchange and the well-known stops, but not all ~308 stations. That only narrows the question pool — it never produces a wrong answer, because the per-line station *counts* are the real network figures, not counts of this file.

Adding a station is one line:

```js
"Ledru-Rollin": ["8"],
```

## Running it

Open `index.html` in a browser. That's it.

To serve it locally instead:

```bash
python3 -m http.server 4321
```

`dist/correspondance.html` is the same game inlined into one file you can email or open from a USB stick. Regenerate it after editing:

```bash
python3 build.py
```

## Licence

MIT — see [LICENSE](LICENSE).
