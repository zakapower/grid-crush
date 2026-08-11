# Main Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Grid Crush main menu into a premium-puzzle title screen with hero brand, idle mini-grid, one **Играть** CTA, and conditional **Продолжить**.

**Architecture:** Keep all game/save/settings APIs. Restructure `#menu` markup in `www/index.html`, restyle in `www/style.css` (CSS-driven idle motion + enter animation + `prefers-reduced-motion`), wire **Играть** through the existing mode-button click path (or a dedicated `#play-btn` with the same handlers). Mirror the three files into `android-app/app/src/main/assets/www/`.

**Tech Stack:** Vanilla HTML/CSS/JS (no build step), existing CSS variables for dark/light themes, Android WebView asset mirror.

## Global Constraints

- Feel: premium puzzle — calm, not neon arcade.
- Structure: Hero + CTA; first viewport = brand, mini-grid, record line, CTA group.
- **Играть** starts classic via `startMode()` / `resetGame(null)`.
- **Продолжить** only when `loadSave()` returns a save.
- Keep existing dark/light theme variables; no new palette.
- Menu presentation only — do not change HUD, pause, game over, or save format.
- Rollback = revert menu diffs in the six files listed below.
- Cache-bust query on `style.css` / `game.js` in both HTML files (bump past `?v=1.0.0`).

## File map

| File | Responsibility |
|------|----------------|
| `www/index.html` | Menu markup: hero, mini-grid, record, play/continue |
| `www/style.css` | Menu layout, CTA styles, idle/enter motion, reduced-motion |
| `www/game.js` | Wire play button; keep `refreshMenuBests` / `refreshContinueBtn` |
| `android-app/app/src/main/assets/www/index.html` | Mirror of www HTML |
| `android-app/app/src/main/assets/www/style.css` | Mirror of www CSS |
| `android-app/app/src/main/assets/www/game.js` | Mirror of www JS |

---

### Task 1: Restructure menu markup

**Files:**
- Modify: `www/index.html` (menu block ~lines 11–36)
- Test: open `www/index.html` in browser (manual)

**Interfaces:**
- Consumes: existing `#settings-btn`, `#continue-btn`, `showMenu` / settings overlays (unchanged IDs)
- Produces: `#play-btn` (primary CTA), `.menu-record [data-best="classic"]`, `.menu-mini-grid` with `.menu-block` children, classes `menu-hero`, `menu-title`, `menu-actions`

- [ ] **Step 1: Replace the `#menu` inner structure**

Replace the contents of `#menu` so it matches this structure (keep `settings-btn` SVG as in the file today):

```html
  <div id="menu" class="menu">
    <button type="button" id="settings-btn" class="icon-btn icon-btn--corner" aria-label="Настройки" title="Настройки">
      <!-- existing settings SVG unchanged -->
    </button>

    <div class="menu-inner">
      <header class="menu-hero">
        <h1 class="menu-title">Grid Crush</h1>
        <div class="menu-mini-grid" aria-hidden="true">
          <span class="menu-block" style="--c:#4aa3ff"></span>
          <span class="menu-block" style="--c:#57d38c"></span>
          <span class="menu-block" style="--c:#ffb454"></span>
          <span class="menu-block" style="--c:#ff6b8a"></span>
          <span class="menu-block" style="--c:#b388ff"></span>
          <span class="menu-block" style="--c:#ff8f5a"></span>
        </div>
        <p class="menu-record">Рекорд · <span data-best="classic">—</span></p>
      </header>

      <div class="menu-actions">
        <button type="button" id="play-btn" class="play-btn">Играть</button>
        <button type="button" id="continue-btn" class="continue-btn hidden">Продолжить</button>
      </div>
    </div>
  </div>
```

Remove: `menu-sub` («Режимы игры:»), `.mode-list`, `.mode-btn`.

Bump asset versions in the same file:

```html
  <link rel="stylesheet" href="style.css?v=1.1.0" />
  ...
  <script src="game.js?v=1.1.0"></script>
```

- [ ] **Step 2: Manual smoke — markup loads**

Open `www/index.html` in a browser.  
Expected: page shows title Grid Crush, six colored squares (unstyled/ugly OK), «Играть», settings gear; no «Классика» card; console has no HTML parse errors.

