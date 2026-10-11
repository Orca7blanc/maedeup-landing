// Keep the reader's approved campaign attribution when opening the sample.
(()=>{
  const query=new URLSearchParams(location.search),preserved=new URLSearchParams({from:'home'});
  Object.entries({utm_source:'meta',utm_medium:'paid_social',utm_campaign:'maedeup_book1'}).forEach(([key,value])=>{if(query.get(key)===value)preserved.set(key,value);});
  if(/^[ABC]$/.test(query.get('utm_content')||''))preserved.set('utm_content',query.get('utm_content'));
  if(query.get('analytics')==='off')preserved.set('analytics','off');
  document.querySelectorAll('[data-home-preview]').forEach(link=>link.href='/preview?'+preserved.toString());
})();
