const COLORS = { green: '#3fb950', yellow: '#d29922', red: '#f85149', grey: '#30363d' };
const LABELS = { green: 'закреплено', yellow: 'в работе', red: 'требует внимания', grey: 'не изучено' };

async function loadProgress() {
  const [graph, progress] = await Promise.all(['knowledge-graph', 'progress-public'].map(async name => {
    const response = await fetch(`../data/${name}.json`);
    if (!response.ok) throw new Error('Data unavailable');
    return response.json();
  }));
  const summary = document.getElementById('summary');
  summary.textContent = `По снимку от ${progress.updated}: изучено ${progress.studied} из ${progress.total_topics}. ` +
    `Закреплено: ${progress.by_status.green || 0}. В работе: ${progress.by_status.yellow || 0}. ` +
    'Это не подтверждение прохождения всех тестов.';
  const list = document.getElementById('topics');
  graph.nodes.forEach(topic => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = `${topic.id}. ${topic.label}`;
    const detail = document.createElement('span');
    detail.textContent = `${topic.block} · ${LABELS[topic.status]}` +
      (topic.next_review ? ` · повторение по снимку: ${topic.next_review}` : '');
    item.append(title, detail);
    list.append(item);
  });

  // A full text list remains usable even when the diagram library fails.
  if (typeof d3 === 'undefined') {
    document.getElementById('selection').textContent = 'Диаграмма недоступна. Все темы и статусы доступны в списке ниже.';
    return;
  }
  const width = 900, height = 500;
  const nodes = graph.nodes.map(node => ({ ...node }));
  const links = graph.edges.map(edge => ({ source: edge.from, target: edge.to }));
  const svg = d3.select('#graph').attr('viewBox', `0 0 ${width} ${height}`);
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(node => node.id).distance(85))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('x', d3.forceX(width / 2).strength(0.08))
    .force('y', d3.forceY(height / 2).strength(0.08))
    .force('collide', d3.forceCollide(28));
  const lines = svg.append('g').selectAll('line').data(links).join('line').attr('class', 'link');
  const groups = svg.append('g').selectAll('g').data(nodes).join('g')
    .attr('class', 'node').attr('tabindex', 0).attr('role', 'button')
    .attr('aria-label', node => `${node.id}. ${node.label}: ${LABELS[node.status]}`)
    .on('click', (_, node) => select(node))
    .on('keydown', (event, node) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node); }
    })
    .call(d3.drag()
      .on('start', (event, node) => { if (!event.active) simulation.alphaTarget(0.3).restart(); node.fx = node.x; node.fy = node.y; })
      .on('drag', (event, node) => { node.fx = event.x; node.fy = event.y; })
      .on('end', (event, node) => { if (!event.active) simulation.alphaTarget(0); node.fx = node.fy = null; }));
  groups.append('circle').attr('r', 17).attr('fill', node => COLORS[node.status]);
  groups.append('text').attr('text-anchor', 'middle').attr('dy', '.35em')
    .style('fill', node => node.status === 'grey' ? '#e6edf3' : '#0d1117')
    .text(node => node.id);
  groups.append('title').text(node => `${node.label}: ${LABELS[node.status]}`);
  simulation.on('tick', () => {
    nodes.forEach(node => {
      node.x = Math.max(24, Math.min(width - 24, node.x));
      node.y = Math.max(24, Math.min(height - 24, node.y));
    });
    lines.attr('x1', link => link.source.x).attr('y1', link => link.source.y)
      .attr('x2', link => link.target.x).attr('y2', link => link.target.y);
    groups.attr('transform', node => `translate(${node.x},${node.y})`);
  });
  function select(node) {
    const related = new Set([node.id, ...node.prereqs]);
    links.forEach(link => { if (link.source.id === node.id) related.add(link.target.id); });
    groups.attr('opacity', item => related.has(item.id) ? 1 : 0.25);
    document.getElementById('selection').textContent = `${node.id}. ${node.label} — ${LABELS[node.status]}. ` +
      (node.prereqs.length ? `Предварительные темы: ${node.prereqs.join(', ')}.` : 'Без предварительных тем.');
  }
  document.getElementById('reset-graph').addEventListener('click', () => {
    groups.attr('opacity', 1);
    document.getElementById('selection').textContent = 'Выберите номер темы. Полные названия и статусы — в списке ниже.';
  });
}

loadProgress().catch(() => {
  document.getElementById('summary').textContent = 'Не удалось загрузить прогресс. Обновите страницу позже; результаты не потеряны.';
});
