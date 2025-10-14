// ===============================
// INISIALISASI PETA
// ===============================
var map = L.map('map').setView([-8.22, 114.24], 12);

// Basemap satelit
var satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: '© Esri, Maxar, Earthstar Geographics' }
).addTo(map);

// ===============================
// STYLE JALUR EVAKUASI (GARIS KUNING TEBAL)
// ===============================
function styleJalurEvakuasi(feature) {
  return {
    color: "#FFD700",       // kuning terang
    weight: 5,              // garis tebal
    opacity: 0.9
  };
}

// ===============================
// POPUP UNTUK JALUR EVAKUASI
// ===============================
function popupEvakuasi(props) {
  if (!props) return "";
  const mapping = {
    "REMARK": "Nama Jalur",
    "WADMPK": "Provinsi",
    "WADMKK": "Kabupaten/Kota",
    "WADMKC": "Kecamatan",
    "Keterangan": "Keterangan"
  };

  let html = "<table class='popup-table'>";
  Object.keys(mapping).forEach(key => {
    if (props[key]) {
      html += `<tr><td class='popup-label'>${mapping[key]}</td><td>${props[key]}</td></tr>`;
    }
  });
  html += "</table>";
  return html;
}

// ===============================
// LOAD GEOJSON JALUR EVAKUASI
// ===============================
let layers = {};

function loadLayerEvakuasi(url, layerName) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      layers[layerName] = L.geoJSON(data, {
        style: styleJalurEvakuasi,
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupEvakuasi(feature.properties));
        }
      }).addTo(map);

      // Zoom otomatis ke area jalur
      map.fitBounds(layers[layerName].getBounds());
    })
    .catch(err => console.error("Gagal memuat GeoJSON Evakuasi:", err));
}

// Jalankan saat halaman dibuka
loadLayerEvakuasi("../data/J_Evakuasi_BWI.geojson", "jalur1");
loadLayerEvakuasi("../data/J_Evakuasi_BWS.geojson", "jalur2");

// ===============================
// TOGGLE CHECKBOX UNTUK LAYER
// ===============================
document.getElementById('evakuasi').addEventListener('change', function() {
  if (this.checked) {
    if (layers["jalur1"]) map.addLayer(layers["jalur1"]);
    if (layers["jalur2"]) map.addLayer(layers["jalur2"]);
  } else {
    if (layers["jalur1"]) map.removeLayer(layers["jalur1"]);
    if (layers["jalur2"]) map.removeLayer(layers["jalur2"]);
  }
});
