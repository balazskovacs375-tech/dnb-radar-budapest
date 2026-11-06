const dnbEventTools = {
  permalink(eventId, pageUrl) {
    const url = new URL(pageUrl);
    url.hash = `event-${eventId}`;
    return url.href;
  },
  groupVenues(events, venues) {
    const groups = new Map();
    for (const event of events) {
      const place = venues[event.venue];
      if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) continue;
      if (!groups.has(event.venue)) {
        groups.set(event.venue, { name: event.venue, lat: place.lat, lon: place.lon, events: [] });
      }
      groups.get(event.venue).events.push(event);
    }
    return [...groups.values()];
  },
};

if (typeof module !== 'undefined') module.exports = dnbEventTools;
if (typeof window !== 'undefined') window.dnbEventTools = dnbEventTools;
