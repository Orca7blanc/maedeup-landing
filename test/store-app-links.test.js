import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildSalesHome} from '../src/sales-home.js';
import {ANALYTICS_SCRIPT} from '../src/anonymous-analytics.js';

const appSource = readFileSync(new URL('../public/store-app-links.js', import.meta.url), 'utf8');
const readSource = readFileSync(new URL('../public/read.js', import.meta.url), 'utf8');
const home = buildSalesHome(readFileSync(new URL('../public/index.html', import.meta.url), 'utf8'));
const ebook = readFileSync(new URL('../public/read.html', import.meta.url), 'utf8');
const KY_PAPER = 'https://product.kyobobook.co.kr/detail/S000220619545';
const KY_EBOOK = 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298635';
const YES_PAPER = 'https://www.yes24.com/product/goods/193866498';
const YES_EBOOK = 'https://m.yes24.com/goods/detail/194173626';
const RIDI_EBOOK = 'https://ridibooks.com/books/5273014881';
const supported = [RIDI_EBOOK, KY_EBOOK, YES_EBOOK, KY_PAPER, YES_PAPER];
const campaign = '?utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=C';

// A small DOM model exercises element ownership, selector filtering and the
// real delegated analytics handler; no external browser/DOM dependency needed.
class Element {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.attributes = {}; this.parentElement = null; this.textContent = ''; }
  setAttribute(name, value) {
    const text = String(value);
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = text;
    else this.attributes[name] = text;
  }
  getAttribute(name) {
    return name.startsWith('data-') ? this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] ?? null : this.attributes[name] ?? null;
  }
  get className() { return this.getAttribute('class') || ''; }
  set className(value) { this.setAttribute('class', value); }
  get id() { return this.getAttribute('id') || ''; }
  set id(value) { this.setAttribute('id', value); }
  get href() { return this.getAttribute('href') || ''; }
  set href(value) { this.setAttribute('href', value); }
  get rel() { return this.getAttribute('rel') || ''; }
  set rel(value) { this.setAttribute('rel', value); }
  append(...nodes) { for (const node of nodes) { if (node.parentElement) node.parentElement.children.splice(node.parentElement.children.indexOf(node), 1); this.children.push(node); node.parentElement = this; } }
  replaceWith(node) { const parent = this.parentElement; const index = parent.children.indexOf(this); parent.children[index] = node; node.parentElement = parent; this.parentElement = null; }
  matches(selector) {
    const tag = selector.match(/^[a-z]+/i)?.[0];
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    const id = selector.match(/#([\w-]+)/)?.[1];
    if (id && this.id !== id) return false;
    for (const [, cls] of selector.matchAll(/\.([\w-]+)/g)) if (!this.className.split(/\s+/).includes(cls)) return false;
    for (const [, attr] of selector.matchAll(/\[([\w-]+)\]/g)) if (this.getAttribute(attr) === null) return false;
    return true;
  }
  closest(selector) { for (let el = this; el; el = el.parentElement) if (selector.split(',').some(s => el.matches(s.trim()))) return el; return null; }
  querySelectorAll(selector) {
    const found = [];
    const visit = node => { for (const child of node.children) { if (selector.split(',').some(s => child.matches(s.trim()))) found.push(child); visit(child); } };
    visit(this); return found;
  }
}

