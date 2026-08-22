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
| `thinkingbox-stateful-workflow-sandbox.html` | Thinkingbox: sandbox и бенчмарк для агентов в stateful-бизнес-процессах, pass@1 против pass^20 (arXiv 2608.19741) |
| `memtrapbench-memory-cognitive-traps.html` | MemTrapBench: когнитивные ловушки памяти — фиксация рассуждений и искажение убеждений (arXiv 2608.20202) |
| `hermes-v0205-keyless-cron-release.html` | Hermes Agent v0.20.5: keyless web-тир, память cron-задач, runtime stall guards |
| `outcome-monitors-silent-tool-failures.html` | Тихие сбои инструментов: outcome-контракты и recovery-квитанции (arXiv 2608.19303) |
| `statemem-evolving-state-memory.html` | Память и изменяющееся состояние: StateMemBench и StateMem (arXiv 2608.19652) |
| `remember-verify-ask-memory-commit.html` | Граница «память—уточнение»: persist / re-verify / ask (arXiv 2608.19564) |
| `preaction-gates-composition.html` | Композиция stateful pre-action gates: remediation-induced coupling, remediate-and-regate, некоммутативность операторов (arXiv 2608.18360) |
| `ledger-claim-evidence-trace-audit.html` | LEDGER: claim-to-evidence trace graphs для аудита LLM-агентов (arXiv 2608.18398) |
| `least-privilege-terminal-mcp-agents.html` | Least-privilege пост-тренинг для terminal и MCP агентов, excess-authority errors (arXiv 2608.18351) |
| `mas-concurrency-control.html` | Конкурентность в мультиагентных системах: сбои как stale reads и lost updates (arXiv 2608.18092, position paper) |
| `finskillbench-reliable-agent-skills.html` | FinSkillBench: оценка доменных навыков агентов, курируемые vs самогенерированные (arXiv 2608.18099) |
| `reversible-forgetting-agent-memory.html` | Обратимое забывание: управление устаревшими знаниями в памяти агента (arXiv 2608.18177) |
| `mcp-web3-attack-surface.html` | Атаки на агентов в Web3: поверхность атак MCP, навыков и вызова инструментов (arXiv 2608.17275) |
| `skilleffect-memory-bounded-tools.html` | SkillEffect: проверяемое выполнение инструментов агента в ограниченной памяти (arXiv 2608.17007) |
| `harnessrisk-harness-safety-benchmark.html` | HarnessRisk: бенчмарк безопасности харнесов по фазам жизненного цикла (arXiv 2608.17597) |
| `fragility-self-improving-agents.html` | Хрупкость self-improving агентов: шум оценки, порядок задач и недоопределённость (arXiv 2608.18066) |
| `blind-curator-skill-retirement.html` | The Blind Curator: предвзятый LLM-судья и молчаливый отказ вывода плохих навыков (arXiv 2607.07436) |
| `authorization-before-context.html` | Authorization before context: граница аудиторий против утечек памяти агента (arXiv 2608.17148) |
| `toward-safe-llm-agents.html` | Безопасность LLM-агентов: обзор спецификации, верификации и enforcement (arXiv 2608.14590) |
| `bounded-agents-delegation-security.html` | Bounded Agents: безопасное делегирование полномочий в мультиагентных системах (arXiv 2608.15888) |
| `hallucination-snowball.html` | Hallucination Snowball: где размещать верификацию в мультиагентных пайплайнах (arXiv 2608.14588) |
| `memorylake-memoryarena-backends.html` | Сравнение бэкендов памяти агентов (MemoryLake, Mem0, vector RAG, long-context) на MemoryArena |
| `agentrewind-recoverable-execution.html` | AgentRewind: чекпойнты и восстановление для долгих задач агентов |
| `agentao-governed-local-first-runtime.html` | Agentao: governed local-first runtime для агентов с инструментами |
| `demystifying-agent-skills.html` | Когда навыки агентов работают, а когда ломаются (arXiv 2608.14036) |
| `hermes-v020-herald-release.html` | Hermes Agent v0.20 «The Herald Release»: голос, проверяемые ответы, A2A, webhooks |
| `icl-session-handover.html` | Передача ICL-состояния между сессиями (arXiv 2608.14528) |
| `hermes-agent-practical-guide.html` | Hermes Agent: локальный агент с памятью, навыками и инструментами |
| `building-effective-ai-agents.html` | Workflows vs agents: паттерны оркестрации (Anthropic) |
| `mcp-for-ai-agents.html` | Model Context Protocol: безопасные интеграции |
| `agent-memory-and-skills.html` | Память и навыки агентов (arXiv + практика Hermes) |
| `agentops-observability-and-evals.html` | AgentOps: наблюдаемость и оценка в production |

Процесс публикации новых обзоров описан в `AGENTS.md` (раздел
«Публикация обзоров ИИ-агентов»).

## Оформление обзоров (Graphic Realism)

- Стиль: https://github.com/Kosetor/graphic-realism-design (дизайн-токены `--mgr-*` из `tokens/tokens.css`).
- Палитра: тёмная bg `#0b0c0e` / card `#1a1d24` / ink `#f4f5f7` / muted `#8b919c` / line `#2e3440`;
  светлая bg `#e8eaef` / card `#ffffff` / ink `#0b0c0e`; акценты volt `#c8f542` и cyan `#0e7490` (≤2 на вид).
- Радиус ≤8px; срезанные углы через `clip-path`; CAPS-лейблы, данные моноширинным; без веб-шрифтов.
- Переключатель темы — кнопка с иконкой `ic-sun-rays.svg` (из `icons/mgr-geometry/`), min-height 44px,
  localStorage, видимый фокус. Эмодзи-иконки запрещены.
- Мобильный: body ≥16px, схемы в колонку, `overflow-wrap:anywhere` для длинных ссылок.
