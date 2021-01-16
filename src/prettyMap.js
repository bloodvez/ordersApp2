const L = require('leaflet')

let markersArr = L.layerGroup();
let ordersMap = undefined

let mapRedIcon = L.icon({
  iconUrl: `${__dirname}/images/marker_red.png`,
  iconSize: [25, 41], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
});

let mapGreenIcon = L.icon({
  iconUrl: `${__dirname}/images/marker_green.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


function createMap() {
  if (!ordersMap) {
    tiles = 'http://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}' //2gislayer
    //tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' //openstreetmap

    ordersMap = L.map('prettyMap', { 
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      zoomDelta: 0.1,
      zoomSnap: 0.1 })
      .setView([mapSettings.lat, mapSettings.lng], mapSettings.zoom);

    L.tileLayer(tiles, {
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(ordersMap);
  }

}

function addMarkers() {
  if (ordersMap != undefined && mapToggleCheckbox.checked == true) {
    markersArr.clearLayers()
    ordersArr.forEach(elem => {

      switch (elem.taskType) {
        case "DeliveryInProgress":
          L.marker([elem.lat, elem.lng], { icon: mapRedIcon, title: elem.deliveryDestination }).addTo(markersArr)
          //.bindTooltip(elem.deliveryDestination, { permanent: true }).openTooltip();
          break;

        case "PICKING" || "PickingInProgress":
          L.marker([elem.lat, elem.lng], { icon: mapGreenIcon, title: elem.deliveryDestination }).addTo(markersArr)
          //.bindTooltip(elem.deliveryDestination, { permanent: true }).openTooltip();
          break;

        default:
          L.marker([elem.lat, elem.lng], { title: elem.deliveryDestination }).addTo(markersArr)
          //.bindTooltip(elem.deliveryDestination, { permanent: true }).openTooltip();
          break;
      }
    })
    markersArr.addTo(ordersMap)
  }
}