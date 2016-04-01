$(document).ready(function() {

$(document).bind("contextmenu", function() { return false; });

$("#container").mousedown(function( e ) {
	if ( e.button === 2 ) {
		$("#container").ctxmenu({
			menu: [
				{ "id": "1", "text": "Car", "image": "images/transit.car.png", "action": clickMenu },
				{ "id": "2", "text": "Bus", "image": "images/transit.bus.png", "disabled": true },
				{ "id": "3", "text": "Plane", "image": "images/transit.plane.png", "action": clickMenu },
				{ "id": "4", "text": "Map", "image": "images/map.png", "separator": true, "action": clickMenu },
				{ "id": "5", "text": "Weather", "image": "images/weather.chance.png", "children": [
					{ "id": "5.1", "text": "Sun", "image": "images/weather.sun.png", "action": clickMenu },
					{ "id": "5.2", "text": "Overcast", "image": "images/weather.overcast.png", "action": clickMenu },
					{ "id": "5.3", "text": "Rain", "image": "images/weather.rain.png", "action": clickMenu },
					{ "id": "5.4", "text": "Thunder", "image": "images/weather.thunder.png", "action": clickMenu },
					{ "id": "5.5", "text": "Snow", "image": "images/weather.snow.png", "action": clickMenu }
				]},
				{ "id": "6", "text": "Globe", "image": "images/globe.png", "action": clickMenu },
				{ "id": "7", "text": "Currency", "image": "images/currency.dollar.png", "children": [
					{ "id": "7.1", "text": "Dollar", "image": "images/currency.dollar.png", "action": clickMenu },
					{ "id": "7.2", "text": "Yuan", "image": "images/currency.yen.png", "action": clickMenu },
					{ "id": "7.3", "text": "Euro", "image": "images/currency.euro.png", "children": [
						{ "id": "7.3.1", "text": "Euro", "image": "images/currency.euro.png", "action": clickMenu },
						{ "id": "7.3.2", "text": "Pound", "image": "images/currency.pound.png", "disabled": true },
						{ "id": "7.3.3", "text": "Rubles", "image": "images/currency.rubles.png", "action": clickMenu },
						{ "id": "7.3.4", "text": "Grivna", "image": "images/currency.grivna.png", "action": clickMenu }
					]},
					{ "id": "7.4", "text": "Rupee", "image": "images/currency.rupee.png", "disabled": true }
				]},
				{ "id": "8", "text": "Qr", "image": "images/qr.png", "disabled": true }
			]
		});
		$("#container").ctxmenu("show", e.pageX, e.pageY);
	} else {
		if ( e && e.target ) {
			var $target = $(e.target);
			if ( $target.is(".ctxmenu") || $target.parents(".ctxmenu:first").length ) {
			} else {
				$("#container").ctxmenu("hide");
			}
		} else {
			$("#container").ctxmenu("hide");
		}
	}
});

function clickMenu( m ) {
	$(".log").text("You click menu is " + m.id + "-" + m.text);
}

});