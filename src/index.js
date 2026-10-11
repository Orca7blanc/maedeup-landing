import {handleSocialHealth, processApprovedSocialPosts} from './social-publisher.js';
import {addEbookPreviewReturn} from './ebook-landing.js';
import {salesHomeResponse} from './sales-home.js';

const TITLES = {
  "자별":"판을 다시 짜는 생존자",
  "행":"끝없이 파고드는 탐구자",
  "도경":"끝을 볼 때까지 파고드는 몰입자",
  "은황":"두려워도 곁을 지키는 수호자",
  "금황":"말없이 먼저 막아서는 실용가",
  "범준":"정면으로 버티는 의리파",
  "아유":"의문을 바로 쏘는 직설 탐색자",
  "신기":"결국 끝까지 해내는 실무자",
  "삼랑":"흐름을 읽고 살아남는 적응자",
  "중기":"사고가 나기 전에 막아놓는 관리자"
};
const TYPES = new Set(Object.keys(TITLES));

const SEED_ORIGIN = 'https://seed-serial.totorolhj.chatgpt.site';
const ANALYTICS_SCRIPT = `<script id="seed-anonymous-analytics">(()=>{if(navigator.doNotTrack==='1'||navigator.webdriver===true||/(facebookexternalhit|facebot|headlesschrome|lighthouse|pagespeed|bot|crawler|spider|slackbot|discordbot|twitterbot|whatsapp|linkpreview|validator)/i.test(navigator.userAgent)||new URLSearchParams(location.search).get('analytics')==='off')return;const endpoint='/seed-api/analytics',visitorKey='seed_analytics_visitor',sessionKey='seed_analytics_session';let pageOpenedAt=Date.now(),lastVisibleAt=document.visibilityState==='visible'?Date.now():0;function id(){return crypto.randomUUID()}function visitor(){try{let value=localStorage.getItem(visitorKey);if(!value){value=id();localStorage.setItem(visitorKey,value)}return value}catch{return id()}}function session(){const now=Date.now();try{const old=JSON.parse(sessionStorage.getItem(sessionKey)||'null');if(old&&old.id&&old.touched&&now-old.touched<1800000){sessionStorage.setItem(sessionKey,JSON.stringify({id:old.id,touched:now}));return old.id}const value=id();sessionStorage.setItem(sessionKey,JSON.stringify({id:value,touched:now}));return value}catch{return id()}}function device(){return matchMedia('(max-width:600px)').matches?'mobile':matchMedia('(max-width:1000px)').matches?'tablet':'desktop'}function referrer(){try{return document.referrer?new URL(document.referrer).hostname:''}catch{return''}}function send(eventType,target,durationMs,beacon){const payload=JSON.stringify({events:[{visitorId:visitor(),sessionId:session(),eventType,path:location.pathname,target:target||'',durationMs:durationMs||0,device:device(),referrerHost:referrer(),occurredAt:Date.now()}]});if(beacon&&navigator.sendBeacon){navigator.sendBeacon(endpoint,new Blob([payload],{type:'application/json'}));return}fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true}).catch(()=>{})}window.track=function(name){send('click',String(name||'button').slice(0,100),Date.now()-pageOpenedAt,false)};send('page_view','',0,false);function flush(beacon){if(!lastVisibleAt)return;const now=Date.now(),duration=Math.min(60000,Math.max(0,now-lastVisibleAt));lastVisibleAt=document.visibilityState==='visible'?now:0;if(duration>=1000)send('engaged_time','',duration,beacon)}setInterval(()=>flush(false),15000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush(true);else lastVisibleAt=Date.now()});addEventListener('pagehide',()=>flush(true));document.addEventListener('click',event=>{const el=event.target&&event.target.closest?event.target.closest('a,button,[data-track]'):null;if(!el||el.closest('[data-no-track]')||(el.getAttribute('onclick')||'').includes('track('))return;const target=el.dataset.track||el.getAttribute('aria-label')||(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,100)||el.tagName.toLowerCase();send('click',target,Date.now()-pageOpenedAt,false)})})();</script>`;
const MAEDEUP_SEO_TITLE = '《매듭》 공식 사이트 | 이자운 K-오컬트 장편소설';
const MAEDEUP_SEO_DESCRIPTION = '《문지방을 넘어온 것들》로 시작되는 이자운의 K-오컬트 장편소설 《매듭》 공식 사이트. 작품 소개와 실제 독자 후기, 1권 미리읽기, 전자책·종이책 구매처를 만나보세요.';
const MAEDEUP_URL = 'https://maedeup-landing.orca7blanc.workers.dev/';
const MAEDEUP_SEO_HEAD = `<link rel="canonical" href="${MAEDEUP_URL}"/>
<meta property="og:type" content="website"/>
<meta property="og:locale" content="ko_KR"/>
<meta property="og:site_name" content="《매듭》 공식 사이트"/>
<meta property="og:title" content="${MAEDEUP_SEO_TITLE}"/>
<meta property="og:description" content="${MAEDEUP_SEO_DESCRIPTION}"/>
<meta property="og:url" content="${MAEDEUP_URL}"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${MAEDEUP_SEO_TITLE}"/>
<meta name="twitter:description" content="${MAEDEUP_SEO_DESCRIPTION}"/>
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '《매듭》 공식 사이트',
  alternateName: '매듭',
  url: MAEDEUP_URL,
  description: MAEDEUP_SEO_DESCRIPTION,
  inLanguage: 'ko-KR',
  author: {'@type': 'Person', name: '이자운'}
})}</script>`;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function cleanText(v,max){return String(v??"").replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,max)}
function validClient(v){return /^[A-Za-z0-9._|:-]{6,220}$/.test(String(v||""))}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/social/health' && request.method === 'GET') {
      return handleSocialHealth(env);
    }
    if (url.pathname.startsWith('/seed-api/')) {
      return proxySeedApi(request, url);
    }
    if (isSeedRequest(url.pathname)) {
      return proxySeed(request, url);
    }
    if (url.pathname === '/google1ff58ef5011b84c8.html') {
      return new Response('google-site-verification: google1ff58ef5011b84c8.html\n', {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=300'
        }
      });
    }
    if (url.pathname === '/naver79299a37055c37ed312f92ef0e472ee2.html') {
      return new Response('naver-site-verification: naver79299a37055c37ed312f92ef0e472ee2.html\n', {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=300'
        }
      });
    }
    if (url.pathname.startsWith('/api/')) {
      if (!env.DB) return json({error:'DB binding is not connected yet.'},503);
      try {
        if (url.pathname === '/api/survivors' && request.method === 'GET') return await listSurvivors(url, env);
        if (url.pathname === '/api/survivors' && request.method === 'POST') return await createSurvivor(request, env);
        if (url.pathname === '/api/like' && request.method === 'POST') return await toggleLike(request, env);
        return json({error:'Not found'},404);
      } catch (e) {
        console.error(e);
        return json({error:'Server error'},500);
      }
    }
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.headers.get('content-type')?.includes('text/html')) {
      if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        return addHomepageMetadata(await salesHomeResponse(assetResponse));
      }
      if (url.pathname === '/preview' || url.pathname === '/preview.html') {
        return addAnonymousAnalytics(addEbookPreviewReturn(assetResponse, url));
      }
      if (url.pathname === '/read' || url.pathname === '/read.html') {
        return addAnonymousAnalytics(assetResponse);
      }
    }
    return assetResponse;
  },
  async scheduled(_controller, env) {
    await processApprovedSocialPosts(env);
  }
};

