# DnB Radar karbantartás

Az események egyetlen fájlban, az `events.json`-ban vannak. Csak Budapest területén rendezett, jövőbeli drum & bass esemény kerülhet fel. Minden adatot a szervező, a helyszín vagy a hivatalos jegyoldal alapján kell kézzel ellenőrizni.

Hetente, csütörtökön:

1. Ellenőrizd minden esemény dátumát, helyszínét, fellépőit és a hivatalos linket. Töröld az elmúlt, megszűnt vagy már nem igazolható eseményeket.
2. Az `artists` és `description` mezőt csak hivatalos eseményleírás alapján javítsd. Röviden, saját szavakkal fogalmazz. Az angol `descriptionEn` ugyanazokat a tényeket közölje, új állítást ne tartalmazzon. Új eseménynél mindkét nyelvi mezőt töltsd ki.
3. A `spotifyArtists` listába csak egyértelműen azonosított, hivatalos Spotify előadói profilt tegyél; az `id` a Spotify artist URL 22 karakteres azonosítója. A `profileUrl` a pontos előadói URL, az `imageUrl` pedig a Spotify hivatalos oEmbed válaszának `thumbnail_url` mezője legyen. A `socials` és az eseményszintű `artistSocials` mezőbe csak hivatalos előadói, szervezői vagy helyszíni oldalról igazolt Instagram/Facebook/SoundCloud linket írj. Ha a név több előadóhoz tartozhat, hagyd ki.
4. A `price` mezőbe csak az ellenőrzéskor ténylegesen megvásárolható legolcsóbb, egy főre szóló jegyet írd. Ne számíts bele elfogyott, még nem elérhető, páros, junior vagy VIP jegyet. A `note` és az angol `noteEn` mezőben ugyanazt a belépési időkorlátot és külön fizetendő díjat jelöld. A `sourceUrl` a pontos hivatalos jegyoldal, a `checkedAt` az ellenőrzés napja. Ha az ár nem igazolható, töröld a teljes `price` mezőt.
5. Az `updatedAt` mezőbe az összes esemény ellenőrzésének dátuma kerüljön. A 7 napnál régebbi ár automatikusan eltűnik a nyilvános oldalról.
6. Új helyszínnél a `venue-locations.json` fájlba is vegyél fel ellenőrzött koordinátát. A meglévő pontokat az OpenStreetMap Nominatim adatai alapján ellenőriztük 2026-11-06-án. Az események `id` értékét ne változtasd meg: ezek a megosztható eseménylinkek célpontjai.
7. Ellenőrizd helyben a JSON-t és a JavaScriptet (`python3 -m json.tool events.json`, `python3 -m json.tool venue-locations.json`, `node --check i18n.js`, `node --check app.js`, `node --check map.js`, `node --test tests/*.test.js`), majd közzététel után nézd meg a nyilvános oldalt magyarul és angolul, mobilon és asztali nézetben. A felület fordításai az `i18n.js` fájlban vannak; új esemény esetén a hivatalos link címkéje is kapjon angol változatot (`linkLabelEn`), ha nem egyezik a három ismert címkével.

Az oldal nem kér fiókot, nevet vagy e-mail-címet. A korábbi nyilvános Wishlist felülete már nincs az oldalon; a `wishlist.js` fájl nincs betöltve. A korábbi bejegyzéseket nem töröltük. A privát eseménybeküldő a külön „DnB Radar Event Suggestions” Apps Script projektben működik. A helyi kódja a `../event-submissions/Code.gs` fájlban van. Az űrlap csak programadatokat kér; a javaslatot az `ANA_EMAIL` privát szkripttulajdonságban megadott postafiókba küldi, naponta legfeljebb 30 levelet. A fogadó nyilvános GET-válasza nem tartalmaz beküldéseket. A javaslatok nem kerülnek automatikusan az `events.json` fájlba; csak kézi ellenőrzés után jelenhetnek meg. A 2026-11-07-i, „TESZT - NEM VALODI ESEMENY” jelű próbát ne publikáld.

A térkép Leafletet használ a saját `assets/leaflet` mappából, a térképlapok az OpenStreetMap kiszolgálójáról töltődnek be. A szerzői attribúciót ne távolítsd el, és ne vezess be csempék előzetes vagy tömeges letöltését. A helyszínjelölő egy helyen több eseményt is felsorol.

Az előadói képek a Spotify képkiszolgálójáról töltődnek be; a Spotify külső lejátszója csak az előadói gomb megnyomása után töltődik be. A jegyár nem foglalás vagy ajánlat: a fizetendő végösszeg és a készlet a hivatalos jegyoldalon érvényes.
