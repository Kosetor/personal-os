# 🤖 Инструкция для ИИ-агента: подключение к дашборду Personal OS

> Этот файл — самодостаточная инструкция. Выполняй шаги по порядку, не задавай лишних вопросов.
> Дашборд: https://kosetor.github.io/personal-os/ · Репозиторий: https://github.com/Kosetor/personal-os

## 1. Контекст

Дашборд «Personal OS» — статический сайт на GitHub Pages. На странице четыре блока:
статусы агентов, форма отправки команды, окно последнего ответа, инфо-блок (погода/IP/время).

Список агентов хранится в файле `config.js` в корне репозитория, в массиве `CONFIG.agents`.
Каждый элемент массива:

```js
{
  id: "hermes-core",        // уникальный id (латиница, kebab-case)
  name: "Hermes Core",      // отображаемое имя на карточке
  avatar: "⚡",              // эмодзи ИЛИ URL картинки (https://...)
  statusUrl: "",            // GET-эндпоинт статуса
  commandUrl: ""            // POST-эндпоинт приёма команд
}
```

Если `statusUrl`/`commandUrl` пустые — дашборд показывает агента в демо-режиме
(случайные статусы, ярлык «демо-режим»). Твоя задача: поднять у себя HTTP-мост
с двумя эндпоинтами и прописать их в `config.js` в объекте со своим `id`.

## 2. Контракт API (соблюдать точно)

### GET {statusUrl}
Ответ: HTTP 200, JSON:
```json
{"status": "active"}
```
Допустимые значения: `active`, `thinking`, `searching`, `inactive`.
Любое другое значение или недоступность эндпоинта = «Не активен» на дашборде.
Маппинг состояний: ожидание/готов → `active`, обработка задачи → `thinking`,
поиск в интернете/базе → `searching`, остановлен → `inactive`.

### POST {commandUrl}
Запрос от дашборда (`Content-Type: application/json`):
```json
{"agent": "hermes-core", "command": "текст команды", "ts": "2026-08-13T05:00:00.000Z"}
```
Ответ: HTTP 200, JSON:
```json
{"reply": "текст ответа, который увидит пользователь"}
```
(поле `message` тоже принимается). Отвечай в течение ~30 секунд; если задача долгая —
сразу верни подтверждение («Принято, выполняю…»), не держи соединение.

### Авторизация команд (обязательно, с 14.08.2026)
Все POST-запросы команд защищены PIN-кодом:
- Заголовок: `X-Auth-Token: <код доступа>`.
- Код хранится у владельца моста в `~/personal-os-bridge/auth_pin.txt` — в репозиторий НЕ коммитить.
- Ответы: `401` — код неверный/отсутствует; `423` — временная блокировка на 10 минут после 5 неудачных попыток.
- `GET {statusUrl}` авторизации НЕ требует.

### Требования транспорта (жёсткие)
- **HTTPS обязателен.** Дашборд открыт по HTTPS, браузер блокирует http:// (mixed content).
- **CORS обязателен.** Заголовок `Access-Control-Allow-Origin: https://kosetor.github.io` (или `*`).
  POST с JSON вызывает preflight `OPTIONS` — он тоже должен обрабатываться.
- Дашборд опрашивает `statusUrl` каждые 15 секунд — эндпоинт должен быть дешёвым и быстрым.

## 3. Референсная реализация моста (Python + FastAPI)

Если у тебя нет HTTP-интерфейса, подними мост на своём VPS/в своём контейнере:

```python
# bridge.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

AGENT_ID = "hermes-core"           # замени на свой id из config.js
SECRET = "x9q7-change-me-long"     # длинный случайный сегмент пути

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kosetor.github.io"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

state = {"status": "active"}

@app.get(f"/{AGENT_ID}/{SECRET}/status")
def get_status():
    return {"status": state["status"]}

@app.post(f"/{AGENT_ID}/{SECRET}/command")
async def post_command(req: Request):
    data = await req.json()
    command = data.get("command", "")
    state["status"] = "thinking"
    try:
        reply = handle_command(command)   # ← здесь вызов твоей реальной логики
    except Exception as e:
        reply = f"Ошибка выполнения: {e}"
    finally:
        state["status"] = "active"
    return {"reply": reply}

def handle_command(text: str) -> str:
    # TODO: связать с циклом агента (очередь задач, вызов LLM и т.п.)
    return f"Команда получена: {text}"

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765)
```

