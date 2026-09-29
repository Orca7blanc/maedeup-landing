const CAMPAIGN_VALUES = {utm_source:'meta',utm_medium:'paid_social',utm_campaign:'maedeup_book1'};

export function ebookReturnUrl(url) {
  if (url.searchParams.get('from') !== 'ebook') return null;
  const query = new URLSearchParams();
  for (const [key,value] of Object.entries(CAMPAIGN_VALUES)) if (url.searchParams.get(key) === value) query.set(key,value);
  const variant = url.searchParams.get('utm_content');
  if (/^[ABC]$/.test(variant || '')) query.set('utm_content',variant);
  if (url.searchParams.get('analytics') === 'off') query.set('analytics','off');
  return '/read' + (query.size ? '?' + query.toString() : '') + '#stores';
}

export function addEbookPreviewReturn(response, url) {
  const returnUrl = ebookReturnUrl(url);
  if (!returnUrl) return response;
  return new HTMLRewriter().on('a[href="./#read"]', {element(element) {
    element.setAttribute('href',returnUrl);
    element.setAttribute('data-track','ebook_sample_return');
    element.setInnerContent('전자책 1권 구매처 보기');
  }}).transform(response);
}
