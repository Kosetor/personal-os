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
| `evoundo-recoverability-self-evolution.html` | EvoUndo: самоизменение агента должно быть откатываемым — recoverability как отдельная проверка, 0/197 → 191/197 (arXiv 2608.28363) |
| `longpibench-long-context-prompt-injection.html` | LongPIBench: prompt injection в длинном контексте — короткопромптовые оценки защит завышены (arXiv 2608.28411) |
| `geniac-secbench-iac-security.html` | GenIaC-SecBench: IaC от LLM в 3,2–3,9 раза хуже человека по безопасности — первый human-anchored бенчмарк (arXiv 2608.28021) |
| `skillstate-mutable-execution-state.html` | SKILL.state: явное изменяемое состояние исполнения вместо растущего контекста — точность выше, токенов меньше (arXiv 2608.26263) |
| `sara-action-induction-authorization.html` | SARA: когда вывод тула становится командой — разделение индукции действия и авторизации исполнения, ASR ≤ 0,63% (arXiv 2608.27146) |
| `dumatebench-real-world-workflows.html` | DuMateBench: 200 задач из реальных продакшн-сессий, три формы сложности среды, разрывы в строгой завершаемости (arXiv 2608.26546) |
| `phoenix-v2040-mcp-observability.html` | Phoenix 20.4: in-process MCP-тулсет для агентов, AI Query к trace filter DSL, retrieval relevance evaluator (release notes) |
| `wikiskill-persistent-knowledge-skill-evolution.html` | WikiSkill: компиляция опыта агента в персистентную базу знаний — навыки переносимы между моделями, чужие навыки могут быть лучше своих (arXiv 2608.27454) |
| `persona-execution-separation.html` | Persona-Execution Separation: персона и исполнение в разных trust-доменах под execution audit, governed contract bridge (arXiv 2608.27427) |
| `spa-plan-first-information-flow-control.html` | SPA: защита персистентных агентов между запросами — plan-first архитектура и dual-lattice IFC, tool_knowledge 0%/0,2% (arXiv 2608.27234) |
| `pilot-live-self-improvement.html` | PILOT in the Loop: live self-improvement для long-horizon агентов — супервизор перенаправляет воркера на лету, дистилляция процедур и сбоев в навыки и память (arXiv 2608.26530) |
| `agent-mesh-delegation-reliability.html` | Agent Mesh: примитивы надёжности делегирования — 147 инцидентов продакшена против retry/timeout, identity adequacy и evidence adequacy (arXiv 2608.26225) |
| `context-privilege-escalation-harness.html` | When Context Gets Root: instruction privilege escalation в LLM-харнесах — 13/13 целей атак (arXiv 2608.27299) |
| `toolcall-rate-representation-steering.html` | Tunable Tool-Call Rates: направление в residual stream управляет частотой вызова тулов — 0→90%+, QA 0,29→0,56 (arXiv 2608.25198) |
| `routed-graph-handoff.html` | Routed Graph Handoff: роутер выбирает формат передачи между агентами — граф или текст, до 3,2× компрессии (arXiv 2608.25277) |
| `hips-personalized-memory-strategy.html` | HiPS: иерархическая персонализация стратегии памяти агента — глобальные принципы + правила пользователя (arXiv 2608.25329) |
| `feedback-backfires-tool-failure-loops.html` | Обратная связь, которая вредит: агент повторяет упавший вызов — 0,06 → 0,54, runtime-описание сбоя убирает 76% (arXiv 2608.23651) |
| `toolrobustbench-tool-calling-diagnostics.html` | ToolRobustBench: стадийная диагностика сбоев tool-calling — узкое место — выход тула, неаддитивность семейств (arXiv 2608.23635) |
| `callability-not-operability-agent-first-tooling.html` | Callability ≠ Operability: интерфейс тула и Agent-First Tooling (AFT), AFT-Bench (arXiv 2608.23628) |
| `render-reader-facing-memory-evidence.html` | RENDER: reader-facing рендеринг памяти меняет результаты оценки — 42,4–72,6 п.п., 0% → 45–53% при смене формата (arXiv 2608.23568) |
| `evidence-carrying-termination-tool-use.html` | Когда агенту можно остановиться: evidence-carrying termination — 0/288 небезопасных завершений против 252/288 у критика (arXiv 2608.23623) |
| `automata-agent-traces-failure-monitoring.html` | Автоматы из трасс агента: компактный FSM для предсказания следующего шага и отказов, AUROC до 0,94, ранняя остановка (arXiv 2608.23670) |
| `agentic-scaffolding-sycophancy-amplification.html` | Agentic Scaffolding: scaffolding агентных систем усиливает сикофантию, точность −6,3 п.п., сильнее у способных моделей (arXiv 2608.21377) |
| `schemarouter-field-aware-tool-routing.html` | SchemaRouter: field-aware маршрутизация тулов в гетерогенном агентном RAG — 227 токенов вместо 2066, provenance в 62% ответов (arXiv 2608.21375) |
| `agentic-tool-unlearning-recovery.html` | Agentic Tool Unlearning: «забытое» в весах возвращается тулами (tool-mediated recovery), ATU = unlearning + trajectory-level RL (arXiv 2608.21544) |
| `mcp-universe-rl-training-tool-use.html` | MCP-Universe RL: RL-обучение tool-use агентов — MCP-серверы как окружение тренировки, оркестрация сред и rollout (arXiv 2608.22167) |
| `repo2skill-evo-stale-skills.html` | Repo2Skill-Evo: навыки репозиториев устаревают молча, даже frontier-агенты не справляются с обслуживанием (arXiv 2608.21964) |
| `collaboration-tax-multi-agent-cost.html` | Collaboration Tax: измеримая цена координации мультиагентных систем, четырёхстадийный каскад (arXiv 2608.22152) |
| `aces-continuous-skill-evaluation.html` | ACES: непрерывная оценка навыков живым агентом — парные live-прогоны, ATIF, Skill Lift (arXiv 2608.20614) |
| `skill-representation-retrieval-harness.html` | Представление навыка в промпте управляет выбором: tool-skills vs workflow-skills, лексическая конкуренция (arXiv 2608.20389) |
| `aegis-mcp-resource-abuse.html` | AEGIS: ресурсные лимиты для MCP-инструментов — модальности, OPA, ContextForge (arXiv 2608.20481) |
| `midtool-agentic-tool-use-midtraining.html` | MidTool: mid-training для агентного tool use — синтез данных из API, MCP-навыков и документных воркфлоу (arXiv 2608.20314) |
| `task-model-induction-computer-use-traces.html` | TMI: индукция символических аудируемых моделей задач из компьютерных трасс — скриншоты, мышь, клавиатура (arXiv 2608.20319) |
| `learning-when-to-think-adaptive-reasoning.html` | Learning When to Think: адаптивное выделение compute — NoThink/Short/Long, до 76% меньше токенов (arXiv 2608.20256) |
| `phantom-gains-self-improvement-audit.html` | Phantom Gains: аудит self-improvement против измеренного нуля — семь измерительных артефактов, замороженный контроль, per-problem exact test под FDR (arXiv 2608.20290) |
| `cross-task-skill-transfer-induction.html` | Переносимость индуцированных навыков: task-level vs subtask-level, текст vs код, skill utility score (arXiv 2608.20274) |
| `ai4ai-bench-recursive-self-improvement.html` | AI4AI-Bench: бенчмарк RSI — умеет ли агент переписывать тренировочный алгоритм (arXiv 2608.20318) |
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