function isSeedRequest(pathname){
  return pathname === '/seed' ||
    pathname.startsWith('/seed/') ||
    pathname.startsWith('/episode/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vinext/') ||
    pathname === '/seed-title-logo.png' ||
    pathname === '/og.png' ||
    pathname === '/favicon.svg';
}

async function proxySeedApi(request, url){
  const upstreamPath = url.pathname.replace(/^\/seed-api/, '/api');
  const upstreamUrl = new URL(`${upstreamPath}${url.search}`, SEED_ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete('host');
  const upstreamRequest = new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  });
  return fetch(upstreamRequest);
}

async function proxySeed(request, url){
  const upstreamUrl = new URL(`${url.pathname}${url.search}`, SEED_ORIGIN);
  const upstreamResponse = await fetch(new Request(upstreamUrl, request), {redirect:'manual'});
  const headers = new Headers(upstreamResponse.headers);
  const location = headers.get('location');
  if(location?.startsWith(SEED_ORIGIN)){
    headers.set('location', location.replace(SEED_ORIGIN, new URL(request.url).origin));
  }
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers
  });
}

function addHomepageMetadata(response){
  return new HTMLRewriter()
    .on('title',{element(element){element.setInnerContent(MAEDEUP_SEO_TITLE)}})
    .on('meta[name="description"]',{element(element){element.setAttribute('content',MAEDEUP_SEO_DESCRIPTION)}})
    .on('head',{element(element){
      element.append(MAEDEUP_SEO_HEAD,{html:true});
    }})
    .on('body',{element(element){element.append(ANALYTICS_SCRIPT,{html:true})}})
    .transform(response);
}

