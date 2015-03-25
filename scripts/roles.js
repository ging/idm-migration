var client = require('./../lib/HTTPClient.js');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-ROLES/roles',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.roles.length) return;

	if (!db.roles[u].is_internal && db.roles[u].application_id !== undefined) {

		db.roles[u].id = db.roles[u].id + '';
		db.roles[u].application_id = db.roles[u].application_id + '';

		var body = {role: db.roles[u]};

		if (migration_config.debug) {
			console.log(body);
			sendReq(u+1);
		} else {
			client.sendData("http", options, body, undefined, function (status, resp) {
				console.log('OK ', status, 'user ', db.roles[u]);
				sendReq(u+1);
			}, function (status, resp) {
				console.log('ERROR: ', resp, status, 'user ', db.roles[u]);
				sendReq(u+1);
			});
		}

	} else {
		sendReq(u+1);
	}

}

sendReq(0);