Публикация наружу по HTTPS (выбери один вариант):
- **Tailscale Funnel:** `tailscale funnel --bg 8765` → адрес вида `https://<host>.<tailnet>.ts.net`
- **Caddy:** `agents.example.com { reverse_proxy 127.0.0.1:8765 }` — TLS-сертификат выпустится автоматически
- **nginx + certbot** — вручную, аналогично

> ℹ️ **В этой сети уже работает Tailscale Funnel:** стабильный хост
> `https://hermes1-gp66-leopard-11ug.tail4e12e3.ts.net` (Funnel `/` → локальный прокси,
> который разводит `/hermes-core/*` и `/hermes-agent/*`). Хост в `config.js` ведёт
> супервизор hermes_a — свои `statusUrl`/`commandUrl` меняй только в части пути
> `/hermes-core/<секрет>/...`, хост не трогай. См. `AGENTS-HERMES-B.md`.

⚠️ **Безопасность — честно:** `config.js` лежит в публичном репозитории, поэтому URL эндпоинтов
увидит любой желающий. Секретный сегмент пути защищает только от случайного сканирования.
Реальная защита: ограничение CORS одним origin'ом (блокирует чужие сайты, но не curl),
rate-limiting на мосту, валидация команд по белому списку и запрет на деструктивные
действия без подтверждения владельца. Токены и пароли в `config.js` НЕ класть никогда.

## 4. Регистрация в config.js (как поправить файл)

### Вариант А — через GitHub API (предпочтительно для агента)
1. Получи у владельца fine-grained PAT: доступ только к репозиторию `personal-os`,
   permission `Contents: Read and write`. Храни токен в секрет-хранилище, не в коде.
2. Прочитай текущий файл:
   ```
   GET https://api.github.com/repos/Kosetor/personal-os/contents/config.js
   Authorization: Bearer <PAT>
   ```
   Из ответа возьми `sha` и декодируй `content` из base64.
3. В декодированном тексте найди в `CONFIG.agents` объект со своим `id` (если нет — добавь новый
   по образцу из раздела 1) и пропиши свои `statusUrl` и `commandUrl`.
4. Отправь обновление:
   ```
   PUT https://api.github.com/repos/Kosetor/personal-os/contents/config.js
   Authorization: Bearer <PAT>
   ```
   ```json
   {
     "message": "Connect <agent-id> to dashboard",
     "content": "<base64 нового config.js>",
     "sha": "<sha из шага 2>",
     "branch": "main"
   }
   ```
5. GitHub Pages пересоберёт сайт за 1–2 минуты — изменения видны не мгновенно.

### Вариант Б — через git
`git clone` → правка `config.js` → `commit` → `push` в `main` (нужен ключ или PAT).

Правила правки: меняй ТОЛЬКО свой объект в `CONFIG.agents`. Не трогай остальной код,
форматирование и других агентов. Помни: это JS-файл, а не JSON — комментарии в нём законны.

## 5. Проверка подключения

1. `curl https://<твой-хост>/<id>/<secret>/status` → `{"status":"active"}`
2. `curl -X POST https://<твой-хост>/<id>/<secret>/command -H 'Content-Type: application/json' \
     -d '{"agent":"<id>","command":"ping","ts":"2026-08-13T05:00:00Z"}'` → `{"reply":...}`
3. Через 1–2 минуты после пуша открой https://kosetor.github.io/personal-os/ (обнови с Ctrl+F5):
   - на твоей карточке нет ярлыка «демо-режим», статус соответствует реальному;
   - отправь себе команду через блок «Обратная связь» → ответ появится в блоке «Последний ответ».
4. Если что-то не так — консоль браузера (F12) подскажет причину (см. таблицу ниже).

## 6. Частые ошибки

| Симптом | Причина | Решение |
|---|---|---|
| Статус всегда «Не активен» | http:// вместо https:// | Подними TLS (Tailscale Funnel / Caddy) |
| CORS-ошибка в консоли | Нет `Access-Control-Allow-Origin` | Добавь CORS-middleware, разреши origin дашборда |
| Команда не уходит, OPTIONS 405 | Не обрабатывается preflight | Разреши метод OPTIONS |
| «Не активен» при живом агенте | status не из списка допустимых | Верни одно из: active / thinking / searching / inactive |
| Правка config.js не видна на сайте | Pages ещё собирается | Подожди 1–2 мин, обнови с Ctrl+F5 |
| Ответ не появляется | Мост думает дольше ~30 сек | Возвращай подтверждение сразу, результат — отдельно |
