/* Personal OS — логика дашборда. Настройки — в config.js */
/* global CONFIG */

const $ = (s) => document.querySelector(s);

const STATUSES = {
  active:    { label: "Активен",          cls: "st-active" },
  thinking:  { label: "Думает…",          cls: "st-thinking" },
  searching: { label: "Ищет информацию…", cls: "st-searching" },
  inactive:  { label: "Не активен",       cls: "st-inactive" },
  offline:   { label: "Не активен",       cls: "st-inactive" }
};

const state = { agents: [], history: [] };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Встроенные векторные иконки агентов. Stroke: currentColor — адаптируются
   к темам (dark/light/acid). В config.js avatar задаётся как "svg:<ключ>". */
const SVG_ICONS = {
  robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="20" width="36" height="28" rx="7"/><circle cx="24.5" cy="34" r="2.6" fill="currentColor" stroke="none"/><circle cx="39.5" cy="34" r="2.6" fill="currentColor" stroke="none"/><path d="M25 42h14"/><path d="M32 20v-7"/><circle cx="32" cy="10" r="2.6"/><path d="M14 33h-5M50 33h5"/></svg>`,
  bolt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M35.5 8 14 34h13l-4.5 22L48 28H33z"/></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16c8-4 16-4 24 0v30c-8-4-16-4-24 0z"/><path d="M56 16c-8-4-16-4-24 0v30c8-4 16-4 24 0z"/><path d="M32 16v30"/></svg>`,
  chip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 10 50 21v22L32 54 14 43V21z"/><circle cx="32" cy="32" r="5.5" fill="currentColor" stroke="none"/><path d="M32 18v9M32 37v9M18 32h9M37 32h9"/></svg>`,
};

function avatarHtml(a, size) {
  if (a.avatar && a.avatar.startsWith("svg:")) {
    const svg = SVG_ICONS[a.avatar.slice(4)];
    if (svg) return `<span class="avatar-svg" style="width:${size}px;height:${size}px">${svg}</span>`;
  }
  if (a.avatar && /^https?:\/\//i.test(a.avatar)) {
    return `<img class="avatar-img" src="${escapeHtml(a.avatar)}" alt="${escapeHtml(a.name)}">`;
  }
  return `<span style="font-size:${Math.round(size * 0.5)}px">${a.avatar || "🤖"}</span>`;
}

/* ---------- Темы оформления ---------- */

function initTheme() {
  const current = document.documentElement.dataset.theme || "dark";
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeBtn === current);
    btn.addEventListener("click", () => {
      const t = btn.dataset.themeBtn;
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem("pos-theme", t); } catch (e) { /* приватный режим */ }
      document.querySelectorAll(".theme-btn").forEach((x) =>
        x.classList.toggle("active", x === btn));
    });
  });
}

/* ---------- Глитч-анимации ---------- */

function glitch(el) {
  if (reduceMotion || !el) return;
  el.classList.remove("glitching");
  void el.offsetWidth; // перезапуск анимации
  el.classList.add("glitching");
  setTimeout(() => el.classList.remove("glitching"), 650);
}

function ambientGlitch() {
  const panels = document.querySelectorAll(".panel");
  if (!panels.length) return;
  glitch(panels[Math.floor(Math.random() * panels.length)]);
}

/* ---------- Блок 1: агенты ---------- */

function renderAgents() {
  $("#agents").innerHTML = state.agents.map((a) => {
    const st = STATUSES[a.status] || STATUSES.inactive;
    return `
      <div class="agent-card ${st.cls}" data-id="${a.id}" title="${escapeHtml(a.name)}">
        <div class="avatar">${avatarHtml(a, 56)}</div>
        <div class="agent-name">${escapeHtml(a.name)}</div>
        <div class="agent-id">${escapeHtml(a.id)}</div>
        <div class="agent-status"><span class="pip"></span>${st.label}</div>
        ${a.demo ? '<span class="demo-tag">демо-режим</span>' : ""}
      </div>`;
  }).join("");

  document.querySelectorAll(".agent-card").forEach((card) =>
    card.addEventListener("click", () => { $("#agentSelect").value = card.dataset.id; })
  );
}

