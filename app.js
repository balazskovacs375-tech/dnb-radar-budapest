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

function card(event) {
  const article = node('article', 'event-card');
  const date = node('div', 'event-date');
  const day = node('strong', '', event.date.slice(8));
  const month = node('span', '', new Intl.DateTimeFormat('hu-HU', { month: 'short', timeZone: 'Europe/Budapest' }).format(new Date(`${event.date}T12:00:00+02:00`)).replace('.', '').toUpperCase());
  date.append(day, month);
  const body = node('div', 'event-body');
  const top = node('div', 'card-top');
  top.append(node('span', 'date-long', `${formatDate(event.date)} · ${event.time}`));
  body.append(top, node('h3', '', event.title));
  const artists = node('p', 'artists', event.artists.join(' · '));
  body.append(artists);
  const venue = node('p', 'venue', `${event.venue} · ${event.address}`);
  body.append(venue);
  const link = node('a', 'event-link', `${event.linkLabel} ↗`);
  link.href = event.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${event.title} – ${event.linkLabel}, új lapon nyílik`);
  article.append(date, body, link);
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
