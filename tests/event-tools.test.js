const test = require('node:test');
const assert = require('node:assert/strict');
const { permalink, groupVenues } = require('../event-tools.js');

test('event link keeps the current page and points at one card', () => {
  assert.equal(
    permalink('eclips-sota-2026', 'https://dnbradar.com/?lang=en#esemenyek'),
    'https://dnbradar.com/?lang=en#event-eclips-sota-2026'
  );
});

test('one venue marker holds all of its upcoming events', () => {
  const venues = { Kassa: { lat: 47.5, lon: 19.04 }, A38: { lat: 47.47, lon: 19.06 } };
  const events = [
    { id: 'one', venue: 'Kassa' },
    { id: 'two', venue: 'A38' },
    { id: 'three', venue: 'Kassa' },
    { id: 'unmapped', venue: 'Unknown' },
  ];
  assert.deepEqual(groupVenues(events, venues), [
    { name: 'Kassa', lat: 47.5, lon: 19.04, events: [events[0], events[2]] },
    { name: 'A38', lat: 47.47, lon: 19.06, events: [events[1]] },
  ]);
});
