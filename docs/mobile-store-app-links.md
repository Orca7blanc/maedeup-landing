# Mobile store links

Checked against public vendor code on 2026-10-20. The optional app actions are
progressive enhancements on `/` and `/read`; the original HTTPS purchase links
remain available with JavaScript disabled and on desktop.

## Verified routing syntax

| Store | Native route | Android package |
| --- | --- | --- |
| 교보문고 shopping app | Official HTTPS dispatcher below, containing a `kyobobook://webview?url=` destination | `mok.android` |
| YES24 shopping app | `YES24://MAIN?returnUrl=<encoded HTTPS product URL>` | `com.yes24.commerce` |
| RIDI Android app | `ridi://ContentsHome/5273014881/share` | `com.initialcoms.ridi` |

Kyobo evidence:

- The mobile HTML at <https://www.kyobobook.co.kr> and
  <https://event.kyobobook.co.kr/guide/app> contains an `APP 열기` link whose
  `deeplink_custom_path` uses the `kyobobook://webview?url=` router.
- The button uses this HTTPS App Link dispatcher:
  `https://apps.kyobobook.co.kr/api/v1/click/53ZVm7lpXE2DBPo45wUhTw/ZVGe11UKI0iOYYg0gDMeWw`.
  We add only `deeplink_custom_path`, set to the encoded native route containing
  the encoded original HTTPS product URL. No vendor campaign labels or landing
  page query parameters are copied.
- Both exact existing book destinations returned HTTP 200 through this endpoint,
  preserving their product URL in the generated native route. Its Android
  response falls back to the store (`mok.android`), while the iPhone response
  identifies App Store ID `464243977`. The Android HTML does **not** establish
  that a raw `kyobobook:` intent can launch the app: the installed app may handle
  the HTTPS link before that HTML executes.
- <https://apps.kyobobook.co.kr/.well-known/assetlinks.json> declares
  `delegate_permission/common.handle_all_urls` for `mok.android`.
- <https://apps.kyobobook.co.kr/.well-known/apple-app-site-association> names
  `8EAYGV6GQ9.com.kyobobook.m`. This does not establish that ordinary product URLs
  are universal links.
- The target is the shopping app, not the separate `교보eBook` reader
  (`com.kyobo.ebook.common.b2c`). The button and helper now make that distinction.

The user reported both original Kyobo app actions opening Chrome. That is
consistent with the old intent's `browser_fallback_url` being used, but does not
identify whether the failure was app resolution, a different installed app,
link-opening preferences or the browser environment. The correction follows the
vendor's observed HTTPS button rather than claiming an unverified native scheme
is supported. Actual installed-app execution remains a real-device check.

YES24 evidence:

- <https://m.yes24.com/Scripts/Common/commonV2.js?v=20261001>, `goApp(type, info)`:
  `MAIN` builds `?returnUrl=` with `encodeURIComponent(info)` and generates
  `YES24://MAIN?...` / `intent://MAIN?...#Intent;scheme=YES24;package=com.yes24.commerce;end`.
- Its current external-browser branch uses a generic Airbridge URL and can lose
  the product destination. We use the explicitly defined native route and keep
  the existing exact HTTPS product URL as the fallback, rather than copying a
  vendor marketing/tracking campaign link.

RIDI evidence (Android):

- <https://ridibooks.com/support/app/download> links the official APK at
  <https://getapp.ridibooks.com/apk>. The current download identifies itself as
  version `26.10.2`, package `com.initialcoms.ridi`.
- Read-only inspection of that APK's manifest confirms a `VIEW`/`BROWSABLE`
  intent filter accepting the `ridi` scheme. Its sharing code obtains
  `Book.getBookId()` and constructs `ridi://ContentsHome/` + book ID + `/share`.
- The Android button therefore uses `ContentsHome/5273014881/share` with scheme
  `ridi`, the explicit package, and the original web product as Chrome fallback.
  It opens the book route rather than downloading or opening a purchased file.
- The iOS implementation of this product route was not separately verified.
  RIDI's original web action remains unchanged on iPhone and iPad; do not infer
  iOS support solely from the Android APK.

Only the five existing, allowlisted product URLs can be placed in these app
routes. No visitor query parameters, private data, or arbitrary destinations
are forwarded. Kyobo and YES24 target shopping apps; RIDI targets its book detail.

## Fallback and measurement

YES24 and RIDI Android links include Chrome's documented `S.browser_fallback_url`:
<https://developer.chrome.com/docs/android/intents>. Browsers that do not support
the intent may still require the visible web purchase link. YES24 iOS uses the
native scheme with a visible web alternative. Kyobo uses the official HTTPS
dispatcher on both platforms; if its app cannot open, the vendor may offer the
app store. The original web product button is always available separately.
The landing page adds no delayed automatic navigation:
it could move the browser after a successful app launch or when the user returns.

Each app action copies its source link's exact `data-track` target. Existing
delegated analytics records one click; `/read.js` runs first to preserve its
campaign suffix. A recorded click is an attempted store/app opening, not proof
that the app opened or a purchase completed.

## Unverified stores and device limits

RIDI's original web purchase link remains available on every device. The public
RIDI AASA response contained only `webcredentials`, not `applinks`, so the regular
HTTPS book URL alone is not treated as a verified universal link. The newly
verified Android native sharing route is the evidence for its optional app action.

Aladin and Youngpoong keep their original web links; their product app routes
were not verified. Native installed-app execution, app version differences and
Instagram/Threads in-app browser behavior require real-device verification and
are not claimed as tested by the automated checks.
