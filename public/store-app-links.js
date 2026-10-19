// Progressive enhancement: original web links work without this script.
// Vendor routes are documented in docs/mobile-store-app-links.md.
(() => {
  const ua = navigator.userAgent || '';
  const android = /Android/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!android && !ios) return;

  // Keep a strict list of the existing book destinations. Never forward the
  // landing page's query string or a visitor-supplied URL into another app.
  const destinations = new Map([
    ['https://product.kyobobook.co.kr/detail/S000220619545', {id: 'kyobo', name: '교보문고', format: '종이책', scheme: 'kyobobook', package: 'mok.android', route: 'webview?url='}],
    ['https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298635', {id: 'kyobo', name: '교보문고', format: '전자책', scheme: 'kyobobook', package: 'mok.android', route: 'webview?url='}],
    ['https://m.yes24.com/goods/detail/194173626', {id: 'yes24', name: 'YES24', format: '전자책', scheme: 'YES24', package: 'com.yes24.commerce', route: 'MAIN?returnUrl='}],
    ['https://www.yes24.com/product/goods/193866498', {id: 'yes24', name: 'YES24', format: '종이책', scheme: 'YES24', package: 'com.yes24.commerce', route: 'MAIN?returnUrl='}]
  ]);
  const enhanced = [];
  document.querySelectorAll('a.shop[data-track], a.store[data-track]').forEach(web => {
    const url = web.getAttribute('href');
    const store = destinations.get(url);
    if (!store || web.dataset.appEnhanced === '1') return;
    const route = store.route + encodeURIComponent(url);
    const appUrl = android
      ? 'intent://' + route + '#Intent;scheme=' + store.scheme + ';package=' + store.package + ';S.browser_fallback_url=' + encodeURIComponent(url) + ';end'
      : store.scheme + '://' + route;
    const option = document.createElement('div');
    option.className = 'store-app-option';
    const app = document.createElement('a');
    app.className = 'store-app-action';
    app.href = appUrl;
    app.textContent = '앱으로 열기';
    app.setAttribute('aria-label', store.name + ' 앱으로 매듭 1 ' + store.format + ' 열기');
    app.setAttribute('aria-describedby', 'store-app-help');
    app.rel = 'noopener noreferrer';
    // The existing delegated analytics handler records ONE click. Retain its
    // exact target (including /read's campaign suffix); do not call track().
    app.dataset.track = web.dataset.track;
    app.dataset.storeApp = store.id;
    web.dataset.appEnhanced = '1';
    web.setAttribute('aria-label', store.name + ' 웹에서 매듭 1 ' + store.format + ' 구매');
    const label = document.createElement('span');
    label.className = 'store-web-label';
    label.textContent = '웹에서 구매';
    web.append(label);
    web.replaceWith(option);
    option.append(web, app);
    enhanced.push(option);
  });
  if (!enhanced.length) return;

  if (!document.getElementById('store-app-help')) {
    const note = document.createElement('p');
    note.id = 'store-app-help';
    note.className = 'store-app-help';
    note.textContent = '앱이 열리지 않으면 ‘웹에서 구매’를 눌러 주세요.';
    const purchase = document.querySelector('#read .buy-panel, #stores');
    // On the original homepage the first purchase grid sits inside #read.
    (purchase || enhanced[0].parentElement).append(note);
  }
  if (!document.getElementById('store-app-style')) {
    const style = document.createElement('style');
    style.id = 'store-app-style';
    style.textContent = `
      .store-app-option{display:flex;flex-direction:column;gap:6px;min-width:0}
      .shopgrid>.store-app-option{flex:0 0 auto;min-width:132px;max-width:190px}
      .store-app-option>.shop{box-sizing:border-box;width:100%!important;min-width:0!important;max-width:none!important;flex:1 0 auto}
      .store-app-option>.store{box-sizing:border-box;height:auto;flex:1 0 auto}
      .store-app-action{box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:44px;padding:8px 12px;border:1px solid #8c754b;border-radius:10px;background:#201a12;color:#e7cca0;font-size:14px;line-height:1.5;text-decoration:none;text-align:center}
      .store-app-action:hover{background:#302619;border-color:#c5a66f}
      .store-app-action:focus-visible{outline:2px solid #e7cca0;outline-offset:3px}
      .store-web-label{display:block;font-size:12px!important;line-height:1.5;color:#c6b99f}
      .store-app-option>.store{flex-wrap:wrap;gap:6px}
      .store-app-option>.store>.store-web-label{flex-basis:100%}
      .store-app-help{flex-basis:100%;width:100%;margin:14px 0 0;font-size:13px;line-height:1.7;color:#b4a58e;text-align:center}
      @media(max-width:820px){.shopgrid>.store-app-option{min-width:126px;max-width:172px}}
      @media(max-width:430px){.shopgrid>.store-app-option{min-width:118px;max-width:158px}}
    `;
    document.head.append(style);
  }
})();
