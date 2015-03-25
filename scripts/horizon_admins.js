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

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '',
    method: 'PUT',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};


var admins = db.administrators;

var create_roles = function (u) {

	if (u >= admins.length) return;

	var organization_id = pad(admins[u].user_id, 32);

	options.path = '/v3/OS-ROLES/users/'+ admins[u].user_id + '/organizations/' + organization_id + '/applications/' + migration_config.idm_application_id + '/roles/' + migration_config.idm_provider_role_id;

	if (migration_config.debug) {
		console.log(options.path);
		create_roles(u+1);
	} else {

		client.sendData("http", options, undefined, undefined, function (status, resp) {
			console.log('OK ', status, options.path);
			create_roles(u+1);
			
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, options.path);
			create_roles(u+1);
		});
	}
}

create_roles(0);