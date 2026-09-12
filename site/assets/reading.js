// Reading is a browser-local bookmark, never a test result or an FSRS update.
(() => {
  const button = document.getElementById('learnBtn');
  const message = document.getElementById('learnMsg');
  const article = location.pathname.split('/').pop().replace(/\.html$/, '');
  const key = 'pos-read-v2:' + article;
  const explain = 'Отметка сохранена только в этом браузере. Она не передаётся агенту и не означает прохождение теста. Тест на сайте пока недоступен; запросите его у своего обучающего агента.';
  function render(read) {
    button.classList.toggle('done', read);
    button.setAttribute('aria-pressed', String(read));
    button.textContent = read ? '✓ Прочитано · отменить отметку' : 'Отметить как прочитанное';
    message.textContent = read ? explain : 'Тест на сайте пока недоступен. Отметка о чтении остаётся только в этом браузере.';
  }
  let read = false;
  try { read = localStorage.getItem(key) === 'true'; } catch (_) {}
  render(read);
  button.addEventListener('click', () => {
    try {
      if (read) localStorage.removeItem(key);
      else localStorage.setItem(key, 'true');
      read = !read;
      render(read);
    } catch (_) {
      message.textContent = 'Не удалось сохранить отметку: хранилище браузера недоступно. Результаты тестов не изменены.';
    }
  });
})();
