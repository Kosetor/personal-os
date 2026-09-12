"""Offline publication checks. No private database or network access required."""
from collections import Counter
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.refs, self.ids = [], set()
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for key in ('src', 'href'):
            if attrs.get(key):
                self.refs.append(attrs[key])


def check():
    errors = []
    pages = {p: Page(p.read_text(encoding='utf-8')) for p in SITE.rglob('*.html')}
    for path, page in pages.items():
        text = path.read_text(encoding='utf-8')
        if re.search(r'<p>#{1,6}\s', text):
            errors.append(f'{path.name}: unrendered Markdown heading')
        if 'тест уже ждёт' in text or 'onclick="markLearned()"' in text:
            errors.append(f'{path.name}: obsolete reading/test flow')
        for ref in page.refs:
            url = urlsplit(ref)
            if url.scheme or url.netloc:
                continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if not target.is_relative_to(SITE):
                errors.append(f'{path.name}: link outside site: {ref}')
                continue
            if target.is_dir():
                target /= 'index.html'
            if not target.is_file():
                errors.append(f'{path.name}: missing target: {ref}')
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                errors.append(f'{path.name}: missing anchor: {ref}')
    articles = set((SITE / 'articles').glob('*.html'))
    archived = {(SITE / urlsplit(ref).path).resolve() for ref in pages[SITE / 'index.html'].refs if ref.startswith('articles/')}
    if archived != articles:
        errors.append('Archive must link to every published article, with no missing articles')
    for article in articles:
        for asset in [SITE / 'assets/audio' / (article.stem + '.mp3'), SITE / 'assets' / ('info-' + article.stem + '.svg')]:
            if not asset.is_file() or asset.stat().st_size == 0:
                errors.append(f'{article.name}: missing or empty media: {asset.name}')
    graph = json.loads((SITE / 'data/knowledge-graph.json').read_text(encoding='utf-8'))
    progress = json.loads((SITE / 'data/progress-public.json').read_text(encoding='utf-8'))
    nodes = graph['nodes']
    ids = {node['id'] for node in nodes}
    counts = Counter(node['status'] for node in nodes)
    if len(ids) != len(nodes) or not set(counts) <= {'green', 'yellow', 'red', 'grey'}:
        errors.append('Duplicate topic IDs or unknown statuses')
    if progress['total_topics'] != len(nodes) or progress['studied'] != len(nodes) - counts['grey']:
        errors.append('Progress totals disagree with graph')
    if Counter({key: value for key, value in progress['by_status'].items() if value}) != counts:
        errors.append('Status counts disagree with graph')
    expected_edges = {(prereq, node['id']) for node in nodes for prereq in node['prereqs']}
    actual_edges = {(edge['from'], edge['to']) for edge in graph['edges']}
    if expected_edges != actual_edges or any(a not in ids or b not in ids for a, b in actual_edges):
        errors.append('Graph edges disagree with prerequisites')
    upcoming = {(item['topic'], item['next_review']) for item in progress['upcoming']}
    scheduled = {(node['id'], node['next_review']) for node in nodes if node.get('next_review')}
    if upcoming != scheduled or progress['next_review_count'] != len(progress['upcoming']):
        errors.append('Review dates disagree with graph')
    if graph['updated'] != progress['updated']:
        errors.append('Graph and progress must be exported together')
    age = (date.today() - date.fromisoformat(progress['updated'])).days
    if age > 2:
        print(f'WARNING: public progress snapshot is {age} days old; verify the private agent before changing results.')
    for path in SITE.rglob('*'):
        if path.is_file() and (path.suffix in {'.db', '.sqlite', '.log', '.key', '.pem'} or path.name.startswith('.env')):
            errors.append(f'Private file cannot be deployed: {path.name}')
    for error in errors:
        print('ERROR:', error)
    print(f'Checked {len(pages)} pages, {len(articles)} articles with media, {len(nodes)} topics. Errors: {len(errors)}')
    return bool(errors)


if __name__ == '__main__':
    sys.exit(check())
