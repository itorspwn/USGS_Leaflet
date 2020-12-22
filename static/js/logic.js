// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  function markerStyle (feature){
    return {
      stroke: false,
      fillOpacity: 0.4,
      fillColor: colorSelect(feature.properties.mag),
      radius: feature.properties.mag * 7
    }
  }

  // Select colors for magnitude of earthquake 
  function colorSelect(mag) {
    if (mag > 5) 
      return "red";
    else if (mag > 4)
      return "orange";
    else if (mag > 3)
      return "yellow";
    else if (mag > 2)
      return "green";
    else if (mag > 1)
      return "blue";
    else if (mag > 0.5)
      return "lightskyblue";
    else
      return "white";
    
  }

  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    style: markerStyle,
    pointToLayer: function(feature, data){
      return L.circleMarker(data)
    }
  }); 
  // Set up the legend
  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [5, 4, 3, 2, 1, 0.5];
    var colors = ["red", "orange", "yellow", "green", "blue", "lightskyblue"];
    var labels = [];

    // Add min & max
    var legendInfo = "<h4>Mag. Scales</h4>" +
      "<div class=\"labels\">" +
      "<div class=\"min\">" + limits[0] + "</div>" +
      "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      console.log(limit);
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };


    // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, legend);
}

function createMap(earthquakes, legend) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    quakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
  

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  // Adding legend to the map
  legend.addTo(myMap);

}