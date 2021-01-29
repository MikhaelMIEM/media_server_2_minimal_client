var ws = new WebSocket('wss://media.auditory.ru:8443/player');
var video;
var webRtcPeer;


window.onload = function() {
	video = document.getElementById('video');
}

window.onbeforeunload = function() {
	ws.close();
}

ws.onopen = function(message) {
	console.info('Websocket ready to work. Now allowed to start translation');
	// Когда отработает этот код можно запускать трансляцию
}

ws.onmessage = function(message) {
	var parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
	case 'startResponse':
		startResponse(parsedMessage);
		break;
	case 'error':
		onError('Error message from server: ' + parsedMessage.message);
		break;
	case 'playEnd':
		playEnd();
		break;
	case 'videoInfo':
		break;
	case 'iceCandidate':
		webRtcPeer.addIceCandidate(parsedMessage.candidate, function(error) {
			if (error)
				return console.error('Error adding candidate: ' + error);
		});
		break;
	case 'iceCandidate':
		break;
	default:
		onError('Unrecognized message', parsedMessage);
	}
}

function start() {
	// Video and audio by default
	var userMediaConstraints = {
		audio : true,
		video : true
	}

	var options = {
		remoteVideo : video,
		mediaConstraints : userMediaConstraints,
		onicecandidate : onIceCandidate
	}

	console.info('User media constraints' + userMediaConstraints);

	webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
			function(error) {
				if (error)
					return console.error(error);
				webRtcPeer.generateOffer(onOffer);
			});
}

function onOffer(error, offerSdp) {
	if (error)
		return console.error('Error generating the offer:' + error);
	console.info('Invoking SDP offer callback function ' + location.host);

	var message = {
		id : 'start',
		sdpOffer : offerSdp,
		videourl : document.getElementById('videourl').value
	}
	sendMessage(message);
}

function onError(error) {
	console.error(error);
}

function onIceCandidate(candidate) {
	console.log('Local candidate' + JSON.stringify(candidate));

	var message = {
		id : 'onIceCandidate',
		candidate : candidate
	}
	sendMessage(message);
}

function startResponse(message) {
	console.log('SDP answer received from server. Processing ...');

	webRtcPeer.processAnswer(message.sdpAnswer, function(error) {
		if (error)
			return console.error(error);
	});
}

function stop() {
	console.log('Stopping video ...');
	if (webRtcPeer) {
		webRtcPeer.dispose();
		webRtcPeer = null;

		var message = {
			id : 'stop'
		}
		sendMessage(message);
	}
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Sending message: ' + jsonMessage);
	ws.send(jsonMessage);
}
