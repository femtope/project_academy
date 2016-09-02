var type = '',
    region = '',
    prefecture = '',
    sub_prefecture = '',
    geoData = null,
    dataLayer = null,
    markerGroup = null,
    guineaAdminLayer1, guineaAdminLayer2,
    region_layer = null, prefecture_layer = null, sub_prefecture_layer = null,
    GINLabels = [],
    GINAdmin2 = false,
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    terrain = googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18}),
    mapbox = L.tileLayer('https://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=eng&token=61YWYROufLu_f8ylE0vn0Q&app_id=qIWDkliFCtLntLma2e6O', {maxZoom: 18})


var map = L.map('map', {
    center: [10.6, -14],
    zoom: 7,
    setView: [10.6, -13.8],
    animation: true,
    zoomControl: false,
    layers: [osm]
    //minZoom: 6

});

var baseMaps = {
    "Google Satelite": googleSat,
    "Google Street": googleStreets,
    "Terrain": terrain,
    "MapBox": mapbox,
    "OSM": osm
};

L.control.layers(baseMaps).addTo(map);

map.on('zoomend', function () {
    adjustLayerbyZoom(map.getZoom())
})

//
//L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    maxZoom: 18
//}).addTo(map);

new L.Control.Zoom({
    position: 'topright'
}).addTo(map);

L.control.scale({
    position: 'bottomright',
    maxWidth: 150,
    metric: true,
    updateWhenIdle: true
}).addTo(map);

function adjustLayerbyZoom(zoomGIN) {

    if (zoomGIN > 8) {
        if (!GINAdmin2) {
            map.addLayer(guineaAdminLayer2)
                //Add labels to the Admin2
            for (var i = 0; i < GINLabels.length; i++) {
                GINLabels[i].addTo(map)

            }
            GINAdmin2 = true
        }
    } else {
        map.removeLayer(guineaAdminLayer2)
        for (var i = 0; i < GINLabels.length; i++) {
            map.removeLayer(GINLabels[i])

        }

        GINAdmin2 = false
    }

}





function triggerUiUpdate() {
    type = $('#hf_type').val()
    console.log("HF Type:  ", type)
    region = $('#region_scope').val()
    console.log("Region:  ", region)
    prefecture = $('#prefecture_scope').val()
    console.log("Prefecture:  ", prefecture)
    sub_prefecture = $('#sub_prefecture_scope').val()
    console.log("Sub-Prefecture:  ", sub_prefecture)
    var query = buildQuery(type, region, prefecture, sub_prefecture)
    console.log("QUERY:  ", query)
    getData(query)
   // map.setZoom(6)
}



function buildQuery(type, region, prefecture, sub_prefecture) {
  var needsAnd = false;
    query = 'http://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM guinea_hf';
   if (type.length > 0 || region.length > 0 || prefecture.length > 0 || sub_prefecture.length > 0){
       query = query.concat(' WHERE')
       if (type.length > 0){
      query = query.concat(" type = '".concat(type.concat("'")))
      needsAnd = true
    }

    if (region.length > 0){
      query = needsAnd  ? query.concat(" AND region = '".concat(region.concat("'"))) :  query.concat(" region = '".concat(region.concat("'")))
      needsAnd = true
    }

    if(prefecture.length > 0) {
      query = needsAnd  ? query.concat(" AND prefecture = '".concat(prefecture.concat("'"))) :  query.concat(" prefecture = '".concat(prefecture.concat("'")))
      needsAnd = true
    }

    if(sub_prefecture.length > 0) {
      query = needsAnd  ? query.concat(" AND sub_prefecture = '".concat(sub_prefecture.concat("'"))) :  query.concat(" sub_prefecture = '".concat(sub_prefecture.concat("'")))
      needsAnd = true
    }

   }
     else query = 'http://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM guinea_hf';
  return query

}



function addDataToMap(geoData) {
    // adjustLayerbyZoom(map.getZoom())
    //remove all layers first

    if (dataLayer != null)
        map.removeLayer(dataLayer)

    if (markerGroup != null)
        map.removeLayer(markerGroup)

    var _radius = 8
    var _outColor = "#fff"
    var _weight = 2
    var _opacity = 2
    var _fillOpacity = 2.0

    var markerHealth = L.icon({
        iconUrl: "image/Hospital_Logo_01.png",
        iconSize: [20, 20],
        iconAnchor: [25, 25]
    });



    $('#projectCount').text(geoData.features.length)

    markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true
        })
        //console.log("geoData", geoData)
    dataLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
            var marker = L.marker(latlng, {icon: markerHealth})
                //markerGroup.addLayer(marker);
            return marker
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.cartodb_id) {
                //layer.bindPopup(buildPopupContent(feature));
                layer.on('click', function () {
                    displayInfo(feature)
                })
            }

        }

    })

    markerGroup.addLayer(dataLayer);
    map.addLayer(markerGroup);
}

