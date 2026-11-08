const list = document.getElementById('event-list');
const empty = document.getElementById('empty');
const updated = document.getElementById('updated');
const i18n = window.dnbI18n;
const eventTools = window.dnbEventTools;
let events = [];
let checkedAt = '';
let loadFailed = false;

const seriesLogos = {
  'eclips-sota-2026': ['ECLIPS', 'eclips.png', 'wide'],
  'modestep-a38-2026': ['Next Level', 'next-level.webp', 'wide'],
  'ivy-lab-2026': ['The Hive', 'the-hive.png', 'square'],
  'boiler-room-worship-2026': ['Boiler Room', 'boiler-room.svg', 'square'],
  'kanine-2026': ['Bladerunnaz', 'bladerunnaz.png', 'wide'],
  'beat-safari-zigi-sc-2026': ['Beat Safari', 'beat-safari.jpg', 'square'],
  'metrik-goddard-emily-makis-2026': ['Bladerunnaz', 'bladerunnaz.png', 'wide'],
  'bladerunnaz-mozey-2027': ['Bladerunnaz', 'bladerunnaz.png', 'wide'],
  'kosheen-akvarium-2027': ['IAM Productions', 'iam-productions.jpg', 'square']
};

function budapestToday() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

document.querySelector('#event-submit-form input[name="date"]').min = budapestToday();

function shortDate(date) {
  return i18n.language === 'en'
    ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Europe/Budapest' }).format(new Date(`${date}T12:00:00+02:00`))
    : `${date.replaceAll('-', '. ')}.`;
}

function officialLabel(event) {
  if (i18n.language === 'hu') return event.linkLabel;
  const labels = {
    'Hivatalos jegyoldal': 'officialTickets',
    'Hivatalos esemény (telt ház)': 'officialSoldOut',
    'Hivatalos esemény / jegyek': 'officialEventTickets'
  };
  return event.linkLabelEn || (labels[event.linkLabel] ? i18n.t(labels[event.linkLabel]) : event.linkLabel);
}

function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function link(value, href, className = '') {
  const a = node('a', className, value);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function currentPrice(price) {
  if (!price || !Number.isInteger(price.amountHuf) || !/^202\d-\d\d-\d\d$/.test(price.checkedAt)) return false;
  return Date.now() - Date.parse(`${price.checkedAt}T12:00:00Z`) < 7 * 24 * 60 * 60 * 1000;
}

function spotifyPlayer(artists) {
  const verifiedArtists = artists.filter(artist => /^[A-Za-z0-9]{22}$/.test(artist.id) && artist.profileUrl === `https://open.spotify.com/artist/${artist.id}`);
  const section = node('div', 'spotify-section');
  section.append(node('p', 'detail-label', i18n.t('spotifyLabel')));
  const choices = node('div', 'spotify-choices');
  const player = node('div', 'spotify-player');
  const close = node('button', 'spotify-close', i18n.t('closeSpotify'));
  let search;
  let activeArtist = verifiedArtists[0];
  close.type = 'button';
  close.hidden = true;
  function closePlayer() {
    player.replaceChildren();
    close.hidden = true;
    if (search) search.hidden = true;
    for (const choice of choices.children) choice.setAttribute('aria-pressed', 'false');
  }
  close.addEventListener('click', closePlayer);
  for (const artist of verifiedArtists) {
    const button = node('button', 'spotify-choice', artist.name);
    button.type = 'button';
    button.setAttribute('aria-label', i18n.language === 'en' ? `Listen to ${artist.name} on Spotify` : `${artist.name} zenéi a Spotifyon`);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') {
        closePlayer();
        return;
      }
      const iframe = node('iframe', 'spotify-iframe');
      iframe.src = `https://open.spotify.com/embed/artist/${artist.id}`;
      iframe.title = i18n.language === 'en' ? `${artist.name} – Spotify player` : `${artist.name} – Spotify lejátszó`;
      iframe.loading = 'lazy';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      player.replaceChildren(iframe);
      close.hidden = false;
      activeArtist = artist;
      if (search) search.hidden = false;
      for (const choice of choices.children) choice.setAttribute('aria-pressed', String(choice === button));
    });
    choices.append(button);
  }
  section.append(choices, close, player);
  if (verifiedArtists.length) {
    search = node('form', 'track-search');
    search.hidden = true;
    search.target = '_blank';
    search.rel = 'noopener noreferrer';
    search.method = 'get';
    const label = node('p', 'detail-label', i18n.t('trackSearchLabel'));
    const fields = node('div', 'track-search-fields');
    const query = node('input', 'track-search-input');
    query.type = 'search';
    query.maxLength = 100;
    query.placeholder = i18n.t('trackSearchPlaceholder');
    query.setAttribute('aria-label', i18n.t('trackSearchPlaceholder'));
    const submit = node('button', 'track-search-button', i18n.t('trackSearchAction'));
    submit.type = 'submit';
    fields.append(query, submit);
    search.append(label, fields);
    search.addEventListener('submit', () => {
      const title = query.value.trim();
      search.action = title
        ? `https://open.spotify.com/search/${encodeURIComponent(`${activeArtist.name} ${title}`)}`
        : activeArtist.profileUrl;
    });
    section.append(search);
  }
  return section;
}

