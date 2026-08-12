# Daily Challenge + Achievements — Design Spec

**Date:** 2026-08-12  
**Product:** Grid Crush  
**Goal:** Retention via a simple local daily run and a small achievements list — no leaderboards/backend.

## Decisions

| Topic | Choice |
|--------|--------|
| Daily | **B** — «На сегодня»: same classic gameplay; track best score for the local calendar day |
| Seeded shared start | No (no leaderboard) |
| Achievements count | 9 |
| Daily streak achievement | **3 consecutive calendar days** with at least one daily attempt |
| UI approach | Menu CTAs + trophy overlay |
| Storage | `localStorage` only |
| Classic autosave | Unchanged; daily does not use classic autosave resume |

## Menu

- Keep hero composition (title, mini-grid, record, background).
- Primary: **Играть** → classic (existing `startMode` / autosave behavior).
- Secondary: **На сегодня** → start a daily run of classic rules.
- Under daily button: `Сегодня · N` or `Сегодня · —` if no score today.
- Trophy icon button (corner or near settings) opens achievements overlay.
- Settings gear unchanged.

## Daily challenge

### Rules
- Same board, pieces, scoring, clears, streaks as classic.
- Local calendar day key: `YYYY-MM-DD` from device local timezone.
- Persist `dailyBest` for the current day; at day change, previous day best is not shown (only current day).
- On daily game over (or when a run’s score is finalized): if score > today’s best, update today’s best.
- Playing daily counts as an “attempt” for the day for streak tracking (even if score is 0), once per day is enough to mark the day.

### Autosave
- Classic autosave / auto-resume on app open stays as today.
- Daily runs do **not** hijack classic autosave. If the player leaves a daily mid-run via «В меню», discard daily progress (no daily continue). Closing the app mid-daily may either discard or ignore daily resume — **spec: no resume for daily**; only classic resumes.

### Pause / menu
- Pause «В меню» during daily → clear any ephemeral daily state, back to menu (same as abandoning).
- Game over → show score; if new daily best, hint in UI (e.g. subtitle or small label «Рекорд дня»).

## Achievements (9)

Stored as progress + unlocked flags. Unlock when condition first met; show brief toast/badge.

| id | Title (RU) | Condition | Progress type |
|----|------------|-----------|---------------|
| `score_1k` | Первая тысяча | Score ≥ 1000 in one run | boolean / best |
| `score_5k` | Разгон | Score ≥ 5000 in one run | boolean / best |
| `streak_5` | В ударе | Combo streak ≥ 5 | boolean / best |
| `streak_10` | Не останавливайся | Combo streak ≥ 10 | boolean / best |
| `multi_3` | Тройной удар | ≥ 3 lines in one clear | boolean / best |
| `multi_4` | Четверной | ≥ 4 lines in one clear | boolean / best |
| `games_10` | Разминаемся | 10 finished games (classic + daily) | counter / 10 |
| `games_50` | Завсегдатай | 50 finished games | counter / 50 |
| `daily_streak_3` | Три дня подряд | Daily attempted on 3 consecutive calendar days | streak / 3 |

### Tracking notes
- Finished game = game over screen shown (not abandon to menu).
- Streak/line achievements update live during a run (and on game over).
- `daily_streak_3`: maintain `lastDailyDate` + `dailyStreakCount`. On first daily attempt of a day: if yesterday → increment; if today already counted → no-op; else → reset to 1.
- Achievements apply in both classic and daily unless noted (`daily_streak_3` only from daily).

## Achievements UI

- Overlay modal (like settings/pause): title «Достижения», scrollable list.
- Each row: title, short condition, progress (`3/10` or checkmark when done).
- Locked/unlocked visual difference (opacity or check).
- Close via X / backdrop tap.
- Unlock toast: small non-blocking banner ~2s («Достижение: …»).

## Data (localStorage keys — illustrative)

- `blockBlastDaily_v1`: `{ date, best }`
- `blockBlastDailyStreak_v1`: `{ lastDate, streak }`
- `blockBlastAchievements_v1`: `{ unlocked: {}, progress: {}, gamesFinished }`
- Existing classic save/best keys unchanged.

## Files

- `www/index.html` — menu buttons, achievements overlay, toast
- `www/style.css` — styles
- `www/game.js` — daily mode flag, persistence, achievement hooks
- Mirror: `android-app/app/src/main/assets/www/*`

## Out of scope

- Online leaderboards / Play Games
- Seeded shared daily boards
- Rewards/skins/currency
- Cloud sync
- Notifications reminding to play daily

## Success criteria

- Player can start classic and daily from menu
- Today’s best updates and resets next local day
- 9 achievements track correctly and persist across restarts
- Daily 3-day streak increments only on consecutive days
- Classic autosave behavior unchanged
- No network required

## Rollback

Revert menu/overlay/JS persistence for daily + achievements.
