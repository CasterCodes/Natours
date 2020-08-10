export const mapbox = (locations, accessToken) => {
  mapboxgl.accessToken = accessToken;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/casterprog/ckde5aswt4qyz1inxiqk1o5aw',
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((location) => {
    // create a maker
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p> Day ${location.day}:  ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
