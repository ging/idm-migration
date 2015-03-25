var client = require('./../lib/HTTPClient.js');
var serv = require('./../data/service_catalogue.json');
var migration_config = require('./../migration_config.js');

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/services',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var options2 = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/endpoints',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendServs = function (u) {

	//console.log(serv[u]);

	var body = {service: {type: serv[u].type, name: serv[u].name}};

	//console.log(body);
	client.sendData("http", options, body, undefined, function (status, resp) {
		var id = JSON.parse(resp).service.id;
		serv[u].id = id;
		console.log('OK ', status, 'resp ', body);

		if (u < serv.length - 1) {
			sendServs(u+1);
		} else {
			sendEndp(0, 0, 1);
		}

	}, function (status, resp) {
		console.log('ERROR: ', resp, status);
		if (u < serv.length - 1) {
			sendServs(u+1);
		} else {
			console.log('ERROR in services, stop');
			return;
		}
	});
}

var sendEndp = function (s, e, type) {

	//console.log(serv[u]);

	var body;

	if (type === 1) {
		body = {endpoint: {
			interface: 'admin',
			region: serv[s].endpoints[e].region,
			url: serv[s].endpoints[e].adminURL,
			service_id: serv[s].id
		}};
	} else if (type === 2) {
		body = {endpoint: {
			interface: 'public',
			region: serv[s].endpoints[e].region,
			url: serv[s].endpoints[e].publicURL,
			service_id: serv[s].id
		}};
	} else if (type === 3) {
		body = {endpoint: {
			interface: 'internal',
			region: serv[s].endpoints[e].region,
			url: serv[s].endpoints[e].internalURL,
			service_id: serv[s].id
		}};
	} else {
		console.log(':)');
		return;
	}

	//console.log(body1);


	client.sendData("http", options2, body, undefined, function (status, resp) {

		console.log('OK ', status, 'resp ', resp);

		if (e < serv[s].endpoints.length - 1) {
			sendEndp(s, e + 1, type);
		} else {
			if (s < serv.length - 1) {
				sendEndp(s + 1 , 0, type);
			} else {
				sendEndp(0 , 0, type + 1);
			}
		}
	}, function (status, resp) {
		console.log('ERROR: ', resp, status);

		if (e < serv[s].endpoints.length - 1) {
			sendEndp(s, e + 1, type);
		} else {
			if (s < serv.length - 1) {
				sendEndp(s + 1 , 0, type);
			} else {
				sendEndp(0 , 0, type + 1);
			}
		}
	});
}

sendServs(0);