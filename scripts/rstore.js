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

// /v3/OS-ROLES/organizations/{organization_id}/applications/{application_id}/roles/{role_id}

var path = '/v3/OS-ROLES';

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-ROLES',
    method: 'PUT',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var send_cloud_proj = function (u) {

	if (u >= db.users.length) {
		return send_orgs(0);
	}

	options.path = path + '/organizations/' + pad(db.users[u].actor_id, 32) + '/applications/' 
		+ migration_config.store_app_id + '/roles/' + migration_config.purchaser_role_id;

	if (migration_config.debug) {
		console.log(options.path);
		send_cloud_proj(u+1);
	} else {
		client.sendData("http", options, undefined, undefined, function (status, resp) {
			console.log('OK ', status, options.path);
			send_cloud_proj(u+1);
			//console.log('RESP: ', resp);
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, options.path);
			send_cloud_proj(u+1);
		});
	}
}

var send_orgs = function (u) {

	if (u >= db.organizations.length) return;

	options.path = path + '/organizations/' + pad(db.organizations[u].id, 32) + '/applications/' 
		+ migration_config.store_app_id + '/roles/' + migration_config.purchaser_role_id;

	if (migration_config.debug) {
		console.log(options.path);
		send_orgs(u+1);
	} else {
		client.sendData("http", options, undefined, undefined, function (status, resp) {
			console.log('OK ', status, options.path);
			send_orgs(u+1);
			//console.log('RESP: ', resp);
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, options.path);
			send_orgs(u+1);
		});
	}
}

send_cloud_proj(0);