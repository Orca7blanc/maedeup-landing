// Preserve only the campaign's public attribution labels, never arbitrary query data.
(() => {
  const query = new URLSearchParams(location.search);
  const variant = /^[ABC]$/.test(query.get('utm_content') || '') ? query.get('utm_content') : 'organic';
  const values = {utm_source:'meta',utm_medium:'paid_social',utm_campaign:'maedeup_book1'};
  const campaign = new URLSearchParams({from:'ebook'});
  for (const [key,value] of Object.entries(values)) if (query.get(key) === value) campaign.set(key,value);
  if (variant !== 'organic') campaign.set('utm_content',variant);
  if (query.get('analytics') === 'off') campaign.set('analytics','off');
  document.querySelectorAll('[data-preview]').forEach(link => {link.href = '/preview?' + campaign.toString();});
  document.querySelectorAll('[data-track]').forEach(link => {link.dataset.track += '_' + variant;});
  const recordVisit = () => {if (typeof window.track === 'function') window.track('ebook_landing_visit_' + variant);};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', recordVisit, {once:true});
  else recordVisit();
})();

// Atmospheric motion stays optional; book text and purchase links never move.
(() => {
  const button = document.querySelector('.motion-toggle');
  if (!button) return;
  button.hidden = false;
  button.addEventListener('click', () => {
    const paused = document.documentElement.classList.toggle('motion-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? '배경 움직임 켜기' : '배경 움직임 끄기';
  });
})();
