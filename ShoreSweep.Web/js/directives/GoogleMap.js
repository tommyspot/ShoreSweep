﻿var ngGoogleMap = ngGoogleMap || angular.module('google-map', []);

ngGoogleMap.directive('googleMap', function () {
  return {
    restrict: 'AE',
    replace: true,
    template: '<div id="googleMap"></div>',
    scope: {
      ngModel: '=?',
      ngMarkers: '=?'
    },

    link: function (scope, element, attr) {
      var chartElement = element[0];
      var center = scope.ngModel ? new google.maps.LatLng(scope.ngModel.latitude, scope.ngModel.longitude):
                scope.ngMarkers ? new google.maps.LatLng(scope.ngMarkers[0].latitude, scope.ngMarkers[0].longitude):null;
      // get map options
      var options = {
        center: center,
        zoom: 12,
        mapTypeId: "roadmap"
      };

      // create the map + marker
      var map = new google.maps.Map(element[0], options);
      if (scope.ngMarkers) {
        for (var i = 0; i < scope.ngMarkers.length; i++) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(scope.ngMarkers[i].latitude, scope.ngMarkers[i].longitude),
            map: map,
            label: scope.ngMarkers[i].id + '',
            title: scope.ngMarkers[i].id + '-' + scope.ngMarkers[i].size
          });
        }        
      } else {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(scope.ngModel.latitude, scope.ngModel.longitude),
          map: map,
          label: scope.ngModel.id + '',
          title: scope.ngModel.description
        });
      }
    

      //fix error only load right at first time
      google.maps.event.addListenerOnce(map, 'idle', function () {
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
        var infowindow = new google.maps.InfoWindow();
        if (scope.ngMarkers) {
          for (var i = 0; i < scope.ngMarkers.length; i++) {
            infowindow.setContent(scope.ngMarkers[i].id + '-' + scope.ngMarkers[i].size);
            infowindow.open(map, marker);
          }          
        } else {
          infowindow.setContent(scope.ngModel.id + '-' + scope.ngModel.size);
          infowindow.open(map, marker);
        }        
        
      });

      google.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {
          var infowindow = new google.maps.InfoWindow();
          infowindow.setContent(scope.ngModel.id + '-' + scope.ngModel.size);
          infowindow.open(map, marker);
        }
      })(marker));

      // Define the LatLng coordinates for the polygon's path.
      if (scope.ngModel) {
        var polygonCoords = scope.ngModel.polygonCoords;
        if (polygonCoords) {
          // Construct the polygon.
          var polygon = new google.maps.Polygon({
            paths: polygonCoords,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35
          });
          polygon.setMap(map);
        }
      }
    }
  }
});