const REVIEW_NAV_LINK = '<a class="reader-review-nav-link" href="#reader-reviews" data-track="reader_reviews_nav">독자 후기</a>';

const REVIEW_STYLE = String.raw`
<style id="maedeup-reader-reviews-style">
.reader-review-nav-link{display:inline-flex!important;align-items:center;gap:7px;color:#d5c29b!important}.reader-review-nav-link:before{content:"";width:6px;height:6px;border-radius:999px;background:#b23737;box-shadow:0 0 12px rgba(178,55,55,.68)}
.reader-reviews{position:relative;isolation:isolate;padding-top:104px!important;padding-bottom:112px!important;overflow:hidden;background:radial-gradient(68% 62% at 50% 0%,rgba(107,26,28,.16),transparent 72%),linear-gradient(180deg,rgba(8,12,20,.02),rgba(10,11,14,.48) 42%,rgba(8,10,15,.12))}
.reader-reviews:before{content:"";position:absolute;z-index:-1;inset:36px 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(195,155,93,.28),transparent)}
.reader-reviews .reader-reviews-wrap{max-width:1080px;margin:0 auto;padding:0 24px}.reader-reviews-head{max-width:760px;margin:0 auto 48px;text-align:center}
.reader-reviews-kicker{display:inline-flex;align-items:center;gap:11px;margin-bottom:16px;color:#bda879;font-size:11px;font-weight:700;letter-spacing:.18em}.reader-reviews-kicker:before,.reader-reviews-kicker:after{content:"";width:28px;height:1px;background:rgba(189,168,121,.48)}
.reader-reviews h2{margin:0 0 16px;color:#eee7da;font-size:clamp(30px,5vw,52px);line-height:1.22;letter-spacing:-.035em}.reader-reviews-intro{margin:0;color:#a69e92;font-size:clamp(15px,2vw,17px);line-height:1.8}
.reader-review-lead{position:relative;max-width:800px;margin:0 auto 30px;padding:34px clamp(24px,5vw,52px);overflow:hidden;text-align:center;border:1px solid rgba(195,155,93,.22);border-radius:24px;background:linear-gradient(145deg,rgba(27,29,35,.96),rgba(13,15,21,.94));box-shadow:0 28px 80px rgba(0,0,0,.3)}
.reader-review-lead:before{content:"매듭";position:absolute;right:-16px;bottom:-28px;color:rgba(195,155,93,.045);font-family:serif;font-size:116px;font-weight:800;line-height:1;transform:rotate(-7deg)}
.reader-review-source{display:inline-flex;align-items:center;gap:7px;margin-bottom:14px;color:#bda879;font-size:12px;font-weight:700;letter-spacing:.04em}.reader-review-source:before{content:"✓";display:grid;place-items:center;width:18px;height:18px;color:#e0cc9e;border:1px solid rgba(195,155,93,.42);border-radius:50%;font-size:10px}
.reader-review-lead blockquote{position:relative;margin:0;color:#f4efe5;font-size:clamp(23px,4vw,36px);font-weight:700;line-height:1.45;letter-spacing:-.035em}
.reader-review-journey{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:0 0 26px}.reader-review-card{position:relative;min-height:254px;padding:28px 26px 26px;border:1px solid rgba(255,255,255,.085);border-radius:22px;background:linear-gradient(160deg,rgba(28,31,39,.9),rgba(15,17,23,.93));box-shadow:0 20px 52px rgba(0,0,0,.2);transition:transform .24s ease,border-color .24s ease,background .24s ease}.reader-review-card:hover{transform:translateY(-3px);border-color:rgba(195,155,93,.27);background:linear-gradient(160deg,rgba(33,35,43,.94),rgba(16,18,24,.96))}
.reader-review-step{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:28px}.reader-review-volume{color:#dfcfad;font-size:13px;font-weight:800}.reader-review-role{color:#77756f;font-size:11px;letter-spacing:.08em}.reader-review-card blockquote{margin:0 0 24px;color:#e9e4dc;font-size:clamp(18px,2.2vw,23px);font-weight:650;line-height:1.58;letter-spacing:-.025em}.reader-review-card cite{position:absolute;right:26px;bottom:24px;color:#89847c;font-size:11px;font-style:normal}
.reader-review-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:38px}.reader-review-mini{padding:20px;border-left:2px solid rgba(157,49,50,.65);border-radius:0 14px 14px 0;background:rgba(255,255,255,.035)}.reader-review-mini b{display:block;margin-bottom:10px;color:#a99a7e;font-size:12px}.reader-review-mini p{margin:0;color:#c7c1b8;font-size:14px;line-height:1.65}
.reader-proof-zone{padding:28px;border:1px solid rgba(255,255,255,.075);border-radius:24px;background:rgba(6,8,13,.42)}.reader-proof-head{display:flex;align-items:end;justify-content:space-between;gap:22px;margin-bottom:20px}.reader-proof-head h3{margin:0 0 6px;color:#e4ddd0;font-size:22px;letter-spacing:-.025em}.reader-proof-head p{margin:0;color:#817d75;font-size:13px;line-height:1.65}.reader-proof-badge{flex:0 0 auto;padding:7px 11px;color:#c9b78f;border:1px solid rgba(195,155,93,.28);border-radius:999px;font-size:11px}
.reader-proof-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.reader-proof{overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(22,24,30,.88)}.reader-proof summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;color:#d8d1c6;cursor:pointer;font-size:14px;font-weight:700;list-style:none}.reader-proof summary::-webkit-details-marker{display:none}.reader-proof summary:after{content:"＋";color:#ae9a72;font-size:18px;font-weight:400;transition:transform .2s ease}.reader-proof[open] summary:after{transform:rotate(45deg)}.reader-proof-body{padding:0 12px 14px}.reader-proof-body img{display:block;width:100%;height:auto;border-radius:10px;background:#fff}.reader-proof-link{display:flex;justify-content:center;margin-top:12px;padding:10px 12px;color:#cab78f!important;border:1px solid rgba(195,155,93,.2);border-radius:10px;font-size:12px;font-weight:700;text-decoration:none}.reader-proof-link:hover{background:rgba(195,155,93,.08)}
.reader-review-note{margin:18px 2px 0;color:#716e68;font-size:11px;line-height:1.75;text-align:center}.reader-review-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:28px}.reader-review-action{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 19px;color:#e2d7c3!important;border:1px solid rgba(195,155,93,.27);border-radius:999px;background:rgba(195,155,93,.07);font-size:13px;font-weight:750;text-decoration:none;transition:background .2s ease,border-color .2s ease,transform .2s ease}.reader-review-action:hover{transform:translateY(-2px);border-color:rgba(195,155,93,.5);background:rgba(195,155,93,.13)}
@media(max-width:820px){.reader-review-journey,.reader-review-mini-grid{grid-template-columns:1fr}.reader-review-card{min-height:0;padding-bottom:64px}.reader-proof-grid{grid-template-columns:1fr}.reader-proof-head{align-items:flex-start;flex-direction:column}.reader-proof-badge{align-self:flex-start}}
@media(max-width:560px){.reader-reviews{padding-top:78px!important;padding-bottom:82px!important}.reader-reviews .reader-reviews-wrap{padding:0 18px}.reader-reviews-head{margin-bottom:34px}.reader-review-lead{padding:29px 20px;border-radius:20px}.reader-review-journey{gap:12px}.reader-review-card{padding:24px 21px 62px;border-radius:18px}.reader-review-card cite{right:21px}.reader-review-mini{padding:17px}.reader-proof-zone{padding:20px 14px;border-radius:20px}.reader-proof summary{padding:15px 14px}.reader-review-actions{align-items:stretch;flex-direction:column}.reader-review-action{width:100%}}
@media(prefers-reduced-motion:reduce){.reader-review-card,.reader-proof summary:after,.reader-review-action{transition:none!important}}
</style>`;

