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
// WARNA POLIGON
// ===============================
function getColorKRBRadius(level) {
  return level === 'KRB I' ? '#FFEDA0' :
         level === 'KRB II' ? '#FEB24C' :
         level === 'KRB III' ? '#d334c0ff' : '#CCCCCC';
}

function getColorKRBLahar(level) {
  return level === 'KRB I' ? '#f5dd04ff' :
         level === 'KRB II' ? '#fb5efbff' :
         level === 'KRB III' ? '#c40794ff' : '#CCCCCC';
}

// ===============================
// STYLE POLYGON
// ===============================
function styleRadius(level) {
  return {
    fillColor: getColorKRBRadius(level),
    color: 'black',
    weight: 1,
    fillOpacity: 0.6
  };
}
function styleLahar(level) {
  return {
    fillColor: getColorKRBLahar(level),
    color: 'black',
    weight: 1,
    fillOpacity: 0.6
  };
}

// ===============================
// POPUP
// ===============================
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

// ===============================
// LOAD SEMUA LAYER
// ===============================
var layers = {};

function loadLayer(url, layerName, styleFn, level) {
  fetch(url)
    .then(r => r.json())
    .then(d => {
      layers[layerName] = L.geoJSON(d, {
        style: styleFn(level),
        onEachFeature: function (feature, layer) {
          layer.bindPopup(popupKRB(feature.properties));
          layer.on({
            click: function (e) {
              e.target.openPopup();
            },
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
    .catch(err => console.error("Gagal memuat " + url, err));
}

// Radius
loadLayer("../data/KRB_1.geojson", "krb1r", styleRadius, "KRB I");
loadLayer("../data/KRB_2.geojson", "krb2r", styleRadius, "KRB II");
loadLayer("../data/KRB_3.geojson", "krb3r", styleRadius, "KRB III");

// Lahar
loadLayer("../data/KRB1.geojson", "krb1l", styleLahar, "KRB I");
loadLayer("../data/KRB2.geojson", "krb2l", styleLahar, "KRB II");
loadLayer("../data/KRB3.geojson", "krb3l", styleLahar, "KRB III");

// ===============================
// KONTROL CHECKBOX
// ===============================
function toggleLayer(id, layerName) {
  const checkbox = document.getElementById(id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked && layers[layerName]) {
      layers[layerName].addTo(map);
    } else if (layers[layerName]) {
      map.removeLayer(layers[layerName]);
    }
  });
}

toggleLayer('krb1r', 'krb1r');
toggleLayer('krb2r', 'krb2r');
toggleLayer('krb3r', 'krb3r');
toggleLayer('krb1l', 'krb1l');
toggleLayer('krb2l', 'krb2l');
toggleLayer('krb3l', 'krb3l');
