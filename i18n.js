const messages = {
  hu: {
    pageTitle: 'Drum And Bass X Budapest — DnB Radar',
    metaDescription: 'DnB Radar: budapesti drum & bass bulik, fellépői zenék, ellenőrzött jegyárak és hivatalos jegylinkek.',
    skip: 'Ugrás az eseményekhez', brandAria: 'DnB Radar kezdőlap',
    upcoming: 'Közelgő programok', eventsLoading: 'Ellenőrzött adatok betöltése…',
    noEvents: 'Nincs közelgő program', noVerifiedEvents: 'Jelenleg nincs igazolt közelgő budapesti esemény a listában.',
    wishlistEyebrow: 'KÖZÖSSÉGI KÍVÁNSÁGLISTA', wishlistTitleOne: 'Kit hoznál', wishlistTitleTwo: 'Budapestre?',
    wishlistIntro: 'Írd be, melyik drum & bass előadót látnád szívesen. Nem kell regisztráció; a kívánságod azonnal nyilvános lesz.',
    artistName: 'Előadó neve', artistPlaceholder: 'Például: egy előadó neve', addWish: 'Felírom ↗',
    wishlistStatusInitial: 'Csak előadói neveket írj be; a lista minden látogatónak látható.',
    wishes: 'Kívánságok', wishesLoading: 'Kívánságok betöltése…',
    wishlistNoWishes: 'Még nincs kívánság. Írd be az első előadót.',
    wishlistUnavailable: 'A kívánságlista most nem érhető el.',
    wishlistValidation: 'Írj be egy 2–70 karakteres előadói nevet, hivatkozás nélkül.',
    wishlistDuplicate: 'Ez az előadó már szerepel a listán.', wishlistSaving: 'Kívánság mentése…',
    wishlistSuccess: 'Felkerült a nyilvános kívánságlistára.',
    wishlistUnconfirmed: 'A mentést most nem tudtuk megerősíteni. Frissítsd az oldalt, mielőtt újra elküldöd.',
    wishlistSubmitFailed: 'Most nem sikerült elérni a kívánságlistát. Próbáld újra később.',
    footerDescription: 'Budapesti drum & bass eseménynaptár', backToTop: 'Vissza az elejére ↑',
    spotifyLabel: 'Spotify-dalok', spotifyHint: 'Válassz előadót; a dalok csak kattintás után töltődnek be a Spotifyról.',
    artistProfiles: 'Ellenőrzött előadói profilok',
    soldOut: 'Telt ház', details: 'További részletek és jegyek',
    priceSource: 'Ár forrása ↗', currentPrice: 'Aktuális jegyárért nyisd meg a hivatalos oldalt.',
    eventsUnavailable: 'Az eseménylista jelenleg nem elérhető.',
    eventsUnavailableTitle: 'Az eseménylista nem érhető el.', retryLater: 'Próbáld újra később.',
    officialTickets: 'Hivatalos jegyoldal', officialSoldOut: 'Hivatalos esemény (telt ház)',
    officialEventTickets: 'Hivatalos esemény / jegyek'
  },
  en: {
    pageTitle: 'Drum And Bass X Budapest — DnB Radar',
    metaDescription: 'DnB Radar: Budapest drum & bass events, artist music, checked ticket prices and official ticket links.',
    skip: 'Skip to events', brandAria: 'DnB Radar home',
    upcoming: 'Upcoming events', eventsLoading: 'Loading checked event details…',
    noEvents: 'No upcoming events', noVerifiedEvents: 'There are currently no verified upcoming Budapest events on the list.',
    wishlistEyebrow: 'COMMUNITY WISHLIST', wishlistTitleOne: 'Who would you bring', wishlistTitleTwo: 'to Budapest?',
    wishlistIntro: 'Which drum & bass artist would you like to see? No registration is needed; your wish appears publicly right away.',
    artistName: 'Artist name', artistPlaceholder: 'For example: an artist name', addWish: 'Add wish ↗',
    wishlistStatusInitial: 'Enter artist names only; the list is visible to everyone.',
    wishes: 'Wishes', wishesLoading: 'Loading wishes…',
    wishlistNoWishes: 'No wishes yet. Add the first artist.',
    wishlistUnavailable: 'The wishlist is unavailable right now.',
    wishlistValidation: 'Enter an artist name with 2–70 characters and no links.',
    wishlistDuplicate: 'This artist is already on the list.', wishlistSaving: 'Saving wish…',
    wishlistSuccess: 'Added to the public wishlist.',
    wishlistUnconfirmed: 'We could not confirm the save. Refresh the page before trying again.',
    wishlistSubmitFailed: 'Could not reach the wishlist. Please try again later.',
    footerDescription: 'Budapest drum & bass event guide', backToTop: 'Back to top ↑',
    spotifyLabel: 'Spotify tracks', spotifyHint: 'Choose an artist; their tracks load from Spotify only after you click.',
    artistProfiles: 'Verified artist profiles',
    soldOut: 'Sold out', details: 'More details and tickets',
    priceSource: 'Price source ↗', currentPrice: 'Open the official page for the current ticket price.',
    eventsUnavailable: 'The event list is currently unavailable.',
    eventsUnavailableTitle: 'Event list unavailable.', retryLater: 'Please try again later.',
    officialTickets: 'Official tickets', officialSoldOut: 'Official event (sold out)',
    officialEventTickets: 'Official event / tickets'
  }
};

const languageFromUrl = new URL(location.href).searchParams.get('lang');
let storedLanguage;
try { storedLanguage = localStorage.getItem('dnbRadarLanguage'); } catch (_) {}
let language = ['hu', 'en'].includes(languageFromUrl) ? languageFromUrl : (storedLanguage === 'en' ? 'en' : 'hu');

function translate(key) { return messages[language][key] || messages.hu[key] || key; }

function renderLanguage() {
  document.documentElement.lang = language;
  document.title = translate('pageTitle');
  document.querySelector('meta[name="description"]').content = translate('metaDescription');
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = translate(element.dataset.i18n);
  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) element.placeholder = translate(element.dataset.i18nPlaceholder);
  for (const element of document.querySelectorAll('[data-i18n-aria]')) element.setAttribute('aria-label', translate(element.dataset.i18nAria));
  for (const button of document.querySelectorAll('.language-switch button')) button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  document.dispatchEvent(new CustomEvent('dnb-language-change'));
}

function setLanguage(nextLanguage) {
  if (!['hu', 'en'].includes(nextLanguage) || nextLanguage === language) return;
  language = nextLanguage;
  try { localStorage.setItem('dnbRadarLanguage', language); } catch (_) {}
  const url = new URL(location.href);
  if (language === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
  history.replaceState(null, '', url);
  renderLanguage();
}

window.dnbI18n = { get language() { return language; }, t: translate };
for (const button of document.querySelectorAll('.language-switch button')) button.addEventListener('click', () => setLanguage(button.dataset.lang));
window.addEventListener('popstate', () => {
  const selected = new URL(location.href).searchParams.get('lang');
  language = selected === 'en' ? 'en' : 'hu';
  renderLanguage();
});
renderLanguage();
