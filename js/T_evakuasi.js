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
// WARNA DAN STYLE TEMPAT EVAKUASI
// ===============================
function getColorEvakuasi(nama) {
  const colors = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#073b4c'];
  let index = Math.abs(nama?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

function styleEvakuasi(feature) {
  return {
    fillColor: getColorEvakuasi(feature.properties.REMARK || feature.properties.NAMOBJ),
    color: '#333',
    weight: 1,
    fillOpacity: 0.6
  };
}

// ===============================
// POPUP UNTUK TEMPAT EVAKUASI
// ===============================
function popupEvakuasi(props) {
  if (!props) return "";
  var mapping = {
    "REMARK": "Nama Lokasi",
    "WADMPK": "Provinsi",
    "WADMKK": "Kabupaten/Kota",
    "WADMKC": "Kecamatan",
    "Keterangan": "Keterangan"
  };

  var html = "<table class='popup-table'>";
  Object.keys(mapping).forEach(key => {
    if (props[key] !== undefined && props[key] !== null && props[key] !== "") {
      html += `<tr><td class='popup-label'>${mapping[key]}</td><td>${props[key]}</td></tr>`;
    }
  });
  html += "</table>";
  return html;
}

// ===============================
// LOAD GEOJSON TEMPAT EVAKUASI
// ===============================
var layers = {};

function loadLayerEvakuasi(url, layerName) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      layers[layerName] = L.geoJSON(data, {
        style: styleEvakuasi,
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupEvakuasi(feature.properties));
          layer.on({
            mouseover: function (e) {
              e.target.setStyle({ weight: 2, fillOpacity: 0.8 });
              e.target.bringToFront();
            },
            mouseout: function (e) {
              layers[layerName].resetStyle(e.target);
            }
          });
        },
        pointToLayer: function (feature, latlng) {
          // untuk data titik
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: getColorEvakuasi(feature.properties.REMARK || "A"),
            color: "#000",
            weight: 1,
            fillOpacity: 0.8
          });
        }
      }).addTo(map);

      // zoom otomatis ke area evakuasi
      map.fitBounds(layers[layerName].getBounds());
    })
    .catch(err => console.error("Gagal memuat GeoJSON Evakuasi:", err));
}

// jalankan langsung
loadLayerEvakuasi("../data/Tempat_Evakuasi.geojson", "evakuasi");

// ===============================
// TOGGLE CHECKBOX UNTUK LAYER
// ===============================
document.getElementById('evakuasi').addEventListener('change', function() {
  if (this.checked && layers['evakuasi']) {
    map.addLayer(layers['evakuasi']);
  } else if (layers['evakuasi']) {
    map.removeLayer(layers['evakuasi']);
  }
});
