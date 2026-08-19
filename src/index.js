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

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}})}
function cleanText(v,max){return String(v??"").replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,max)}
function validClient(v){return /^[A-Za-z0-9._|:-]{6,220}$/.test(String(v||""))}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
    return env.ASSETS.fetch(request);
  }
};

async function listSurvivors(url, env){
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
