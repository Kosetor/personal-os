const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../site/assets/home.js'), 'utf8');

async function render(response) {
  const elements = Object.fromEntries(['progress-summary', 'progress-details', 'published-count'].map(id => [id, {}]));
  vm.runInNewContext(source, {
    document: { getElementById: id => elements[id], querySelectorAll: () => Array(5) },
    fetch: async () => response,
  });
  await new Promise(resolve => setImmediate(resolve));
  return elements;
}

test('Published article count stays separate from the public progress snapshot', async () => {
  const elements = await render({ ok:true, json:async()=>({studied:4,total_topics:25,updated:'2026-09-07',upcoming:[]}) });
  assert.equal(elements['published-count'].textContent, '5');
  assert.match(elements['progress-summary'].textContent, /4 из 25/);
  assert.match(elements['progress-details'].textContent, /2026-09-07/);
});

test('A failed fetch cannot appear as zero completed topics', async () => {
  const elements = await render({ ok:false });
  assert.match(elements['progress-summary'].textContent, /недоступен/);
});

test('Malformed progress fails visibly', async () => {
  const elements = await render({ ok:true, json:async()=>({studied:'five',total_topics:25,updated:'unknown'}) });
  assert.match(elements['progress-summary'].textContent, /недоступен/);
});
