var client = require('./../lib/HTTPClient.js');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/roles',
    method: 'GET',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var options2 = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '',
    method: 'PUT',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var owner_id, member_id;

client.sendData("http", options, undefined, undefined, function (status, resp) {
	console.log('STATUS: ', status);
	console.log('RESP: ', JSON.parse(resp).roles);

	var roles = JSON.parse(resp).roles;
	
	for (var r in roles) {
		if (roles[r].name === 'owner') owner_id = roles[r].id;
		if (roles[r].name === 'member') member_id = roles[r].id;
	}

	sendReqOwners(0);

}, function (status, resp) {
	console.log('STATUS: ', status);
	console.log('ERROR: ', resp);
});



var sendReqOwners = function (o) {

	var owners = db.organizations[o].owners;

	var path = '/v3/projects/' + db.organizations[o].id + '/users/'; 

	var sendReqOwners_1 = function (own) {
		options2.path = path + owners[own] + '/roles/' + owner_id;
		client.sendData("http", options2, undefined, undefined, function (status, resp) {
			console.log('OK ', status, options2.path);
			if (own < owners.length - 1) {
				sendReqOwners_1(own + 1);
			} else {
				if (o < db.organizations.length - 1) {
					sendReqOwners(o+1);
				} else {
					sendReqMembers(0);
				}
			}
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, options2.path);
			if (own < owners.length - 1) {
				sendReqOwners_1(own + 1);
			} else {
				if (o < db.organizations.length - 1) {
					sendReqOwners(o+1);
				} else {
					sendReqMembers(0);
				}
			}
		});
	}

	if (owners.length === 0) {


		if (db.organizations[o].owner) {
			console.log('ORG sin owner, se lo pongo', db.organizations[o]);
			owners.push(db.organizations[o].owner);
			sendReqOwners_1(0);
		} else {
			console.log('ERROR ORG sin owner en nunguna parte', db.organizations[o]);
			sendReqOwners(o+1);
		}
	} else {
		sendReqOwners_1(0);
	}
	//console.log('ORG con owner', db.organizations[o]);
		

}

var sendReqMembers = function (o) {

	var members = db.organizations[o].members;

	var path = '/v3/projects/' + db.organizations[o].id + '/users/'; 

	var sendReqMembers_1 = function (mem) {
		options2.path = path + members[mem] + '/roles/' + member_id;
		client.sendData("http", options2, undefined, undefined, function (status, resp) {
			console.log('OK ', status, options2.path);
			if (mem < members.length - 1) {
				sendReqMembers_1(mem + 1);
			} else {
				if (o < db.organizations.length - 1) {
					sendReqMembers(o+1);
				} else {
					console.log(':)');
				}
			}
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, options2.path);
			if (mem < members.length - 1) {
				sendReqMembers_1(mem + 1);
			} else {
				if (o < db.organizations.length - 1) {
					sendReqMembers(o+1);
				} else {
					console.log(':(');
				}
			}
		});
	}

	if (members.length > 0) {
		sendReqMembers_1(0);
	} else {
		sendReqMembers(o+1);
	}

}