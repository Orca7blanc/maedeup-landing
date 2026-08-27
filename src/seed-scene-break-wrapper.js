import app from './index.js';

const SCENE_BREAK_STYLE = `<style id="seed-scene-break-style">
.seed-scene-break{
  display:block!important;
  width:100%!important;
  text-align:center!important;
  align-self:stretch!important;
  justify-self:stretch!important;
}
</style>`;

const SCENE_BREAK_SCRIPT = `<script id="seed-scene-break-script">
(()=>{
  const BLOCK_SELECTOR='p,div,li,blockquote';
  const EXCLUDED_SELECTOR='script,style,pre,code,button,a,nav,header,footer';
  let scheduled=false;

  function textOf(el){
    return (el.textContent||'').replace(/\\u00a0/g,' ').trim();
  }

  function applySceneBreaks(){
    scheduled=false;
    const nodes=document.querySelectorAll(BLOCK_SELECTOR);

    for(const el of nodes){
      if(el.matches(EXCLUDED_SELECTOR)||el.closest(EXCLUDED_SELECTOR)) continue;

      if(textOf(el)!=='◇'){
        if(el.classList.contains('seed-scene-break')) el.classList.remove('seed-scene-break');
        continue;
      }

      let nestedDiamondBlock=false;
      for(const child of el.querySelectorAll(BLOCK_SELECTOR)){
        if(textOf(child)==='◇'){
          nestedDiamondBlock=true;
          break;
        }
      }

      el.classList.toggle('seed-scene-break',!nestedDiamondBlock);
    }
  }

  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(applySceneBreaks);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',schedule,{once:true});
  }else{
    schedule();
  }

  new MutationObserver(schedule).observe(document.documentElement,{
    subtree:true,
    childList:true,
    characterData:true
  });
})();
</script>`;

function isSeedHtmlPath(pathname){
  return pathname==='/seed' ||
    pathname.startsWith('/seed/') ||
    pathname.startsWith('/episode/');
}

function addSceneBreakCentering(response){
  const contentType=response.headers.get('content-type')||'';
  if(!contentType.includes('text/html')) return response;

  const headers=new Headers(response.headers);
  headers.delete('content-length');
  const htmlResponse=new Response(response.body,{
    status:response.status,
    statusText:response.statusText,
    headers
  });

  return new HTMLRewriter()
    .on('head',{element(element){
      element.append(SCENE_BREAK_STYLE,{html:true});
    }})
    .on('body',{element(element){
      element.append(SCENE_BREAK_SCRIPT,{html:true});
    }})
    .transform(htmlResponse);
}

export default {
  async fetch(request,env,ctx){
    const response=await app.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(!isSeedHtmlPath(url.pathname)) return response;
    return addSceneBreakCentering(response);
  }
};