function addAnonymousAnalytics(response){
  return new HTMLRewriter()
    .on('body',{element(element){element.append(ANALYTICS_SCRIPT,{html:true})}})
    .transform(response);
}

async function applyLegacyScoreFix(env){
  // One-time cleanup for the seven early friend-test records created before
  // the similarity formula was widened. Matching uses result type + nickname
  // (and the original score), so other records are left untouched.
  const pending=await env.DB.prepare(`
    SELECT 1 AS x FROM survivors
    WHERE status='visible' AND (
      (result_type='행'   AND nickname='니이모를찾아서' AND score=91) OR
      (result_type='중기' AND nickname='굴다리아저씨'   AND score=91) OR
      (result_type='행'   AND nickname='리본매듭'       AND score=91) OR
      (result_type='신기' AND nickname='무명'           AND score=90 AND comment LIKE '너무 흥미진진하게%') OR
      (result_type='도경' AND nickname='귀가길'         AND score=90) OR
      (result_type='도경' AND nickname='2등인가??'      AND score=91) OR
      (result_type='은황' AND nickname='최초의 생존자'  AND score=90)
    ) LIMIT 1
  `).first();
  if(!pending) return;
  await env.DB.batch([
    env.DB.prepare("UPDATE survivors SET score=81 WHERE status='visible' AND result_type='행' AND nickname='니이모를찾아서' AND score=91"),
    env.DB.prepare("UPDATE survivors SET score=78 WHERE status='visible' AND result_type='중기' AND nickname='굴다리아저씨' AND score=91"),
    env.DB.prepare("UPDATE survivors SET score=88 WHERE status='visible' AND result_type='행' AND nickname='리본매듭' AND score=91"),
    env.DB.prepare("UPDATE survivors SET score=74 WHERE status='visible' AND result_type='신기' AND nickname='무명' AND score=90 AND comment LIKE '너무 흥미진진하게%'"),
    env.DB.prepare("UPDATE survivors SET score=85 WHERE status='visible' AND result_type='도경' AND nickname='귀가길' AND score=90"),
    env.DB.prepare("UPDATE survivors SET score=82 WHERE status='visible' AND result_type='도경' AND nickname='2등인가??' AND score=91"),
    env.DB.prepare("UPDATE survivors SET score=76 WHERE status='visible' AND result_type='은황' AND nickname='최초의 생존자' AND score=90")
  ]);
}

