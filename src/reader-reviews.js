const REVIEW_NAV_LINK = '<a class="reader-review-nav-link" href="#reader-reviews" data-track="reader_reviews_nav">독자 후기</a>';

const REVIEW_STYLE = String.raw`
<style id="maedeup-reader-reviews-style">
.reader-review-nav-link{color:#d5c29b!important}
.rr-hero{margin:22px 0 0;padding:16px 0 0;border-top:1px solid rgba(198,164,103,.25);max-width:490px;text-align:left}
.rr-hero blockquote{margin:0 0 8px;color:#dfd3ba;font-size:18px;line-height:1.6}
.rr-hero .rr-meta{font-size:11px}.rr-hero details{margin-top:6px}.rr-hero summary{font-size:11px}
.reader-reviews{padding:104px 0!important;scroll-margin-top:88px;background:radial-gradient(70% 42% at 50% 0,rgba(107,26,28,.17),transparent 75%),linear-gradient(180deg,rgba(9,12,18,.25),rgba(10,12,18,.78));border-top:1px solid rgba(195,155,93,.18)}
.rr-wrap{max-width:1080px;margin:auto;padding:0 24px}
.rr-head{max-width:780px;margin:0 auto 42px;text-align:center}
.rr-kicker,.rr-eyebrow{font-size:11px;font-weight:700;letter-spacing:.13em;color:#c0a87b}
.rr-head h2{margin:14px 0 16px;color:#eee7da;font-size:clamp(30px,5vw,50px);line-height:1.3;letter-spacing:-.035em}
.rr-head p{color:#aaa395;font-size:16px;line-height:1.85;margin:0}
.rr-lead{position:relative;padding:clamp(24px,4vw,44px);border:1px solid rgba(195,155,93,.34);border-radius:22px;background:linear-gradient(135deg,#20202a,#11131b);box-shadow:0 24px 65px rgba(0,0,0,.22)}
.rr-lead blockquote{max-width:850px;margin:20px 0 16px;color:#f3ecdf;font-weight:700;font-size:clamp(26px,4.1vw,43px);line-height:1.48;letter-spacing:-.04em;word-break:keep-all;overflow-wrap:anywhere}
.rr-lead .rr-context{font-size:17px;color:#c7c0b2}
.rr-meta{display:flex;gap:8px 12px;flex-wrap:wrap;align-items:center;color:#a8a397;font-size:12px;line-height:1.65}
.rr-meta cite{font-style:normal}.rr-badge{display:inline-block;border:1px solid rgba(195,155,93,.36);padding:3px 8px;border-radius:5px;color:#d5c399;font-size:11px}
.rr-gift{color:#cab3af;border-color:rgba(163,105,94,.5)}
.rr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:20px;align-items:start}
.rr-card{min-width:0;padding:28px;border:1px solid rgba(211,192,156,.15);border-radius:18px;background:linear-gradient(145deg,rgba(28,29,36,.95),rgba(15,18,24,.95))}
.rr-card blockquote{margin:18px 0 20px;color:#e7e0d3;font-size:clamp(20px,2.4vw,25px);line-height:1.6;font-weight:600;letter-spacing:-.03em;word-break:keep-all;overflow-wrap:anywhere}
.rr-context{color:#afa99d;font-size:14px;line-height:1.9;margin:0 0 18px;word-break:keep-all;overflow-wrap:anywhere}
.rr-topic{display:flex;justify-content:space-between;gap:12px;align-items:center;color:#d0bd96;font-size:13px}
.rr-topic span:last-child{font-size:11px;color:#9c9384}
.rr-rule{margin:54px 0 24px;padding-top:26px;border-top:1px solid rgba(195,155,93,.2)}
.rr-rule h3{margin:0 0 10px;font-size:26px;color:#e5dcca}.rr-rule p{margin:0;color:#a9a194;font-size:14px;line-height:1.8}
.rr-evidence{margin:22px 0 0}.rr-evidence figcaption{color:#9d978b;font-size:11px;line-height:1.7;margin-top:8px}
.rr-capture{display:block;border-radius:7px;overflow:hidden;background:#fff;border:7px solid #f5f3ef}
.rr-capture img{display:block;width:100%;height:auto;background:#fff}
.rr-lead .rr-capture{max-width:920px}
.rr-details{border-top:1px solid rgba(195,155,93,.17);margin-top:18px;padding-top:6px}
.rr-details summary{display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;padding:10px 0;color:#c9b890;font-size:12px;list-style:none;min-height:40px}
.rr-details summary::-webkit-details-marker{display:none}.rr-details summary::after{content:"＋";font-size:18px}
.rr-details[open] summary::after{content:"−"}.rr-details .rr-evidence{margin:8px 0 12px}
.rr-details p{font-size:13px;color:#aca598;line-height:1.8;margin:8px 0}
.rr-author-capture{max-width:270px}
.rr-source{display:inline-flex;align-items:center;min-height:44px;gap:5px;padding:8px 0;color:#cdb992!important;font-size:12px;text-decoration:underline;text-underline-offset:5px;text-decoration-color:rgba(205,185,146,.4)}
.rr-book-photo{margin:18px 0;display:block;border-radius:10px;overflow:hidden}
.rr-book-photo img{width:100%;height:236px;display:block;object-fit:cover;object-position:50% 42%}
.rr-photo-layout{display:grid;grid-template-columns:minmax(0,1fr) 145px;gap:20px;align-items:center}
.rr-photo-layout .rr-book-photo{margin:0}
.rr-photo-layout .rr-book-photo img{height:218px}
.rr-summary-title{font-weight:600;color:#e4dccb;font-size:24px;line-height:1.5;margin:18px 0}
.rr-caption{color:#9f9789;font-size:11px;line-height:1.8;margin:8px 0 0}
.rr-bottom{margin-top:38px;padding:26px 20px;text-align:center;border-top:1px solid rgba(195,155,93,.2)}
.rr-bottom p{margin:0 0 20px;color:#c4bbaa;font-size:17px;line-height:1.8}
.rr-action{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:10px 23px;border:1px solid #a48a57;border-radius:999px;background:rgba(170,128,58,.12);color:#eddfc3!important;font-size:14px;text-decoration:none}
.rr-note{color:#a49a8a;font-size:11px;line-height:1.9;text-align:center;margin:22px auto 0;max-width:780px}
.rr-hero a:focus-visible,.rr-hero summary:focus-visible,.reader-reviews a:focus-visible,.reader-reviews summary:focus-visible{outline:2px solid #e5c783;outline-offset:5px;border-radius:4px}
@media(max-width:720px){.rr-grid{grid-template-columns:1fr}.reader-reviews{padding:76px 0!important}.rr-wrap{padding:0 18px}.rr-head{margin-bottom:30px}.rr-card{padding:24px}.rr-lead{padding:25px 23px}.rr-lead .rr-context{font-size:15px}.rr-rule{margin-top:38px}.rr-hero{max-width:100%;margin-top:20px}.rr-photo-layout{grid-template-columns:minmax(0,1fr) 120px;gap:16px}.rr-photo-layout .rr-book-photo img{height:198px}}
@media(max-width:420px){.rr-card{padding:22px}.rr-photo-layout{grid-template-columns:1fr}.rr-photo-layout .rr-book-photo img{height:230px}.rr-head p{font-size:14px}.rr-hero blockquote{font-size:16px}.rr-meta{gap:6px 10px}.rr-capture{border-width:5px}}
</style>`;

