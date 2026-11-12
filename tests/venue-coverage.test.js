const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const events = JSON.parse(fs.readFileSync(__dirname + '/../events.json', 'utf8')).events;
const venues = JSON.parse(fs.readFileSync(__dirname + '/../venue-locations.json', 'utf8'));

test('every listed venue has one plausible Budapest map point', () => {
  const missing = [...new Set(events.map(event => event.venue))].filter(name => !venues[name]);
  assert.deepEqual(missing, []);
  for (const [name, point] of Object.entries(venues)) {
    assert.ok(point.lat > 47.3 && point.lat < 47.7, `${name}: latitude`);
    assert.ok(point.lon > 18.9 && point.lon < 19.4, `${name}: longitude`);
  }
});

test('event ids are stable URL fragments without collisions', () => {
  const ids = events.map(event => event.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => /^[a-z0-9-]+$/.test(id)));
});

test('free listings have official event links, translations and no ticket price', () => {
  const free = events.filter(event => event.freeEntry);
  assert.ok(free.length > 0);
  for (const event of free) {
    assert.match(event.url, /^https:\/\//);
    assert.ok(event.description && event.descriptionEn && event.linkLabelEn);
    assert.equal(event.price, undefined);
  }
});
