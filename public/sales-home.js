(()=>{
  const switcher=document.querySelector('.sales-format-switch');
  const tabs=[...document.querySelectorAll('[data-format]')];
  function select(tab,focus=false){
    tabs.forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;document.getElementById('edition-'+button.dataset.format).hidden=!active;});
    if(focus)tab.focus();
  }
  if(switcher&&tabs.length){
    switcher.hidden=false;switcher.setAttribute('role','tablist');
    tabs.forEach((tab,i)=>{tab.setAttribute('role','tab');const panel=document.getElementById('edition-'+tab.dataset.format);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight'||event.key==='ArrowLeft')target=tabs[1-i];if(event.key==='Home')target=tabs[0];if(event.key==='End')target=tabs[tabs.length-1];if(target){event.preventDefault();select(target,true);}});});
    select(tabs[0]);
  }
  const query=new URLSearchParams(location.search),preserved=new URLSearchParams({from:'home'});
  Object.entries({utm_source:'meta',utm_medium:'paid_social',utm_campaign:'maedeup_book1'}).forEach(([key,value])=>{if(query.get(key)===value)preserved.set(key,value);});
  if(/^[ABC]$/.test(query.get('utm_content')||''))preserved.set('utm_content',query.get('utm_content'));
  if(query.get('analytics')==='off')preserved.set('analytics','off');
  document.querySelectorAll('[data-home-preview]').forEach(link=>link.href='/preview?'+preserved.toString());
  function revealHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const el=document.getElementById(id);if(!el)return;let ancestor=el.closest('details');while(ancestor){ancestor.open=true;ancestor=ancestor.parentElement.closest('details');}requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'auto'}));}
  document.querySelectorAll('.sales-fold').forEach(fold=>fold.addEventListener('toggle',()=>{if(fold.open){Object.values(window.__maedeupPagerStates||{}).forEach(state=>state.update?.(true));fold.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-in'));}}));
  window.addEventListener('hashchange',revealHash);if(location.hash)revealHash();
  const motion=document.getElementById('sales-motion');
  if(motion&&!matchMedia('(prefers-reduced-motion:reduce)').matches){motion.hidden=false;motion.addEventListener('click',()=>{const paused=document.body.classList.toggle('sales-motion-paused');motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'배경 움직임 켜기':'배경 움직임 멈추기';});}
})();
