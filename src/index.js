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

const SEED_URL = 'https://seed-serial.totorolhj.chatgpt.site';
const SEED_PROMO_STYLE = `<style id="seed-serial-promo">
.seed-nav-link{display:inline-flex!important;align-items:center;gap:7px;color:#b9c3a3!important}.seed-nav-link:before{content:"";width:6px;height:6px;border-radius:50%;background:#91a96f;box-shadow:0 0 12px rgba(145,169,111,.65)}
.seed-feature{padding-top:28px!important;padding-bottom:108px!important}.seed-card{position:relative;display:grid;grid-template-columns:minmax(220px,.78fr) minmax(0,1fr);align-items:center;gap:clamp(34px,6vw,78px);max-width:980px;margin:0 auto;padding:clamp(40px,5vw,64px);overflow:hidden;color:#d8d0c4;border:1px solid rgba(164,183,133,.19);border-radius:26px;background:radial-gradient(75% 120% at 10% 50%,rgba(91,111,74,.15),transparent 68%),linear-gradient(135deg,rgba(19,22,19,.94),rgba(10,10,9,.98));box-shadow:0 30px 90px rgba(0,0,0,.26);transition:transform .28s ease,border-color .28s ease,box-shadow .28s ease}.seed-card:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.025),transparent 65%)}.seed-card:hover{transform:translateY(-3px);border-color:rgba(164,183,133,.36);box-shadow:0 36px 100px rgba(0,0,0,.36)}
.seed-logo-wrap{position:relative;z-index:1;text-align:center}.seed-logo-wrap img{display:block;width:100%;height:auto;filter:drop-shadow(0 14px 22px rgba(0,0,0,.62))}.seed-copy{position:relative;z-index:1}.seed-kicker{display:flex;align-items:center;gap:12px;margin-bottom:14px;color:#807b72;font-size:11px;letter-spacing:.11em}.seed-status{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;color:#c8d9aa;border:1px solid rgba(145,169,111,.3);border-radius:999px;background:rgba(95,116,74,.12);font-weight:700;letter-spacing:.02em}.seed-status:before{content:"";width:6px;height:6px;border-radius:50%;background:#91a96f;box-shadow:0 0 10px rgba(145,169,111,.7)}.seed-copy h2{margin:0 0 14px;font-size:clamp(30px,4vw,48px);line-height:1.25}.seed-copy p{margin:0 0 25px;color:#a8a197;font-size:16px;line-height:1.85}.seed-link{display:inline-flex;align-items:center;gap:10px;color:#d4bf93;font-size:15px;font-weight:700}.seed-link span{transition:transform .22s ease}.seed-card:hover .seed-link span{transform:translateX(4px)}
@media(max-width:680px){.seed-feature{padding-top:18px!important;padding-bottom:78px!important}.seed-card{grid-template-columns:1fr;gap:28px;padding:38px 24px;text-align:center;border-radius:22px}.seed-logo-wrap{width:min(320px,100%);margin:0 auto}.seed-kicker{justify-content:center;flex-wrap:wrap}.seed-copy p{font-size:15px}}
@media(prefers-reduced-motion:reduce){.seed-card,.seed-link span{transition:none!important}}
</style>`;
const SEED_NAV_LINK = `<a class="seed-nav-link" href="${SEED_URL}" target="_blank" rel="noopener noreferrer" onclick="track('seed_nav_open')">SeeD 연재중</a>`;
const SEED_PROMO_CARD = `<section class="section seed-feature" id="seed-serial"><div class="wrap reveal is-in"><a class="seed-card" href="${SEED_URL}" target="_blank" rel="noopener noreferrer" onclick="track('seed_serial_open')" aria-label="연재소설 SeeD 보러 가기"><div class="seed-logo-wrap"><img src="${SEED_URL}/seed-title-logo.png" alt="SeeD" loading="lazy"/></div><div class="seed-copy"><div class="seed-kicker"><span class="seed-status">연재중</span><span>ANOTHER STORY BY LEE JA-WOON</span></div><h2>이자운의 또 다른 이야기</h2><p>멸망 이후의 세계를 기록하는 연재소설.</p><span class="seed-link">SeeD 연재 보러 가기 <span aria-hidden="true">→</span></span></div></a></div></section>`;

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function cleanText(v,max){return String(v??"").replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,max)}
function validClient(v){return /^[A-Za-z0-9._|:-]{6,220}$/.test(String(v||""))}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
    if ((url.pathname === '/' || url.pathname === '/index.html') && assetResponse.headers.get('content-type')?.includes('text/html')) {
      return addSeedSerialPromo(assetResponse);
    }
    return assetResponse;
  }
};

function addSeedSerialPromo(response){
  return new HTMLRewriter()
    .on('head',{element(element){element.append(SEED_PROMO_STYLE,{html:true})}})
    .on('.navlinks',{element(element){element.append(SEED_NAV_LINK,{html:true})}})
    .on('footer.footer',{element(element){element.before(SEED_PROMO_CARD,{html:true})}})
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
