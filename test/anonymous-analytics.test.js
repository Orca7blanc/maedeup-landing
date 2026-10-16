import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {ANALYTICS_SCRIPT} from '../src/anonymous-analytics.js';
import {ebookReturnUrl} from '../src/ebook-landing.js';
import {buildSalesHome} from '../src/sales-home.js';

const source = ANALYTICS_SCRIPT.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
const campaignQuery = variant => `utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=${variant}`;
const expectedAttribution = variant => ({utmSource: 'meta', utmMedium: 'paid_social', utmCampaign: 'maedeup_book1', adVariant: variant});
const attribution = event => Object.fromEntries(['utmSource', 'utmMedium', 'utmCampaign', 'adVariant'].map(key => [key, event[key]]));
const emptyAttribution = {utmSource: '', utmMedium: '', utmCampaign: '', adVariant: ''};

function browser() {
  const local = new Map(), session = new Map(), events = [], requests = [];
  let now = 1792141200000, sequence = 0;
  const storage = (map, mode) => ({
    getItem(key) { if (mode === 'blocked') throw Error('storage disabled'); return map.get(key) || null; },
    setItem(key, value) { if (mode) throw Error('storage disabled'); map.set(key, value); }
  });
  function open(path = '/', options = {}) {
    const url = new URL(path, 'https://maedeup-landing.orca7blanc.workers.dev');
    const listeners = {}, intervals = [];
    const document = {
      visibilityState: 'visible', referrer: options.referrer || '',
      addEventListener(type, listener) { listeners[type] = listener; }
    };
    const window = {};
    const context = vm.createContext({
      window, document, location: {search: url.search, pathname: url.pathname},
      navigator: {doNotTrack: '0', webdriver: false, userAgent: 'Mozilla/5.0 Chrome/145.0', ...options.navigator},
      localStorage: storage(local, options.storage), sessionStorage: storage(session, options.storage),
      crypto: {randomUUID: () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, '0')}`},
      Date: {now: () => now}, URLSearchParams, URL, Blob,
      matchMedia: () => ({matches: false}),
      setInterval(callback) { intervals.push(callback); },
      addEventListener(type, listener) { listeners[type] = listener; },
      fetch(endpoint, init) {
        requests.push({endpoint, init});
        events.push(...JSON.parse(init.body).events);
        return Promise.resolve();
      }
    });
    vm.runInContext(source, context);
    function click(target, overrides = {}) {
      const el = {
        dataset: {track: target}, tagName: 'A', textContent: '',
        getAttribute(name) { return overrides[name] || null; },
        closest(selector) { return selector === '[data-no-track]' && overrides.noTrack ? el : null; },
        ...overrides.element
      };
      listeners.click?.({target: {closest: () => el}});
    }
    return {window, document, listeners, intervals, click};
  }
  return {open, events, requests, local, session, advance(ms) { now += ms; }};
}

for (const variant of ['A', 'B', 'C']) {
  test(`${variant}: homepage → preview → homepage keeps one attributed visit`, () => {
    const b = browser();
    const home = b.open('/?' + campaignQuery(variant));
    home.click('home_hero_preview');
    b.advance(2000);
    const previewUrl = '/preview?from=home&' + campaignQuery(variant);
    b.open(previewUrl).click('home_sample_return');
    b.advance(2000);
    b.open(ebookReturnUrl(new URL(previewUrl, 'https://example.com'))).click('home_ebook_book1_ridi');
    assert.equal(new Set(b.events.map(event => event.sessionId)).size, 1);
    assert.equal(new Set(b.events.map(event => event.visitorId)).size, 1);
    for (const event of b.events) assert.deepEqual(attribution(event), expectedAttribution(variant));
    assert.equal(b.events.filter(event => event.eventType === 'page_view').length, 3);
    assert.ok(b.events.every(event => !event.path.includes('?')));
  });
}

test('internal pages without query labels inherit the current visit only', () => {
  const b = browser();
  b.open('/?' + campaignQuery('B'));
  b.open('/preview').click('home_sample_return');
  b.open('/').click('home_paper_book1_yes24');
  assert.equal(new Set(b.events.map(event => event.sessionId)).size, 1);
  assert.ok(b.events.every(event => event.adVariant === 'B'));
});

test('fresh direct visits and incomplete/unapproved query labels remain unattributed', () => {
  for (const path of ['/', '/?utm_content=A', '/?utm_source=other&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=A', '/?' + campaignQuery('SECRET')]) {
    const b = browser();
    b.open(path).click('home_ebook_book1_ridi');
    for (const event of b.events) assert.deepEqual(attribution(event), emptyAttribution);
  }
});

test('an explicit different ad creates a new visit without changing the visitor', () => {
  const b = browser();
  b.open('/?' + campaignQuery('A'));
  const first = b.events.at(-1);
  b.open('/?' + campaignQuery('B'));
  const second = b.events.at(-1);
  assert.notEqual(first.sessionId, second.sessionId);
  assert.equal(first.visitorId, second.visitorId);
  assert.equal(first.adVariant, 'A');
  assert.equal(second.adVariant, 'B');
  b.open('/?' + campaignQuery('B'));
  assert.equal(b.events.at(-1).sessionId, second.sessionId);
});

test('a paid arrival after a direct visit starts a new attributed visit', () => {
  const b = browser();
  b.open('/');
  const directSession = b.events[0].sessionId;
  b.open('/?' + campaignQuery('C'));
  assert.notEqual(b.events.at(-1).sessionId, directSession);
  assert.equal(b.events.at(-1).adVariant, 'C');
});

test('30-minute expiry prevents stale attribution on untagged returns', () => {
  const b = browser();
  b.open('/?' + campaignQuery('A'));
  const first = b.events[0];
  b.advance(30 * 60 * 1000);
  b.open('/');
  assert.notEqual(b.events.at(-1).sessionId, first.sessionId);
  assert.deepEqual(attribution(b.events.at(-1)), emptyAttribution);
});

test('an inactive open tab starts a new visit before its next click', () => {
  const b = browser();
  const page = b.open('/?' + campaignQuery('C'));
  const originalSession = b.events[0].sessionId;
  b.advance(31 * 60 * 1000);
  page.click('home_paper_book1_kyobo');
  const [visit, click] = b.events.slice(-2);
  assert.equal(visit.eventType, 'page_view');
  assert.equal(click.eventType, 'click');
  assert.equal(visit.sessionId, click.sessionId);
  assert.notEqual(click.sessionId, originalSession);
  assert.deepEqual(attribution(click), emptyAttribution);
});

test('all eight real store links keep their distinct target and campaign labels', () => {
  const html = buildSalesHome(readFileSync(new URL('../public/index.html', import.meta.url), 'utf8'));
  const targets = [...html.matchAll(/data-track="(home_(?:ebook|paper)_[^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(targets, [
    'home_ebook_book1_ridi', 'home_ebook_book1_kyobo', 'home_ebook_book1_yes24', 'home_ebook_series_aladin',
    'home_paper_book1_kyobo', 'home_paper_book1_yes24', 'home_paper_book1_aladin', 'home_paper_book1_ypbooks'
  ]);
  const b = browser();
  const page = b.open('/?' + campaignQuery('A'));
  for (const target of targets) page.click(target);
  assert.deepEqual(b.events.filter(event => event.eventType === 'click').map(event => event.target), targets);
  assert.ok(b.events.every(event => event.adVariant === 'A'));
  assert.equal(new Set(b.events.map(event => event.sessionId)).size, 1);
});

test('internal store selector and preview clicks retain distinct action names', () => {
  const b = browser();
  const page = b.open('/?' + campaignQuery('B'));
  for (const target of ['home_nav_stores', 'home_hero_stores', 'review_purchase_book1', 'home_hero_preview']) page.click(target);
  assert.deepEqual(b.events.slice(1).map(event => event.target), ['home_nav_stores', 'home_hero_stores', 'review_purchase_book1', 'home_hero_preview']);
});

test('time events, delegated clicks and legacy window.track all carry attribution', () => {
  const b = browser();
  const page = b.open('/read?' + campaignQuery('C'));
  b.advance(15000);
  page.intervals[0]();
  page.window.track('ebook_landing_visit_C');
  page.click('ebook_bookstore_ridi_C');
  assert.deepEqual(b.events.map(event => event.eventType), ['page_view', 'engaged_time', 'click', 'click']);
  assert.ok(b.events.every(event => event.adVariant === 'C'));
  assert.equal(b.events[1].durationMs, 15000);
});

test('QA, do-not-track, automation and preview bots emit nothing and store no IDs', () => {
  for (const options of [{path: '/?analytics=off'}, {navigator: {doNotTrack: '1'}}, {navigator: {webdriver: true}}, {navigator: {userAgent: 'facebookexternalhit/1.1'}}]) {
    const b = browser();
    b.open(options.path || '/', options).click('home_ebook_book1_ridi');
    assert.equal(b.events.length, 0);
    assert.equal(b.local.size, 0);
    assert.equal(b.session.size, 0);
  }
});

test('no-track controls and inline tracking do not double count clicks', () => {
  const b = browser();
  const page = b.open('/');
  page.click('ignored', {noTrack: true});
  page.click('inline', {onclick: "track('inline')"});
  page.window.track('inline');
  assert.deepEqual(b.events.map(event => event.target), ['', 'inline']);
});

test('saved opt-out emits nothing and does not create anonymous IDs', () => {
  const b = browser();
  b.local.set('seed_analytics_opt_out', '1');
  b.open('/?' + campaignQuery('A')).click('home_ebook_book1_ridi');
  assert.equal(b.events.length, 0);
  assert.equal(b.local.has('seed_analytics_visitor'), false);
  assert.equal(b.session.size, 0);
});

test('opting out in an already-open page stops subsequent click and time events', () => {
  const b = browser();
  const page = b.open('/?' + campaignQuery('B'));
  assert.equal(b.events.length, 1);
  b.local.set('seed_analytics_opt_out', '1');
  b.advance(15000);
  page.click('home_ebook_book1_ridi');
  page.window.track('legacy_click');
  page.intervals[0]();
  assert.equal(b.events.length, 1);
});

test('arbitrary query strings and full referrers never enter events', () => {
  const b = browser();
  b.open('/?' + campaignQuery('A') + '&email=private%40example.com&fbclid=secret-ad-id', {referrer: 'https://www.instagram.com/?email=private@example.com'});
  const event = b.events[0];
  assert.equal(event.referrerHost, 'www.instagram.com');
  const serialized = JSON.stringify(event);
  assert.doesNotMatch(serialized, /private|secret-ad-id|fbclid|email/);
  assert.deepEqual(attribution(event), expectedAttribution('A'));
});

test('blocked or full storage keeps same-page visitor and session IDs stable', () => {
  for (const storage of ['blocked', 'full']) {
    const b = browser();
    const page = b.open('/?' + campaignQuery('A'), {storage});
    page.click('home_ebook_book1_ridi');
    page.window.track('second_click');
    assert.equal(new Set(b.events.map(event => event.visitorId)).size, 1);
    assert.equal(new Set(b.events.map(event => event.sessionId)).size, 1);
    assert.ok(b.events.every(event => event.adVariant === 'A'));
  }
});

test('failed sendBeacon falls back to keepalive fetch', () => {
  const b = browser();
  let beacons = 0;
  const page = b.open('/?' + campaignQuery('B'), {navigator: {sendBeacon() { beacons++; return false; }}});
  b.advance(15000);
  page.document.visibilityState = 'hidden';
  page.listeners.visibilitychange();
  assert.equal(beacons, 1);
  assert.equal(b.events.at(-1).eventType, 'engaged_time');
  assert.equal(b.requests.at(-1).init.keepalive, true);
});
