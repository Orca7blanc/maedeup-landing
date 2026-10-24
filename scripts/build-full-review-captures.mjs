import {writeFileSync} from 'node:fs';

// Display original JPEG pixels without rewriting text or resampling screenshots.
// y ranges are half-open and meet at verified whitespace between text lines.
export const reviews = [
  {
    slug:'nanan-book3', author:'나난', volume:3, height:5163,
    images:['nanan-book3-page1-20261025.jpg','nanan-book3-page2-20261025.jpg','nanan-book3-source-20261024.jpg','nanan-book3-page4-20261025.jpg'],
    slices:[[0,147,590],[0,1140,2028],[1,148,2010],[2,215,2010],[3,205,380]],
  },
  {
    slug:'kkamangsae-book1', author:'까망새', volume:1, height:6585,
    images:['kkamangsae-book1-page1-20261025.jpg','kkamangsae-book1-page2-20261025.jpg','kkamangsae-book1-page3-20261025.jpg','kkamangsae-book1-source-20261024.jpg'],
    slices:[[0,147,674],[0,1240,2038],[1,147,2005],[2,215,2015],[3,213,1815]],
  },
];

for (const review of reviews) {
  let offset=0;
  const pieces=review.slices.map(([page,start,end],i)=>{
    const height=end-start, y=offset;
    offset+=height;
    return `<svg class="capture-piece" id="part-${i+1}" x="0" y="${y}" width="1080" height="${height}" viewBox="0 ${start} 1080 ${height}" overflow="hidden"><image href="/reviews/${review.images[page]}" x="0" y="0" width="1080" height="2187"/></svg>`;
  }).join('\n');
  if(offset!==review.height)throw new Error(`Unexpected height: ${review.slug}`);
  const title=`${review.author} · 《매듭 ${review.volume}》 후기 전체`;
  const html=`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>${title}</title><link rel="stylesheet" href="/reviews/full-review.css"></head>
<body><header><nav aria-label="후기 페이지 탐색"><a href="/#reader-reviews">← 매듭 독자 후기</a><a href="/read#reviews">전자책 안내</a></nav><p class="eyebrow">책과콩나무 · 도서 제공 서평</p><h1>${title}</h1><p>처음부터 끝까지 이어 읽는 원문 캡처입니다.<br>휴대폰에서는 두 손가락으로 확대할 수 있습니다.</p></header>
<main><figure aria-label="${title} 원문 캡처 합본"><svg class="full-capture" xmlns="http://www.w3.org/2000/svg" width="1080" height="${review.height}" viewBox="0 0 1080 ${review.height}" role="img" aria-labelledby="capture-title capture-description"><title id="capture-title">${title}</title><desc id="capture-description">스크롤 캡처 네 장의 중복 영역과 앱 메뉴를 정리해 연결했습니다. 제목, 작성자, 책 사진, 도서 제공 표시와 후기 본문을 포함합니다.</desc>
${pieces}
</svg><figcaption>후기 끝 · 원문 캡처의 글과 사진을 그대로 이어 붙였습니다.</figcaption></figure></main><footer><a href="/#reader-reviews">매듭 독자 후기로 돌아가기 →</a></footer></body></html>\n`;
  writeFileSync(new URL(`../public/reviews/${review.slug}-full.html`,import.meta.url),html);
}