async function listSurvivors(url, env){
  await applyLegacyScoreFix(env);
  const type = cleanText(url.searchParams.get('type'),20);
  const sort = url.searchParams.get('sort') === 'popular' ? 'popular' : 'latest';
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit')||30)));
  const client = cleanText(url.searchParams.get('client_id'),220);
  const where = ["s.status='visible'"];
  const params=[];
  if(type && TYPES.has(type)){where.push('s.result_type=?');params.push(type)}
  const order = sort==='popular' ? 's.likes DESC, s.created_at DESC' : 's.created_at DESC';
  let likeSelect='0 AS liked', join='';
  if(client && validClient(client)){
    likeSelect='CASE WHEN sl.client_id IS NULL THEN 0 ELSE 1 END AS liked';
    join='LEFT JOIN survivor_likes sl ON sl.post_id=s.id AND sl.client_id=?';
    params.unshift(client);
  }
  const sql=`SELECT s.id,s.result_type,s.result_title,s.score,s.nickname,s.comment,s.created_at,s.likes,${likeSelect} FROM survivors s ${join} WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ?`;
  const rows=(await env.DB.prepare(sql).bind(...params,limit).all()).results||[];
  const totalRow=await env.DB.prepare("SELECT COUNT(*) AS n FROM survivors WHERE status='visible'").first();
  let hasPosted=false;
  if(client && validClient(client)){
    const posted=await env.DB.prepare("SELECT 1 AS x FROM survivors WHERE substr(share_token,1,instr(share_token,'|')-1)=? LIMIT 1").bind(client).first();
    hasPosted=!!posted;
  }
  return json({rows,total:Number(totalRow?.n||0),has_posted:hasPosted});
}

async function createSurvivor(request, env){
  let b; try{b=await request.json()}catch{return json({error:'잘못된 요청입니다.'},400)}
  const type=cleanText(b.result_type,20), score=Number(b.score), nickname=cleanText(b.nickname||'무명',12), comment=cleanText(b.comment,60), token=cleanText(b.share_token,220);
  if(!TYPES.has(type)) return json({error:'올바른 테스트 결과가 아닙니다.'},400);
  if(!Number.isInteger(score)||score<0||score>100) return json({error:'유사도 값이 올바르지 않습니다.'},400);
  if(nickname.length<1||nickname.length>12) return json({error:'닉네임은 1~12자로 입력해 주세요.'},400);
  if(comment.length<1||comment.length>60) return json({error:'한마디는 1~60자로 입력해 주세요.'},400);
  if(/https?:\/\/|www\./i.test(comment+nickname)) return json({error:'링크는 게시할 수 없습니다.'},400);
  if(token.length<8) return json({error:'테스트 결과 토큰이 없습니다.'},400);
  const client=token.split('|')[0];
  if(!validClient(client)) return json({error:'방문자 식별 정보가 올바르지 않습니다.'},400);
  const already=await env.DB.prepare("SELECT id FROM survivors WHERE substr(share_token,1,instr(share_token,'|')-1)=? LIMIT 1").bind(client).first();
  if(already) return json({error:'이미 생존 기록을 남겼습니다.'},409);
  try{
    const r=await env.DB.prepare(`INSERT INTO survivors(result_type,result_title,score,nickname,comment,share_token) VALUES(?,?,?,?,?,?)`).bind(type,TITLES[type],score,nickname,comment,token).run();
    return json({ok:true,id:r.meta?.last_row_id||null},201);
  }catch(e){
    if(String(e).toLowerCase().includes('unique')) return json({error:'이 테스트 결과는 이미 게시판에 남겼습니다.'},409);
    throw e;
  }
}

async function toggleLike(request, env){
  let b; try{b=await request.json()}catch{return json({error:'잘못된 요청입니다.'},400)}
  const postId=Number(b.post_id), client=cleanText(b.client_id,220);
  if(!Number.isInteger(postId)||postId<1||!validClient(client)) return json({error:'좋아요 정보가 올바르지 않습니다.'},400);
  const exists=await env.DB.prepare('SELECT 1 AS x FROM survivor_likes WHERE post_id=? AND client_id=?').bind(postId,client).first();
  if(exists){
    await env.DB.batch([
      env.DB.prepare('DELETE FROM survivor_likes WHERE post_id=? AND client_id=?').bind(postId,client),
      env.DB.prepare('UPDATE survivors SET likes=MAX(0,likes-1) WHERE id=?').bind(postId)
    ]);
    return json({ok:true,liked:false});
  }
  const post=await env.DB.prepare("SELECT id FROM survivors WHERE id=? AND status='visible'").bind(postId).first();
  if(!post) return json({error:'게시글을 찾을 수 없습니다.'},404);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO survivor_likes(post_id,client_id) VALUES(?,?)').bind(postId,client),
    env.DB.prepare('UPDATE survivors SET likes=likes+1 WHERE id=?').bind(postId)
  ]);
  return json({ok:true,liked:true});
}
