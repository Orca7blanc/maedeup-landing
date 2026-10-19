import {renderUnfoldedReaderReviews} from './reader-reviews.js';
import {legacyExtrasStyle,legacyExtrasCard} from './home-extras.js';

const MARKERS = ['<nav class="nav">','<header class="hero" id="top">','<section class="bridge section" id="bridge">','<section class="section" id="world">','<section class="section scenes-showcase">','<section class="section" id="characters">','<section class="section quote-wall">','<section class="section" id="read">','<section class="section final">','<section class="section writer-notes" id="writer-notes">','<footer class="footer">','<script>'];
const STORE_LINKS={
  ebook:[['리디','https://ridibooks.com/books/5273014881','ridi'],['교보문고','https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298635','kyobo'],['YES24','https://m.yes24.com/goods/detail/194173626','yes24']],
  paper:[['교보문고','https://product.kyobobook.co.kr/detail/S000220619545','kyobo'],['YES24','https://www.yes24.com/product/goods/193866498','yes24'],['알라딘','https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=398378496','aladin'],['영풍문고','https://m.ypbooks.co.kr/books/202607202831420296','ypbooks']]
};
function stores(format){return STORE_LINKS[format].map(([name,url,id])=>`<a class="shop" href="${url}" target="_blank" rel="noopener noreferrer" data-track="home_${format}_book1_${id}"><span class="shop-name">${name}</span><span class="shop-format">1권 ${format==='ebook'?'전자책':'종이책'}</span></a>`).join('');}
const ORDER_STYLE=`<style id="home-order-adjustments">
.edition-label{font-family:var(--font-ui)!important;font-size:17px;line-height:1.7;color:var(--gold2);margin:22px 0 12px}.edition-label:first-child{margin-top:0}
#survival-test .recent-survivors{text-align:left}#survival-test .recent-survivors h3{font-size:26px;margin-bottom:0}
#survival-test .test-description{font-size:17px;line-height:1.9;margin:-12px 0 30px}
@media(prefers-reduced-motion:reduce){.text-phase{animation:none!important}.phase-1,.phase-2{display:none!important}.phase-3{opacity:1!important}}
</style>`;

