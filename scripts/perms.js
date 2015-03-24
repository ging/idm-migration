var client = require('./../lib/HTTPClient.js');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-ROLES/permissions',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.permissions.length) return;

	if (!db.permissions[u].is_internal) {

		db.permissions[u].id = db.permissions[u].id + '';
		db.permissions[u].application_id = db.permissions[u].application_id + '';

		var body = {permission: db.permissions[u]};

		if (migration_config.debug) {
			console.log(body);
			sendReq(u+1);
		} else {
			client.sendData("http", options, body, undefined, function (status, resp) {
				console.log('OK ', status, 'user ', db.permissions[u].id);
				sendReq(u+1);
				//console.log('RESP: ', resp);
			}, function (status, resp) {
				console.log('ERROR: ', resp, status, 'user ', db.permissions[u].id);
				sendReq(u+1);
			});
		}
	} else {
		sendReq(u+1);
	}

}

sendReq(0);