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

// change color of marker when hovered
function makeMarkerIcon(markerColor){
    var markerImage = new google.maps.MarkerImage('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+
        markerColor+'|40|_|%E2%80%A2',
    new google.maps.Size(21,34),
    new google.maps.Point(0,0),
    new google.maps.Point(10,34),
    new google.maps.Size(21,34));
    return markerImage;
}

// Animate marker when clicked
function makeMarkerBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 700);
}

// This function populates the infowindow when the marker is clicked based on that markers position.
function populateInfoWindow(marker, infoWindow){
    makeMarkerBounce(marker);
    if(infoWindow.marker != marker){
        infoWindow.marker = marker;
        infoWindow.setContent('');
        getPhotos(marker);
        infoWindow.open(map,marker);
        infoWindow.addListener('closeclick', function(){
            infoWindow.marker = null;
        });
    }
}

// show markers
function showListings(){
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// hide markers
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

// google api error
googleapiError = () => {
    viewModel.showError(true);
    viewModel.error('Error: Failed to load Map...');
};

// flickr api error
function flickrError(){
    viewModel.showError(true);
    viewModel.error('Error: Failed to load data...')
    largeInfoWindow.setContent('Error: failed to load data...')
}

// load photos from flickr into infoWindow based lat,lng location
function getPhotos(marker){
    var content = '<div class="infoTitle">' + marker.title + '</div><div class="infoPosition">'+
    marker.position + '</div><div class="infoWindow">';
    var lat = marker.getPosition().lat();
    var lng = marker.getPosition().lng();
    $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=71f7dbd68c3df981a0dff409b02b237a&lat='+lat+'&lon='+lng+'&per_page=30&media=photos&format=json&jsoncallback=?',displayIm).fail(function(){
        flickrError();
    });
    function displayIm(data){
        $.each(data.photos.photo, function(i,item){
            var id = item.id;
            var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
            content += '<img class="infoImage" src="' + photoURL + '">';
        });
        content += '</div>';
        largeInfoWindow.setContent(content);
        showListings();
        viewModel.showError(false);
        viewModel.error('');
    }
}


// view model
var viewModel = {
    searchQuery: ko.observable(''),
    list: ko.observableArray([]),
    showMyList: ko.observable(true),
    showError: ko.observable(false),
    error: ko.observable(''),
    init: function(query){
        for(var l in locations){
            viewModel.list.push(locations[l]);
        }
    },
    // search queries
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