/** Reorder the original dark landing page without replacing its visual design. */
export function buildSalesHome(html){
  let previous=html.indexOf('<body>');
  const positions=MARKERS.map(marker=>{const found=html.indexOf(marker,previous);if(found<0)throw new Error('Homepage section boundaries changed; refusing to discard existing content.');previous=found+marker.length;return found;});
  const parts=positions.slice(0,-1).map((start,i)=>html.slice(start,positions[i+1]));
  let [nav,hero,bridge,world,scenes,characters,quote,purchase,final,writer,footer]=parts;
  // Keep the original header and hero composition; their primary action now goes to buying.
  nav=nav.replace('<div class="navlinks"><a href="#world">세계</a><a href="#characters">인물</a><a href="#characters">생존유형</a><a href="#read">읽기</a></div>','<div class="navlinks"><a href="#reader-reviews">독자 후기</a><a href="#read">구매처</a><a href="#world">세계</a><a href="#characters">인물</a></div>')
    .replace('<a class="navcta" href="./test.html">K오컬트 생존유형 테스트</a>','<a class="navcta" href="#read" data-track="home_nav_stores">《매듭 1》 구매처 보기</a>');
  hero=hero.replace('<div class="result-chip" id="resultChip"></div>','')
    .replace('<a class="btn primary mokgan-primary" href="./test.html">14문항으로 유형 확인하기</a>','<a class="btn primary mokgan-primary" href="#read" data-track="home_hero_stores">《매듭 1》 구매처 보기</a>')
    .replace('<a class="btn ghost mokgan-secondary" href="#world">1권 이야기 보기</a>','<a class="btn ghost mokgan-secondary" href="/preview?from=home" data-home-preview data-track="home_hero_preview">1권 미리읽기</a>');
  const actionsStart=characters.indexOf('<div class="test-start-row reveal">');
  const recentStart=characters.indexOf('<div class="recent-survivors reveal"');
  const recentEnd=characters.lastIndexOf('</div>\n</section>');
  if(actionsStart<0||recentStart<0||recentEnd<recentStart)throw new Error('Character content is incomplete.');
  const recent=characters.slice(recentStart,recentEnd);
  characters=(characters.slice(0,actionsStart)+'</div></section>\n')
    .replace('10 SURVIVAL TYPES','CHARACTERS').replace('당신은 누구처럼 살아남을까.','밤을 건너는 이들')
    .replace('14개의 상황을 지나면, 《매듭》 속 인물 10명 가운데 당신과 가장 닮은 생존 방식이 나타납니다.','《매듭》 속 인물들을 만나보세요. 서로 다른 방식으로 경계를 넘는 사람들입니다.');
  // Preserve the two original purchase panels and their shop-button styling.
  const gridStart=purchase.indexOf('<div class="shopgrid">');
  const gridEnd=purchase.indexOf('<p class="shop-note">',gridStart);
  if(gridStart<0||gridEnd<0)throw new Error('Purchase panel is incomplete.');
  const allStores=`<div id="edition-ebook"><h4 class="edition-label">전자책 · 11,900원</h4><div class="shopgrid">${stores('ebook')}<a class="shop" href="https://www.aladin.co.kr/search/wsearchresult.aspx?AuthorSearch=%ec%9d%b4%ec%9e%90%ec%9a%b4@10770557&amp;BranchType=9" target="_blank" rel="noopener noreferrer" data-track="home_ebook_series_aladin"><span class="shop-name">알라딘</span><span class="shop-format">전자책 2·3권 목록</span></a></div></div><div id="edition-paper"><h4 class="edition-label">종이책 · 17,700원</h4><div class="shopgrid">${stores('paper')}</div></div>\n`;
  purchase=(purchase.slice(0,gridStart)+allStores+purchase.slice(gridEnd))
    .replace('이야기는 여기서 시작됩니다.','구매처 안내')
    .replace('서점별로 제공되는 판형이 다릅니다. 원하는 구매처를 선택해 주세요.','원하는 책 형태와 구매처를 선택해 주세요.')
    .replace('href="./preview"','href="/preview?from=home" data-home-preview data-track="home_store_preview"');
  bridge=bridge.replace('당신은 이미 문턱 앞에 서 있습니다.','당신은 누구처럼 살아남을까.')
    .replace('테스트 결과로 들어오면, 이곳에 당신과 닮은 인물과 그가 살아가는 세계가 표시됩니다.','14개의 상황을 지나, 《매듭》 속 당신과 닮은 생존 방식을 만나보세요.')
    .replace('<div class="bridge-title"','<div class="result-chip" id="resultChip"></div><div class="bridge-title"');
  final=final.replace('<section class="section final">','<section class="section final" id="survival-test">')
    .replace('<a class="btn primary mokgan-primary" href="#read">《매듭 문지방을 넘어온 것들》 읽기</a>','<p class="test-description">14문항으로 만나는, 당신의 생존 유형.</p><a class="btn primary mokgan-primary" href="/test.html" data-track="home_final_survival_test">생존유형 테스트 시작</a>')
    .replace('</div>\n</section>',recent+'</div>\n</section>');
  let head=html.slice(0,html.indexOf('<body>'));
  // Keep the pre-sales-page font families, weights and text assignments.
  // The original KoPubWorld stylesheet URL omitted its /css directory.
  head=head.replace('font-kopubworld@1.0.3/batang.min.css','font-kopubworld@1.0.3/css/batang.min.css');
  head=head.replace('</head>',legacyExtrasStyle+ORDER_STYLE+'<script src="/home-order.js?v=20261011" defer></script><script src="/store-app-links.js?v=20261020" defer></script></head>');
  head=head.replace(/font-size:\s*(\d+(?:\.\d+)?)px/g,(match,n)=>Number(n)<14?'font-size:14px':match);
  const scripts=html.slice(positions.at(-1),html.lastIndexOf('</body>'));
  return head+'<body class="original-home">'+nav+'<main id="main">'+hero+renderUnfoldedReaderReviews()+purchase+world+scenes+characters+quote.replace('</img>','')+writer+legacyExtrasCard+bridge+final+'</main>'+footer+scripts+'</body></html>';
}
export async function salesHomeResponse(response){
  if(!response.ok)return response;
  const html=buildSalesHome(await response.text());
  const headers=new Headers(response.headers);
  for(const name of ['content-length','etag','last-modified','content-encoding'])headers.delete(name);
  headers.set('cache-control','no-cache');
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
