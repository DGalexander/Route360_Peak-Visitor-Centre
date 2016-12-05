var latlon = [53.343557, -1.778];
var map = L.map('map').setView(latlon, 13);

/* to change the location of the map change the lat and long, here 40.717192,-74.012042.
To change the default zoom level change 17 to another number. 0 is entire world twice over and 18 is the closest you can get
*/

// add an OpenStreetMap tile layer
L.tileLayer('https://a.tiles.mapbox.com/v3/mi.0ad4304c/{z}/{x}/{y}.png', {
  attribution: "<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='https://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='https://www.route360.net/de/' target='_blank'>Route360°</a>"
}).addTo(map);

// set the service API-key
r360.config.serviceKey = 'OZIWK8M2YYLAMA2VNPAU';
r360.config.serviceUrl = 'https://service.route360.net/britishisles/';

// create a marker and add it to the map
var blueMarker = L.icon({
  iconUrl: 'https://developers.route360.net/download/basic-example/images/marker-icon.png',
  iconSize: [25, 41], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
});

var marker = L.marker((latlon), {
  icon: blueMarker
}).addTo(map);

// create the layer to add the polygons
var polygonLayer = r360.leafletPolygonLayer();
// add it to the map
map.addLayer(polygonLayer);

// define time steps and colors here. Always use time values of the same distance and not too much time. 
// the maximum travel time size is 2 hours, 7200s respectivly, higher values will be blocked be the server
// travel times are defined in seconds the initial values in minutes... Also the label may be altered here
var travelTimeControl = r360.travelTimeControl({
  travelTimes: [{
    time: 300,
    color: "#006837"
  }, {
    time: 600,
    color: "#39B54A"
  }, {
    time: 900,
    color: "#8CC63F"
  }, {
    time: 1200,
    color: "#F7931E"
  }, {
    time: 1500,
    color: "#F15A24"
  }, {
    time: 1800,
    color: "#C1272D"
  }],
  unit: 'min', // just a display value
  position: 'topright', // this is the position in the map
  label: r360.config.i18n.getSpan('travelTime'), // the label, customize for i18n
  initValue: 30 // the inital value has to match a time from travelTimes, e.g.: 40m == 2400s
});

//  bind the action to the travel time control
travelTimeControl.onSlideStop(function() {
  showPolygons();
});

// add a radio element with all the different transport types
var buttonOptions = {
  buttons: [
    // each button has a label which is displayed, a key, a tooltip for mouseover events 
    // and a boolean which indicates if the button is selected by default
    // labels may contain html
    {
      label: '<i class="fa fa-bicycle"></i> Cycling',
      key: 'bike',
      tooltip: 'Cycling speed is on average 15km/h',
      checked: false
    },

    {
      label: '<i class="fa fa-male"></i>  Walking',
      key: 'walk',
      tooltip: 'Walking speed is on average 5km/h',
      checked: true
    },

    {
      label: '<i class="fa fa-car"></i> Car',
      key: 'car',
      tooltip: 'Car speed is limited by speed limit',
      checked: false
    }
  ]
};

// create a new readio button control with the given options
var travelTypeButtons = r360.radioButtonControl(buttonOptions);

// add the newly created control to the map
map.addControl(travelTypeButtons);

 // bind the action to the change event of the radio travel mode element
    travelTypeButtons.onChange(function(value){ showPolygons(); });

// add the newly created control to the map
map.addControl(travelTimeControl);


// call the helper function to display polygons with initial value
showPolygons();

// select language
r360.config.i18n.switchLanguage();

// helper function to encapsulate the show polygon action
function showPolygons() {

  // you need to define some options for the polygon service
  // for more travel options check out the other tutorials
  var travelOptions = r360.travelOptions();
  // we only have one source which is the marker we just added
  travelOptions.addSource(marker);
  // we want to have polygons for whatever the user selects 
  travelOptions.setTravelTimes(travelTimeControl.getValues());
  // get the selected travel type from the control
  travelOptions.setTravelType(travelTypeButtons.getValue());
  
  

  // call the service
  r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons) {

    // in case there are already polygons on the map/layer clear them
    // and fit the map to the polygon bounds ('true' parameter)
    polygonLayer.clearAndAddLayers(polygons, true);
  });
};
