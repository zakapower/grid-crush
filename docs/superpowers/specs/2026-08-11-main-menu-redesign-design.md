# Main Menu Redesign — Design Spec

**Date:** 2026-08-11  
**Product:** Grid Crush  
**Goal:** Make the main menu feel more game-like (premium puzzle), while keeping a simple Play / Continue flow. Easy to roll back.

## Decisions

| Topic | Choice |
|--------|--------|
| Feel | Premium puzzle — calm, confident, not neon arcade |
| Structure | Hero + CTA |
| Start | One primary **Играть** → classic mode |
| Continue | Shown only when a save exists |
| Modes UI | Remove mode card list (classic is the only path) |
| Themes | Keep existing dark/light CSS variables |
| Scope | Menu presentation only; game logic, save, settings unchanged |

## Screen layout (top → bottom)

1. Settings gear — top-right corner (unchanged behavior)
2. Brand hero — large **Grid Crush** title
3. Soft mini grid — small cluster of colored blocks with idle motion
4. Record line — `Рекорд · N` (or em dash if no best)
5. Primary CTA — **Играть** (starts classic / `startMode`)
6. Secondary CTA — **Продолжить** (visible only with save)

First viewport = one composition: brand, short supporting record line, CTA group, one visual anchor (mini grid). No mode cards, no secondary marketing blocks.

## Visual & motion

- Background: existing gradient; optional very subtle cell drift (no neon glow).
- Mini grid: 4–6 colored blocks; every ~2–3s one gently lifts / soft-pops and returns.
- Buttons: large touch targets; primary uses existing blue CTA gradient; light press-scale.
- Menu enter: short fade / slide-up (~0.4s).
- `prefers-reduced-motion: reduce` — disable or greatly simplify idle and enter animations.

## Behavior (wire to existing APIs)

- **Играть** → same as current mode button: unlock SFX, click, `startMode()` / `resetGame(null)`.
- **Продолжить** → existing `continue-btn` + `loadSave()` / `resetGame(saved)`.
- Record → existing `refreshMenuBests()` / `loadBest()`, via `[data-best]` (or equivalent single element).
- Settings overlay — unchanged.

## Files

- Primary: `www/index.html`, `www/style.css`, `www/game.js`
- Mirror if the project keeps Android WebView assets in sync: `android-app/app/src/main/assets/www/*`

## Out of scope

- New game modes
- Changes to in-game HUD, pause, game over
- New settings options
- Sound redesign
- Marketing / store screens

## Success criteria

- Menu reads as a game title screen, not a settings list
- One-tap start into classic
- Continue still works when a save exists
- Dark/light themes still look coherent
- Reduced-motion users get a calm static (or near-static) menu
- Rollback is straightforward (revert HTML/CSS/JS menu changes)

## Rollback

Revert the menu-related diffs in the files above (or revert the feature commit). No schema/migration involved.
