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
		console.log('OK ', status, 'resp ', resp, 'id', id);

		if (u < serv.length - 1) {
			sendServs(u+1);
		} else {
			sendEndp(0, 1);
		}

	}, function (status, resp) {
		console.log('ERROR: ', resp, status);
		sendServs(u+1);
	});
}

var sendEndp = function (u, type) {

	//console.log(serv[u]);

	for (var e in serv[u].endpoints) {

		var body;

		if (type === 1) {
			body = {endpoint: {
				interface: 'admin',
				region: serv[u].endpoints[e].region,
				url: serv[u].endpoints[e].adminURL,
				service_id: serv[u].id
			}};
		} else if (type === 2) {
			var body = {endpoint: {
				interface: 'public',
				region: serv[u].endpoints[e].region,
				url: serv[u].endpoints[e].publicURL,
				service_id: serv[u].id
			}};
		} else if (type === 3) {
			var body = {endpoint: {
				interface: 'internal',
				region: serv[u].endpoints[e].region,
				url: serv[u].endpoints[e].internalURL,
				service_id: serv[u].id
			}};
		} else {
			console.log(':)');
			return;
		}

		//console.log(body1);


		client.sendData("http", options2, body, undefined, function (status, resp) {

			console.log('OK ', status, 'resp ', resp);

			if (u < serv.length - 1) {
				sendEndp(u + 1, type);
			} else {
				sendEndp(0, type + 1);
			}
		}, function (status, resp) {
			console.log('ERROR: ', resp, status);

			if (u < serv.length - 1) {
				sendEndp(u + 1, type);
			} else {
				sendEndp(0, type + 1);
			}
		});

	}

}

sendServs(0);