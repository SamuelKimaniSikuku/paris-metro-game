#!/usr/bin/env python3
"""Inline data.js + app.js into a single self-contained page.

Writes two outputs:
  dist/correspondance.html  — full standalone page (open with a double-click)
  dist/artifact.html        — same content without the html/head/body wrapper,
                              for publishing as an Artifact
"""
import pathlib
import re

root = pathlib.Path(__file__).parent
SCRIPTS = ("data.js", "config.js", "net.js", "app.js", "live.js", "crossword.js")

html = (root / "index.html").read_text(encoding="utf-8")
js = "\n".join((root / f).read_text(encoding="utf-8") for f in SCRIPTS)

pattern = r"\s*".join(r'<script src="%s"></script>' % re.escape(f) for f in SCRIPTS)
inlined, n = re.subn(
    pattern,
    lambda _: "<script>\n" + js + "\n</script>",  # lambda: js contains backslash escapes
    html,
)
if n != 1:
    raise SystemExit(f"expected to inline one script block, matched {n} — did index.html change?")

dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "correspondance.html").write_text(inlined, encoding="utf-8")

body = inlined.split("<body>", 1)[1].rsplit("</body>", 1)[0]
title = re.search(r"<title>(.*?)</title>", inlined, re.S).group(1)
style = re.search(r"<style>.*?</style>", inlined, re.S).group(0)
(dist / "artifact.html").write_text(
    f"<title>{title}</title>\n{style}\n{body.strip()}\n", encoding="utf-8"
)

print("wrote dist/correspondance.html and dist/artifact.html")
