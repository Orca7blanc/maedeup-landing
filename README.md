# 매듭 랜딩페이지

Cloudflare Workers Static Assets + D1 결과공유 게시판.

첫 배포 후 Cloudflare Dashboard > Worker > Bindings > Add binding > D1 database 에서 변수명을 `DB`로 지정하고 기존 `maedeup-survivors` 데이터베이스를 선택하세요.

## 전자책 1권 광고 도착지

`/read`는 첫 권의 가격, 독자 후기, 리디·교보문고 전자책 상세페이지와 미리보기를 담은 가벼운 구매 안내입니다. 기존 홈페이지의 구매 링크는 유지합니다. 교보문고 상세페이지는 성인인증 로그인을 요구합니다.

광고 A/B/C는 같은 페이지를 사용하고 `utm_content=A`, `B`, `C`로 구분합니다.
`/read?utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=A`

미리보기의 `from=ebook` 방문에 한해 구매 버튼이 `/read#stores`로 돌아옵니다. 허용된 캠페인 값만 전달합니다. 검수에는 `analytics=off`를 사용하세요.

기존 익명 통계 수집기를 사용해 방문·서점 이동·미리보기 클릭 이름에 광고 구분을 붙입니다. 외부 서점의 결제 완료는 수집하지 않으며, 이 클릭을 구매 전환으로 간주하지 않습니다. Meta Pixel/Purchase 연동을 추가한 변경은 아닙니다.
