// peta.js (lengkap)
// Inisialisasi peta
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

// Style
function stylePersil(f) { 
  return { 
    color: "#FFA500",       // garis tepi
    weight: 2, 
    fillColor: "#FFA500",   // isi polygon
    fillOpacity: 0.5        // bisa kamu sesuaikan
  }; 
}
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
fetch('../data/Rumah_Terdampak.geojson').then(r => r.json()).then(d => { persilLayer.addData(d).addTo(map); });
fetch('../data/KRB_Full.geojson').then(r => r.json()).then(d => { krbLayer.addData(d).addTo(map); });
fetch('../data/J_Evakuasi_BWI.geojson').then(r => r.json()).then(d => { jalurLayer.addData(d); });
fetch('../data/J_Evakuasi_BWS.geojson').then(r => r.json()).then(d => { jalurLayer.addData(d); });
fetch('../data/Tempat_Evakuasi.geojson').then(r => r.json()).then(d => { tempatLayer.addData(d); });

// Marker Kearifan Lokal (isi popup penuh dikembalikan)
var kearifanLayer = L.layerGroup();

var marker1 = L.marker([-8.024141322546003, 114.18145476023389]).bindPopup(`
  <div style="text-align:center;">
    <img class="popup-img" src="../img/1.jpg" alt="Sesajen">
    <h4 class="popup-title">Rokat Bumi Ijen</h4>
    <table class="popup-table">
      <tr><td class="popup-label">Desa</td><td>Kalianyar</td></tr>
      <tr><td class="popup-label">Dusun</td><td>Kebon Jeruk</td></tr>
      <tr><td class="popup-label">Deskripsi</td><td>Rokat Bumi Ijen adalah tradisi ritual di lereng Kawah Ijen, Bondowoso, sebagai wujud syukur dan doa untuk keselamatan, rezeki yang melimpah, dan terhindar dari bencana alam</td></tr>
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
      <tr><td class="popup-label">Deskripsi</td><td>Rokat Dhisa adalah ritual selamatan desa yang merupakan tradisi masyarakat Madura yang bertujuan untuk mengungkapkan rasa syukur atas hasil panen dan nikmat yang diberikan Tuhan, sekaligus memohon perlindungan dan keberkahan agar desa dan warganya terhindar dari marabahaya, bencana alam, serta penyakit.</td></tr>
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
      <tr><td class="popup-label">Deskripsi</td><td>Tradisi Can Macanan merupakan bentuk ekspresi rasa syukur masyarakat setempat kepada Sang Pencipta dan merupakan salah satu warisan budaya yang dipertahankan</td></tr>
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
      <tr><td class="popup-label">Deskripsi</td><td>Rokat Molong Kopi adalah tradisi selamatan dan ritual yang menandai dimulainya panen raya kopi di daerah Bondowoso, Jawa Timur, dengan melakukan proses memetik kopi pertama secara simbolis diiringi doa-doa untuk keberkahan hasil panen.</td></tr>
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

// === Sidebar Toggle (Mobile) ===
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.querySelector(".sidebar-toggle");

if (toggleBtn && sidebar) {
  // set awal teks sesuai state
  toggleBtn.textContent = sidebar.classList.contains("closed") ? "⬆️ Buka Menu" : "✖ Tutup";

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
    toggleBtn.textContent = sidebar.classList.contains("closed") ? "⬆️ Buka Menu" : "✖ Tutup";
  });
}

// === Tombol panah atas (reopen sidebar) ===
const reopenBtn = document.querySelector(".sidebar-reopen");
if (reopenBtn) {
  reopenBtn.addEventListener("click", () => {
    sidebar.classList.remove("closed");
    toggleBtn.textContent = "✖ Tutup";
  });
}

// === Fitur Pencarian Lokasi (Area) ===
let searchLayer; // buat nyimpen hasil pencarian biar bisa dihapus pas search baru

function searchLocation() {
  const query = document.getElementById("searchInput").value;
  if (!query) {
    alert("Ketik nama daerah dulu ya!");
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&polygon_geojson=1&q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        // hapus hasil pencarian sebelumnya
        if (searchLayer) {
          map.removeLayer(searchLayer);
        }

        const result = data[0];
        const bbox = result.boundingbox;
        const bounds = [
          [parseFloat(bbox[0]), parseFloat(bbox[2])],
          [parseFloat(bbox[1]), parseFloat(bbox[3])]
        ];

        // zoom ke area
        map.fitBounds(bounds);

        // kalau ada geojson (area), tampilkan polygonnya
        if (result.geojson) {
          searchLayer = L.geoJSON(result.geojson, {
            style: {
              color: "#ff7800",
              weight: 2,
              fillOpacity: 0.1
            }
          }).addTo(map)
            .bindPopup(`Hasil pencarian: ${query}`)
            .openPopup();
        } else {
          // fallback: kalau ga ada polygon, kasih marker titik
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          searchLayer = L.marker([lat, lon]).addTo(map)
            .bindPopup(`Hasil pencarian: ${query}`)
            .openPopup();
        }

      } else {
        alert("Lokasi tidak ditemukan.");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Gagal mencari lokasi.");
    });
}

// Pasang event pencarian:
// - Jika HTML sudah pakai onclick di tombol, kita tidak menambahkan listener tambahan (mencegah double-call).
const searchBtn = document.querySelector(".search-box button");
if (searchBtn && !searchBtn.getAttribute("onclick")) {
  searchBtn.addEventListener("click", searchLocation);
}

const searchInput = document.getElementById("searchInput");
if (searchInput && !searchInput.getAttribute("onkeypress")) {
  searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") searchLocation();
  });
}
