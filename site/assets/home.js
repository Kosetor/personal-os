(() => {
  const summary = document.getElementById('progress-summary');
  const details = document.getElementById('progress-details');
  const archive = document.querySelectorAll('.links li');
  document.getElementById('published-count').textContent = String(archive.length);
  fetch('data/progress-public.json').then(response => {
    if (!response.ok) throw new Error('Progress unavailable');
    return response.json();
  }).then(progress => {
    if (!Number.isInteger(progress.studied) || !Number.isInteger(progress.total_topics) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(progress.updated)) throw new Error('Invalid progress');
    summary.textContent = `Изучено по снимку прогресса: ${progress.studied} из ${progress.total_topics}`;
    details.textContent = `Обновлено: ${progress.updated}. Это снимок, а не текущий результат тестирования. ` +
      'Прохождение всех тестов по этим данным подтвердить нельзя.';
    const due = (progress.upcoming || []).filter(item => item.next_review <= new Date().toLocaleDateString('sv-SE'));
    if (due.length) details.textContent += ` В снимке есть повторения со сроком на сегодня или ранее: ${due.length}.`;
  }).catch(() => {
    summary.textContent = 'Прогресс временно недоступен';
    details.textContent = 'Не удалось загрузить данные. Обновите страницу позже; это не означает нулевой прогресс.';
  });
})();
