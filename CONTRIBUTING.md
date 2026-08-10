# Making changes — a guide for people who have never used GitHub

You don't need to install anything. Everything below happens in a web browser.

The site is **https://quiz-metro.com**. The code lives at
**https://github.com/SamuelKimaniSikuku/paris-metro-game**.

---

## 1. Get a GitHub account

Go to [github.com/signup](https://github.com/signup) and make an account. It's free.
Use the email address Samuel has invited — otherwise you won't see the invitation.

## 2. Accept the invitation

Samuel invites you as a *collaborator*. You'll get an email with a green
**Accept invitation** button. Click it. That's the only step where the email matters.

If the email never turns up, open
[github.com/SamuelKimaniSikuku/paris-metro-game/invitations](https://github.com/SamuelKimaniSikuku/paris-metro-game/invitations)
while signed in.

## 3. Find the file you want to change

Open the repository. You'll see a list of files. Here's what each one does:

| File | What's in it |
|---|---|
| `data.js` | The métro itself — lines, stations, landmarks. **Most content changes are here.** |
| `index.html` | The page layout and all the styling (colours, sizes, spacing) |
| `app.js` | The quiz questions and the pass-the-phone game |
| `live.js` | The multiplayer rooms |
| `crossword.js` | The crossword |
| `net.js`, `config.js` | The plumbing that connects players. **Leave these alone** unless you know why you're changing them |

Click a file name to read it.

## 4. Edit it

With the file open, click the **pencil icon** (top right of the file). The text
becomes editable. Make your change.

> **Tip:** to try the editor safely, change something harmless first — a piece of
> text you can see on the site — so you can watch the whole process work end to end.

## 5. Commit — that means "save"

Scroll to the bottom. There's a box called **Commit changes**.

1. In the first line, write what you did: *"Add Bel-Air to line 6"*. One short line.
2. Leave **Commit directly to the main branch** selected.
3. Click the green **Commit changes** button.

That's it. "Commit" is just GitHub's word for "save, with a note about why".

## 6. Watch it go live

Every commit to `main` publishes automatically. It takes about a minute.

To watch it: click the **Actions** tab at the top of the repository. The newest
run has a spinning yellow dot while it builds, and a green tick when it's live.
Then reload https://quiz-metro.com.

If the page looks unchanged, your browser is showing you the old version — on a
phone, pull down to refresh; on a computer, hold **Shift** and click reload.

---

## Two things that will save you pain

**The `dist/` folder is generated, not written.** `dist/correspondance.html` is the
whole game squeezed into one file, for playing offline. It's built from the other
files by `build.py`. Editing it by hand does nothing to the live site, and your
change will be wiped the next time anyone rebuilds. Ignore that folder.

**If you can't see your change, check you edited the right file.** Colours and
layout are in `index.html`. Wording that players read is mostly in the `T` block
near the top of `app.js`, `live.js` or `crossword.js` — each has an `en:` section
and an `fr:` section, because the game plays in both languages. Change both.

---

## Adding a station

The most common change. In `data.js`, find the `STATIONS` list and add a line in
the same shape as its neighbours — the station name, then the lines that serve it:

```js
"Ledru-Rollin": ["8"],
"Père Lachaise": ["2", "3"],
```

Keep the accents and the punctuation exactly as the real station writes them. The
game strips them when it compares answers, so `Pere Lachaise` will still be
accepted from a player who can't type accents.

---

## If you'd rather not publish straight to the live site

Committing to `main` goes live immediately. If you want Samuel to look first:

1. On the edit screen, at step 5 choose **Create a new branch for this commit**
   instead of committing to main. Accept the name it suggests.
2. Click **Propose changes**, then **Create pull request**.

Nothing goes live. Samuel gets a page where he can read exactly what you changed,
comment on it, and click **Merge** when he's happy. This is the safer habit, and
it's how most teams work.

---

## If you break something

Nothing is ever lost — GitHub keeps every version.

Click the **Commits** link (above the file list) to see the history. Open the
commit that caused the trouble and press **Revert**. That undoes it and puts the
site back, typically within a minute.

So: don't be afraid to try things.
