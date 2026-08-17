# Обзоры ИИ-агентов (reviews/ai-agents)

Русскоязычные расширенные HTML-обзоры полезных источников по ИИ-агентам.
Каждая карточка на дашборде (`articles.json`) ссылается на файл из этого
каталога через поле `reviewUrl` (относительный путь от корня GitHub Pages).

## Правила каталога

- Slug: латиница, kebab-case (например `langgraph-production-agents.html`).
- Файл — автономная статическая HTML-страница: без внешних библиотек,
  шрифтов и скриптов; стили локальные; `prefers-color-scheme` приветствуется.
- Язык — русский. Объём — 600–1500 слов.
- Обязательные секции: суть, почему важно, практическое применение,
  ограничения и риски, как применить к вашему ИИ-агенту,
  первичные материалы.
- Каждая страница содержит ссылку на первоисточник
  (`target="_blank" rel="noopener noreferrer"`) и ссылку «← Вернуться в Personal OS».
- В тексте различать «Документировано источником» и
  «Практическая интерпретация для Personal OS».
- Никаких секретов, токенов, приватных ссылок.

## Текущие обзоры

| Файл | Тема |
|---|---|
| `hermes-v020-herald-release.html` | Hermes Agent v0.20 «The Herald Release»: голос, проверяемые ответы, A2A, webhooks |
| `icl-session-handover.html` | Передача ICL-состояния между сессиями (arXiv 2608.14528) |
| `hermes-agent-practical-guide.html` | Hermes Agent: локальный агент с памятью, навыками и инструментами |
| `building-effective-ai-agents.html` | Workflows vs agents: паттерны оркестрации (Anthropic) |
| `mcp-for-ai-agents.html` | Model Context Protocol: безопасные интеграции |
| `agent-memory-and-skills.html` | Память и навыки агентов (arXiv + практика Hermes) |
| `agentops-observability-and-evals.html` | AgentOps: наблюдаемость и оценка в production |

Процесс публикации новых обзоров описан в `AGENTS.md` (раздел
«Публикация обзоров ИИ-агентов»).
