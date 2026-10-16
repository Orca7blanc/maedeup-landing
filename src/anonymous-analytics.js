// Keep browser code as text so worker bundling cannot insert server-only helpers.
// Public campaign labels are the only query-string data sent to analytics.
export const ANALYTICS_SCRIPT = String.raw`<script id="seed-anonymous-analytics">(() => {
  const query = new URLSearchParams(location.search);
  function optedOut() {
    try { return localStorage.getItem('seed_analytics_opt_out') === '1'; }
    catch { return false; }
  }
  if (navigator.doNotTrack === '1' || navigator.webdriver === true ||
      /(facebookexternalhit|facebot|headlesschrome|lighthouse|pagespeed|bot|crawler|spider|slackbot|discordbot|twitterbot|whatsapp|linkpreview|validator)/i.test(navigator.userAgent) ||
      query.get('analytics') === 'off' || optedOut()) return;

  const endpoint = '/seed-api/analytics';
  const visitorKey = 'seed_analytics_visitor';
  const sessionKey = 'seed_analytics_session';
  const sessionTimeout = 30 * 60 * 1000;
  const pageOpenedAt = Date.now();
  let lastVisibleAt = document.visibilityState === 'visible' ? Date.now() : 0;
  let memorySession;
  let memoryVisitor;

  function validAttribution(value) {
    if (value && value.utmSource === 'meta' && value.utmMedium === 'paid_social' &&
        value.utmCampaign === 'maedeup_book1' && /^[ABC]$/.test(value.adVariant || '')) {
      return {utmSource: 'meta', utmMedium: 'paid_social', utmCampaign: 'maedeup_book1', adVariant: value.adVariant};
    }
    return {utmSource: '', utmMedium: '', utmCampaign: '', adVariant: ''};
  }
  const arrivalAttribution = validAttribution({
    utmSource: query.get('utm_source'), utmMedium: query.get('utm_medium'),
    utmCampaign: query.get('utm_campaign'), adVariant: query.get('utm_content')
  });

  function visitor() {
    if (memoryVisitor) return memoryVisitor;
    try {
      memoryVisitor = localStorage.getItem(visitorKey) || crypto.randomUUID();
      localStorage.setItem(visitorKey, memoryVisitor);
    } catch { memoryVisitor = memoryVisitor || crypto.randomUUID(); }
    return memoryVisitor;
  }
  function session(isArrival) {
    const now = Date.now();
    let old;
    try { old = JSON.parse(sessionStorage.getItem(sessionKey) || 'null') || memorySession; }
    catch { old = memorySession; }
    const fresh = old && typeof old.id === 'string' && old.id.length > 0 &&
      Number.isFinite(old.touched) && now >= old.touched && now - old.touched < sessionTimeout;
    const previousAttribution = validAttribution(old && old.attribution);
    // A new explicit ad arrival starts a distinct visit. An untagged internal
    // navigation keeps this tab's current visit, but never an expired campaign.
    const differentAd = isArrival && arrivalAttribution.adVariant &&
      arrivalAttribution.adVariant !== previousAttribution.adVariant;
    const isNew = !fresh || differentAd;
    memorySession = {
      id: isNew ? crypto.randomUUID() : old.id,
      touched: now,
      attribution: isNew ? validAttribution(isArrival ? arrivalAttribution : null) : previousAttribution
    };
    try { sessionStorage.setItem(sessionKey, JSON.stringify(memorySession)); } catch {}
    return {...memorySession, isNew};
  }
  function device() {
    return matchMedia('(max-width:600px)').matches ? 'mobile' :
      matchMedia('(max-width:1000px)').matches ? 'tablet' : 'desktop';
  }
  function referrer() {
    try { return document.referrer ? new URL(document.referrer).hostname : ''; }
    catch { return ''; }
  }
  function write(events, beacon) {
    const payload = JSON.stringify({events});
    if (beacon && navigator.sendBeacon) {
      try {
        if (navigator.sendBeacon(endpoint, new Blob([payload], {type: 'application/json'}))) return;
      } catch {}
    }
    fetch(endpoint, {method: 'POST', headers: {'content-type': 'application/json'}, body: payload, keepalive: true}).catch(() => {});
  }
  function send(eventType, target, durationMs, beacon, isArrival) {
    if (optedOut()) return;
    const current = session(isArrival);
    const common = {
      visitorId: visitor(), sessionId: current.id, path: location.pathname,
      device: device(), referrerHost: referrer(), occurredAt: Date.now(),
      ...current.attribution
    };
    const events = [];
    // A visitor returning to an already-open tab after 30 minutes is a new
    // visit too; record its page view before a click so the rate has a denominator.
    if (current.isNew && eventType !== 'page_view') {
      events.push({...common, eventType: 'page_view', target: '', durationMs: 0});
    }
    events.push({...common, eventType, target: target || '', durationMs: durationMs || 0});
    write(events, beacon);
  }
  window.track = function (name) {
    send('click', String(name || 'button').slice(0, 100), Date.now() - pageOpenedAt, false, false);
  };
  send('page_view', '', 0, false, true);
  function flush(beacon) {
    if (!lastVisibleAt) return;
    const now = Date.now();
    const duration = Math.min(60000, Math.max(0, now - lastVisibleAt));
    lastVisibleAt = document.visibilityState === 'visible' ? now : 0;
    if (duration >= 1000) send('engaged_time', '', duration, beacon, false);
  }
  setInterval(() => flush(false), 15000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
    else lastVisibleAt = Date.now();
  });
  addEventListener('pagehide', () => flush(true));
  document.addEventListener('click', event => {
    const el = event.target && event.target.closest ? event.target.closest('a,button,[data-track]') : null;
    if (!el || el.closest('[data-no-track]') || (el.getAttribute('onclick') || '').includes('track(')) return;
    const target = el.dataset.track || el.getAttribute('aria-label') ||
      (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) || el.tagName.toLowerCase();
    send('click', target, Date.now() - pageOpenedAt, false, false);
  });
})();</script>`;
