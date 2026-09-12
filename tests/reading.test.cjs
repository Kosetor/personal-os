const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../site/assets/reading.js'), 'utf8');

function page(slug, values = new Map(), blocked = false) {
  const button = { classList: { toggle() {} }, setAttribute() {}, addEventListener(_, callback) { this.click = callback; } };
  const message = {};
  vm.runInNewContext(source, {
    location: { pathname: '/personal-os/articles/' + slug + '.html' },
    document: { getElementById: id => id === 'learnBtn' ? button : message },
    localStorage: {
      getItem(key) { if (blocked) throw Error(); return values.get(key); },
      setItem(key, value) { if (blocked) throw Error(); values.set(key, value); },
      removeItem(key) { if (blocked) throw Error(); values.delete(key); },
    },
  });
  return { button, message };
}

test('Two articles read on the same day stay independent and survive reload', () => {
  const values = new Map();
  page('one', values).button.click();
  assert.match(page('one', values).button.textContent, /Прочитано/);
  assert.doesNotMatch(page('two', values).button.textContent, /Прочитано/);
  page('two', values).button.click();
  page('one', values).button.click();
  assert.equal(values.has('pos-read-v2:one'), false);
  assert.equal(values.get('pos-read-v2:two'), 'true');
});

test('Blocked storage reports failure without claiming saved progress', () => {
  const { button, message } = page('one', new Map(), true);
  button.click();
  assert.match(message.textContent, /Не удалось сохранить/);
  assert.doesNotMatch(button.textContent, /Прочитано/);
});

test('Legacy daily marks cannot be mistaken for article or test completion', () => {
  const { button, message } = page('one', new Map([['pos-learned', '{"2026-09-12":true}']]));
  assert.doesNotMatch(button.textContent, /Прочитано/);
  assert.match(message.textContent, /Тест на сайте пока недоступен/);
});
