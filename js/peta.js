var map = L.map('map').setView([-8.219, 114.369], 12);

// Basemap
var satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles © Esri &mdash; Source: Esri, Maxar' }
).addTo(map);

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '© OpenStreetMap contributors' }
);

var polygonLayer;

// Fungsi pencarian wilayah
document.getElementById("btn").addEventListener("click", async () => {
  var query = document.getElementById("search").value.trim();
  if (!query) return alert("Masukkan nama daerah dulu!");

  const url = `https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'id' } });
    const data = await res.json();

    if (data.length === 0) {
      alert("Wilayah tidak ditemukan.");
      return;
    }

    const place = data[0];

    // Hapus polygon lama kalau ada
    if (polygonLayer) map.removeLayer(polygonLayer);

    // Kalau ada polygon
    if (place.geojson && place.geojson.type) {
      polygonLayer = L.geoJSON(place.geojson, {
        color: "red",
        weight: 2
      }).addTo(map);
      map.fitBounds(polygonLayer.getBounds());
    } else {
      map.setView([place.lat, place.lon], 12);
      alert("Wilayah ditemukan tapi tanpa batas polygon.");
    }
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
    alert("Gagal mengambil data dari Nominatim.");
  }
});

// Style
function stylePersil(f) { return { color: "#cd9300ff", weight: 2, fillColor: "#ffc400ff", fillOpacity: 0.3 }; }
function styleKRB(f) { return { color: "#FF0000", weight: 2, fillColor: "#FF0000", fillOpacity: 0.3 }; }
function styleJalur(f) { return { color: "#FFA500", weight: 3, dashArray: "5,5" }; }
function styleTempat(f) { return { color: "#008000", weight: 2, fillColor: "#00FF00", fillOpacity: 0.6 }; }

// Popup helper
function popupPersil(props) {
  if (!props) return "";
  var mapping = {
    "NAMOBJ": "Desa/Kelurahan",
    "WADMKC": "Kecamatan",
    "WADMKK": "Kabupaten/Kota",
    "Jumlah_Rumah": "Jumlah Bangunan Terdampak"
  };
  var html = "<table class='popup-table'>";
  Object.keys(mapping).forEach(key => {
    if (props[key] !== undefined) {
      html += `<tr><td class='popup-label'>${mapping[key]}</td><td>${props[key]}</td></tr>`;
    }
  });
  html += "</table>";
  return html;
}

function popupKRB(props) {
  if (!props) return "";
  var fields = ["FCODE", "THTERBIT", "KRB", "REMARK"];
  var html = "<table class='popup-table'>";
  fields.forEach(f => {
    if (props[f] !== undefined) {
      html += `<tr><td class='popup-label'>${f}</td><td>${props[f]}</td></tr>`;
    }
  });
  html += "</table>";
  return html;
}

function popupEvakuasi(props) {
  if (!props) return "";
  var mapping = { "WADMPK": "Provinsi", "WADMKK": "Kabupaten/Kota", "REMARK": "Lokasi" };
  var html = "<table class='popup-table'>";
  Object.keys(mapping).forEach(key => {
    if (props[key] !== undefined) {
      html += `<tr><td class='popup-label'>${mapping[key]}</td><td>${props[key]}</td></tr>`;
    }
  });
  html += "</table>";
  return html;
}

// Layers
var persilLayer = L.geoJSON(null, { style: stylePersil, onEachFeature: (f, l) => l.bindPopup(popupPersil(f.properties)) });
var krbLayer = L.geoJSON(null, { style: styleKRB, onEachFeature: (f, l) => l.bindPopup(popupKRB(f.properties)) });
var jalurLayer = L.geoJSON(null, { style: styleJalur, onEachFeature: (f, l) => l.bindPopup(popupEvakuasi(f.properties)) });
var tempatLayer = L.geoJSON(null, { style: styleTempat, onEachFeature: (f, l) => l.bindPopup(popupEvakuasi(f.properties)) });

// Load data
fetch('../data/Persil_Desa.geojson').then(r => r.json()).then(d => { persilLayer.addData(d).addTo(map); });
fetch('../data/KRB_Full.geojson').then(r => r.json()).then(d => { krbLayer.addData(d).addTo(map); });
fetch('../data/J_Evakuasi_BWI.geojson').then(r => r.json()).then(d => { jalurLayer.addData(d); });
fetch('../data/J_Evakuasi_BWS.geojson').then(r => r.json()).then(d => { jalurLayer.addData(d); });
fetch('../data/Tempat_Evakuasi.geojson').then(r => r.json()).then(d => { tempatLayer.addData(d); });

// Marker Kearifan Lokal
var kearifanLayer = L.layerGroup();

var marker1 = L.marker([-8.024141322546003, 114.18145476023389]).bindPopup(`
  <div style="text-align:center;">
    <img class="popup-img" src="../img/1.jpg" alt="Sesajen">
    <h4 class="popup-title">Rokat Bumi Ijen</h4>
    <table class="popup-table">
      <tr><td class="popup-label">Desa</td><td>Kalianyar</td></tr>
      <tr><td class="popup-label">Dusun</td><td>Kebon Jeruk</td></tr>
      <tr><td class="popup-label">Deskripsi</td><td>Rokat Bumi adalah ritual kebudayaan tahunan masyarakat Bondowoso dan menjadi agenda Ijen Caldera Fiesta sebagai bentuk penghormatan masyarakat terhadap bumi dan alam Gunung Ijen. Ritual ini dilakukan dengan doa bersama dan kegiatan kebersihan lingkungan sebagai simbol menjaga keseimbangan ekosistem.</td></tr>
    </table>
  </div>
`);
var marker2 = L.marker([-7.9884384010113365, 114.17333930005388]).bindPopup(`
  <div style="text-align:center;">
    <img class="popup-img" src="../img/2.jpg" alt="Ritual Adat">
    <h4 class="popup-title">Rokat Dhisa</h4>
    <table class="popup-table">
      <tr><td class="popup-label">Desa</td><td>Kalianyar</td></tr>
      <tr><td class="popup-label">Dusun</td><td>Blawan</td></tr>
      <tr><td class="popup-label">Deskripsi</td><td>Rokat Dhisa adalah tradisi masyarakat di sekitar Ijen yang dilakukan sebagai ungkapan syukur atas hasil bumi dan keselamatan desa. Melalui doa bersama, selamatan, dan arak-arakan hasil panen, warga memohon berkah serta menjaga keharmonisan antara manusia dan alam.</td></tr>
    </table>
  </div>
`);
var marker3 = L.marker([-7.988535700674706, 114.17241499988876]).bindPopup(`
  <div style="text-align:center;">
    <img class="popup-img" src="../img/3.jpg" alt="Ritual Adat">
    <h4 class="popup-title">Can Macanan</h4>
    <table class="popup-table">
      <tr><td class="popup-label">Desa</td><td>Kalianyar</td></tr>
      <tr><td class="popup-label">Dusun</td><td>Blawan</td></tr>
      <tr><td class="popup-label">Deskripsi</td><td>Tradisi Can Macanan adalah kesenian tradisional berupa tarian barong yang menggambarkan simbol kekuatan dan penjaga desa dari marabahaya. Pertunjukan ini biasanya mengiringi upacara adat yang diiringi gamelan dan gerak tari yang dinamis. Selain sebagai hiburan, Can Macanan mencerminkan nilai spiritual, solidaritas masyarakat, dan pelestarian budaya lokal di kawasan Ijen.</td></tr>
    </table>
  </div>
`);
var marker4 = L.marker([-7.9927996004721775, 114.1929963000355]).bindPopup(`
  <div style="text-align:center;">
    <img class="popup-img" src="../img/4.jpg" alt="Ritual Adat">
    <h4 class="popup-title">Rokat Molong Kopi</h4>
    <table class="popup-table">
      <tr><td class="popup-label">Desa</td><td>Kali Gedang</td></tr>
      <tr><td class="popup-label">Dusun</td><td>Kali Gedang</td></tr>
      <tr><td class="popup-label">Deskripsi</td><td>Rokat Molong Kopi adalah sebuah tradisi ritual di Bondowoso, Jawa Timur setelah panen kopi. Melalui prosesi doa dan persembahan hasil panen pertama, warga memohon perlindungan dan keberkahan agar tanaman kopi tetap subur dan membawa rezeki.</td></tr>
    </table>
  </div>
`);

marker1.addTo(kearifanLayer);
marker2.addTo(kearifanLayer);
marker3.addTo(kearifanLayer);
marker4.addTo(kearifanLayer);
kearifanLayer.addTo(map);

// Toggle Layer
document.getElementById("persilCheck").addEventListener("change", function() {
  this.checked ? map.addLayer(persilLayer) : map.removeLayer(persilLayer);
});
document.getElementById("krbCheck").addEventListener("change", function() {
  this.checked ? map.addLayer(krbLayer) : map.removeLayer(krbLayer);
});
document.getElementById("kearifanCheck").addEventListener("change", function() {
  this.checked ? map.addLayer(kearifanLayer) : map.removeLayer(kearifanLayer);
});
document.getElementById("jalurCheck").addEventListener("change", function() {
  this.checked ? map.addLayer(jalurLayer) : map.removeLayer(jalurLayer);
});
document.getElementById("tempatCheck").addEventListener("change", function() {
  this.checked ? map.addLayer(tempatLayer) : map.removeLayer(tempatLayer);
});

// Toggle Basemap
document.querySelectorAll("input[name=basemap]").forEach(radio => {
  radio.addEventListener("change", function() {
    if (this.value === "satelit") {
      map.addLayer(satellite); map.removeLayer(osm);
    } else {
      map.addLayer(osm); map.removeLayer(satellite);
    }
  });
});