function browser({platform = 'android', page = 'home', extra = [], analytics = false, search = campaign} = {}) {
  const root = new Element('html'), head = new Element('head'), body = new Element('body'), purchase = new Element('section'), grid = new Element('div');
  purchase.id = page === 'home' ? 'read' : 'stores'; grid.className = page === 'home' ? 'shopgrid' : 'store-grid';
  root.append(head, body); body.append(purchase); purchase.append(grid);
  const links = [];
  for (const [, attrs] of (page === 'home' ? home : ebook).matchAll(/<a\s+([^>]+)>/g)) {
    const el = new Element('a');
    for (const [, name, value] of attrs.matchAll(/([\w-]+)="([^"]*)"/g)) el.setAttribute(name, value.replaceAll('&amp;', '&'));
    if (!el.matches(page === 'home' ? 'a.shop[data-track]' : 'a.store[data-track]')) continue;
    links.push(el); grid.append(el);
  }
  for (const url of extra) { const el = new Element('a'); el.className = 'shop'; el.href = url; el.dataset.track = 'unknown'; grid.append(el); links.push(el); }
  const listeners = {}, events = [];
  const document = {
    head, body, readyState: 'complete', visibilityState: 'visible', referrer: '',
    createElement: tag => new Element(tag),
    getElementById: id => root.querySelectorAll('#' + id)[0] || null,
    querySelectorAll: selector => root.querySelectorAll(selector),
    querySelector: selector => selector === '#read .buy-panel, #stores' ? (page === 'read' ? purchase : null) : root.querySelectorAll(selector)[0] || null,
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); }
  };
  const nav = {
    android: {userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/145.0 Mobile', platform: 'Linux armv8l', maxTouchPoints: 5},
    iphone: {userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', platform: 'iPhone', maxTouchPoints: 5},
    ipad: {userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 5},
    desktop: {userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/145.0', platform: 'Win32', maxTouchPoints: 0}
  }[platform];
  const storage = () => { const data = new Map(); return {getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value)}; };
  let sequence = 0;
  const context = vm.createContext({document, window: {}, navigator: {...nav, doNotTrack: '0', webdriver: false}, location: {pathname: page === 'home' ? '/' : '/read', search}, URLSearchParams, URL, Blob, Date, localStorage: storage(), sessionStorage: storage(), crypto: {randomUUID: () => 'test-id-' + ++sequence}, matchMedia: () => ({matches: false}), setInterval() {}, addEventListener() {}, fetch(_url, init) { events.push(...JSON.parse(init.body).events); return Promise.resolve(); }});
  if (analytics) vm.runInContext(ANALYTICS_SCRIPT.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''), context);
  if (page === 'read') vm.runInContext(readSource, context);
  const initial = links.map(el => ({el, href: el.href, target: el.getAttribute('target'), track: el.dataset.track}));
  const run = () => vm.runInContext(appSource, context);
  const apps = () => root.querySelectorAll('.store-app-action');
  const click = el => { for (const listener of listeners.click || []) listener({target: el}); };
  return {root, grid, document, links, initial, run, apps, events, click};
}

function assertAppRoute(app, web, platform) {
  if (web.href === RIDI_EBOOK) {
    assert.equal(platform, 'android', 'RIDI native routing is verified only for Android');
    assert.equal(app.href, 'intent://ContentsHome/5273014881/share#Intent;scheme=ridi;package=com.initialcoms.ridi;S.browser_fallback_url=' + encodeURIComponent(RIDI_EBOOK) + ';end');
    assert.equal(decodeURIComponent(app.href.match(/S\.browser_fallback_url=([^;]+)/)[1]), RIDI_EBOOK);
    return;
  }
  if (web.href === KY_EBOOK || web.href === KY_PAPER) {
    const outer = new URL(app.href);
    assert.equal(outer.origin, 'https://apps.kyobobook.co.kr');
    assert.equal(outer.pathname, '/api/v1/click/53ZVm7lpXE2DBPo45wUhTw/ZVGe11UKI0iOYYg0gDMeWw');
    assert.deepEqual([...outer.searchParams.keys()], ['deeplink_custom_path']);
    assert.equal(outer.hash, '');
    const inner = new URL(outer.searchParams.get('deeplink_custom_path'));
    assert.equal(inner.protocol, 'kyobobook:');
    assert.equal(inner.hostname, 'webview');
    assert.deepEqual([...inner.searchParams.keys()], ['url']);
    assert.equal(inner.searchParams.get('url'), web.href);
    assert.equal(inner.hash, '');
    return;
  }
  // YES24 expectations are specified independently of the production script.
  const route = 'MAIN?returnUrl=' + encodeURIComponent(web.href);
  if (platform === 'android') {
    assert.equal(app.href, 'intent://' + route + '#Intent;scheme=YES24;package=com.yes24.commerce;S.browser_fallback_url=' + encodeURIComponent(web.href) + ';end');
    assert.equal(decodeURIComponent(app.href.match(/S\.browser_fallback_url=([^;]+)/)[1]), web.href);
  } else assert.equal(app.href, 'YES24://' + route);
}

test('desktop visitors retain the original store actions and no mobile UI', () => {
  const b = browser({platform: 'desktop'}); b.run();
  assert.equal(b.apps().length, 0);
  assert.equal(b.root.querySelectorAll('.store-app-option').length, 0);
  assert.equal(b.document.getElementById('store-app-style'), null);
  for (const {el} of b.initial) assert.equal(el.parentElement, b.grid);
});

test('Android uses Kyobo dispatcher, the exact RIDI ContentsHome book route, and YES24 intent fallback', () => {
  const b = browser(); b.run();
  assert.equal(b.apps().length, 5);
  for (const app of b.apps()) {
    const web = app.parentElement.children[0];
    assert.ok(supported.includes(web.href));
    assertAppRoute(app, web, 'android');
    assert.equal(app.dataset.track, web.dataset.track);
  }
});