- [ ] **Step 3: Commit**

```bash
git add www/index.html
git commit -m "Restructure main menu markup for hero CTA layout."
```

---

### Task 2: Style premium menu + motion

**Files:**
- Modify: `www/style.css` (menu section ~lines 111–365; add new rules; keep game HUD styles intact)
- Test: open `www/index.html` (manual), toggle theme via settings

**Interfaces:**
- Consumes: markup/classes from Task 1 (`menu-mini-grid`, `menu-block`, `play-btn`, `menu-record`)
- Produces: visual system for menu enter, idle pulse, play CTA, reduced-motion

- [ ] **Step 1: Replace old mode-list styles with hero CTA styles**

Remove or stop using: `.mode-list`, `.mode-btn`, `.mode-top`, `.mode-name`, `.mode-best`, `.mode-desc`, `.menu-sub` (delete those rule blocks if present).

Add/update rules (place after `.menu` / `.menu-inner` block). Keep existing `:root` theme variables. Reuse the blue CTA look from `.continue-btn` / `#restart` for `.play-btn`:

```css
.menu-inner {
  width: min(380px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  text-align: center;
  animation: menu-enter 0.42s cubic-bezier(0.2, 0.9, 0.3, 1.05) both;
}

.menu-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.menu-title {
  margin: 0;
  font-size: clamp(42px, 12vw, 52px);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 800;
}

.menu-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 28px);
  grid-template-rows: repeat(2, 28px);
  gap: 8px;
  justify-content: center;
}

.menu-block {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: linear-gradient(160deg, color-mix(in srgb, var(--c) 92%, #fff), var(--c));
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.22);
  animation: menu-block-idle 2.8s ease-in-out infinite;
}

.menu-block:nth-child(1) { animation-delay: 0s; }
.menu-block:nth-child(2) { animation-delay: 0.45s; }
.menu-block:nth-child(3) { animation-delay: 0.9s; }
.menu-block:nth-child(4) { animation-delay: 1.35s; }
.menu-block:nth-child(5) { animation-delay: 1.8s; }
.menu-block:nth-child(6) { animation-delay: 2.25s; }

.menu-record {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.menu-record [data-best] {
  color: var(--accent-soft);
  font-weight: 800;
}

.menu-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.play-btn,
.continue-btn {
  appearance: none;
  border: 0;
  border-radius: 16px;
  padding: 16px 18px;
  width: 100%;
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(180deg, #4aa3ff, #2d7fe0);
  box-shadow: 0 8px 20px rgba(45, 127, 224, 0.35);
}

.continue-btn {
  background: var(--btn-secondary-bg);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: 0 8px 20px var(--shadow);
  font-weight: 700;
  font-size: 15px;
}

.continue-btn.hidden {
  display: none !important;
}

.play-btn:active,
.continue-btn:active {
  transform: scale(0.97);
}

@keyframes menu-enter {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes menu-block-idle {
  0%, 70%, 100% { transform: translateY(0) scale(1); }
  80% { transform: translateY(-4px) scale(1.06); }
}

@media (prefers-reduced-motion: reduce) {
  .menu-inner,
  .menu-block {
    animation: none !important;
  }
}
```

Also update the shared transition selector list: replace `.mode-btn` with `.play-btn` wherever `.mode-btn` appears in transition/` :active` groups (around lines 191–217).

If `color-mix` is a concern for older WebViews, fall back to:

```css
.menu-block {
  background: var(--c);
}
```

- [ ] **Step 2: Manual visual check**

Open `www/index.html`.  
Expected:
- Centered hero composition; large title; 3×2 soft blocks gently pulsing in turn
- «Играть» is the dominant blue button
- Settings still top-right
- Open settings → toggle theme → menu still readable in light and dark
- In DevTools, enable `prefers-reduced-motion: reduce` → idle and enter animations stop

- [ ] **Step 3: Commit**

```bash
git add www/style.css
git commit -m "Style premium main menu with calm idle motion."
```

---

### Task 3: Wire Play button in game.js

**Files:**
- Modify: `www/game.js` (mode-btn listeners ~1717–1723; optionally keep `refreshMenuBests` as-is)
- Test: manual play / continue / record

