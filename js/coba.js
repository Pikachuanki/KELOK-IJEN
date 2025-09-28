// map.js
// Pastikan file ini berada di lokasi yang sama dengan index.html

// Nama file GeoJSON (sesuaikan jika perlu)
const geojsonFiles = [
  "data/krb1.geojson",
  "data/krb2.geojson",
  "data/krb3.geojson",
  "data/krb4.geojson",
  "data/krb5.geojson",
  "data/krb6.geojson"
];

// Label yang akan tampil di panel (sesuaikan)
const layerLabels = [
  "KRB 1",
  "KRB 2",
  "KRB 3",
  "KRB 4",
  "KRB 5",
  "KRB 6"
];

// Warna berbeda untuk tiap layer (boleh diganti)
const colors = [
  "#e41a1c", // merah
  "#377eb8", // biru
  "#4daf4a", // hijau
  "#984ea3", // ungu
  "#ff7f00", // oranye
  "#ffff33"  // kuning
];

// Create map (setView default, nanti akan fitBounds bila ada data)
const map = L.map('map', {
  center: [-8.5, 115.0], // default view (ubah jika perlu)
  zoom: 9
});

// Basemap citra satelit (Esri World Imagery)
const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Sumber citra: Esri, Maxar, Earthstar Geographics',
  maxZoom: 19
}).addTo(map);

// Optional: juga tambahkan basemap lain (jalan) untuk toggling
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});

const baseLayers = {
  "Citra Satelit (Esri)": satellite,
  "OpenStreetMap": osm
};

// We'll keep track of layer groups
const krbLayers = [];
const layerControlLayers = {}; // for Leaflet control

// UI elements
const layersListDiv = document.getElementById('layers-list');
const legendDiv = document.getElementById('legend');

// Helper: create popup content from feature.properties
function createPopupContent(properties) {
  if (!properties) return "";
  // Build a small table of properties
  let rows = "";
  for (let key in properties) {
    if (!properties.hasOwnProperty(key)) continue;
    let val = properties[key];
    // short formatting for objects/arrays
    if (typeof val === "object") val = JSON.stringify(val);
    rows += `<tr><td style="font-weight:600; padding-right:8px;">${key}</td><td>${val}</td></tr>`;
  }
  return `<table>${rows}</table>`;
}

// Load each GeoJSON file
let boundsAccumulator = L.latLngBounds(); // to fit map later
let pending = geojsonFiles.length;

geojsonFiles.forEach((url, idx) => {
  fetch(url)
    .then(resp => {
      if (!resp.ok) throw new Error(`Gagal memuat ${url}: ${resp.statusText}`);
      return resp.json();
    })
    .then(geojson => {
      const color = colors[idx % colors.length];

      const gjLayer = L.geoJSON(geojson, {
        style: function(feature) {
          return {
            color: color,
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.35,
            fillColor: color
          };
        },
        onEachFeature: function(feature, layer) {
          const popup = createPopupContent(feature.properties);
          if (popup) layer.bindPopup(popup);
        }
      });

      // add to map by default (optional: if you want all off by default, don't add)
      gjLayer.addTo(map);

      // collect bounds
      try {
        const layerBounds = gjLayer.getBounds();
        if (layerBounds.isValid()) boundsAccumulator.extend(layerBounds);
      } catch (e) {
        // ignore
      }

      // store
      krbLayers.push(gjLayer);
      layerControlLayers[layerLabels[idx] ?? `KRB ${idx+1}`] = gjLayer;

      // Add to side panel with checkbox
      const item = document.createElement('div');
      item.className = 'layer-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true; // default on
      cb.id = `layer-cb-${idx}`;

      cb.addEventListener('change', function() {
        if (this.checked) {
          map.addLayer(gjLayer);
        } else {
          map.removeLayer(gjLayer);
        }
      });

      const colorBox = document.createElement('span');
      colorBox.className = 'color-box';
      colorBox.style.background = color;

      const label = document.createElement('label');
      label.htmlFor = cb.id;
      label.textContent = layerLabels[idx] ?? `KRB ${idx+1}`;

      item.appendChild(cb);
      item.appendChild(colorBox);
      item.appendChild(label);
      layersListDiv.appendChild(item);

      // Update legend
      const legRow = document.createElement('div');
      legRow.style.display = 'flex';
      legRow.style.alignItems = 'center';
      legRow.style.gap = '8px';
      legRow.style.marginTop = '6px';
      const legColor = document.createElement('span');
      legColor.style.width = '18px';
      legColor.style.height = '12px';
      legColor.style.background = color;
      legColor.style.border = '1px solid rgba(0,0,0,0.2)';
      legColor.style.display = 'inline-block';
      const legLabel = document.createElement('span');
      legLabel.textContent = layerLabels[idx] ?? `KRB ${idx+1}`;
      legRow.appendChild(legColor);
      legRow.appendChild(legLabel);
      legendDiv.appendChild(legRow);

    })
    .catch(err => {
      console.error(err);
      const info = document.createElement('div');
      info.style.color = 'crimson';
      info.style.fontSize = '13px';
      info.textContent = `Error loading ${url}: ${err.message}`;
      layersListDiv.appendChild(info);
    })
    .finally(() => {
      pending -= 1;
      // Once all loaded, fit bounds if valid
      if (pending === 0) {
        if (boundsAccumulator.isValid()) {
          map.fitBounds(boundsAccumulator.pad(0.1));
        } else {
          // If no valid bounds, keep default view
        }
        // add layer control (basemap + overlays)
        L.control.layers(baseLayers, layerControlLayers, { collapsed: false, position: 'topleft' }).addTo(map);

        // add scale
        L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);
      }
    });

}); // end foreach
