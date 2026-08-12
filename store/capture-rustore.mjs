import { chromium } from "playwright";
import { createServer } from "http";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "www");
const outDir = path.resolve(__dirname, "rustore-screenshots");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
        if (urlPath === "/") urlPath = "/index.html";
        const filePath = path.join(root, urlPath.replace(/^\//, ""));
        if (!filePath.startsWith(root)) {
          res.writeHead(403);
          res.end();
          return;
        }
        const data = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

const COLORS = ["#4aa3ff", "#57d38c", "#ffb454", "#ff6b8a", "#b388ff", "#35d0d6", "#ff8f5a"];

function demoGrid() {
  const g = Array.from({ length: 8 }, () => Array(8).fill(0));
  const paint = (cells, color) => {
    for (const [r, c] of cells) g[r][c] = color;
  };
  paint(
    [
      [0, 0], [0, 1], [0, 2], [1, 0], [1, 2],
      [2, 3], [2, 4], [3, 3], [3, 4],
      [4, 1], [5, 1], [6, 1], [6, 2],
      [1, 5], [1, 6], [1, 7], [2, 7], [3, 7],
      [5, 4], [5, 5], [5, 6], [6, 6], [7, 6],
      [7, 0], [7, 1], [7, 2], [7, 3],
      [4, 6], [4, 7], [5, 7],
      [3, 0], [4, 0], [5, 0],
    ].map(([r, c], i) => [r, c]),
    null
  );
  // fill with varied colors
  const coords = [
    [0, 0], [0, 1], [0, 2], [1, 0], [1, 2],
    [2, 3], [2, 4], [3, 3], [3, 4],
    [4, 1], [5, 1], [6, 1], [6, 2],
    [1, 5], [1, 6], [1, 7], [2, 7], [3, 7],
    [5, 4], [5, 5], [5, 6], [6, 6], [7, 6],
    [7, 0], [7, 1], [7, 2], [7, 3],
    [4, 6], [4, 7], [5, 7],
    [3, 0], [4, 0], [5, 0],
    [2, 1], [3, 5], [6, 4], [0, 5], [0, 6],
  ];
  coords.forEach(([r, c], i) => {
    g[r][c] = COLORS[i % COLORS.length];
  });
  return g;
}

async function waitHidden(page, selector) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !el || el.classList.contains("hidden");
  }, selector);
}

async function waitShown(page, selector) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return el && !el.classList.contains("hidden");
  }, selector);
}

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: file, type: "png" });
  console.log("saved", name);
}

async function main() {
  const { server, port } = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    locale: "ru-RU",
  });
  const page = await context.newPage();
  const base = `http://127.0.0.1:${port}/`;

  await page.addInitScript(() => {
    try {
      localStorage.setItem("blockBlastBest_classic", "3387");
      localStorage.setItem(
        "blockBlastDaily_v1",
        JSON.stringify({ date: new Date().toISOString().slice(0, 10), best: 920 })
      );
      localStorage.setItem(
        "blockBlastAchievements_v1",
        JSON.stringify({
          unlocked: { score_1k: true, multi_3: true, games_10: true },
          progress: {
            score_1k: 1000,
            score_5k: 2100,
            multi_3: 3,
            multi_4: 2,
            games_10: 12,
            games_50: 12,
            streak_5: 4,
            streak_10: 4,
            daily_streak_3: 1,
          },
          gamesFinished: 12,
        })
      );
      localStorage.setItem("blockBlastMuted", "1");
    } catch (_) {}
  });

  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("blockBlastSave_v2"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("#play-btn");
  await shot(page, "01-menu");

  await page.click("#achievements-btn");
  await waitShown(page, "#achievements-overlay");
  await shot(page, "02-achievements");
  await page.click("#achievements-close-btn");
  await waitHidden(page, "#achievements-overlay");

  await page.click("#settings-btn");
  await waitShown(page, "#settings-overlay");
  await shot(page, "03-settings");
  await page.click("#settings-close-btn");
  await waitHidden(page, "#settings-overlay");

  const savePayload = {
    mode: "classic",
    grid: demoGrid(),
    pieces: [
      { shape: [[1, 1], [1, 1]], color: "#4aa3ff", id: "a" },
      { shape: [[1], [1], [1]], color: "#ffb454", id: "b" },
      { shape: [[1, 1, 1], [0, 1, 0]], color: "#57d38c", id: "c" },
    ],
    score: 1240,
    streak: 3,
    runBestStreak: 5,
    beatRecordThisRun: false,
  };

  await page.evaluate((payload) => {
    localStorage.setItem("blockBlastSave_v2", JSON.stringify(payload));
    localStorage.setItem("blockBlastBest_classic", "3387");
    localStorage.setItem("blockBlastMuted", "1");
  }, savePayload);

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    const app = document.getElementById("app");
    const menu = document.getElementById("menu");
    return app && !app.classList.contains("hidden") && menu && menu.classList.contains("hidden");
  }, null, { timeout: 15000 }).catch(async () => {
    // Fallback: start a fresh game if autosave did not resume
    await page.click("#play-btn");
    await page.waitForFunction(() => {
      const app = document.getElementById("app");
      return app && !app.classList.contains("hidden");
    });
  });
  await page.waitForTimeout(900);
  await shot(page, "04-gameplay");

  await page.click("#pause-btn");
  await waitShown(page, "#pause-overlay");
  await shot(page, "05-pause");
  await page.click("#resume-btn");
  await waitHidden(page, "#pause-overlay");

  await page.evaluate(() => {
    document.getElementById("final-score").textContent = "1240";
    document.getElementById("final-best").textContent = "3387";
    const streakWrap = document.getElementById("final-streak-wrap");
    const streak = document.getElementById("final-streak");
    if (streakWrap && streak) {
      streakWrap.classList.remove("hidden");
      streak.textContent = "5";
    }
    document.getElementById("new-record-badge")?.classList.add("hidden");
    document.getElementById("daily-record-badge")?.classList.add("hidden");
    document.getElementById("gameover-title").textContent = "Конец игры";
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("is-enter");
  });
  await page.waitForTimeout(450);
  await shot(page, "06-gameover");

  await browser.close();
  server.close();
  console.log("done ->", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