**Interfaces:**
- Consumes: `#play-btn` from Task 1; `startMode()`, `sfx`, `continueBtn`, `refreshMenuBests()`, `refreshContinueBtn()`
- Produces: click on `#play-btn` calls `sfx.unlock()`, `sfx.click()`, `startMode()`

- [ ] **Step 1: Point start handler at `#play-btn`**

Replace the `.mode-btn` listener block with:

```javascript
  const playBtn = document.getElementById("play-btn");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      sfx.unlock();
      sfx.click();
      startMode();
    });
  }
```

Leave `continueBtn` listener unchanged. Leave `refreshMenuBests()` unchanged — it still finds `[data-best]`. Leave `showMenu()` unchanged.

Optional cleanup: remove any dead references to `.mode-btn` if present elsewhere (there should be none after this change).

- [ ] **Step 2: Manual behavior check**

1. Open menu → «Играть» starts a new classic game (board + tray appear).  
2. Play a move, leave via pause → «В меню» → if save exists, «Продолжить» visible and restores.  
3. With a prior best score in `localStorage`, record line shows `Рекорд · <number>` (not always `—`).  
4. Settings gear still opens/closes.

- [ ] **Step 3: Commit**

```bash
git add www/game.js
git commit -m "Wire Play button to classic startMode."
```

---

### Task 4: Mirror assets into Android WebView

**Files:**
- Modify (overwrite to match www):  
  - `android-app/app/src/main/assets/www/index.html`  
  - `android-app/app/src/main/assets/www/style.css`  
  - `android-app/app/src/main/assets/www/game.js`

**Interfaces:**
- Consumes: final `www/*` from Tasks 1–3  
- Produces: identical menu behavior inside the Android asset pack

- [ ] **Step 1: Copy www trio into Android assets**

PowerShell from repo root:

```powershell
Copy-Item -Force www/index.html android-app/app/src/main/assets/www/index.html
Copy-Item -Force www/style.css android-app/app/src/main/assets/www/style.css
Copy-Item -Force www/game.js android-app/app/src/main/assets/www/game.js
```

- [ ] **Step 2: Verify copies match**

```powershell
(Get-FileHash www/index.html).Hash -eq (Get-FileHash android-app/app/src/main/assets/www/index.html).Hash
(Get-FileHash www/style.css).Hash -eq (Get-FileHash android-app/app/src/main/assets/www/style.css).Hash
(Get-FileHash www/game.js).Hash -eq (Get-FileHash android-app/app/src/main/assets/www/game.js).Hash
```

Expected: `True` three times.

- [ ] **Step 3: Commit**

```bash
git add android-app/app/src/main/assets/www/index.html android-app/app/src/main/assets/www/style.css android-app/app/src/main/assets/www/game.js
git commit -m "Mirror redesigned main menu into Android assets."
```

---

### Task 5: End-to-end acceptance

**Files:** none (verification only)

- [ ] **Step 1: Run acceptance against the spec**

Checklist (all must pass):

- [ ] Menu reads as a title screen (brand hero + mini-grid + CTAs), not a mode list  
- [ ] One tap **Играть** → classic game  
- [ ] **Продолжить** only with save; restores correctly  
- [ ] Record line updates via existing best storage  
- [ ] Dark and light themes look coherent  
- [ ] `prefers-reduced-motion: reduce` calms animations  
- [ ] Settings / pause / game over unchanged  
- [ ] Android asset hashes match `www/`

- [ ] **Step 2: No further commit unless fixes were needed**

If a checklist item fails, fix in the owning task’s files, then commit a focused fix (e.g. `Fix menu continue button contrast in light theme.`).

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Hero + CTA layout | 1, 2 |
| Mini-grid idle | 1, 2 |
| Record line | 1, 2, 3 |
| Играть → classic | 1, 3 |
| Продолжить if save | 1, 3 (existing API) |
| Themes preserved | 2 |
| prefers-reduced-motion | 2 |
| Android mirror | 4 |
| Settings unchanged | 1–3 (IDs preserved) |
| Rollback via revert | commits are menu-scoped |

No placeholders left in steps. Selector/ID names consistent: `#play-btn`, `[data-best]`, `#continue-btn`.
