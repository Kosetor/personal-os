# 🤖 Инструкция для агента hermes_b (Hermes Core)

> Этот файл — дополнение к `AGENTS.md`. Читай и исполняй оба.
> Твой слот на дашборде: **hermes-core** (id `hermes-core`, карточка ⚡ «Hermes Core»).
> Твой сосед по репозиторию: **hermes_a** (id `hermes-agent`, карточка 🤖 «Hermes Agent»).

## 1. Кто ты и где твой мост

- Ты — второй агент в дашборде Personal OS. Твой HTTP-мост слушает на `127.0.0.1:38765`.
- Твой маршрут (соблюдай ТОЧНО, он прописан в `config.js`):
  - `GET  /hermes-core/<твой-секрет>/status` → `{"status": "active|thinking|searching|inactive"}`
  - `POST /hermes-core/<твой-секрет>/command` → `{"reply": "..."}` (тело: `{"agent","command","ts"}`)
  - `OPTIONS` на command — обязательно (preflight), CORS: `Access-Control-Allow-Origin: https://kosetor.github.io`.
- Команды с дашборда исполняй через `hermes chat -q "<команда>" -Q` с рабочей директорией
  = корень этого репозитория (тогда AGENTS.md и этот файл попадают в контекст агента).
- ⚠️ **ВАЖНО (уже сломано у тебя):** если твой мост запущен через systemd-юнит
  (`hermes-core-bridge.service`), у процесса урезанный PATH — бинарь `hermes` по имени
  НЕ находится, и все POST-команды падают с
  `[Errno 2] No such file or directory: 'hermes'`.
  Вызывай `hermes` по АБСОЛЮТНОМУ пути (обычно `~/.local/bin/hermes` — проверь `which hermes`),
  либо пропиши `Environment=PATH=...` в юнит. hermes_a уже так починил свой мост.

## 2. Сеть и публичный доступ (ТЕКУЩАЯ схема, НЕ устаревшая)

- **Основной канал — Tailscale Funnel, стабильный хост:**
  `https://hermes1-gp66-leopard-11ug.tail4e12e3.ts.net`
  (узел в tailnet `tail4e12e3.ts.net`, Funnel смонтирован на `/`).
- Funnel проксирует `/` → `127.0.0.1:8443`, где стоит `funnel_proxy.py` (его держит hermes_a),
  который разводит пути с сохранением префикса:
  - `/hermes-core/*` → `127.0.0.1:38765` (твой мост)
  - `/hermes-agent/*` → `127.0.0.1:8765` (мост hermes_a)
  Твой полный публичный адрес: `https://hermes1-gp66-leopard-11ug.tail4e12e3.ts.net/hermes-core/<секрет>/...`
- `localhost.run`-туннели — только аварийный fallback супервизора, обычно неактивны и нестабильны.
  Не рассчитывай на них и не прописывай их адреса никуда.
- **НЕ запускай свой cloudflared/свои туннели** — они с этой сети не работают (530, edge в HKG)
  и конфликтуют с супервизором. Весь публичный доступ — через Funnel hermes_a.
- **Хост в `config.js` ведёт супервизор hermes_a** (коммиты вида «Update agent tunnel URLs…»).
  НЕ меняй хост своих URL и вообще ничего в объекте `hermes-agent`; формат чужих
  и демо-записей (`hermes-docs`, `agent-zero`) тоже не трогай.
- Ты можешь менять: своё имя/аватар в своём объекте и свой секрет
  (путь `/hermes-core/<секрет>/...`) — но тогда обнови путь и в `config.js`, и в своём мосте
  одновременно.

### Особенности сети (чтобы не пугаться и не «чинить» зря)

- Узел tailscale может показывать `offline` в `tailscale status` — это НОРМАЛЬНО для этой сети:
  control long-poll рвётся каждые ~2 минуты (провайдер режет idle-TCP), но Funnel продолжает
  работать через DERP-ретрансляцию. Публичные запросы при этом проходят.
- Публичный DNS ts.net-домена капризный: 9.9.9.9 резолвит, а 8.8.8.8/1.1.1.1 долго кэшируют
  NXDOMAIN. Если `curl` с твоей стороны не резолвит — добавь `--resolve` или резолвер 9.9.9.9;
  снаружи (у GitHub Pages) резолвится нормально.
- Разовый сбой публичного запроса — не повод переключать каналы: повтори через 1–2 минуты.

## 3. Правила параллельной работы (обязательно)

1. Перед любой правкой репозитория: `git pull --rebase origin main`.
2. Меняй ТОЛЬКО свой объект в `CONFIG.agents`. Одной правкой — один коммит с понятным сообщением.
3. После правки: `git push origin main`. Если push отклонён — снова `git pull --rebase`, повтори.
4. Никогда не переписывай `config.js` целиком «из головы»: читай текущую версию с GitHub,
   меняй минимум. Полная перезапись уже дважды ломала чужие URL (см. историю: коммиты
   «Connect hermes-core…» сломали путь у hermes-agent).
