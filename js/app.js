var map;
var markers = [];
var largeInfoWindow;
var locations = [
    {title: 'Vishesh\'s Home', location: {lat: 30.680885, lng: 76.844523}},
    {title: 'Little Flower Convent School', location: {lat: 30.678838, lng: 76.845883}},
    {title: 'Government ITI', location: {lat: 30.679686, lng: 76.846797}},
    {title: 'Nand Sweets', location: {lat: 30.681596, lng: 76.844383}},
    {title: 'Blue Dart Express Limited', location: {lat: 30.681420, lng: 76.843589}}
];
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 15,
      center: {lat: 30.68, lng: 76.84}
    });

    largeInfoWindow = new google.maps.InfoWindow();
    var highlightedIcon = new makeMarkerIcon('FFFF24');

    for (var i = 0; i < locations.length; i++){
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        markers.push(marker);
        marker.addListener('click',function(){
            populateInfoWindow(this,largeInfoWindow);
        });
        marker.addListener('mouseover', function(){
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function(){
            this.setIcon(null);
        });
    }
    showListings();
}

function makeMarkerIcon(markerColor){
    var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+
        markerColor+'|40|_|%E2%80%A2',
    new google.maps.Size(21,34),
    new google.maps.Point(0,0),
    new google.maps.Point(10,34),
    new google.maps.Size(21,34));
    return markerImage;
}

function makeMarkerBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 750);
}

function populateInfoWindow(marker, infoWindow){
    makeMarkerBounce(marker);
    if(infoWindow.marker != marker){
        infoWindow.marker = marker;
        infoWindow.setContent('<div>' + marker.title + '</div><div>' + marker.position + '</div>');
        infoWindow.open(map,marker);
        infoWindow.addListener('closeclick', function(){
            infoWindow.setMarker(null);
        });
    }
}

function showListings(){
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

function hideListings(){
    for(var i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
}

function selectMarker(value){
    if (largeInfoWindow.marker != value.location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == value.title) {
                populateInfoWindow(markers[i], largeInfoWindow);
                break;
            }
        }
    }
}

var viewModel = {
    searchQuery: ko.observable(''),
    list: ko.observableArray([]),
    showMyList: ko.observable(true),
    init: function(query){
        for(var l in locations){
            viewModel.list.push(locations[l]);
        }
    },
    search: function(query) {
        viewModel.list.removeAll();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
        }
        for(var l in locations) {
            if(locations[l].title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
              viewModel.list.push(locations[l]);
              var marker = locations[l].location;
                for (var i = 0; i < markers.length; i++) {
                    if (markers[i].position.lat().toFixed(5) == marker.lat.toFixed(5) &&
                        markers[i].position.lng().toFixed(5) == marker.lng.toFixed(5)) {
                            markers[i].setVisible(true);
                    }
                }
            }
        }
    }
};
viewModel.init();
viewModel.searchQuery.subscribe(viewModel.search);
ko.applyBindings(viewModel);