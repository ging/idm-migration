var client = require('./../lib/HTTPClient.js');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var path = '/v3/OS-ROLES/roles/';

// /v3/OS-ROLES/roles/{role_id}/permissions/ {permission_id}
var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-ROLES',
    method: 'PUT',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.rpermissions.length) return;

	if (db.rpermissions[u].enabled) {
		options.path = path + db.rpermissions[u].role_id + '/permissions/' + db.rpermissions[u].permission_id;

		if (migration_config.debug) {
			console.log(options.path);
			sendReq(u+1);
		} else {
			client.sendData("http", options, undefined, undefined, function (status, resp) {
				console.log('OK ', status, options.path);
				sendReq(u+1);
				//console.log('RESP: ', resp);
			}, function (status, resp) {
				console.log('ERROR: ', resp, status, options.path);
				sendReq(u+1);
			});
		}
	} else {
		sendReq(u+1);
	}
}

sendReq(0);