5. Держи свой мост живым. Если он упал — подними заново (это твой процесс, hermes_a
   его не трогает). Не меняй порт без договорённости с hermes_a.
6. Статусы: ожидание → `active`, обработка → `thinking`, поиск → `searching`, стоп → `inactive`.
   Не выдумывай других значений — дашборд покажет «Не активен».
7. Отвечай на команду в течение ~30 с; долгая задача — верни подтверждение сразу
   («Принято, выполняю…»), результат вернёшь следующим ответом, если спросят.

## 4. Проверка после изменений

Подставь свой секрет вместо `<секрет>`:

```bash
# статус — должен ответить {"status":"active"}
curl -s https://hermes1-gp66-leopard-11ug.tail4e12e3.ts.net/hermes-core/<секрет>/status

# команда — должна вернуть {"reply":...}
curl -s -X POST https://hermes1-gp66-leopard-11ug.tail4e12e3.ts.net/hermes-core/<секрет>/command \
  -H 'Content-Type: application/json' \
  -d '{"agent":"hermes-core","command":"ping","ts":"2026-08-14T00:00:00Z"}'
```

Если статус отвечает, а POST падает с `No such file or directory: 'hermes'` — см. раздел 1,
это PATH-проблема, а не сеть.

## 5. Telegram: как подключить (провайдер режет Telegram — нужен fallback)

У этой сети DPI-блокировка подсетей Telegram: `api.telegram.org` по имени НЕ коннектится
(крупные пакеты режутся), а GitHub/8.8.8.8 работают. Рабочий обход, проверенный hermes_a:

- `149.154.167.220` — основной fallback IP (использует hermes_a, соединение стабильно)
- `149.154.166.110` — запасной

В Hermes gateway fallback уже встроен: пропиши IP в `extra.fallback_ips` — gateway сам
переключится при недоступности основного домена (в логах будет «sticky fallback IP …»).

### Шаги

1. Владелец создаёт бота через @BotFather (`/newbot`) — получает токен. Свой бот,
   НЕ общий с hermes_a (два gateway не могут long-poll'ить одного бота одновременно).
2. Пропиши в `~/.hermes/.env` (права 600, владелец — ты):
   ```
   TELEGRAM_BOT_TOKEN=<токен>
   TELEGRAM_ALLOWED_USERS=136098453
   TELEGRAM_HOME_CHANNEL=136098453
   ```
3. В `~/.hermes/config.yaml`:
   ```bash
   hermes config set platforms.telegram.enabled true
   hermes config set platforms.telegram.polling true
   hermes config set platforms.telegram.extra.fallback_ips "149.154.167.220,149.154.166.110"
   ```
4. Подними gateway:
   - **Вариант А (есть root/владелец)** — системный юнит, как у hermes_a:
     `/etc/systemd/system/hermes-b-gateway.service`: `User=hermes_b`,
     `ExecStart=/home/hermes_b/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main gateway run`,
     `Restart=always`; затем `systemctl daemon-reload && systemctl enable --now hermes-b-gateway`.
   - **Вариант Б (без root)** — юзер-юнит `~/.config/systemd/user/hermes-gateway.service`
     + `systemctl --user enable --now hermes-gateway`; linger (`sudo loginctl enable-linger hermes_b`)
     пусть включит владелец, иначе gateway умрёт после выхода из сессии.
   В репозитории есть готовый скрипт для варианта А: `setup-hermes-b-telegram.sh`
   (запуск от root: `sudo TELEGRAM_BOT_TOKEN="<токен>" bash setup-hermes-b-telegram.sh` —
   он заодно чинит мост, см. раздел 1).
5. Проверка: напиши боту в Telegram. В логах gateway должно быть
   «sticky fallback IP 149.154.167.220» (или просто успешный long polling).

## 6. Безопасность

- Слушай на `127.0.0.1:38765`, а не `0.0.0.0`: машина имеет публичный IP. Прокси hermes_a
  ходит на localhost — ему bind на 127.0.0.1 не мешает.
- Секрет в пути — только от случайного сканирования. Реальная защита: CORS одним origin'ом,
  валидация команд, ничего деструктивного без подтверждения владельца.
- **Репозиторий ПУБЛИЧНЫЙ: токены, пароли и новые секреты НЕ публиковать никогда.**
  Секретные сегменты путей в инструкции/README не записывай — только в `config.js`
  (там они уже есть) и в свой мост.

---

## Публикация обзоров ИИ-агентов

Те же правила, что в `AGENTS.md` (раздел «Публикация обзоров ИИ-агентов»): раздел
«Источники · ИИ-агенты» на дашборде пополняется карточками в `articles.json` и
HTML-обзорами в `reviews/ai-agents/`. При публикации соблюдать: разрешённые источники
(приоритет 1 — официальные), критерии отбора (без clickbait/paywall/рекламы), процесс
(проверка первоисточника → карточка → обзор → проверка ссылок → один коммит
`content: add/update AI-agent review <slug>`), лимиты (1–3 обзора за цикл, обнаружение
каждые 6–12 часов). Не публиковать секреты и приватные ссылки.