const EVIDENCE_ROOT = '/reviews/';
const KYOBO = 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/';

// One entry per known reviewer, including reviews reposted across channels.
// Masked IDs on separate platforms are not asserted to be distinct people.
const REVIEWS = [
  {id:'kyobo-mi',author:'mi (마스킹 ID)',platform:'교보문고',volume:1,badge:'구매자 후기',date:'2026.07.28',quote:'첫 장부터 빨려들어갑니다.',url:KYOBO+'E000013298635',image:'kyobo-mi-book1-20260922.webp',width:816,height:127},
  {id:'ridi-tot',author:'tot***',platform:'리디',volume:3,badge:'구매자 후기',date:'2026.07.25',quote:'작가는 디테일과 장난질에 미쳐 있습니다.',context:'한 번 읽는 것보다 두 번째, 세 번째 읽을 때 더 많은 게 보입니다.',url:'https://ridibooks.com/books/5273014883',image:'ridi-book3-excerpt-20260922.webp',width:889,height:72},
  {id:'yes24-tj',author:'t…j (마스킹 ID)',platform:'YES24',volume:2,badge:'구매자 후기',date:'2026.09.15',topic:'손에 땀이 나는 긴장감',quote:'손에 땀이 나서 책장에 손자국도 났다.',context:'특히 마지막 놀이는 정말 숨을 참아가며 봤다.',url:'https://sarak.yes24.com/review/22410667',image:'yes24-book2-excerpt-20260922.webp',width:884,height:105},
  {id:'kyobo-tj',author:'tj (마스킹 ID)',platform:'교보문고',volume:2,badge:'구매자 후기',date:'2026.07.17',topic:'한국형 오컬트의 맛',quote:'오래간만에 맛보는 한국형 오컬트 별미입니다.',url:KYOBO+'E000013298720',image:'kyobo-tj-book2-20260922.webp',width:814,height:109},
  {id:'kyobo-yo',author:'yo (마스킹 ID)',platform:'교보문고',volume:3,badge:'구매자 후기',date:'2026.08.13',topic:'끝까지 읽은 뒤의 만족',quote:'마무리 부분도 매듭이 잘맺어진 느낌으로 재밌게 잘봤습니다.',url:KYOBO+'E000013298721'},
  {id:'kyobo-ls',author:'ls (마스킹 ID)',platform:'교보문고',volume:2,badge:'독자 후기',date:'2026.07.17',topic:'다음 권을 펼치게 하는 힘',quote:'뒷내용 궁금해서 참을 수 없음!! 1권읽고 바로 2권 읽었음!!',url:KYOBO+'E000013298720',image:'kyobo-ls-book2-20260922.webp',width:814,height:107},
  {id:'haeya',author:'해야',platform:'네이버 블로그',volume:1,badge:'도서 제공 서평',topic:'눈앞에 그려지는 장면',quote:'마치 잘 만들어진 영화 한편을 보는듯한 느낌을 받았다.',url:'https://blog.naver.com/haeya_s2/224390447851',photo:'haeya-book1-photo-20260922.webp'},
  {id:'nanan',author:'나난',platform:'네이버 블로그',volume:1,badge:'도서 제공 서평',topic:'망설임을 넘어선 재미',quote:'하지만 이 모든 걱정과 고민과 불안에도 불구하고 이야기는 확실히 재미를 안겨준다.',description:'낯선 작가, 세 권의 긴 이야기. 읽기 전의 망설임을 털어놓은 서평은, 그럼에도 이야기가 주는 재미를 이야기합니다.',url:'https://blog.naver.com/noon472/224418554577',image:'nanan-book1-excerpt-20260922.webp',width:734,height:163},
  {id:'egg',author:'달걀댁',platform:'알라딘 서재',volume:1,badge:'도서 제공 서평',topic:'취향을 건드리는 퇴마와 전투',quote:'무엇보다도 내 취향에 딱 맞는 작품이었다.',description:'부적마다 다른 기능과 역동적인 전투 장면을 인상적으로 읽었다는 감상입니다.',url:'https://blog.aladin.co.kr/monkeyking/17476771'},
  {id:'soso',author:'소소 (kindlyhj)',platform:'네이버 블로그',volume:2,badge:'도서 제공 서평',topic:'두 번째 권에서 넓어지는 세계',summary:'1권을 다시 훑고 읽은 2권에서 넓어지는 세계와 빠른 전개를 인상적으로 받아들인 감상.',url:'https://blog.naver.com/kindlyhj/224415759199'}
];

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function sourceLink(r){
  return '<a class="rr-source" href="'+escapeHtml(r.url)+'" target="_blank" rel="noopener noreferrer" data-track="review_source_'+r.id+'">'+escapeHtml(r.platform)+'에서 원문 보기 <span aria-hidden="true">↗</span></a>';
}
function metadata(r){
  return '<div class="rr-meta"><span class="rr-badge'+(r.badge==='도서 제공 서평'?' rr-gift':'')+'">'+r.badge+'</span><cite>'+escapeHtml(r.platform)+' · '+escapeHtml(r.author)+' · '+r.volume+'권'+(r.date?' · '+r.date:'')+'</cite></div>';
}
function capture(file,width,height,alt,extra=''){
  return '<a class="rr-capture '+extra+'" href="'+EVIDENCE_ROOT+file+'" target="_blank" rel="noopener noreferrer" aria-label="'+escapeHtml(alt)+' 확대 보기"><img src="'+EVIDENCE_ROOT+file+'" width="'+width+'" height="'+height+'" alt="'+escapeHtml(alt)+'" loading="lazy" decoding="async"></a>';
}
function evidence(r,caption='실제 후기 캡처 · 누르면 확대해서 볼 수 있습니다.'){
  return '<figure class="rr-evidence">'+capture(r.image,r.width,r.height,r.platform+' '+r.author+' '+r.volume+'권 후기 발췌')+'<figcaption>'+caption+'</figcaption></figure>';
}
function details(r){
  if(!r.image) return sourceLink(r);
  return '<details class="rr-details"><summary>후기 캡처와 출처 보기</summary>'+evidence(r)+sourceLink(r)+'</details>';
}
function shortCard(r,index){
  const visible=r.id==='yes24-tj';
  return '<article class="rr-card" data-review-id="'+r.id+'"><div class="rr-topic"><span>'+r.topic+'</span><span>0'+(index+1)+' / '+r.volume+'권</span></div><blockquote>“'+escapeHtml(r.quote)+'”</blockquote>'+
    (r.context?'<p class="rr-context">“'+escapeHtml(r.context)+'”</p>':'')+metadata(r)+
    (visible?evidence(r,'YES24 2권 리뷰 중 해당 문단 발췌 · 누르면 확대')+
      '<details class="rr-details"><summary>구매 표시와 출처 보기</summary><figure class="rr-evidence">'+capture('yes24-book2-header-20260922.webp',536,78,'YES24 2권 구매 표시, 마스킹 ID와 작성일')+'<figcaption>위 발췌문과 같은 후기의 제목·작성 정보입니다.</figcaption></figure>'+sourceLink(r)+'</details>':details(r))+'</article>';
}
function longCard(r){
  const body=r.summary?'<p class="rr-summary-title">'+r.topic+'</p><p class="rr-context">'+r.summary+'</p><p class="rr-caption">서평 내용 요약 · 직접 인용문이 아닙니다.</p>':
    '<blockquote>“'+escapeHtml(r.quote)+'”</blockquote>'+(r.description?'<p class="rr-context">'+r.description+'</p>':'');
  const photo=r.photo?'<a class="rr-book-photo" href="'+EVIDENCE_ROOT+r.photo+'" target="_blank" rel="noopener noreferrer" aria-label="해야 독자가 찍은 매듭 1권 사진 확대 보기"><img src="'+EVIDENCE_ROOT+r.photo+'" width="693" height="867" alt="해야 서평에 실린 매듭 1권 실제 책 사진" loading="lazy" decoding="async"></a>':'';
  return '<article class="rr-card" data-review-id="'+r.id+'"><div class="rr-topic"><span>'+(r.summary?'이어 읽은 독자의 감상':r.topic)+'</span><span>'+r.volume+'권</span></div>'+
    (photo?'<div class="rr-photo-layout"><div>'+body+'</div>'+photo+'</div>':body)+metadata(r)+details(r)+'</article>';
}
const hero=REVIEWS[0],lead=REVIEWS[1];
const HERO_REVIEW='<aside class="rr-hero" data-review-id="'+hero.id+'" aria-label="첫 장을 읽은 독자의 반응"><blockquote>“'+hero.quote+'”</blockquote>'+metadata(hero)+details(hero)+'</aside>';
const REVIEW_SECTION='<section class="section reader-reviews" id="reader-reviews" aria-labelledby="reader-reviews-title"><div class="rr-wrap">'+
  '<header class="rr-head"><span class="rr-kicker">READER REVIEWS</span><h2 id="reader-reviews-title">읽은 뒤에야<br>나온 말들.</h2><p>첫 장의 흡입력부터, 마지막 장을 덮은 뒤의 재독까지.<br>독자들이 남긴 문장과 실제 후기 화면을 모았습니다.</p></header>'+
  '<article class="rr-lead" data-review-id="'+lead.id+'"><span class="rr-eyebrow">다 읽고, 다시 펼치는 이야기</span><blockquote>“'+lead.quote+'”</blockquote><p class="rr-context">“'+lead.context+'”</p>'+metadata(lead)+evidence(lead,'리디 3권 리뷰 첫 문단 발췌 · 누르면 확대')+
  '<details class="rr-details"><summary>구매 표시와 원문 출처 보기</summary><figure class="rr-evidence">'+capture('ridi-book3-author-20260922.webp',256,59,'리디 구매자 tot***의 작성 정보','rr-author-capture')+'<figcaption>같은 후기의 작성 정보입니다. 전체 원문에는 작품 내용이 포함되어 있습니다.</figcaption></figure>'+sourceLink(lead)+'</details></article>'+
  '<div class="rr-grid" aria-label="긴장감, 장르, 완결과 이어 읽기 후기">'+REVIEWS.slice(2,6).map(shortCard).join('')+'</div>'+
  '<div class="rr-rule"><h3>책을 곁에 두고 쓴 이야기</h3><p>읽기 전의 망설임부터 취향에 닿은 순간까지.<br>아래 네 편은 도서를 제공받아 작성된 서평입니다.</p></div>'+
  '<div class="rr-grid" aria-label="도서 제공 서평 네 편">'+REVIEWS.slice(6).map(longCard).join('')+'</div>'+
  '<div class="rr-bottom"><p>이번에는, 첫 장을 직접 펼쳐보세요.</p><a class="rr-action" href="./preview" data-track="review_preview_book1">1권 미리 읽기 <span aria-hidden="true">&nbsp; →</span></a></div>'+
  '<p class="rr-note">인용문은 원문 일부를 발췌했습니다. 구매자 표시는 판매처에서 확인된 후기에만 붙였습니다.<br>마스킹된 아이디는 가린 상태로 표시하며, 각 카드에서 원문을 확인할 수 있습니다.</p></div></section>';

function isHtml(response){
  return (response.headers.get('content-type')||'').toLowerCase().includes('text/html');
}
export function shouldAddReaderReviews(request,response){
  if(request.method!=='GET'||!response.ok||!isHtml(response)) return false;
  const pathname=new URL(request.url).pathname;
  return pathname==='/'||pathname==='/index.html';
}
export function addReaderReviews(response){
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  const htmlResponse=new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  return new HTMLRewriter()
    .on('head',{element(element){element.append(REVIEW_STYLE,{html:true});}})
    .on('.navlinks',{element(element){element.append(REVIEW_NAV_LINK,{html:true});}})
    .on('.hero-actions',{element(element){element.after(HERO_REVIEW,{html:true});}})
    .on('#seed-serial',{element(element){element.before(REVIEW_SECTION,{html:true});}})
    .transform(htmlResponse);
}