for (const platform of ['iphone', 'ipad']) test(`${platform} exposes direct app links alongside usable original web links`, () => {
  const b = browser({platform}); b.run();
  assert.equal(b.apps().length, 4);
  for (const app of b.apps()) {
    const web = app.parentElement.children[0];
    assertAppRoute(app, web, platform);
    assert.equal(web.children.filter(el => el.className === 'store-web-label')[0]?.textContent, '웹에서 구매');
  }
  assert.match(b.document.getElementById('store-app-help').textContent, /앱이 열리지 않으면/);
  const ridi = b.links.find(web => web.href === RIDI_EBOOK);
  assert.equal(ridi.parentElement, b.grid, 'unverified iOS RIDI native route is not exposed');
  assert.equal(ridi.dataset.appEnhanced, undefined);
});

test('official app routes do not forward landing attribution, personal data or arbitrary query parameters', () => {
  const b = browser({search: campaign + '&email=private%40example.test&token=secret&next=https%3A%2F%2Fevil.example'}); b.run();
  for (const app of b.apps()) {
    assertAppRoute(app, app.parentElement.children[0], 'android');
    const readable = decodeURIComponent(decodeURIComponent(app.href));
    assert.doesNotMatch(readable, /utm_|private|secret|evil\.example|email=|token=/);
  }
});

test('both landing pages load the revised app script and read attribution runs first', () => {
  for (const html of [home, ebook]) {
    assert.match(html, /<script src="\/store-app-links\.js\?v=20261020" defer><\/script>/);
    assert.doesNotMatch(html, /store-app-links\.js\?v=20261019/);
  }
  assert.ok(ebook.indexOf('<script src="/read.js" defer>') < ebook.indexOf('<script src="/store-app-links.js'));
});

test('enhancement preserves original web destinations, target behavior and attribution', () => {
  const b = browser(); b.run();
  for (const {el, href, target, track} of b.initial) {
    assert.equal(el.href, href); assert.equal(el.getAttribute('target'), target); assert.equal(el.dataset.track, track);
  }
});

test('/read retains its real runtime campaign suffix exactly once', () => {
  const b = browser({page: 'read'}); b.run();
  assert.equal(b.apps().length, 3);
  assert.deepEqual(b.apps().map(el => el.dataset.track), ['ebook_bookstore_ridi_C', 'ebook_bookstore_kyobo_C', 'ebook_bookstore_yes24_C']);
  for (const app of b.apps()) assert.equal(app.dataset.track, app.parentElement.children[0].dataset.track);
});

for (const platform of ['iphone', 'ipad']) test(`/read on ${platform} keeps RIDI web-only`, () => {
  const b = browser({page: 'read', platform}); b.run();
  assert.equal(b.apps().length, 2);
  assert.deepEqual(b.apps().map(el => el.dataset.track), ['ebook_bookstore_kyobo_C', 'ebook_bookstore_yes24_C']);
  const ridi = b.links.find(web => web.href === RIDI_EBOOK);
  assert.equal(ridi.parentElement, b.grid);
  assert.equal(ridi.dataset.track, 'ebook_bookstore_ridi_C');
});

test('unknown and query-modified destinations never receive an app action', () => {
  const extra = ['https://evil.example/?next=' + encodeURIComponent(KY_PAPER), KY_PAPER + '?next=https://evil.example', 'https://product.kyobobook.co.kr/detail/S000000000000', 'https://ridibooks.com/books/1', RIDI_EBOOK + '?next=https://evil.example'];
  const b = browser({extra}); b.run();
  assert.equal(b.apps().length, 5);
  for (const el of b.links.slice(-extra.length)) { assert.equal(el.parentElement, b.grid); assert.equal(el.dataset.appEnhanced, undefined); }
});

test('repeated initialization creates no duplicate links, helper or style', () => {
  const b = browser(); b.run(); const originalApps = b.apps(); b.run();
  assert.deepEqual(b.apps(), originalApps);
  assert.equal(b.root.querySelectorAll('.store-app-option').length, 5);
  assert.equal(b.root.querySelectorAll('#store-app-help').length, 1);
  assert.equal(b.root.querySelectorAll('#store-app-style').length, 1);
  for (const app of b.apps()) assert.equal(app.parentElement.children[0].children.filter(el => el.className === 'store-web-label').length, 1);
});

test('the real delegated analytics records one attributed outbound event per app click', () => {
  const b = browser({analytics: true}); b.run(); b.run();
  b.events.length = 0;
  for (const app of b.apps()) b.click(app);
  assert.equal(b.events.length, 5);
  assert.deepEqual(b.events.map(event => event.target), b.apps().map(app => app.dataset.track));
  assert.ok(b.events.every(event => event.eventType === 'click' && event.adVariant === 'C' && event.utmCampaign === 'maedeup_book1'));
  assert.equal(new Set(b.events.map(event => event.sessionId)).size, 1);
});
