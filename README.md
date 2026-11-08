# CBT Mock Test Engine (Project 4)
Offline computer-based test screen. Plain HTML/JS, no install, no internet, no login. Data stays in your browser (localStorage).

## Run
Open `index.html` in Chrome/Edge/Firefox (double-click). Click **Choose question file** and pick `questions/sample1.json`.

## Question file format
```json
{"title":"My test","durationMinutes":20,"marking":{"correct":4,"wrong":-1},
 "sections":[{"name":"Physics","questions":[{"q":"Unit of charge?","options":["Volt","Coulomb"],"answer":1}]}]}
```
`answer` is the 0-based index of the correct option. A section (or question) may override marking with `marks` / `negative`. Any file in this format runs with no code change (`sample2.json` is a second example).

## Features
Timer (absolute end time, so refresh keeps it) with auto-submit, question palette (answered / not answered / marked / not visited), mark for review, clear answer, sections, +/- marking, result page (score, accuracy, per-section table, time per question). Every click is saved, so a refresh resumes the test.

## Test
`node test.js` checks scoring against a hand calculation (15 questions) and the second file's section overrides.

## Manual checks (do these in your browser)
1. Start sample1, answer a few, refresh: answers, marks and timer remain.
2. Turn Wi-Fi off, reload: still works.
3. Submit; compare score with your hand calculation.
4. Load `sample2.json` via "Load another test".
5. For a quick auto-submit test, set `durationMinutes` to 0.2 in a copy of a file.

## Browser test (optional)
`pip install playwright && playwright install chromium && python e2e_browser_test.py` runs 14 end-to-end checks (offline, refresh-resume, scoring, auto-submit, second file, mobile width).