async function fetchAgentStatus(agent) {
  if (!agent.statusUrl) {
    // Демо-режим: случайные статусы, пока не настроен statusUrl
    const pool = ["active", "active", "thinking", "searching", "inactive"];
    agent.status = pool[Math.floor(Math.random() * pool.length)];
    agent.demo = true;
    return;
  }
  try {
    const r = await fetch(agent.statusUrl, { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    agent.status = STATUSES[j.status] ? j.status : "inactive";
    agent.demo = false;
  } catch {
    agent.status = "offline";
    agent.demo = false;
  }
}

async function pollStatuses() {
  await Promise.all(state.agents.map(fetchAgentStatus));
  renderAgents();
  $("#updatedAt").textContent = new Date().toLocaleTimeString("ru-RU");
}

/* ---------- Авторизация: код доступа (PIN) ---------- */

const PIN_KEY = "pos-pin";

function getPin() {
  try { return localStorage.getItem(PIN_KEY) || ""; } catch (e) { return ""; }
}
function savePin(p) {
  try { localStorage.setItem(PIN_KEY, p); } catch (e) { /* приватный режим */ }
}
function clearPin() {
  try { localStorage.removeItem(PIN_KEY); } catch (e) {}
}

function showLock(msg) {
  const lock = $("#lockScreen");
  if (!lock) return;
  lock.classList.add("visible");
  lock.setAttribute("aria-hidden", "false");
  if (msg) $("#lockMsg").textContent = msg;
  const inp = $("#lockInput");
  if (inp) { inp.value = ""; setTimeout(() => inp.focus(), 50); }
}

function hideLock() {
  const lock = $("#lockScreen");
  if (!lock) return;
  lock.classList.remove("visible");
  lock.setAttribute("aria-hidden", "true");
}

function initAuth() {
  const btn = $("#lockBtn");
  const inp = $("#lockInput");
  if (!btn || !inp) return;
  btn.addEventListener("click", () => {
    const p = inp.value.trim();
    if (!p) return;
    savePin(p);
    hideLock();
  });
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click(); });
  if (!getPin()) showLock("");
}

/* ---------- Блоки 2 и 3: команда и ответ ---------- */

function renderResponse(agent, command, reply, mode) {
  const box = $("#responseBox");
  box.classList.remove("response-empty");
  const time = new Date().toLocaleString("ru-RU", { timeZone: CONFIG.city.tz });
  const replyCls = mode === "pending" ? "pending" : mode === "error" ? "error" : "";
  const replyText = mode === "pending" ? "Агент думает…" : reply;
  box.innerHTML = `
    <div class="resp-head">
      <div class="avatar sm">${avatarHtml(agent, 42)}</div>
      <div>
        <div class="resp-agent">${escapeHtml(agent.name)}</div>
        <div class="resp-time">${time} · ${escapeHtml(CONFIG.city.name)}</div>
      </div>
    </div>
    <div class="resp-command"><span>Команда</span>${escapeHtml(command)}</div>
    <div class="resp-reply ${replyCls}">${escapeHtml(replyText)}</div>`;
}

function pushHistory(agent, command) {
  state.history.unshift({ agent: agent.name, command, at: new Date() });
  state.history = state.history.slice(0, 5);
  $("#history").innerHTML = state.history.map((h) => {
    const short = h.command.length > 80 ? h.command.slice(0, 80) + "…" : h.command;
    return `<div class="history-item"><b>${escapeHtml(h.agent)}</b> // ${escapeHtml(short)} // ${h.at.toLocaleTimeString("ru-RU")}</div>`;
  }).join("");
}

async function sendCommand() {
  const agent = state.agents.find((a) => a.id === $("#agentSelect").value);
  const command = $("#commandInput").value.trim();
  if (!agent || !command) return;

  const btn = $("#sendBtn");
  btn.disabled = true;
  btn.textContent = "Отправка…";
  renderResponse(agent, command, null, "pending");

  let reply = "";
  let mode = "ok";

  if (agent.commandUrl) {
    try {
      const r = await fetch(agent.commandUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Auth-Token": getPin() },
        body: JSON.stringify({ agent: agent.id, command, ts: new Date().toISOString() })
      });
      if (r.status === 401 || r.status === 423) {
        clearPin();
        showLock(r.status === 423
          ? "Слишком много неудачных попыток — вход заблокирован на 10 минут."
          : "Неверный код доступа.");
        mode = "error";
      } else if (!r.ok) {
        throw new Error("HTTP " + r.status);
      }
      const data = await r.json().catch(() => ({}));
      reply = data.reply || (mode === "error"
        ? "Требуется авторизация: введи код доступа."
        : "Команда принята (агент вернул пустой ответ).");
    } catch (e) {
      reply = "Агент не ответил: " + e.message;
      mode = "error";
    }
  } else {
    // Демо-режим: имитация работы агента
    agent.status = "thinking";
    renderAgents();
    await new Promise((res) => setTimeout(res, 1400));
    reply = `Демо-режим: команда «${command}» принята агентом «${agent.name}».\n\nЧтобы получать реальные ответы, укажите commandUrl для агента в config.js.`;
    agent.status = "active";
  }

  renderResponse(agent, command, reply, mode);
  glitch(document.querySelector(".response-panel"));
  pushHistory(agent, command);
  renderAgents();
  $("#commandInput").value = "";
  btn.disabled = false;
  btn.textContent = "Отправить команду";
}

