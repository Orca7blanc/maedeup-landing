# Mobile store links

Checked against public vendor code on 2026-10-19. The optional app actions are
progressive enhancements on `/` and `/read`; the original HTTPS purchase links
remain available with JavaScript disabled and on desktop.

## Verified routing syntax

| Store | Native route | Android package |
| --- | --- | --- |
| 교보문고 shopping app | `kyobobook://webview?url=<encoded HTTPS product URL>` | `mok.android` |
| YES24 shopping app | `YES24://MAIN?returnUrl=<encoded HTTPS product URL>` | `com.yes24.commerce` |

Kyobo evidence:

- The mobile HTML at <https://www.kyobobook.co.kr> and
  <https://event.kyobobook.co.kr/guide/app> contains an `APP 열기` link whose
  `deeplink_custom_path` uses the `kyobobook://webview?url=` router.
- The linked official `apps.kyobobook.co.kr` endpoint launches that same router
  for both Android and iOS. Its Android store fallback names `mok.android`.
- <https://apps.kyobobook.co.kr/.well-known/apple-app-site-association> names
  `8EAYGV6GQ9.com.kyobobook.m`. This does not establish that ordinary product URLs
  are universal links.

YES24 evidence:

- <https://m.yes24.com/Scripts/Common/commonV2.js?v=20261001>, `goApp(type, info)`:
  `MAIN` builds `?returnUrl=` with `encodeURIComponent(info)` and generates
  `YES24://MAIN?...` / `intent://MAIN?...#Intent;scheme=YES24;package=com.yes24.commerce;end`.
- Its current external-browser branch uses a generic Airbridge URL and can lose
  the product destination. We use the explicitly defined native route and keep
  the existing exact HTTPS product URL as the fallback, rather than copying a
  vendor marketing/tracking campaign link.

Only the four existing, allowlisted product URLs can be placed in these app
routes. No visitor query parameters, private data, or arbitrary destinations
are forwarded. These are shopping apps, not ebook reader apps.

## Fallback and measurement

Android links include Chrome's documented `S.browser_fallback_url`:
<https://developer.chrome.com/docs/android/intents>. Browsers that do not support
the intent may still require the visible web purchase link. iOS uses the native
scheme with a visible web alternative. There is no delayed automatic navigation:
it could move the browser after a successful app launch or when the user returns.

Each app action copies its source link's exact `data-track` target. Existing
delegated analytics records one click; `/read.js` runs first to preserve its
campaign suffix. A recorded click is an attempted store/app opening, not proof
that the app opened or a purchase completed.

## Unverified stores and device limits

RIDI retains its web purchase link. Its official product-page JavaScript exposes
reader/download schemes obtained from authenticated purchase APIs, but no public
product purchase route was verified. `지원 환경: 앱` describes reading support.
The public RIDI AASA response contained only `webcredentials`, not `applinks`.
Do not invent a `ridi://` product path from the numeric book ID.

Aladin and Youngpoong keep their original web links; their product app routes
were not verified. Native installed-app execution, app version differences and
Instagram/Threads in-app browser behavior require real-device verification and
are not claimed as tested by the automated checks.
