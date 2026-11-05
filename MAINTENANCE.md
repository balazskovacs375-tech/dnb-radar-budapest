# DnB Radar karbantartás

Az események egyetlen fájlban, az `events.json`-ban vannak. Csak Budapest területén rendezett, jövőbeli drum & bass esemény kerülhet fel. Minden adatot a szervező, a helyszín vagy a hivatalos jegyoldal alapján kell kézzel ellenőrizni.

Hetente, csütörtökön:

1. Ellenőrizd minden esemény dátumát, helyszínét, fellépőit és a hivatalos linket. Töröld az elmúlt, megszűnt vagy már nem igazolható eseményeket.
2. Az `artists` és `description` mezőt csak hivatalos eseményleírás alapján javítsd. Röviden, saját szavakkal fogalmazz.
3. A `spotifyArtists` listába csak egyértelműen azonosított, hivatalos Spotify előadói profilt tegyél; az `id` a Spotify artist URL 22 karakteres azonosítója. Ha a név több előadóhoz tartozhat, hagyd ki.
4. A `price` mezőbe csak az ellenőrzéskor ténylegesen megvásárolható legolcsóbb, egy főre szóló jegyet írd. Ne számíts bele elfogyott, még nem elérhető, páros, junior vagy VIP jegyet. A `note` mezőben jelöld a belépési időkorlátot és a külön fizetendő díjakat. A `sourceUrl` a pontos hivatalos jegyoldal, a `checkedAt` az ellenőrzés napja. Ha az ár nem igazolható, töröld a teljes `price` mezőt.
5. Az `updatedAt` mezőbe az összes esemény ellenőrzésének dátuma kerüljön. A 7 napnál régebbi ár automatikusan eltűnik a nyilvános oldalról.
6. Ellenőrizd helyben a JSON-t és a JavaScriptet (`python3 -m json.tool events.json`, `node --check app.js`), majd közzététel után nézd meg a nyilvános oldalt mobilon és asztali nézetben.

Az oldal nem gyűjt látogatói adatot. A Spotify külső lejátszója csak az előadói gomb megnyomása után töltődik be. A jegyár nem foglalás vagy ajánlat: a fizetendő végösszeg és a készlet a hivatalos jegyoldalon érvényes.
