const dnbMap = (() => {
  const element = document.getElementById('event-map');
  const section = document.getElementById('terkep');
  const fallback = document.getElementById('map-fallback');
  const locations = fetch('venue-locations.json').then(response => {
    if (!response.ok) throw new Error('Venue locations unavailable');
    return response.json();
  });
  let map;
  let markers = new Map();
  let pendingVenue = '';
  let renderNumber = 0;

  function popup(group, language) {
    const content = document.createElement('div');
    content.className = 'map-popup';
    const heading = document.createElement('strong');
    heading.textContent = group.name;
    content.append(heading);
    for (const event of group.events) {
      const link = document.createElement('a');
      link.href = `#event-${event.id}`;
      link.textContent = `${event.date.slice(5).replace('-', '.')} · ${event.title}`;
      content.append(link);
    }
    const directions = document.createElement('a');
    directions.className = 'map-directions';
    directions.href = `https://www.openstreetmap.org/?mlat=${group.lat}&mlon=${group.lon}#map=16/${group.lat}/${group.lon}`;
    directions.target = '_blank';
    directions.rel = 'noopener noreferrer';
    directions.textContent = language === 'en' ? 'Open location ↗' : 'Helyszín megnyitása ↗';
    content.append(directions);
    return content;
  }

  async function render(events, language) {
    const current = ++renderNumber;
    if (!events.length) {
      section.hidden = true;
      element.hidden = true;
      fallback.hidden = true;
      return;
    }
    section.hidden = false;
    try {
      const venues = await locations;
      if (current !== renderNumber) return;
      const groups = window.dnbEventTools.groupVenues(events, venues);
      if (!groups.length || !window.L) throw new Error('Map unavailable');
      if (map) map.remove();
      element.hidden = false;
      fallback.hidden = true;
      map = L.map(element, { scrollWheelZoom: false, zoomControl: true });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(map);
      markers = new Map();
      const bounds = [];
      for (const group of groups) {
        const icon = L.divIcon({
          className: 'dnb-map-pin',
          html: `<span>${group.events.length}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        const marker = L.marker([group.lat, group.lon], { icon, title: group.name })
          .bindPopup(popup(group, language), { maxWidth: 280 })
          .addTo(map);
        markers.set(group.name, marker);
        bounds.push([group.lat, group.lon]);
      }
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
      if (pendingVenue) focusVenue(pendingVenue);
    } catch (_) {
      element.hidden = true;
      fallback.hidden = false;
      fallback.textContent = language === 'en' ? 'The map is temporarily unavailable. Venue addresses are shown on each event.' : 'A térkép átmenetileg nem elérhető. A helyszínek címe az eseményeknél látható.';
    }
  }

  function focusVenue(name) {
    if (!map || !markers.has(name)) {
      pendingVenue = name;
      return;
    }
    pendingVenue = '';
    const marker = markers.get(name);
    map.invalidateSize();
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14));
    marker.openPopup();
  }

  return { render, focusVenue };
})();

window.dnbMap = dnbMap;
