(() => {
  const SIZE = 8;
  const COLORS = [
    "#4aa3ff",
    "#57d38c",
    "#ffb454",
    "#ff6b8a",
    "#b388ff",
    "#35d0d6",
    "#ff8f5a",
  ];

  // Набор как в Block Blast: линии, квадраты, прямоугольники, L/T/S (все ориентации отдельно).
  const SHAPES = [
    { w: 10, shape: [[1]] },
    { w: 8, shape: [[1, 1]] },
    { w: 8, shape: [[1], [1]] },
    { w: 7, shape: [[1, 1, 1]] },
    { w: 7, shape: [[1], [1], [1]] },
    { w: 5, shape: [[1, 1, 1, 1]] },
    { w: 5, shape: [[1], [1], [1], [1]] },
    { w: 4, shape: [[1, 1, 1, 1, 1]] },
    { w: 4, shape: [[1], [1], [1], [1], [1]] },
    { w: 6, shape: [[1, 1], [1, 1]] },
    { w: 2, shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
    { w: 4, shape: [[1, 1, 1], [1, 1, 1]] },
    { w: 4, shape: [[1, 1], [1, 1], [1, 1]] },
    { w: 5, shape: [[1, 0], [1, 1]] },
    { w: 5, shape: [[0, 1], [1, 1]] },
    { w: 5, shape: [[1, 1], [1, 0]] },
    { w: 5, shape: [[1, 1], [0, 1]] },
    { w: 4, shape: [[1, 0, 0], [1, 1, 1]] },
    { w: 4, shape: [[0, 0, 1], [1, 1, 1]] },
    { w: 4, shape: [[1, 1, 1], [1, 0, 0]] },
    { w: 4, shape: [[1, 1, 1], [0, 0, 1]] },
    { w: 4, shape: [[1, 0], [1, 0], [1, 1]] },
    { w: 4, shape: [[0, 1], [0, 1], [1, 1]] },
    { w: 4, shape: [[1, 1], [1, 0], [1, 0]] },
    { w: 4, shape: [[1, 1], [0, 1], [0, 1]] },
    { w: 3, shape: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
    { w: 3, shape: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
    { w: 3, shape: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
    { w: 3, shape: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
    { w: 4, shape: [[1, 1, 1], [0, 1, 0]] },
    { w: 4, shape: [[0, 1, 0], [1, 1, 1]] },
    { w: 4, shape: [[1, 0], [1, 1], [1, 0]] },
    { w: 4, shape: [[0, 1], [1, 1], [0, 1]] },
    { w: 3, shape: [[1, 1, 0], [0, 1, 1]] },
    { w: 3, shape: [[0, 1, 1], [1, 1, 0]] },
    { w: 3, shape: [[0, 1], [1, 1], [1, 0]] },
    { w: 3, shape: [[1, 0], [1, 1], [0, 1]] },
  ];

  const SHAPE_WEIGHT_TOTAL = SHAPES.reduce((s, p) => s + p.w, 0);

  const boardCanvas = document.getElementById("board");
  const ctx = boardCanvas.getContext("2d");
  const trayEl = document.getElementById("tray");
  const scoreEl = document.getElementById("score");
  const sideLabel = document.getElementById("side-label");
  const sideValue = document.getElementById("side-value");
  const boardWrap = document.getElementById("board-wrap");
  const floatLayer = document.getElementById("float-layer");
  const overlay = document.getElementById("overlay");
  const finalScoreEl = document.getElementById("final-score");
  const finalBestEl = document.getElementById("final-best");
  const finalSideLabel = document.getElementById("final-side-label");
  const finalStreakEl = document.getElementById("final-streak");
  const finalStreakWrap = document.getElementById("final-streak-wrap");
  const newRecordBadge = document.getElementById("new-record-badge");
  const gameoverTitle = document.getElementById("gameover-title");
  const comboLabel = document.getElementById("combo-label");
  const restartBtn = document.getElementById("restart");
  const toMenuBtn = document.getElementById("to-menu");
  const pauseBtn = document.getElementById("pause-btn");
  const pauseOverlay = document.getElementById("pause-overlay");
  const resumeBtn = document.getElementById("resume-btn");
  const pauseRestartBtn = document.getElementById("pause-restart-btn");
  const pauseMenuBtn = document.getElementById("pause-menu-btn");
  const menuEl = document.getElementById("menu");
  const appEl = document.getElementById("app");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsOverlay = document.getElementById("settings-overlay");
  const settingsSoundBtn = document.getElementById("settings-sound-btn");
  const settingsVibroBtn = document.getElementById("settings-vibro-btn");
  const settingsThemeBtn = document.getElementById("settings-theme-btn");
  const settingsCloseBtn = document.getElementById("settings-close-btn");

  const SAVE_KEY = "blockBlastSave_v2";
  const BEST_KEY = "blockBlastBest_classic";
  const MUTE_KEY = "blockBlastMuted";
  const VIBRO_KEY = "blockBlastVibro";
  const THEME_KEY = "blockBlastTheme";
  const STREAK_BONUS = 40;
  const PLACE_POINTS = 2;
  const MASTER_VOLUME = 2.6;

  const theme = (() => {
    let current = "dark";
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") current = saved;
    } catch (_) {
      current = "dark";
    }

    function apply() {
      document.documentElement.setAttribute("data-theme", current);
    }

    apply();

    return {
      get() {
        return current;
      },
      isLight() {
        return current === "light";
      },
      set(value) {
        current = value === "light" ? "light" : "dark";
        try {
          localStorage.setItem(THEME_KEY, current);
        } catch (_) {
          /* ignore */
        }
        apply();
      },
      toggle() {
        this.set(current === "light" ? "dark" : "light");
        return current;
      },
      boardColors() {
        if (current === "light") {
          return {
            board: "#c5d0e0",
            cellA: "#e8eef6",
            cellB: "#dce5f0",
            stroke: null,
          };
        }
        return {
          board: "#121f35",
          cellA: "#1b2f4c",
          cellB: "#162843",
          stroke: null,
        };
      },
    };
  })();

  const haptics = (() => {
    let enabled = true;
    try {
      enabled = localStorage.getItem(VIBRO_KEY) !== "0";
    } catch (_) {
      enabled = true;
    }

    function vibrate(pattern) {
      if (!enabled) return;
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(pattern);
        }
      } catch (_) {
        /* ignore */
      }
    }

    function cancel() {
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(0);
        }
      } catch (_) {
        /* ignore */
      }
    }

    return {
      isEnabled() {
        return enabled;
      },
      setEnabled(value) {
        enabled = !!value;
        if (!enabled) cancel();
        try {
          localStorage.setItem(VIBRO_KEY, enabled ? "1" : "0");
        } catch (_) {
          /* ignore */
        }
      },
      toggle() {
        this.setEnabled(!enabled);
        return enabled;
      },
      tap() {
        vibrate(10);
      },
      place() {
        vibrate(14);
      },
      clear(lines) {
        const n = Math.max(1, Math.min(4, lines | 0));
        if (n === 1) vibrate(28);
        else if (n === 2) vibrate([22, 28, 36]);
        else if (n === 3) vibrate([24, 24, 40, 24, 48]);
        else vibrate([30, 20, 45, 20, 55, 20, 70]);
      },
      reject() {
        vibrate(40);
      },
      gameOver() {
        vibrate([50, 40, 80]);
      },
    };
  })();

  const sfx = (() => {
    let ctxAudio = null;
    let master = null;
    let muted = false;

    try {
      muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch (_) {
      muted = false;
    }

    function ac() {
      if (!ctxAudio) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        ctxAudio = new Ctx();
        master = ctxAudio.createGain();
        master.gain.value = muted ? 0 : MASTER_VOLUME;
        master.connect(ctxAudio.destination);
      }
      if (ctxAudio.state === "suspended") ctxAudio.resume();
      return ctxAudio;
    }

    function applyMute() {
      if (master) master.gain.value = muted ? 0 : MASTER_VOLUME;
    }

    function out() {
      const audio = ac();
      return audio ? master : null;
    }

    function tone({
      freq = 440,
      freqEnd = null,
      type = "sine",
      dur = 0.12,
      gain = 0.08,
      delay = 0,
      attack = 0.008,
      release = null,
      curve = "exp",
    }) {
      const audio = ac();
      const dest = out();
      if (!audio || !dest) return;
      const t0 = audio.currentTime + delay;
      const rel = release == null ? dur * 0.55 : release;
      const osc = audio.createOscillator();
      const g = audio.createGain();
      const filter = audio.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.max(freq * 2.2, 900), t0);
      filter.frequency.exponentialRampToValueAtTime(600, t0 + dur);
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(40, freq), t0);
      if (freqEnd != null) {
        if (curve === "linear") {
          osc.frequency.linearRampToValueAtTime(Math.max(40, freqEnd), t0 + dur);
        } else {
          osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t0 + dur);
        }
      }
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + 0.02, dur));
      osc.connect(filter);
      filter.connect(g);
      g.connect(dest);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
      void rel;
    }

    function thud({ freq = 110, dur = 0.12, gain = 0.09, delay = 0 }) {
      const audio = ac();
      const dest = out();
      if (!audio || !dest) return;
      const t0 = audio.currentTime + delay;
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(45, t0 + dur);
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(dest);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }

    function noise({
      dur = 0.1,
      gain = 0.045,
      delay = 0,
      freq = 1400,
      type = "bandpass",
      q = 0.9,
    }) {
      const audio = ac();
      const dest = out();
      if (!audio || !dest) return;
      const frames = Math.max(1, Math.floor(audio.sampleRate * dur));
      const buffer = audio.createBuffer(1, frames, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) {
        const env = Math.pow(1 - i / frames, 1.4);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const src = audio.createBufferSource();
      const g = audio.createGain();
      const filter = audio.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = q;
      src.buffer = buffer;
      const t0 = audio.currentTime + delay;
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(dest);
      src.start(t0);
    }

    return {
      unlock() {
        ac();
        applyMute();
      },
      isMuted() {
        return muted;
      },
      setMuted(value) {
        muted = !!value;
        try {
          localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
        } catch (_) {
          /* ignore */
        }
        ac();
        applyMute();
      },
      toggleMute() {
        this.setMuted(!muted);
        return muted;
      },
      place() {
        // Один короткий тап — без стопки осцилляторов
        noise({ dur: 0.02, gain: 0.04, freq: 2200, type: "bandpass", q: 2.2 });
        tone({
          freq: 620,
          freqEnd: 280,
          type: "triangle",
          dur: 0.05,
          gain: 0.07,
          attack: 0.002,
        });
      },
      clear(lines = 1, streak = 1) {
        const n = Math.max(1, Math.min(5, lines | 0));
        const s = Math.max(1, Math.min(8, streak | 0));
        // Клир по числу линий — стабильная громкость; серия = отдельная мелодия сверху
        thud({
          freq: 95 + n * 14,
          dur: 0.07 + n * 0.018,
          gain: 0.08 + n * 0.01,
        });
        noise({
          dur: 0.05 + n * 0.016,
          gain: 0.04 + n * 0.007,
          freq: 1000 + n * 180,
          type: "bandpass",
          q: 0.8,
        });
        tone({
          freq: 340 + n * 55,
          freqEnd: 780 + n * 160,
          type: "sine",
          dur: 0.1 + n * 0.025,
          gain: 0.055 + n * 0.007,
          delay: 0.012,
          attack: 0.003,
        });

        if (n >= 2) {
          thud({ freq: 140 + n * 10, dur: 0.07, gain: 0.05, delay: 0.045 });
          tone({
            freq: 520 + n * 40,
            freqEnd: 1040 + n * 80,
            type: "triangle",
            dur: 0.11 + n * 0.02,
            gain: 0.038 + n * 0.005,
            delay: 0.05,
            attack: 0.003,
          });
        }

        if (n >= 3) {
          tone({
            freq: 660,
            freqEnd: 1320,
            type: "sine",
            dur: 0.14,
            gain: 0.038,
            delay: 0.09,
            attack: 0.004,
          });
          noise({
            dur: 0.08,
            gain: 0.028,
            delay: 0.07,
            freq: 1800,
            type: "highpass",
            q: 0.6,
          });
        }

        if (n >= 4) {
          thud({ freq: 70, dur: 0.14, gain: 0.09, delay: 0.02 });
          tone({
            freq: 880,
            freqEnd: 1760,
            type: "triangle",
            dur: 0.18,
            gain: 0.04,
            delay: 0.12,
            attack: 0.004,
          });
        }

        // Серия: один свист-взлёт (выше с каждой ×), не лесенка монеток
        if (s >= 2) {
          const step = s - 2;
          const root = 480 + step * 70;
          const delay = 0.075 + n * 0.01;
          tone({
            freq: root,
            freqEnd: root * (1.75 + step * 0.06),
            type: "sine",
            dur: 0.11 + step * 0.014,
            gain: 0.04,
            delay,
            attack: 0.002,
            curve: "linear",
          });
          tone({
            freq: root * 1.5,
            freqEnd: root * 1.72,
            type: "triangle",
            dur: 0.09 + step * 0.01,
            gain: 0.026,
            delay: delay + 0.028,
            attack: 0.003,
            curve: "linear",
          });
          if (s >= 4) {
            tone({
              freq: root * 2.05,
              freqEnd: root * 2.2,
              type: "sine",
              dur: 0.07,
              gain: 0.028,
              delay: delay + 0.055,
              attack: 0.001,
            });
          }
          if (s >= 6) {
            noise({
              dur: 0.06,
              gain: 0.022,
              delay: delay + 0.04,
              freq: 2400 + step * 100,
              type: "bandpass",
              q: 1.4,
            });
          }
        }
      },
      reject() {
        tone({ freq: 210, freqEnd: 120, type: "triangle", dur: 0.09, gain: 0.045 });
      },
      gameOver() {
        tone({ freq: 330, freqEnd: 165, type: "triangle", dur: 0.28, gain: 0.055 });
        tone({ freq: 247, freqEnd: 110, type: "sine", dur: 0.36, gain: 0.045, delay: 0.14 });
      },
      click() {
        tone({ freq: 820, type: "sine", dur: 0.035, gain: 0.04, attack: 0.002 });
      },
      refill() {
        tone({ freq: 640, type: "sine", dur: 0.06, gain: 0.035, attack: 0.004 });
        tone({
          freq: 820,
          type: "sine",
          dur: 0.07,
          gain: 0.028,
          delay: 0.06,
          attack: 0.004,
        });
      },
    };
  })();

  function loadBest() {
    try {
      const legacy = localStorage.getItem("blockBlastBest");
      if (legacy && !localStorage.getItem(BEST_KEY)) {
        localStorage.setItem(BEST_KEY, legacy);
      }
      return Number(localStorage.getItem(BEST_KEY) || 0) || 0;
    } catch (_) {
      return 0;
    }
  }

  function saveBest(value) {
    try {
      localStorage.setItem(BEST_KEY, String(value));
    } catch (_) {
      /* ignore */
    }
  }

  function clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (_) {
      /* ignore */
    }
  }

  function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function isValidGrid(grid) {
    if (!Array.isArray(grid) || grid.length !== SIZE) return false;
    for (const row of grid) {
      if (!Array.isArray(row) || row.length !== SIZE) return false;
      for (const cell of row) {
        if (cell !== 0 && !isHexColor(cell)) return false;
      }
    }
    return true;
  }

  function isValidShape(shape) {
    if (!Array.isArray(shape) || !shape.length || shape.length > SIZE) return false;
    let width = 0;
    let hasBlock = false;
    for (const row of shape) {
      if (!Array.isArray(row) || !row.length || row.length > SIZE) return false;
      if (!width) width = row.length;
      if (row.length !== width) return false;
      for (const cell of row) {
        if (cell !== 0 && cell !== 1) return false;
        if (cell === 1) hasBlock = true;
      }
    }
    return hasBlock;
  }

  function isValidPiece(piece) {
    if (piece == null) return true;
    if (!piece || typeof piece !== "object") return false;
    if (!isValidShape(piece.shape) || !isHexColor(piece.color)) return false;
    return true;
  }

  function saveGame() {
    if (state.screen !== "game" || state.gameOver || state.drag) return;
    try {
      const payload = {
        mode: "classic",
        grid: state.grid,
        pieces: state.pieces,
        score: state.score,
        streak: state.streak,
        runBestStreak: state.runBestStreak,
        beatRecordThisRun: state.beatRecordThisRun,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (_) {
      /* ignore */
    }
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.mode !== "classic") {
        clearSave();
        return null;
      }
      if (!isValidGrid(data.grid)) {
        clearSave();
        return null;
      }
      if (!Array.isArray(data.pieces) || data.pieces.length !== 3 || !data.pieces.every(isValidPiece)) {
        clearSave();
        return null;
      }
      data.score = Math.max(0, Number(data.score) || 0);
      data.streak = Math.max(0, Number(data.streak) || 0);
      data.runBestStreak = Math.max(data.streak, Number(data.runBestStreak) || 0);
      data.beatRecordThisRun = !!data.beatRecordThisRun;
      return data;
    } catch (_) {
      clearSave();
      return null;
    }
  }

  const state = {
    screen: "menu",
    grid: null,
    pieces: [null, null, null],
    score: 0,
    best: 0,
    streak: 0,
    runBestStreak: 0,
    beatRecordThisRun: false,
    gameOver: false,
    paused: false,
    drag: null,
    particles: [],
    placePulses: [],
    clearBursts: [],
    now: performance.now(),
  };

  state.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

  function updateComboUI() {
    if (state.streak >= 2) {
      comboLabel.textContent = `Серия ×${state.streak}`;
      comboLabel.classList.remove("is-off");
    } else {
      comboLabel.classList.add("is-off");
    }
  }

  function updateSideUI() {
    sideLabel.textContent = "Рекорд";
    sideValue.textContent = String(state.best);
    sideValue.style.color = "";
  }

  function refreshMenuBests() {
    document.querySelectorAll("[data-best]").forEach((el) => {
      const best = loadBest();
      el.textContent = best > 0 ? String(best) : "—";
    });
  }

  function updateSoundUI() {
    if (!settingsSoundBtn) return;
    const muted = sfx.isMuted();
    settingsSoundBtn.classList.toggle("is-off", muted);
    const label = muted ? "Звук выключен" : "Звук включён";
    settingsSoundBtn.setAttribute("aria-label", label);
    settingsSoundBtn.title = label;
  }

  function updateVibroUI() {
    if (!settingsVibroBtn) return;
    const on = haptics.isEnabled();
    settingsVibroBtn.classList.toggle("is-off", !on);
    const label = on ? "Вибрация включена" : "Вибрация выключена";
    settingsVibroBtn.setAttribute("aria-label", label);
    settingsVibroBtn.title = label;
  }

  function updateThemeUI() {
    if (!settingsThemeBtn) return;
    const light = theme.isLight();
    settingsThemeBtn.classList.toggle("is-light", light);
    const label = light ? "Тема: светлая" : "Тема: тёмная";
    settingsThemeBtn.setAttribute("aria-label", label);
    settingsThemeBtn.title = label;
  }

  function updateSettingsUI() {
    updateSoundUI();
    updateVibroUI();
    updateThemeUI();
  }

  function refreshThemeVisuals() {
    if (state.screen === "game") {
      paintTrayCanvases();
      const preview = state.drag?.preview || null;
      drawBoard(preview && preview.valid !== undefined ? preview : null);
    }
  }

  function openSettings() {
    updateSettingsUI();
    settingsOverlay.classList.remove("hidden");
  }

  function closeSettings() {
    settingsOverlay.classList.add("hidden");
  }

  function pauseMetaText() {
    const best = state.best > 0 ? state.best : loadBest();
    const bestPart = best > 0 ? ` · рекорд ${best}` : "";
    return `Счёт ${state.score}${bestPart}`;
  }

  function showMenu() {
    clearDragGhost();
    state.drag = null;
    state.screen = "menu";
    state.gameOver = false;
    state.paused = false;
    overlay.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    closeSettings();
    appEl.classList.add("hidden");
    appEl.classList.remove("ending");
    menuEl.classList.remove("hidden");
    updateSettingsUI();
    refreshMenuBests();
  }

  function showGame() {
    state.screen = "game";
    state.paused = false;
    closeSettings();
    menuEl.classList.add("hidden");
    pauseOverlay.classList.add("hidden");
    appEl.classList.remove("hidden");
  }

  function pauseGame() {
    if (state.screen !== "game" || state.gameOver || state.paused) return;
    if (state.drag) {
      clearDragGhost();
      state.drag = null;
      renderTray(false);
      drawBoard(null);
    }
    state.paused = true;
    const meta = document.getElementById("pause-meta");
    if (meta) meta.textContent = pauseMetaText();
    pauseOverlay.classList.remove("hidden");
    saveGame();
  }

  function resumeGame() {
    if (!state.paused) return;
    state.paused = false;
    pauseOverlay.classList.add("hidden");
  }

  function createEmptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneShape(shape) {
    return shape.map((row) => row.slice());
  }

  function pieceFromShape(shape) {
    return {
      shape: cloneShape(shape),
      color: COLORS[(Math.random() * COLORS.length) | 0],
      id: Math.random().toString(36).slice(2),
    };
  }

  function boardFillRatio() {
    let filled = 0;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (state.grid[r][c]) filled += 1;
      }
    }
    return filled / (SIZE * SIZE);
  }

  function isStraightLine(shape) {
    const cells = shapeCells(shape);
    if (cells.length <= 1) return true;
    let sameRow = true;
    let sameCol = true;
    const r0 = cells[0][0];
    const c0 = cells[0][1];
    for (const [r, c] of cells) {
      if (r !== r0) sameRow = false;
      if (c !== c0) sameCol = false;
    }
    return sameRow || sameCol;
  }

  function clearScoreAt(shape, row, col) {
    if (!canPlace(shape, row, col)) return 0;
    const preview = previewClears(shape, row, col);
    return preview.rows.length + preview.cols.length;
  }

  function bestClearScore(shape) {
    let best = 0;
    const h = shape.length;
    const w = shape[0].length;
    for (let r = 0; r <= SIZE - h; r++) {
      for (let c = 0; c <= SIZE - w; c++) {
        const score = clearScoreAt(shape, r, c);
        if (score > best) best = score;
      }
    }
    return best;
  }

  /** Помощь: сильнее тянем к почти готовым линиям. */
  function bestAssistScore(shape) {
    let best = 0;
    const h = shape.length;
    const w = shape[0].length;
    for (let r = 0; r <= SIZE - h; r++) {
      for (let c = 0; c <= SIZE - w; c++) {
        if (!canPlace(shape, r, c)) continue;
        const fill = new Set();
        for (const [sr, sc] of shapeCells(shape)) fill.add(`${r + sr},${c + sc}`);

        const scoreLine = (pre, count, touched) => {
          if (!touched || count >= SIZE || pre < 1) return;
          let score = count * count;
          if (pre >= 5) score += 50;
          else if (pre >= 4) score += 28;
          else if (pre >= 3) score += 12;
          if (score > best) best = score;
        };

        for (let row = 0; row < SIZE; row++) {
          let pre = 0;
          let count = 0;
          let touched = false;
          for (let col = 0; col < SIZE; col++) {
            if (state.grid[row][col]) pre += 1;
            if (state.grid[row][col] || fill.has(`${row},${col}`)) count += 1;
            if (fill.has(`${row},${col}`)) touched = true;
          }
          scoreLine(pre, count, touched);
        }
        for (let col = 0; col < SIZE; col++) {
          let pre = 0;
          let count = 0;
          let touched = false;
          for (let row = 0; row < SIZE; row++) {
            if (state.grid[row][col]) pre += 1;
            if (state.grid[row][col] || fill.has(`${row},${col}`)) count += 1;
            if (fill.has(`${row},${col}`)) touched = true;
          }
          scoreLine(pre, count, touched);
        }
      }
    }
    return best;
  }

  function pickWeightedShape(entries) {
    const total = entries.reduce((s, e) => s + e.w, 0);
    if (total <= 0) return SHAPES[0].shape;
    let roll = Math.random() * total;
    for (const entry of entries) {
      roll -= entry.w;
      if (roll <= 0) return entry.shape;
    }
    return entries[entries.length - 1].shape;
  }

  function clearingPool() {
    const pool = [];
    for (const entry of SHAPES) {
      const score = bestClearScore(entry.shape);
      if (score <= 0) continue;
      const cells = shapeCells(entry.shape).length;
      // Чуть чаще маленькие фигуры под клир — проще заметить
      const sizeBonus = cells <= 3 ? 1.4 : cells <= 5 ? 1.1 : 0.9;
      pool.push({ shape: entry.shape, w: entry.w * score * score * score * sizeBonus });
    }
    return pool;
  }

  function assistPool() {
    const pool = [];
    for (const entry of SHAPES) {
      const score = bestAssistScore(entry.shape);
      if (score < 18) continue;
      pool.push({ shape: entry.shape, w: entry.w * score * score });
    }
    return pool;
  }

  function starterPool() {
    return SHAPES.map((entry) => {
      const cells = shapeCells(entry.shape).length;
      let w = entry.w;
      if (isStraightLine(entry.shape) && cells >= 3) w *= 0.35;
      else if (isStraightLine(entry.shape)) w *= 0.55;
      else if (cells === 1) w *= 0.4;
      else w *= 1.25;
      return { shape: entry.shape, w };
    });
  }

  function randomPiece(options = {}) {
    const preferClear = !!options.preferClear;
    const requirePlaceable = !!options.requirePlaceable;
    const starter = !!options.starter;

    if (preferClear) {
      const clearing = clearingPool();
      if (clearing.length) {
        const piece = pieceFromShape(pickWeightedShape(clearing));
        if (!requirePlaceable || anyPlacement(piece)) return piece;
      }

      const assisting = assistPool();
      if (assisting.length) {
        const piece = pieceFromShape(pickWeightedShape(assisting));
        if (!requirePlaceable || anyPlacement(piece)) return piece;
      }
    }

    const pool = starter ? starterPool() : SHAPES;
    for (let attempt = 0; attempt < 28; attempt++) {
      const shape = pickWeightedShape(pool);
      const piece = pieceFromShape(shape);
      if (!requirePlaceable || anyPlacement(piece)) return piece;
    }

    for (const entry of SHAPES) {
      const piece = pieceFromShape(entry.shape);
      if (anyPlacement(piece)) return piece;
    }
    return pieceFromShape(SHAPES[0].shape);
  }

  function refillPieces() {
    if (!state.pieces.every((p) => !p)) return false;

    const fill = boardFillRatio();
    const canClearNow = clearingPool().length > 0;
    // Разнообразие только на совсем пустом поле; иначе всегда тянем к ломанию
    const early = fill < 0.07 && !canClearNow;

    if (canClearNow) {
      // Есть клир — все три фигуры умеют ломать
      state.pieces = [
        randomPiece({ preferClear: true, requirePlaceable: true }),
        randomPiece({ preferClear: true, requirePlaceable: true }),
        randomPiece({ preferClear: true, requirePlaceable: true }),
      ];
    } else if (early) {
      state.pieces = [
        randomPiece({ starter: true, requirePlaceable: true }),
        randomPiece({ starter: true, requirePlaceable: true }),
        randomPiece({ starter: true, requirePlaceable: true }),
      ];
    } else {
      // Подводим линии к клиру
      state.pieces = [
        randomPiece({ preferClear: true, requirePlaceable: true }),
        randomPiece({ preferClear: true, requirePlaceable: true }),
        randomPiece({ preferClear: true, requirePlaceable: true }),
      ];
    }

    if (!state.pieces.some((p) => anyPlacement(p))) {
      state.pieces[0] = randomPiece({ preferClear: true, requirePlaceable: true });
    }
    return true;
  }

  function shapeCells(shape) {
    const cells = [];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) cells.push([r, c]);
      }
    }
    return cells;
  }

  function canPlace(shape, row, col) {
    for (const [r, c] of shapeCells(shape)) {
      const gr = row + r;
      const gc = col + c;
      if (gr < 0 || gc < 0 || gr >= SIZE || gc >= SIZE) return false;
      if (state.grid[gr][gc]) return false;
    }
    return true;
  }

  function previewClears(shape, row, col) {
    if (!canPlace(shape, row, col)) return { rows: [], cols: [], cells: [] };
    const fill = new Set();
    for (const [r, c] of shapeCells(shape)) fill.add(`${row + r},${col + c}`);

    const rows = [];
    for (let r = 0; r < SIZE; r++) {
      let full = true;
      for (let c = 0; c < SIZE; c++) {
        if (!state.grid[r][c] && !fill.has(`${r},${c}`)) {
          full = false;
          break;
        }
      }
      if (full) rows.push(r);
    }

    const cols = [];
    for (let c = 0; c < SIZE; c++) {
      let full = true;
      for (let r = 0; r < SIZE; r++) {
        if (!state.grid[r][c] && !fill.has(`${r},${c}`)) {
          full = false;
          break;
        }
      }
      if (full) cols.push(c);
    }

    const cells = [];
    const seen = new Set();
    const mark = (r, c) => {
      const key = `${r},${c}`;
      if (seen.has(key)) return;
      seen.add(key);
      cells.push([r, c]);
    };
    for (const r of rows) for (let c = 0; c < SIZE; c++) mark(r, c);
    for (const c of cols) for (let r = 0; r < SIZE; r++) mark(r, c);
    return { rows, cols, cells };
  }

  function anyPlacement(piece) {
    if (!piece) return false;
    const h = piece.shape.length;
    const w = piece.shape[0].length;
    for (let r = 0; r <= SIZE - h; r++) {
      for (let c = 0; c <= SIZE - w; c++) {
        if (canPlace(piece.shape, r, c)) return true;
      }
    }
    return false;
  }

  function placePiece(piece, row, col) {
    const placed = [];
    for (const [r, c] of shapeCells(piece.shape)) {
      const gr = row + r;
      const gc = col + c;
      state.grid[gr][gc] = piece.color;
      placed.push([gr, gc]);
    }
    spawnPlacePulses(placed, piece.color);
  }

  function clearLines() {
    const fullRows = [];
    const fullCols = [];
    for (let r = 0; r < SIZE; r++) {
      if (state.grid[r].every((v) => v)) fullRows.push(r);
    }
    for (let c = 0; c < SIZE; c++) {
      let full = true;
      for (let r = 0; r < SIZE; r++) {
        if (!state.grid[r][c]) {
          full = false;
          break;
        }
      }
      if (full) fullCols.push(c);
    }

    if (!fullRows.length && !fullCols.length) return { points: 0, lines: 0, cells: [] };

    const cleared = [];
    const seen = new Set();
    const mark = (r, c) => {
      const key = `${r},${c}`;
      if (seen.has(key)) return;
      seen.add(key);
      cleared.push({ r, c, color: state.grid[r][c] || "#ffffff" });
    };

    for (const r of fullRows) {
      for (let c = 0; c < SIZE; c++) mark(r, c);
    }
    for (const c of fullCols) {
      for (let r = 0; r < SIZE; r++) mark(r, c);
    }

    for (const cell of cleared) {
      state.grid[cell.r][cell.c] = 0;
    }

    const lines = fullRows.length + fullCols.length;
    const multiLineBonus = lines > 1 ? lines * 25 : 0;
    return {
      points: cleared.length * 10 + multiLineBonus,
      lines,
      cells: cleared,
    };
  }

  function checkGameOver() {
    const remaining = state.pieces.filter(Boolean);
    if (!remaining.length) return false;
    return remaining.every((p) => !anyPlacement(p));
  }

  function endGame() {
    if (state.gameOver) return;
    state.gameOver = true;
    state.paused = false;
    pauseOverlay.classList.add("hidden");
    clearSave();

    if (state.drag) {
      clearDragGhost();
      state.drag = null;
    }
    renderTray(false);

    const isNewRecord = state.beatRecordThisRun && state.score > 0;

    finalScoreEl.textContent = String(state.score);
    finalSideLabel.textContent = "Рекорд";
    finalBestEl.textContent = String(state.best);

    if (state.runBestStreak >= 2) {
      finalStreakEl.textContent = `×${state.runBestStreak}`;
      finalStreakWrap.classList.remove("hidden");
    } else {
      finalStreakWrap.classList.add("hidden");
    }

    if (isNewRecord) {
      newRecordBadge.classList.remove("hidden");
      gameoverTitle.textContent = "Отличный забег!";
    } else {
      newRecordBadge.classList.add("hidden");
      gameoverTitle.textContent = "Конец игры";
    }

    appEl.classList.add("ending");
    sfx.gameOver();
    haptics.gameOver();

    window.clearTimeout(state._endTimer);
    state._endTimer = window.setTimeout(() => {
      overlay.classList.remove("hidden");
      appEl.classList.remove("ending");
    }, 900);
  }

  function bumpScore() {
    scoreEl.classList.remove("bump");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("bump");
  }

  function bumpBest() {
    sideValue.classList.remove("bump");
    void sideValue.offsetWidth;
    sideValue.classList.add("bump");
  }

  function addScore(points) {
    if (!points) return;
    const before = state.best;
    state.score += points;
    scoreEl.textContent = String(state.score);
    bumpScore();

    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
      sideValue.textContent = String(state.best);
      bumpBest();
      if (state.score > before) state.beatRecordThisRun = true;
    }

    updateSideUI();
  }

  function shakeBoard(strong = false) {
    boardWrap.classList.remove("shake");
    void boardWrap.offsetWidth;
    boardWrap.style.setProperty("--shake", strong ? "1" : "0");
    boardWrap.classList.add("shake");
    window.clearTimeout(state._shakeTimer);
    state._shakeTimer = window.setTimeout(() => {
      boardWrap.classList.remove("shake");
    }, 300);
  }

  function showFloatScore(points, lines, streak, row, col) {
    const { origin, cell } = playArea();
    const rect = boardRect();
    const scale = rect.width / boardCanvas.width;
    const wrapRect = boardWrap.getBoundingClientRect();
    let cx = rect.left + (origin + (col + 0.5) * cell) * scale - wrapRect.left;
    let cy = rect.top + (origin + (row + 0.5) * cell) * scale - wrapRect.top;
    const el = document.createElement("div");
    const hot = lines > 1 || streak >= 2;
    el.className = "float-score" + (hot ? " combo" : "");
    let text = `+${points}`;
    if (streak >= 2) text += `  ×${streak}`;
    else if (lines > 1) text += `  ${lines} линии`;
    el.textContent = text;
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
    floatLayer.appendChild(el);

    const layerW = floatLayer.clientWidth || wrapRect.width;
    const layerH = floatLayer.clientHeight || wrapRect.height;
    const pad = 10;
    const w = Math.max(el.offsetWidth, 72);
    const h = Math.max(el.offsetHeight, 28);
    // translate(-50%) + анимация вверх (~1.2h) — держим текст внутри поля
    cx = Math.min(Math.max(cx, pad + w / 2), layerW - pad - w / 2);
    cy = Math.min(Math.max(cy, pad + h * 1.35), layerH - pad - h * 0.35);
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;

    window.setTimeout(() => el.remove(), 750);
  }

  function spawnPlacePulses(cells, color) {
    const t = performance.now();
    for (const [r, c] of cells) {
      state.placePulses.push({ r, c, color, born: t, life: 160 });
    }
  }

  function spawnClearFx(cells) {
    const t = performance.now();
    const { origin, cell } = playArea();
    for (const item of cells) {
      state.clearBursts.push({
        r: item.r,
        c: item.c,
        color: item.color,
        born: t,
        life: 280,
      });
      const box = cellRect(origin, cell, item.r, item.c);
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const count = 5 + ((Math.random() * 3) | 0);
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const spd = 1.2 + Math.random() * 2.4;
        state.particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * spd * cell * 0.08,
          vy: Math.sin(ang) * spd * cell * 0.08 - cell * 0.02,
          born: t,
          life: 320 + Math.random() * 180,
          size: 3 + Math.random() * 4,
          color: item.color,
        });
      }
    }
  }

  const BOARD_PAD = 16;
  const BOARD_RADIUS = 26;
  const CELL_GAP = 4;

  function playArea() {
    const size = boardCanvas.width - BOARD_PAD * 2;
    const cell = size / SIZE;
    return { origin: BOARD_PAD, size, cell };
  }

  function drawRoundedRect(context, x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function cellRect(origin, cell, r, c) {
    const gap = CELL_GAP;
    return {
      x: origin + c * cell + gap / 2,
      y: origin + r * cell + gap / 2,
      w: cell - gap,
      h: cell - gap,
      radius: (cell - gap) * 0.22,
    };
  }

  function drawBlock(context, x, y, w, h, radius, color, alpha = 1) {
    context.save();
    context.globalAlpha = alpha;
    drawRoundedRect(context, x, y, w, h, radius);
    const grad = context.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, shade(color, 20));
    grad.addColorStop(1, shade(color, -16));
    context.fillStyle = grad;
    context.fill();
    context.restore();
  }

  function shade(hex, amount) {
    const n = String(hex).replace("#", "");
    const num = parseInt(n.length === 3 ? n.split("").map((ch) => ch + ch).join("") : n, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0xff) + amount;
    let b = (num & 0xff) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function drawBoard(preview) {
    const { origin, cell } = playArea();
    const W = boardCanvas.width;
    const now = state.now;
    const colors = theme.boardColors();
    ctx.clearRect(0, 0, W, W);

    ctx.fillStyle = colors.board;
    drawRoundedRect(ctx, 0, 0, W, W, BOARD_RADIUS);
    ctx.fill();

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const box = cellRect(origin, cell, r, c);
        ctx.fillStyle = (r + c) % 2 === 0 ? colors.cellA : colors.cellB;
        drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.radius);
        ctx.fill();
      }
    }

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!state.grid[r][c]) continue;
        const box = cellRect(origin, cell, r, c);
        drawBlock(ctx, box.x, box.y, box.w, box.h, box.radius, state.grid[r][c]);

        const pulse = state.placePulses.find((p) => p.r === r && p.c === c);
        if (pulse) {
          const t = Math.min(1, (now - pulse.born) / pulse.life);
          const alpha = 0.35 * (1 - easeOutCubic(t));
          ctx.save();
          ctx.globalAlpha = alpha;
          drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.radius);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();
        }
      }
    }

    for (const burst of state.clearBursts) {
      const t = Math.min(1, (now - burst.born) / burst.life);
      const box = cellRect(origin, cell, burst.r, burst.c);
      const alpha = 0.7 * (1 - t);
      const grow = 1 + t * 0.45;
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const w = box.w * grow;
      const h = box.h * grow;
      ctx.save();
      ctx.globalAlpha = alpha;
      drawRoundedRect(ctx, cx - w / 2, cy - h / 2, w, h, box.radius);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();
      drawBlock(
        ctx,
        cx - box.w * (1 - t * 0.3) / 2,
        cy - box.h * (1 - t * 0.3) / 2,
        box.w * (1 - t * 0.3),
        box.h * (1 - t * 0.3),
        box.radius,
        burst.color,
        1 - t
      );
    }

    for (const p of state.particles) {
      const t = Math.min(1, (now - p.born) / p.life);
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      drawRoundedRect(ctx, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, p.size * 0.35);
      ctx.fill();
      ctx.restore();
    }

    if (preview) {
      const color = preview.valid ? preview.color : "#ff5d7a";
      const pulse = 0.48 + Math.sin(now / 140) * 0.08;
      const alpha = preview.valid ? pulse : 0.28;
      let clears = null;

      if (preview.valid) {
        clears = previewClears(preview.shape, preview.row, preview.col);
      }

      for (const [r, c] of shapeCells(preview.shape)) {
        const gr = preview.row + r;
        const gc = preview.col + c;
        if (gr < 0 || gc < 0 || gr >= SIZE || gc >= SIZE) continue;
        const box = cellRect(origin, cell, gr, gc);
        drawBlock(ctx, box.x, box.y, box.w, box.h, box.radius, color, alpha);
      }

      // Превью ломания — поверх, ярко пульсирует (как в Block Blast)
      if (clears && clears.cells.length) {
        const flash = 0.55 + Math.sin(now / 70) * 0.25;
        for (const [r, c] of clears.cells) {
          const box = cellRect(origin, cell, r, c);
          ctx.save();
          ctx.globalAlpha = flash;
          drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.radius);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  function drawShape(context, piece, ox, oy, cell, alpha = 1) {
    const gap = Math.max(2, cell * 0.08);
    const radius = (cell - gap) * 0.22;
    for (const [r, c] of shapeCells(piece.shape)) {
      const x = ox + c * cell + gap / 2;
      const y = oy + r * cell + gap / 2;
      drawBlock(context, x, y, cell - gap, cell - gap, radius, piece.color, alpha);
    }
  }

  function drawPieceOnCanvas(canvas, piece) {
    const pctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const slot = canvas.parentElement;
    const cssW = canvas.clientWidth || slot?.clientWidth || 0;
    const cssH = canvas.clientHeight || slot?.clientHeight || 0;
    // Пока экран скрыт (display:none) размер 0 — не рисуем «сжатый» битмап
    if (cssW < 8 || cssH < 8) return false;

    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.clearRect(0, 0, cssW, cssH);
    if (!piece) return true;

    const rows = piece.shape.length;
    const cols = piece.shape[0].length;
    const maxSide = Math.max(rows, cols);
    const cell = Math.min((cssW - 24) / maxSide, (cssH - 24) / maxSide, 28);
    const ox = (cssW - cols * cell) / 2;
    const oy = (cssH - rows * cell) / 2;
    drawShape(pctx, piece, ox, oy, cell);
    return true;
  }

  function paintTrayCanvases() {
    trayEl.querySelectorAll(".piece-slot").forEach((slot) => {
      const canvas = slot.querySelector("canvas");
      const index = Number(slot.dataset.index);
      if (!canvas || !Number.isFinite(index)) return;
      drawPieceOnCanvas(canvas, state.pieces[index]);
    });
  }

  function scheduleTrayPaint() {
    requestAnimationFrame(() => {
      paintTrayCanvases();
      const sample = trayEl.querySelector("canvas");
      if (sample && sample.clientWidth < 8) {
        requestAnimationFrame(paintTrayCanvases);
      }
    });
  }

  function renderTray(animate = false) {
    trayEl.innerHTML = "";
    state.pieces.forEach((piece, index) => {
      const slot = document.createElement("div");
      slot.className = "piece-slot" + (piece ? "" : " empty") + (animate && piece ? " pop" : "");
      slot.dataset.index = String(index);
      const canvas = document.createElement("canvas");
      canvas.className = "piece-canvas";
      slot.appendChild(canvas);
      trayEl.appendChild(slot);
      drawPieceOnCanvas(canvas, piece);
      if (piece && !state.gameOver && !state.paused) bindDrag(slot, index);
    });
    scheduleTrayPaint();
  }

  function boardRect() {
    return boardCanvas.getBoundingClientRect();
  }

  function ghostToCell(ghostLeft, ghostTop, shape) {
    const rect = boardRect();
    const scale = rect.width / boardCanvas.width;
    const origin = BOARD_PAD * scale;
    const cell = ((boardCanvas.width - BOARD_PAD * 2) / SIZE) * scale;
    const col = Math.round((ghostLeft - rect.left - origin) / cell);
    const row = Math.round((ghostTop - rect.top - origin) / cell);
    return { row, col, valid: canPlace(shape, row, col) };
  }

  function clearDragGhost() {
    if (state.drag && state.drag.ghost) state.drag.ghost.remove();
    document.querySelectorAll(".drag-ghost").forEach((el) => el.remove());
  }

  function bindDrag(slot, index) {
    slot.addEventListener("pointerdown", (e) => {
      if (state.gameOver || state.paused || !state.pieces[index] || state.drag) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      sfx.unlock();

      const piece = state.pieces[index];
      const rect = boardRect();
      const scale = rect.width / boardCanvas.width;
      const cell = ((boardCanvas.width - BOARD_PAD * 2) / SIZE) * scale;
      const rows = piece.shape.length;
      const cols = piece.shape[0].length;
      const ghost = document.createElement("canvas");
      ghost.className = "drag-ghost";
      ghost.width = Math.max(1, Math.round(cols * cell));
      ghost.height = Math.max(1, Math.round(rows * cell));
      ghost.style.width = `${ghost.width}px`;
      ghost.style.height = `${ghost.height}px`;
      drawShape(ghost.getContext("2d"), piece, 0, 0, cell);
      document.body.appendChild(ghost);

      const lift = 88; // одинаковый зазор от пальца до низа фигуры
      state.drag = {
        index,
        piece,
        ghost,
        pointerId: e.pointerId,
        offsetX: ghost.width / 2,
        offsetY: ghost.height + lift,
        lift,
      };

      try {
        slot.setPointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }

      slot.style.opacity = "0.2";
      moveGhost(e.clientX, e.clientY);
    });
  }

  function moveGhost(x, y) {
    if (!state.drag) return;
    const { ghost, offsetX, offsetY, piece } = state.drag;
    const left = x - offsetX;
    const top = y - offsetY;
    ghost.style.left = `${left}px`;
    ghost.style.top = `${top}px`;
    const preview = ghostToCell(left, top, piece.shape);
    preview.shape = piece.shape;
    preview.color = piece.color;
    state.drag.preview = preview;
  }

  function finishDrag() {
    if (!state.drag) return;
    const { index, piece, preview } = state.drag;
    clearDragGhost();
    state.drag = null;

    if (preview && preview.valid) {
      placePiece(piece, preview.row, preview.col);
      state.pieces[index] = null;
      const result = clearLines();
      let didClear = false;
      if (result.points) {
        state.streak += 1;
        if (state.streak > state.runBestStreak) state.runBestStreak = state.streak;
        const streakBonus = state.streak >= 2 ? (state.streak - 1) * STREAK_BONUS : 0;
        const totalPoints = result.points + streakBonus + PLACE_POINTS;
        spawnClearFx(result.cells);
        sfx.clear(result.lines, state.streak);
        haptics.clear(result.lines + Math.max(0, state.streak - 1));
        addScore(totalPoints);
        updateComboUI();
        const mid = result.cells[Math.floor(result.cells.length / 2)] || { r: 3, c: 3 };
        showFloatScore(totalPoints, result.lines, state.streak, mid.r, mid.c);
        if (result.lines >= 2 || state.streak >= 3) shakeBoard(true);
        else shakeBoard(false);
        didClear = true;
      } else {
        state.streak = 0;
        updateComboUI();
        sfx.place();
        haptics.place();
        addScore(PLACE_POINTS);
      }
      const refilled = refillPieces();
      // Не накладывать refill поверх clear — звучит грязно
      if (refilled && !didClear) sfx.refill();
      renderTray(refilled);
      saveGame();
      if (!state.gameOver && checkGameOver()) endGame();
    } else {
      sfx.reject();
      haptics.reject();
      renderTray(false);
    }
  }

  function onPointerMove(e) {
    if (!state.drag || e.pointerId !== state.drag.pointerId) return;
    e.preventDefault();
    moveGhost(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    if (!state.drag || e.pointerId !== state.drag.pointerId) return;
    e.preventDefault();
    finishDrag();
  }

  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp, { passive: false });
  window.addEventListener("pointercancel", onPointerUp, { passive: false });

  function tick(now) {
    state.now = now;
    const dt = Math.min(32, now - (state._last || now));
    state._last = now;

    state.particles = state.particles.filter((p) => {
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.vy += 0.08 * (dt / 16);
      return now - p.born < p.life;
    });
    state.placePulses = state.placePulses.filter((p) => now - p.born < p.life);
    state.clearBursts = state.clearBursts.filter((p) => now - p.born < p.life);

    if (state.screen === "game") {
      drawBoard(state.drag ? state.drag.preview : null);
    }
    requestAnimationFrame(tick);
  }

  function resetGame(fromSave = null) {
    clearDragGhost();
    state.drag = null;
    state.particles = [];
    state.placePulses = [];
    state.clearBursts = [];
    floatLayer.innerHTML = "";
    window.clearTimeout(state._shakeTimer);
    window.clearTimeout(state._endTimer);
    boardWrap.classList.remove("shake");
    appEl.classList.remove("ending");
    overlay.classList.add("hidden");
    newRecordBadge.classList.add("hidden");

    if (fromSave) {
      state.best = loadBest();
      state.grid = fromSave.grid.map((row) => row.slice());
      state.pieces = fromSave.pieces.map((p) =>
        p
          ? {
              shape: cloneShape(p.shape),
              color: p.color,
              id: p.id || Math.random().toString(36).slice(2),
            }
          : null
      );
      state.score = Number(fromSave.score) || 0;
      state.streak = Number(fromSave.streak) || 0;
      state.runBestStreak = Number(fromSave.runBestStreak) || state.streak;
      state.beatRecordThisRun = !!fromSave.beatRecordThisRun;
      state.gameOver = false;
      if (state.pieces.every((p) => !p)) refillPieces();
    } else {
      state.best = loadBest();
      state.grid = createEmptyGrid();
      state.pieces = [null, null, null];
      state.score = 0;
      state.streak = 0;
      state.runBestStreak = 0;
      state.beatRecordThisRun = false;
      state.gameOver = false;
      clearSave();
      refillPieces();
    }

    scoreEl.textContent = String(state.score);
    updateComboUI();
    updateSideUI();
    showGame();
    renderTray(true);
    drawBoard(null);
    if (!fromSave) saveGame();
  }

  function startMode() {
    resetGame(null);
  }

  function onRestart(e) {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    state.paused = false;
    pauseOverlay.classList.add("hidden");
    resetGame(null);
  }

  function onToMenu(e) {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    clearSave();
    showMenu();
  }

  function toggleSoundFromUi() {
    sfx.unlock();
    sfx.toggleMute();
    updateSoundUI();
    if (!sfx.isMuted()) sfx.click();
  }

  function toggleVibroFromUi() {
    sfx.unlock();
    haptics.toggle();
    updateVibroUI();
    sfx.click();
    if (haptics.isEnabled()) haptics.tap();
  }

  function toggleThemeFromUi() {
    sfx.unlock();
    theme.toggle();
    updateThemeUI();
    refreshThemeVisuals();
    sfx.click();
  }

  restartBtn.addEventListener("click", onRestart);
  pauseRestartBtn.addEventListener("click", onRestart);
  toMenuBtn.addEventListener("click", onToMenu);

  pauseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    pauseGame();
  });

  resumeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    resumeGame();
  });

  pauseMenuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    // Выход в меню = сдаться; сохранение только при закрытии приложения во время катки
    clearSave();
    showMenu();
  });

  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    openSettings();
  });

  settingsCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sfx.unlock();
    sfx.click();
    closeSettings();
  });

  settingsSoundBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSoundFromUi();
  });

  settingsVibroBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleVibroFromUi();
  });

  settingsThemeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleThemeFromUi();
  });

  settingsOverlay.addEventListener("click", (e) => {
    if (e.target === settingsOverlay) closeSettings();
  });

  const playBtn = document.getElementById("play-btn");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      sfx.unlock();
      sfx.click();
      startMode();
    });
  }

  window.addEventListener(
    "pointerdown",
    () => {
      sfx.unlock();
    },
    { once: true, capture: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveGame();
      if (state.screen === "game" && !state.gameOver) pauseGame();
    }
  });
  window.addEventListener("pagehide", () => saveGame());

  window.addEventListener("resize", () => {
    if (state.drag || state.screen !== "game") return;
    const slot = trayEl.querySelector(".piece-canvas");
    if (!slot) {
      renderTray(false);
      return;
    }
    const w = slot.clientWidth;
    if (Math.abs(w - (state._trayW || 0)) < 2) return;
    state._trayW = w;
    renderTray(false);
  });

  updateSettingsUI();
  const bootSave = loadSave();
  if (bootSave) resetGame(bootSave);
  else showMenu();
  requestAnimationFrame(tick);
})();
