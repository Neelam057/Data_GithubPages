// This function determines the color of the marker based on the depth of the earthquake.
function getColor(depth) {
  let color = "#98ee00";

  // If statement on color
  if (depth > 90) {
    color = "#ea2c2c";
  } else if (depth > 70) {
    color = "#ea822c";
  } else if (depth > 50) {
    color = "#ee9c00";
  } else if (depth > 30) {
    color = "#eecc00";
  } else if (depth > 10) {
    color = "#d4ee00";
  } else {
    color = "#98ee00";
  }

  return color;
}

// Helper function for radius
function getRadius(mag) {
  return mag * 2;
}

// Make Map
function createMap(time_frame) {

    // Delete Map
    let map_container = d3.select("#map_container");
    map_container.html(""); // empties it
    map_container.append("div").attr("id", "map"); //recreate it
  
  // Step 1: CREATE THE BASE LAYERS
  // Create the 'basemap' tile layer that will be the background of our map.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create the 'topo' tile layer as a second background of the map
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Add a control to the map that will allow the user to change which layers are visible.
  let queryURL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${time_frame}.geojson`;
  let platesURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json';

  // Make a request that retrieves the earthquake geoJSON data.
  d3.json(queryURL).then(function (data) {
    d3.json(platesURL).then(function (plates_data) {
      console.log(data);
      console.log(plates_data);

      // Loop through Earthquakes
      let markers = [];
      let heatArray = [];

      for (let i = 0; i < data.features.length; i++) {
        let row = data.features[i];
        let location = row.geometry.coordinates;
        if (location) {
          let latitude = location[1];
          let longitude = location[0];
          let depth = location[2];
          let mag = row.properties.mag;

          let marker = L.circleMarker([latitude, longitude], {
            fillOpacity: 0.9,
            color: "#000",
            weight: 0.5,
            fillColor: getColor(depth),
            radius: getRadius(mag)
          }).bindPopup(`
            <div style="font-size: 14px; line-height: 1.4;">
              <h4>${row.properties.title}</h4>
              <hr>
              <p><strong>Depth:</strong> ${depth}m</p>
              <p><strong>Magnitude:</strong> ${mag}</p>
              <p><strong>Location:</strong> ${latitude.toFixed(2)}, ${longitude.toFixed(2)}</p>
            </div>
          `);

          markers.push(marker);
          // HeatMap points
          heatArray.push([latitude, longitude]);
        }
      }

      // Create a layer group from the markers array
      let markerLayer = L.layerGroup(markers);

      // Create Heatmap Layer
      let heatLayer = L.heatLayer(heatArray, {
        radius: 50,
        blur: 15
      });

      let geoLayer = L.geoJSON(plates_data, {
        style: {
          color: "orange",
          weight: 3
        }
      });

      // Step 3: CREATE THE LAYER CONTROL
      let baseMaps = {
        Street: street,
        Topography: topo
      };
      let overlayMaps = {
        Earthquakes: markerLayer,
        "Tectonic Plates": geoLayer,
        HeatMap: heatLayer
      };

      // Step 4: INITIALIZE THE MAP
      // Create the map object with center and zoom options.
      let myMap = L.map("map", {
        center: [20, -30],
        zoom: 3,
        layers: [street, markerLayer, geoLayer]
      });

      // Step 5: Add the Layer Control, Legend, Annotations as needed
      // Then add the 'basemap' tile layer to the map.
      L.control.layers(baseMaps, overlayMaps).addTo(myMap);

      // Set up the legend.
      let legend = L.control({ position: "bottomright" });
      legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        let legendInfo = `
          <h3>Earthquake Depth</h3>
          <i style="background:#98ee00"></i>-10-10<br>
          <i style="background:#d4ee00"></i>10-30<br>
          <i style="background:#eecc00"></i>30-50<br>
          <i style="background:#ee9c00"></i>50-70<br>
          <i style="background:#ea822c"></i>70-90<br>
          <i style="background:#ea2c2c"></i>90+
        `;

        div.innerHTML = legendInfo;

        return div;
      };

      // Adding the legend to the map
      legend.addTo(myMap);
    });
  });
}

function init() {
  let time_frame = d3.select("#time_frame").property("value");
  createMap(time_frame);
}

// Event Listener
d3.select("#filter-btn").on("click", function () {
  init();
});

// On page load
init();