/* ---------- Блок 4: погода, IP, время ---------- */

const WMO = {
  0: ["Ясно", "☀️"], 1: ["Преимущественно ясно", "🌤️"],
  2: ["Переменная облачность", "⛅"], 3: ["Пасмурно", "☁️"],
  45: ["Туман", "🌫️"], 48: ["Туман, изморозь", "🌫️"],
  51: ["Лёгкая морось", "🌦️"], 53: ["Морось", "🌦️"], 55: ["Сильная морось", "🌧️"],
  56: ["Ледяная морось", "🌧️"], 57: ["Ледяная морось", "🌧️"],
  61: ["Небольшой дождь", "🌦️"], 63: ["Дождь", "🌧️"], 65: ["Сильный дождь", "🌧️"],
  66: ["Ледяной дождь", "🌧️"], 67: ["Ледяной дождь", "🌧️"],
  71: ["Небольшой снег", "🌨️"], 73: ["Снег", "❄️"], 75: ["Сильный снег", "❄️"],
  77: ["Снежная крупа", "❄️"],
  80: ["Ливень", "🌧️"], 81: ["Ливень", "🌧️"], 82: ["Сильный ливень", "⛈️"],
  85: ["Снегопад", "🌨️"], 86: ["Сильный снегопад", "🌨️"],
  95: ["Гроза", "⛈️"], 96: ["Гроза с градом", "⛈️"], 99: ["Гроза с градом", "⛈️"]
};

async function loadWeather() {
  const c = CONFIG.city;
  const el = $("#weather");
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + c.lat + "&longitude=" + c.lon +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=" + encodeURIComponent(c.tz);
    const r = await fetch(url);
    const j = await r.json();
    const cur = j.current;
    const [text, icon] = WMO[cur.weather_code] || ["—", "❔"];
    el.innerHTML = `
      <div class="info-title">${icon} Погода · ${escapeHtml(c.name)}</div>
      <div class="big">${Math.round(cur.temperature_2m)}°C</div>
      <div class="muted">${text} · ощущается как ${Math.round(cur.apparent_temperature)}°C · ветер ${Math.round(cur.wind_speed_10m)} км/ч</div>`;
  } catch {
    el.innerHTML = `<div class="info-title">🌡️ Погода · ${escapeHtml(c.name)}</div><div class="muted">Не удалось загрузить данные</div>`;
  }
}

