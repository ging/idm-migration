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
    host: migration_config.horizon_host,
    port: migration_config.horizon_port,
    path: 'TODO',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var options2 = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/roles',
    method: 'GET',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.users.length) return;

	var body = {
		user_id: db.users[u].id
	};

	if (db.users[u].actor_id <= 13692) {
		body.role_id = trial_role_id;
	} else if (db.users[u].actor_id > 13692 && db.users[u].actor_id <= 13878) {
		body.role_id = basic_role_id;
	} else if (db.users[u].actor_id > 13878) {
		body.role_id = community_role_id;
		body.region_id = 'TODO';
	}

	if (migration_config.debug) {
		console.log(body);
		sendReq(u+1);
	} else {
		client.sendData("http", options, body, undefined, function (status, resp) {
			console.log('OK ', status, options.path);
			sendReq(u+1);
			//console.log('RESP: ', resp);
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, options.path);
			sendReq(u+1);
		});
	}

}

var trial_role_id, basic_role_id, community_role_id;

client.sendData("http", options2, undefined, undefined, function (status, resp) {
	//TODO get ids de roles
	var roles = JSON.parse(resp).roles;
	console.log('OK ', roles);
	for (var r in roles) {
		if (roles[r].name === 'trial') {
			trial_role_id = roles[r].id;
		} else if (roles[r].name === 'basic') {
			basic_role_id = roles[r].id;
		} else if (roles[r].name === 'community') {
			community_role_id = roles[r].id;	
		}
	}
	console.log(trial_role_id, basic_role_id, community_role_id);
	sendReq(0);
}, function (status, resp) {
	console.log('ERROR: ', resp, status);
});

