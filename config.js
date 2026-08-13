// ============================================================
//  Personal OS — конфигурация дашборда
//  Отредактируйте этот файл под свою инфраструктуру.
// ============================================================

const CONFIG = {
  // Заголовок страницы
  title: "Personal OS",

  // Город для блока погоды и времени
  city: {
    name: "Благовещенск",
    lat: 50.2906,
    lon: 127.5272,
    tz: "Asia/Yakutsk" // UTC+9 — время Благовещенска
  },

  // Как часто опрашивать статусы агентов (мс)
  statusPollMs: 15000,

  // ---------------------------------------------------------
  //  СПИСОК АГЕНТОВ
  //  avatar     — эмодзи ИЛИ ссылка на картинку (https://...)
  //  statusUrl  — GET-эндпоинт статуса.
  //               Ответ: {"status": "active"}
  //               Возможные: active | thinking | searching | inactive
  //  commandUrl — POST-эндпоинт для команд.
  //               Запрос:  {"agent": "id", "command": "...", "ts": "..."}
  //               Ответ:   {"reply": "текст ответа"}
  //  Поля пустые — агент работает в демо-режиме.
  //  ВАЖНО: эндпоинты должны быть доступны по HTTPS и отдавать
  //  CORS-заголовок Access-Control-Allow-Origin.
  //  ВАЖНО: хосты URL (часть до /hermes-*/...) автоматически
  //  обновляет supervisor агента hermes-agent (см. AGENTS.md §7-8).
  // ---------------------------------------------------------
  agents: [
    {
      id: "hermes-core",
      name: "Hermes Core",
      avatar: "⚡",
      statusUrl: "https://a44836666d3b4f.lhr.life/hermes-core/h7k9m2p4x1q8w3r6/status",
      commandUrl: "https://a44836666d3b4f.lhr.life/hermes-core/h7k9m2p4x1q8w3r6/command"
    },
    {
      id: "hermes-agent",
      name: "Hermes Agent",
      avatar: "🤖",
      statusUrl: "https://c291644ad04b01.lhr.life/hermes-agent/l8cI1GozLAALAK3-HPa9mF_oCeC7izXx/status",
      commandUrl: "https://c291644ad04b01.lhr.life/hermes-agent/l8cI1GozLAALAK3-HPa9mF_oCeC7izXx/command"
    },
    {
      id: "hermes-docs",
      name: "Hermes Docs",
      avatar: "📚",
      statusUrl: "",
      commandUrl: ""
    },
    {
      id: "agent-zero",
      name: "Agent Zero",
      avatar: "🧠",
      statusUrl: "",
      commandUrl: ""
    }
  ]
};