const REVIEW_SECTION = String.raw`
<section class="section reader-reviews" id="reader-reviews" aria-labelledby="reader-reviews-title">
  <div class="reader-reviews-wrap reveal is-in">
    <header class="reader-reviews-head">
      <span class="reader-reviews-kicker">READER REVIEWS</span>
      <h2 id="reader-reviews-title">독자들이 먼저 말한 《매듭》</h2>
      <p class="reader-reviews-intro">실제 판매처에 남겨진 독서 경험입니다.<br/>시작의 흡입력부터 완결 뒤의 재해석까지 한 흐름으로 모았습니다.</p>
    </header>

    <article class="reader-review-lead">
      <span class="reader-review-source">리디 구매자 후기</span>
      <blockquote>“경상도 오컬트라니 귀합니다.”</blockquote>
    </article>

    <div class="reader-review-journey" aria-label="권별 구매자 후기">
      <article class="reader-review-card">
        <div class="reader-review-step"><span class="reader-review-volume">1권 · 시작</span><span class="reader-review-role">첫 장의 흡입력</span></div>
        <blockquote>“첫 장부터 빨려들어갑니다.”</blockquote>
        <cite>교보문고 eBook 구매자 후기</cite>
      </article>
      <article class="reader-review-card">
        <div class="reader-review-step"><span class="reader-review-volume">2권 · 이어 읽기</span><span class="reader-review-role">멈추지 않는 전개</span></div>
        <blockquote>“몰입감있는 글에 시간가는줄 모르고 내리 읽었네요.”</blockquote>
        <cite>교보문고 eBook 구매자 후기</cite>
      </article>
      <article class="reader-review-card">
        <div class="reader-review-step"><span class="reader-review-volume">3권 · 완결</span><span class="reader-review-role">복선과 재독</span></div>
        <blockquote>“다 읽고 나니 앞권에서 지나쳤던 사건들이 새롭게 보이네요.”</blockquote>
        <cite>교보문고 eBook 구매자 후기</cite>
      </article>
    </div>

    <div class="reader-review-mini-grid" aria-label="권별 한 줄 후기">
      <article class="reader-review-mini"><b>《문지방을 넘어온 것들》</b><p>“흡입력있는 문장에 디테일한 설정으로 재밌게 잘봤습니다.”</p></article>
      <article class="reader-review-mini"><b>《척추에 박은 못》</b><p>“오래간만에 맛보는 한국형 오컬트 별미입니다.”</p></article>
      <article class="reader-review-mini"><b>《뒤집힌 자궁》</b><p>“마무리 부분도 매듭이 잘맺어진 느낌으로 재밌게 잘봤습니다.”</p></article>
    </div>

    <div class="reader-proof-zone">
      <div class="reader-proof-head">
        <div><h3>실제 구매자 리뷰 화면</h3><p>텍스트 카드는 빠르게 읽고, 원본 캡처에서는 ‘eBook · 구매자’ 표시와 리뷰의 전체 문맥을 확인할 수 있습니다.</p></div>
        <span class="reader-proof-badge">교보문고 eBook · 구매자 표시 확인</span>
      </div>
      <div class="reader-proof-grid">
        <details class="reader-proof">
          <summary>1권 리뷰 원본 보기</summary>
          <div class="reader-proof-body">
            <img src="/reviews/kyobo-ebook-1.webp" alt="교보문고 eBook 매듭 1권 구매자 리뷰 화면" loading="lazy" decoding="async"/>
            <a class="reader-proof-link" href="https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298635" target="_blank" rel="noopener noreferrer" data-track="review_kyobo_book1">교보문고에서 확인 →</a>
          </div>
        </details>
        <details class="reader-proof">
          <summary>2권 리뷰 원본 보기</summary>
          <div class="reader-proof-body">
            <img src="/reviews/kyobo-ebook-2.webp" alt="교보문고 eBook 매듭 2권 구매자 리뷰 화면" loading="lazy" decoding="async"/>
            <a class="reader-proof-link" href="https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298720" target="_blank" rel="noopener noreferrer" data-track="review_kyobo_book2">교보문고에서 확인 →</a>
          </div>
        </details>
        <details class="reader-proof">
          <summary>3권 리뷰 원본 보기</summary>
          <div class="reader-proof-body">
            <img src="/reviews/kyobo-ebook-3.webp" alt="교보문고 eBook 매듭 3권 구매자 리뷰 화면" loading="lazy" decoding="async"/>
            <a class="reader-proof-link" href="https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298721" target="_blank" rel="noopener noreferrer" data-track="review_kyobo_book3">교보문고에서 확인 →</a>
          </div>
        </details>
      </div>
      <p class="reader-review-note">리뷰어 아이디는 판매처에서 가린 상태 그대로 표시했습니다. 구매자 표시는 판매처 화면에서 실제로 확인되는 후기에만 사용했으며, 캡처는 해당 후기 영역만 잘라 실었습니다.</p>
      <div class="reader-review-actions">
        <a class="reader-review-action" href="https://ridibooks.com/books/5273014881" target="_blank" rel="noopener noreferrer" data-track="review_ridi_book1">리디 1권과 후기 보기</a>
        <a class="reader-review-action" href="https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298635" target="_blank" rel="noopener noreferrer" data-track="review_kyobo_all">교보문고 1권과 후기 보기</a>
      </div>
    </div>
  </div>
</section>`;

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
  const htmlResponse=new Response(response.body,{
    status:response.status,
    statusText:response.statusText,
    headers
  });

  return new HTMLRewriter()
    .on('head',{element(element){element.append(REVIEW_STYLE,{html:true})}})
    .on('.navlinks',{element(element){element.append(REVIEW_NAV_LINK,{html:true})}})
    .on('#seed-serial',{element(element){element.before(REVIEW_SECTION,{html:true})}})
    .transform(htmlResponse);
}
