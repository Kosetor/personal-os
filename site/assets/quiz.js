/* Тест на сайте: выбор темы, ответы, подсчёт, локальная история и отправка отчёта.
   Чистые функции вынесены в QuizCore — их проверяет tests/quiz.test.cjs. */
(function (root) {
  'use strict';
  var DATA_BASE = 'data/tests/';
  var STORE_KEY = 'posl.quiz.attempts';
  var BOT = 'AlicaTrashBot';

  function scoreAnswers(questions, chosen) {
    var score = 0, bits = '', details = [];
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var pick = chosen[i];
      var ok = typeof pick === 'number' && pick === q.answer;
      bits += ok ? '1' : '0';
      if (ok) score++;
      details.push({ i: i, q: q.q, pick: pick, answer: q.answer, correct: ok, explain: q.explain || '' });
    }
    return { score: score, total: questions.length, bits: bits, details: details,
             percent: questions.length ? Math.round(100 * score / questions.length) : 0 };
  }

  function rating(result) {
    if (result.percent >= 90) return 'ok';
    if (result.percent >= 60) return 'mid';
    return 'bad';
  }

  function buildPayload(slug, title, result, startedAt) {
    return { slug: slug, title: title, score: result.score, total: result.total,
             bits: result.bits, percent: result.percent, started_at: startedAt,
             finished_at: new Date().toISOString() };
  }

  /* Компактная строка для Telegram: #quiz <slug> <score>/<total> <биты> */
  function telegramText(payload) {
    return '#quiz ' + payload.slug + ' ' + payload.score + '/' + payload.total + ' ' +
           payload.bits + ' ' + payload.percent + '%';
  }

  function telegramLink(payload) {
    return 'https://t.me/' + BOT + '?text=' + encodeURIComponent(telegramText(payload));
  }

  function readStore() {
    try { return JSON.parse(root.localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return []; }
  }

  function saveAttempt(entry) {
    var all = readStore();
    all.unshift(entry);
    root.localStorage.setItem(STORE_KEY, JSON.stringify(all.slice(0, 50)));
    return all;
  }

  function init() {
    var $ = function (id) { return root.document.getElementById(id); };
    var state = { tests: [], current: null, chosen: [], startedAt: null, result: null };
    var sel = $('topic-select');

    fetch(DATA_BASE + 'index.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('index.json')); })
      .then(function (data) {
        state.tests = (data.tests || []).slice().reverse();
        sel.innerHTML = state.tests.map(function (t) {
          return '<option value="' + t.slug + '">' + t.title + ' · ' + t.count + ' вопросов</option>';
        }).join('');
        var want = new URLSearchParams(root.location.search).get('t');
        if (want && state.tests.some(function (t) { return t.slug === want; })) sel.value = want;
        load(sel.value);
      })
      .catch(function () {
        $('topic-note').textContent = 'Не удалось загрузить список тестов. Проверьте подключение к сети.';
      });

    sel.addEventListener('change', function () { load(sel.value); });

    function load(slug) {
      if (!slug) return;
      fetch(DATA_BASE + slug + '.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('quiz')); })
        .then(function (quiz) {
          state.current = quiz;
          state.chosen = [];
          state.startedAt = new Date().toISOString();
          $('quiz-title').textContent = quiz.title;
          $('questions').innerHTML = quiz.questions.map(function (q, qi) {
            var opts = q.options.map(function (o, oi) {
              return '<label class="opt" data-q="' + qi + '" data-o="' + oi + '">' +
                     '<input type="radio" name="q' + qi + '" value="' + oi + '"><span>' + o + '</span></label>';
            }).join('');
            return '<div class="qwrap" data-q="' + qi + '"><p class="q"><span class="num">' + (qi + 1) + '.</span>' +
                   q.q + '</p>' + opts + '</div>';
          }).join('');
          $('topic-note').textContent = quiz.questions.length + ' вопросов · время не ограничено';
          $('quiz-card').hidden = false;
          $('result-card').hidden = true;
          $('questions').querySelectorAll('input[type=radio]').forEach(function (inp) {
            inp.addEventListener('change', function () {
              state.chosen[Number(inp.name.slice(1))] = Number(inp.value);
            });
          });
        })
        .catch(function () { $('topic-note').textContent = 'Тест для этой темы ещё не готов.'; });
    }

    $('submit').addEventListener('click', function () {
      if (!state.current) return;
      var quiz = state.current;
      var missing = quiz.questions.some(function (_, i) { return typeof state.chosen[i] !== 'number'; });
      if (missing) { $('topic-note').textContent = 'Ответьте на все вопросы — тогда результат попадёт в базу.'; return; }
      var res = scoreAnswers(quiz.questions, state.chosen);
      state.result = res;
      var cls = rating(res);
      $('score').textContent = res.score + ' / ' + res.total;
      $('score').className = 'score ' + cls;
      $('score-note').textContent = res.percent + '% · ' +
        (cls === 'ok' ? 'уверенное знание' : cls === 'mid' ? 'основное усвоено, есть пробелы' : 'тему стоит перечитать');
      $('feedback').innerHTML = res.details.map(function (d) {
        return '<div><p class="q"><span class="num">' + (d.i + 1) + '.</span>' + d.q + '</p>' +
               '<p class="note">' + (d.correct ? '✔ верно' : '✘ выбран вариант ' + (d.pick + 1) +
               ', верный — ' + (d.answer + 1)) + (d.explain ? ' · ' + d.explain : '') + '</p></div>';
      }).join('');
      var wrap = $('questions').querySelectorAll('.qwrap');
      for (var i = 0; i < wrap.length; i++) {
        wrap[i].querySelectorAll('label.opt').forEach(function (l) {
          var qi = Number(l.dataset.q), oi = Number(l.dataset.o);
          if (oi === quiz.questions[qi].answer) l.classList.add('correct');
          else if (state.chosen[qi] === oi) l.classList.add('wrong');
        });
      }
      var payload = buildPayload(quiz.slug, quiz.title, res, state.startedAt);
      saveAttempt(payload);
      renderHistory();
      $('result-card').hidden = false;
      $('result-card').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });

    $('send').addEventListener('click', function () {
      var q = state.current; if (!q || !state.result) return;
      var payload = buildPayload(q.slug, q.title, state.result, state.startedAt);
      root.open(telegramLink(payload), '_blank', 'noopener');
      $('send-note').textContent = 'Открылся Telegram: отправьте сообщение боту — результат попадёт в локальную базу.';
    });

    $('copy').addEventListener('click', function () {
      var q = state.current; if (!q || !state.result) return;
      var payload = buildPayload(q.slug, q.title, state.result, state.startedAt);
      var text = telegramText(payload);
      if (root.navigator.clipboard) {
        root.navigator.clipboard.writeText(text).then(function () {
          $('send-note').textContent = 'Отчёт скопирован: ' + text;
        }, function () { $('send-note').textContent = 'Отчёт: ' + text; });
      } else {
        $('send-note').textContent = 'Отчёт: ' + text;
      }
    });

    $('retry').addEventListener('click', function () {
      if (state.current) load(state.current.slug);
    });

    function renderHistory() {
      var all = readStore();
      if (!all.length) { $('history').innerHTML = '<li class="note">Пока пусто.</li>'; return; }
      $('history').innerHTML = all.slice(0, 12).map(function (a) {
        var d = (a.finished_at || '').slice(0, 16).replace('T', ' ');
        return '<li>' + (a.title || a.slug) + ' — <b>' + a.score + '/' + a.total + '</b> (' + a.percent +
               '%) <span class="badge">' + d + '</span></li>';
      }).join('');
    }
    renderHistory();
  }

  root.QuizCore = { scoreAnswers: scoreAnswers, buildPayload: buildPayload,
                    telegramText: telegramText, telegramLink: telegramLink, rating: rating };
  if (root.document && root.document.getElementById) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
  }
})(typeof window !== 'undefined' ? window : globalThis);
