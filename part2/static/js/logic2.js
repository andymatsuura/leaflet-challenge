const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
const platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url).then(function(data) {
    console.log(data.features);
    // data shows in console log so will pass it to create features function 
    createFeatures(data.features);
});

//marker size based on magnitude
function markerSize(mag)  {
    return mag * 5;
};

//marker color based on depth
//looked up colors on color-hex, link in readme
// changed to orange and orangered because the code for them was not showing up
function markerColor(depth) {
    if (depth < 10) return "#00ff00";
    else if (depth < 30) return "#cae00d";
    else if (depth < 50) return "#fdbe02";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "#ee0000"
};

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>
            <p>Date: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}`)
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        //used pointtoLayer from leaflet documentation
        pointToLayer: function (feature, latlng) {
            let markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                weight: 1,
                opacity: 1,
                color: "black",
                stroke: true,
                fillOpacity: 0.6
            }
            return L.circleMarker(latlng, markers)
        }
    })
    createMap(earthquakes)
}

function createMap(earthquakes) {
    // Create the base layers. used same function from wk1 lesson10 edited where needed
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let tectonicPlates = new L.layerGroup();
        d3.json(platesURL).then(function(plates) {
            L.geoJSON(plates, {
                color: "red",
                weight: 3
            }).addTo(tectonicPlates);
        });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlays object.
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    }

    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes, tectonicPlates]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        depthLevels = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h3>Depth</h3>"
// help from chatgpt here, map wasnt working properly
    for (let i = 0; i < depthLevels.length; i++) {
        div.innerHTML +=
            '<i style="background:' + markerColor(depthLevels[i] + 1) + '"></i> ' +
            depthLevels[i] + (depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    legend.addTo(myMap);
};