function addAdminLayersToMap(layers) {
    var layerStyles = {
            'admin0': {
                "clickable": true,
                "color": '#B81609',
                "fillColor": '#FFFFFF',
                "weight": 2.0,
                "opacity": 1.5,
                "fillOpacity": 0.1
            },
            'admin2': {
                "clickable": true,
                "color": '#412406',
                "fillColor": '#FFFFFF',
                "weight": 1.5,
                "opacity": 0.7,
                "fillOpacity": 0.1
            },
            'region': {
                "clickable": true,
                "color": '#e2095c',
                "fillColor": '#FFFFFF',
                "weight": 2.0,
                "opacity": 0.7,
                "fillOpacity": 0.1
            },
            'prefecture': {
                "clickable": true,
                "color": '#e2095c',
                "fillColor": '#FFFFFF',
                "weight": 2.5,
                "opacity": 0.7,
                "fillOpacity": 0.1
            },
            'sub_prefecture': {
                "clickable": true,
                "color": '#ff0000',
                "fillColor": '#FFFFFF',
                "weight": 2.5,
                "opacity": 0.7,
                "fillOpacity": 0.1
            }
      }

    regionSelect = $('#region_scope').val()
    console.log('Region Selected: ', regionSelect)
    prefectureSelect = $('#prefecture_scope').val()
    console.log('Region Selected: ', regionSelect)


    guineaAdminLayer1 = L.geoJson(layers['guineaAdmin0'], {
        style: layerStyles['admin0']
    }).addTo(map)

//    guineaAdminLayer2 = L.geoJson(layers['guineaAdmin2'], {
//        style: layerStyles['admin2'],
//        onEachFeature: function (feature, layer) {
//            var labelIcon = L.divIcon({
//                className: 'labelLga-icon',
//                html: feature.properties.NAME_2
//            })
//            GINLabels.push(L.marker(layer.getBounds().getCenter(), {
//                    icon: labelIcon
//                }))
//
//        }
//    })

    //Zoom In to region level on selection
    if(region_layer != null)
      map.removeLayer(region_layer)

      region_layer = L.geoJson(layers['guineaAdmin1'], {
        filter: function(feature) {
          return feature.properties.NAME_1 === regionSelect
          console.log('name 1: ', feature.properties.NAME_1)
      },
      style: layerStyles['region'],
      }).addTo(map)
    map.fitBounds(region_layer.getBounds())

    //Zoom In to Prefecture Level on selection

    if(prefecture_layer != null)
      map.removeLayer(prefecture_layer)

      prefecture_layer = L.geoJson(layers['guineaAdmin2'], {
        filter: function(feature) {
          return feature.properties.NAME_1 === regionSelect
          console.log('name 2: ', feature.properties.NAME_1)
      },
      style: layerStyles['region'],
      }).addTo(map)
    map.fitBounds(region_layer.getBounds())


}


function displayInfo(feature) {
    //console.log('displaying info..')
    var infoContent = buildPopupContent(feature)
        //console.log("info", infoContent)
    $('#infoContent').html(infoContent)
}

function normalizeName(source) {
    source = source.replace("_", " ").replace('of_', ' of ')
    source = source.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    return source
}

function buildPopupContent(feature) {
    var subcontent = ''
    var propertyNames = ['country','region', 'prefecture', 'sub_prefecture', 'place', 'type', 'organization', 'center']
    for (var i = 0; i < propertyNames.length; i++) {
        subcontent = subcontent.concat('<p><strong>' + normalizeName(propertyNames[i]) + ': </strong>' + feature.properties[propertyNames[i]] + '</p>')

    }
    return subcontent;
}

function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getData(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
    }).fail(function () {
        console.log("error!")
    });
}

function getAdminLayers() {
    showLoader()
    var adminLayers = {}

    //Add Admin Layers to Map
     $.get('resources/GIN_Admin0.geojson', function (guinea_admin0) {
        adminLayers['guineaAdmin0'] = JSON.parse(guinea_admin0)
        addAdminLayersToMap(adminLayers)
		}).fail(function () {
            logError(null)
        })

     $.get('resources/GIN_Admin1.geojson', function (guinea_admin1) {
        adminLayers['guineaAdmin1'] = JSON.parse(guinea_admin1)
        addAdminLayersToMap(adminLayers)
		}).fail(function () {
            logError(null)
        })


     $.get('resources/GIN_Admin2.geojson', function (guinea_admin2) {
        adminLayers['guineaAdmin2'] = JSON.parse(guinea_admin2)
        addAdminLayersToMap(adminLayers)
		}).fail(function () {
            logError(null)
        })


}

function logError(error) {
    console.log("error!")
}

getAdminLayers()
hideLoader()
/*triggerUiUpdate()*/
