const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = readFileSync(path.join(__dirname, '../site/assets/quiz.js'), 'utf8');

function load() {
  const sandbox = { document: {}, navigator: {}, location: { search: '' }, localStorage: null };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox);
  return sandbox.QuizCore;
}

const QUESTIONS = [
  { q: 'Первый?', options: ['a', 'b', 'c', 'd'], answer: 2, explain: 'потому что c' },
  { q: 'Второй?', options: ['a', 'b', 'c'], answer: 0, explain: '' },
];

test('Scoring counts correct answers and builds the bit string', () => {
  const core = load();
  const r = core.scoreAnswers(QUESTIONS, [2, 1]);
  assert.equal(r.score, 1);
  assert.equal(r.total, 2);
  assert.equal(r.bits, '10');
  assert.equal(r.percent, 50);
  assert.equal(r.details[0].correct, true);
  assert.equal(r.details[1].correct, false);
});

test('Unanswered question never counts as correct', () => {
  const core = load();
  const r = core.scoreAnswers(QUESTIONS, [undefined, 0]);
  assert.equal(r.score, 1);
  assert.equal(r.bits, '01');
});

test('Rating thresholds separate confident, partial and weak results', () => {
  const core = load();
  assert.equal(core.rating({ percent: 100 }), 'ok');
  assert.equal(core.rating({ percent: 60 }), 'mid');
  assert.equal(core.rating({ percent: 20 }), 'bad');
});

test('Report line carries slug, score and bits for the local database', () => {
  const core = load();
  const payload = core.buildPayload('analiz-riskov', 'Анализ рисков',
    core.scoreAnswers(QUESTIONS, [2, 0]), '2026-09-22T10:00:00Z');
  assert.equal(payload.slug, 'analiz-riskov');
  assert.equal(payload.score, 2);
  assert.equal(payload.bits, '11');
  const text = core.telegramText(payload);
  assert.match(text, /^#quiz analiz-riskov 2\/2 11 100%$/);
  assert.match(core.telegramLink(payload), /^https:\/\/t\.me\/AlicaTrashBot\?text=/);
});
