// Facebook Stuff
var friends = [];
var locations = new Array();
var seenLocations = {};
var callbackCounter = -1;
function populateArray() 
{
	FB.api('/me/friends?fields=id,name,location,link,picture', function(response) {
		for (var i=0, l=response.data.length; i<l; i++) {
			var friend = response.data[i];
			
			if (!friend.location || !friend.location.id) {
				continue;
			}
			
			if (seenLocations[friend.location.id]) {
				//location is known
			} else {
				seenLocations[friend.location.id] = true;
				if (callbackCounter == -1) {
					callbackCounter = 0;
				}
				callbackCounter++;
				FB.api('/' + friend.location.id, function(locationResponse) {
					if (locationResponse.location) {
						locations[locationResponse.id] = locationResponse.location;
					}
					callbackCounter--;
				});
			}
			friends.push(friend);
		}
	});
}

// Google Maps Stuff
var markers = [];
var infoWindow;
function putMarkers()
{
	while (callbackCounter != 0) {
		setTimeout("putMarkers()", 1000);
		return;
	}
	
	infoWindow = new google.maps.InfoWindow();
	
	for (i in friends) {
		var friend = friends[i];
		if (locations[friend.location.id]) {
			var lat_lng = new google.maps.LatLng(locations[friend.location.id].latitude, locations[friend.location.id].longitude);
			var marker = new google.maps.Marker({
				position: lat_lng,
				icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
			});
			
			marker.html = 
			"<div style='text-align: center;'>"
			+ "<img src = '" + friend.picture + "'><br/>" 
			+ friend.name
			+ "</div>" ;
			marker.link = friend.link;
			
			google.maps.event.addListener(marker, 'mouseover', function(){
				infoWindow.setContent(this.html);
				infoWindow.open(map, this);
			});
			google.maps.event.addListener(marker, 'mouseout', function(){
				infoWindow.close();
			});
			google.maps.event.addListener(marker, 'click', function(){
				window.open(this.link);
			});
			
			markers.push(marker);
		}
	}
	
	var markerClusterer = new MarkerClusterer(map, markers);
	google.maps.event.addListener(markerClusterer, "mouseover", function(c){
		var clusterMarkers = c.getMarkers();
		var content = "";
		
		for (i in clusterMarkers) {
			var m = clusterMarkers[i];
			content = content + m.html;
			if (i > 3) {
				content = content + "<br /><div style='text-align: center; font-weight: bold;'>and more!</div>";
				break;
			}
		}
		 
		infoWindow.setContent(content);
		infoWindow.setPosition(c.getCenter());
		infoWindow.open(map);
	});
	google.maps.event.addListener(markerClusterer, "mouseout", function(c){
		infoWindow.close();
	});
}

function mapFriends()
{
	populateArray();
	putMarkers();
}