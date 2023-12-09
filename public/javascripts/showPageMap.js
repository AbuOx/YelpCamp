//mapToken is defined in a script on the boilerplate.ejs file, bc if we would refer to process.env file from here to get token
//ejs file would have trouble finding it. Hence we just get the token from that ejs file, and call it from this script, since we refer to this script from that ejs file too.
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker/point and add it to the map.
const marker = new mapboxgl.Marker({ color: 'red' })
    .setLngLat(campground.geometry.coordinates)
    //Adding a popup on the marker
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h5>${campground.title}</h5><p>${campground.location}</p>`
        )
    )
    .addTo(map);