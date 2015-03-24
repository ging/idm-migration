var client = require('./../lib/HTTPClient.js');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var pad = function(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

};

// /v3/OS-ROLES/users/{user_id}/organizations/{organization_id}/applications/{application_id}/roles/{role_id}

var path = '/v3/OS-ROLES';

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-ROLES',
    method: 'PUT',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.rusers.length) return;

	// rol de user o de user en org
	if (db.rusers[u].user_id) {
		var organization_id = db.rusers[u].organization_id ? db.rusers[u].organization_id : pad(db.rusers[u].user_id, 32);
		options.path = path + '/users/'+ db.rusers[u].user_id + '/organizations/' + organization_id + '/applications/' 
			+ db.rusers[u].application_id + '/roles/' + db.rusers[u].role_id;

	// rol de org
	} else {
		options.path = path + '/organizations/' + db.rusers[u].organization_id + '/applications/' 
			+ db.rusers[u].application_id + '/roles/' + db.rusers[u].role_id;

	}

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
}

sendReq(0);