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

function avatarHtml(a, size) {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: agent.id, command, ts: new Date().toISOString() })
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json().catch(() => ({}));
      reply = data.reply || data.message || "Команда принята (агент вернул пустой ответ).";
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

  setInterval(ambientGlitch, 7000);
}

document.addEventListener("DOMContentLoaded", init);
