const list = document.getElementById('event-list');
const empty = document.getElementById('empty');
const updated = document.getElementById('updated');
let events = [];

function budapestToday() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function formatDate(date) {
  return new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Europe/Budapest' }).format(new Date(`${date}T12:00:00+02:00`));
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
  const section = node('div', 'spotify-section');
  section.append(node('p', 'detail-label', 'Zene a Spotifyon'));
  const choices = node('div', 'spotify-choices');
  const player = node('div', 'spotify-player');
  const hint = node('p', 'spotify-hint', 'A lejátszó csak kattintás után kapcsolódik a Spotifyhoz.');
  for (const artist of artists) {
    if (!/^[A-Za-z0-9]{22}$/.test(artist.id)) continue;
    const button = node('button', 'spotify-choice', artist.name);
    button.type = 'button';
    button.setAttribute('aria-label', `${artist.name} zenéi a Spotifyon`);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const iframe = node('iframe', 'spotify-iframe');
      iframe.src = `https://open.spotify.com/embed/artist/${artist.id}`;
      iframe.title = `${artist.name} – Spotify lejátszó`;
      iframe.loading = 'lazy';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      player.replaceChildren(iframe);
      hint.hidden = true;
      for (const choice of choices.children) choice.setAttribute('aria-pressed', String(choice === button));
    });
    choices.append(button);
  }
  section.append(choices, hint, player);
  return section;
}

function card(event) {
  const article = node('article', 'event-card');
  const date = node('div', 'event-date');
  date.append(
    node('strong', '', event.date.slice(8)),
    node('span', '', new Intl.DateTimeFormat('hu-HU', { month: 'short', timeZone: 'Europe/Budapest' }).format(new Date(`${event.date}T12:00:00+02:00`)).replace('.', '').toUpperCase())
  );
  const body = node('div', 'event-body');
  body.append(node('p', 'date-long', `${formatDate(event.date)} · ${event.time}`));
  body.append(node('h3', '', event.title));
  body.append(node('p', 'artists', event.artists.join(' · ')));
  body.append(node('p', 'venue', `${event.venue} · ${event.address}`));

  const actions = node('div', 'event-actions');
  if (currentPrice(event.price)) {
    const price = node('div', 'price');
    price.append(node('strong', '', `${new Intl.NumberFormat('hu-HU').format(event.price.amountHuf)} Ft-tól`));
    price.append(node('span', '', `Ellenőrizve: ${event.price.checkedAt.replaceAll('-', '. ')}.`));
    actions.append(price);
  } else if (event.linkLabel.includes('telt ház')) {
    actions.append(node('strong', 'sold-out', 'Telt ház'));
  }
  const official = link(`${event.linkLabel} ↗`, event.url, 'event-link');
  official.setAttribute('aria-label', `${event.title} – ${event.linkLabel}, új lapon nyílik`);
  actions.append(official);

  const details = node('details', 'event-details');
  details.append(node('summary', '', 'A fellépőkről és a jegyről'));
  if (event.description) details.append(node('p', 'description', event.description));
  if (currentPrice(event.price)) {
    details.append(node('p', 'price-note', event.price.note));
    if (event.price.sourceUrl !== event.url) details.append(link('Ár forrása ↗', event.price.sourceUrl, 'price-source'));
  } else if (!event.linkLabel.includes('telt ház')) {
    details.append(node('p', 'price-note', 'Aktuális jegyárért nyisd meg a hivatalos oldalt.'));
  }
  if (event.spotifyArtists?.length) details.append(spotifyPlayer(event.spotifyArtists));
  body.append(details);
  article.append(date, body, actions);
  return article;
}

function render() {
  list.replaceChildren(...events.map(card));
  empty.hidden = events.length > 0;
}

fetch('events.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Az adatfájl nem tölthető be.');
  return response.json();
}).then(data => {
  updated.textContent = `Utolsó ellenőrzés: ${data.updatedAt.replaceAll('-', '. ')}.`;
  events = data.events.filter(event => event.date >= budapestToday()).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  render();
}).catch(() => {
  updated.textContent = 'Az eseménylista jelenleg nem elérhető.';
  empty.hidden = false;
  empty.querySelector('h3').textContent = 'Az eseménylista nem érhető el.';
  empty.querySelector('p').textContent = 'Próbáld újra később.';
});