function flagEmoji(cc) {
  return cc.toUpperCase().replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

async function loadNet() {
  const el = $("#netinfo");
  let d = null;
  try {
    const r = await fetch("https://ipapi.co/json/");
    const j = await r.json();
    if (j && j.ip) d = { ip: j.ip, cc: (j.country_code || "").toLowerCase(), country: j.country_name || "" };
  } catch { /* пробуем резервный сервис */ }
  if (!d) {
    try {
      const r = await fetch("https://ipwho.is/");
      const j = await r.json();
      if (j && j.ip) d = { ip: j.ip, cc: (j.country_code || "").toLowerCase(), country: j.country || "" };
    } catch { /* нет сети */ }
  }
  if (!d) {
    el.innerHTML = `<div class="info-title">🌐 Сеть</div><div class="muted">Не удалось определить IP</div>`;
    return;
  }
  el.innerHTML = `
    <div class="info-title">🌐 Ваш IP</div>
    <div class="big" style="font-size:20px">${escapeHtml(d.ip)}</div>
    <div class="muted"><img class="flag" src="https://flagcdn.com/w40/${escapeHtml(d.cc)}.png" alt="${escapeHtml(d.cc)}" onerror="this.remove()">${flagEmoji(d.cc)} ${escapeHtml(d.country)}</div>`;
}

function tickClock() {
  const now = new Date();
  const tFmt = new Intl.DateTimeFormat("ru-RU", { timeZone: CONFIG.city.tz, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dFmt = new Intl.DateTimeFormat("ru-RU", { timeZone: CONFIG.city.tz, weekday: "long", day: "numeric", month: "long", year: "numeric" });
  $("#clock").textContent = tFmt.format(now);
  $("#localtime").innerHTML = `
    <div class="info-title">🕒 Время · ${escapeHtml(CONFIG.city.name)}</div>
    <div class="big">${tFmt.format(now)}</div>
    <div class="muted">${dFmt.format(now)}</div>`;
}

/* ---------- Блок 5: дайджест статей ---------- */

const digest = { items: [], idx: 0 };

function renderDigest() {
  const el = $("#digest");
  if (!digest.items.length) {
    el.innerHTML = `<div class="digest-empty">Статей пока нет — ждём первую публикацию.</div>`;
    $("#digestMeta").textContent = "FEED // 6H";
    return;
  }
  const it = digest.items[digest.idx];
  const showDate = it.date || (it.published_at || "").slice(0, 10);
  $("#digestMeta").textContent = `${digest.idx + 1} / ${digest.items.length} · 6H`;
  el.innerHTML = `
    <div class="digest-card">
      <div class="digest-top">
        <span class="digest-source">${escapeHtml(it.source || "")}</span>
        <span class="digest-date mono">${escapeHtml(showDate)}</span>
      </div>
      <a class="digest-title" href="${escapeHtml(it.link)}" target="_blank" rel="noopener">${escapeHtml(it.title)}</a>
      <p class="digest-ann">${escapeHtml(it.annotation || "")}</p>
      <div class="digest-foot">
        <a class="digest-more" href="${escapeHtml(it.link)}" target="_blank" rel="noopener">Читать полностью →</a>
        <div class="digest-nav">
          <button type="button" class="digest-btn mono" id="digPrev" aria-label="Предыдущая статья" ${digest.items.length > 1 ? "" : "disabled"}>◀</button>
          <button type="button" class="digest-btn mono" id="digNext" aria-label="Следующая статья" ${digest.items.length > 1 ? "" : "disabled"}>▶</button>
        </div>
      </div>
    </div>`;
  $("#digPrev").addEventListener("click", () => {
    digest.idx = (digest.idx - 1 + digest.items.length) % digest.items.length;
    renderDigest();
  });
  $("#digNext").addEventListener("click", () => {
    digest.idx = (digest.idx + 1) % digest.items.length;
    renderDigest();
  });
}

async function loadDigest() {
  try {
    const r = await fetch("articles.json", { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    digest.items = Array.isArray(j.items) ? j.items : [];
    if (digest.idx >= digest.items.length) digest.idx = 0;
  } catch (e) {
    digest.items = [];
  }
  renderDigest();
}

/* ---------- Автообновление конфигурации ---------- */

async function refreshConfig() {
  // Быстрые туннели (localhost.run) меняют поддомен при переподключении —
  // периодически перечитываем config.js и обновляем URL агентов,
  // чтобы карточки оставались живыми без ручного Ctrl+F5.
  try {
    const r = await fetch("config.js", { cache: "no-store" });
    const txt = await r.text();
    const fresh = new Function(txt + "\nreturn CONFIG;")();
    for (const a of state.agents) {
      const nc = (fresh.agents || []).find((x) => x.id === a.id);
      if (!nc) continue;
      a.statusUrl = nc.statusUrl || "";
      a.commandUrl = nc.commandUrl || "";
      a.demo = !a.statusUrl;
    }
  } catch (e) { /* Pages ещё пересобирается или нет сети — пропускаем цикл */ }
}

/* ---------- Инициализация ---------- */

function init() {
  document.title = CONFIG.title + " — Dashboard";
  $("#appTitle").textContent = CONFIG.title;
  $("#footCity").textContent = CONFIG.city.name;

  const pollSec = Math.round((CONFIG.statusPollMs || 15000) / 1000);
  $("#agentsMeta").textContent = "POLL " + pollSec + "S";

  initTheme();
  initAuth();

  state.agents = CONFIG.agents.map((a) => ({ ...a, status: "inactive", demo: !a.statusUrl }));
  $("#agentSelect").innerHTML = state.agents
    .map((a) => `<option value="${a.id}">${escapeHtml(a.name)}</option>`)
    .join("");

  $("#sendBtn").addEventListener("click", sendCommand);
  $("#commandInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendCommand();
  });

  renderAgents();
  pollStatuses();
  setInterval(pollStatuses, CONFIG.statusPollMs || 15000);

  tickClock();
  setInterval(tickClock, 1000);

  loadWeather();
  setInterval(loadWeather, 10 * 60 * 1000);

  loadNet();

  loadDigest();
  setInterval(loadDigest, 15 * 60 * 1000);

  setInterval(ambientGlitch, 7000);
}

document.addEventListener("DOMContentLoaded", init);