function artistLine(event) {
  const row = node('div', 'artist-list');
  const profiles = new Map((event.spotifyArtists || []).map(artist => [artist.name, artist]));
  for (const name of event.artists) {
    const profile = profiles.get(name);
    if (profile && /^https:\/\/image-cdn-[a-z]+\.spotifycdn\.com\/image\/[A-Za-z0-9]+$/.test(profile.imageUrl)
        && profile.profileUrl === `https://open.spotify.com/artist/${profile.id}`) {
      const artistLink = link('', profile.profileUrl, 'artist-with-photo');
      artistLink.setAttribute('aria-label', i18n.language === 'en' ? `${name} on Spotify, opens in a new tab` : `${name} Spotify-profilja, új lapon nyílik`);
      const photo = node('img', 'artist-photo');
      photo.src = profile.imageUrl;
      photo.alt = '';
      photo.width = 32;
      photo.height = 32;
      photo.loading = 'lazy';
      artistLink.append(photo, node('span', '', name));
      row.append(artistLink);
    } else {
      row.append(node('span', 'artist-name', name));
    }
  }
  return row;
}

function artistSocials(event) {
  const entries = [];
  for (const artist of event.spotifyArtists || []) {
    if (artist.profileUrl) entries.push([artist.name, 'Spotify', artist.profileUrl]);
    for (const [platform, url] of Object.entries(artist.socials || {})) entries.push([artist.name, platform, url]);
  }
  for (const [name, socials] of Object.entries(event.artistSocials || {})) {
    for (const [platform, url] of Object.entries(socials)) entries.push([name, platform, url]);
  }
  if (!entries.length) return null;
  const section = node('div', 'artist-socials');
  section.append(node('p', 'detail-label', i18n.t('artistProfiles')));
  const links = node('div', 'artist-social-links');
  for (const [name, platform, url] of entries) {
    if (!/^https:\/\//.test(url)) continue;
    links.append(link(`${name} · ${platform} ↗`, url));
  }
  section.append(links);
  return section;
}

function card(event) {
  const article = node('article', 'event-card');
  article.id = `event-${event.id}`;
  const soldOut = event.linkLabel.includes('telt ház');
  if (soldOut) article.classList.add('is-sold-out');
  const date = node('div', 'event-date');
  date.append(
    node('strong', '', event.date.slice(8)),
    node('span', '', new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-GB' : 'hu-HU', { month: 'short', timeZone: 'Europe/Budapest' }).format(new Date(`${event.date}T12:00:00+02:00`)).replace('.', '').toUpperCase())
  );
  const body = node('div', 'event-body');
  const heading = node('div', 'event-heading');
  const series = seriesLogos[event.id];
  if (series) {
    const logo = node('img', `series-logo series-logo--${series[2]}`);
    logo.src = `assets/series/${series[1]}`;
    logo.alt = `${series[0]} logo`;
    logo.width = series[2] === 'wide' ? 98 : 54;
    logo.height = 54;
    logo.loading = 'lazy';
    logo.decoding = 'async';
    heading.append(logo);
  }
  heading.append(node('h3', '', event.title));
  body.append(heading);
  body.append(artistLine(event));
  body.append(node('p', 'venue', `${event.venue} · ${event.address}`));

  const actions = node('div', 'event-actions');
  if (currentPrice(event.price)) {
    const price = node('div', 'price');
    const amount = new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'hu-HU').format(event.price.amountHuf);
    price.append(node('strong', '', i18n.language === 'en' ? `From HUF ${amount}` : `${amount} Ft-tól`));
    price.append(node('span', '', i18n.language === 'en' ? `Checked: ${shortDate(event.price.checkedAt)}` : `Ellenőrizve: ${shortDate(event.price.checkedAt)}`));
    actions.append(price);
  } else if (soldOut) {
    actions.append(node('strong', 'sold-out', i18n.t('soldOut')));
  }
  const label = officialLabel(event);
  const official = link(`${label} ↗`, event.url, 'event-link');
  official.setAttribute('aria-label', i18n.language === 'en' ? `${event.title} – ${label}, opens in a new tab` : `${event.title} – ${label}, új lapon nyílik`);
  actions.append(official);
  const secondaryActions = node('div', 'event-secondary-actions');
  const mapLink = node('a', '', i18n.t('showOnMap'));
  mapLink.href = '#terkep';
  mapLink.addEventListener('click', () => {
    window.setTimeout(() => window.dnbMap?.focusVenue(event.venue), 450);
  });
  const share = node('button', '', i18n.t('shareEvent'));
  share.type = 'button';
  share.setAttribute('aria-label', `${i18n.t('shareEvent')}: ${event.title}`);
  const shareStatus = node('span', 'share-status');
  shareStatus.setAttribute('role', 'status');
  share.addEventListener('click', async () => {
    const url = eventTools.permalink(event.id, location.href);
    try {
      await navigator.clipboard.writeText(url);
      shareStatus.textContent = i18n.t('linkCopied');
    } catch (_) {
      shareStatus.textContent = url;
    }
  });
  secondaryActions.append(mapLink, share, shareStatus);
  actions.append(secondaryActions);

  const details = node('details', 'event-details');
  details.append(node('summary', '', i18n.t('details')));
  if (event.description) details.append(node('p', 'event-description', i18n.language === 'en' ? (event.descriptionEn || event.description) : event.description));
  if (currentPrice(event.price)) {
    details.append(node('p', 'price-note', i18n.language === 'en' ? (event.price.noteEn || event.price.note) : event.price.note));
    if (event.price.sourceUrl !== event.url) details.append(link(i18n.t('priceSource'), event.price.sourceUrl, 'price-source'));
  } else if (!soldOut) {
    details.append(node('p', 'price-note', i18n.t('currentPrice')));
  }
  if (event.spotifyArtists?.length) body.append(spotifyPlayer(event.spotifyArtists));
  const socials = artistSocials(event);
  if (socials) details.append(socials);
  body.append(details);
  article.append(date, body, actions);
  return article;
}

function render() {
  if (loadFailed) {
    updated.textContent = i18n.t('eventsUnavailable');
    empty.querySelector('h3').textContent = i18n.t('eventsUnavailableTitle');
    empty.querySelector('p').textContent = i18n.t('retryLater');
    empty.hidden = false;
    return;
  }
  if (checkedAt) updated.textContent = i18n.language === 'en' ? `Last checked: ${shortDate(checkedAt)}` : `Utolsó ellenőrzés: ${shortDate(checkedAt)}`;
  list.replaceChildren(...events.map(card));
  empty.hidden = events.length > 0;
  window.dnbMap?.render(events, i18n.language);
  const target = location.hash.startsWith('#event-') ? document.getElementById(location.hash.slice(1)) : null;
  if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'center' }));
}

document.addEventListener('dnb-language-change', render);
window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#event-')) return;
  document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center', behavior: 'smooth' });
});

fetch('events.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Az adatfájl nem tölthető be.');
  return response.json();
}).then(data => {
  checkedAt = data.updatedAt;
  events = data.events.filter(event => event.date >= budapestToday()).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  render();
}).catch(() => {
  loadFailed = true;
  render();
});
