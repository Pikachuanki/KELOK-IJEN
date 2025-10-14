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
// WARNA POLIGON PERSIL
// ===============================
function getColorPersil(namaDesa) {
  const colors = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#073b4c'];
  let index = Math.abs(namaDesa?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

function stylePersil(feature) {
  return {
    fillColor: getColorPersil(feature.properties.NAMOBJ),
    color: '#333',
    weight: 1,
    fillOpacity: 0.6
  };
}

// ===============================
// POPUP UNTUK PERSIL
// ===============================
function popupPersil(props) {
  if (!props) return "";
  let html = "<table class='popup-table'>";
  if (props.NAMOBJ) html += `<tr><td class='popup-label'>Desa/Kelurahan</td><td>${props.NAMOBJ}</td></tr>`;
  if (props.WADMKC) html += `<tr><td class='popup-label'>Kecamatan</td><td>${props.WADMKC}</td></tr>`;
  if (props.WADMKK) html += `<tr><td class='popup-label'>Kabupaten/Kota</td><td>${props.WADMKK}</td></tr>`;
  if (props.Jumlah_Rumah) html += `<tr><td class='popup-label'>Jumlah Bangunan Terdampak</td><td>${props.Jumlah_Rumah}</td></tr>`;
  html += "</table>";
  return html;
}

// ===============================
// LOAD GEOJSON PERSIL
// ===============================
var layers = {};

function loadLayerPersil(url, layerName) {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      layers[layerName] = L.geoJSON(data, {
        style: stylePersil,
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupPersil(feature.properties));
          layer.on({
            mouseover: function (e) {
              e.target.setStyle({ weight: 2, fillOpacity: 0.8 });
              e.target.bringToFront();
            },
            mouseout: function (e) {
              layers[layerName].resetStyle(e.target);
            }
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error("Gagal memuat GeoJSON Persil:", err));
}

// Jalankan saat halaman dibuka
loadLayerPersil("../data/Persil_Desa.geojson", "persil");

// ===============================
// TOGGLE CHECKBOX UNTUK PERSIL
// ===============================
document.getElementById('persil').addEventListener('change', function() {
  if (this.checked) {
    map.addLayer(layers['persil']);
  } else {
    map.removeLayer(layers['persil']);
  }
});
