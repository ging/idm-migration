var client = require('./../lib/HTTPClient.js');
var users = require('./../data/keystone_users.json');
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
    path: '/v3/users',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var options1 = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/projects',
    method: 'POST',
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

var options3 = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/roles',
    method: 'GET',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var admins_project_id, services_project_id, keystone_admin_role_id, keystone_member_role_id;

var getRoles = function () {

	client.sendData("http", options3, undefined, undefined, function (status, resp) {
		console.log('OK ', status, 'roles ', resp);
		var roles = JSON.parse(resp).roles;

		for (var r in roles) {
			if (roles[r].name === 'admin') keystone_admin_role_id = roles[r].id;
			if (roles[r].name === 'member') keystone_member_role_id = roles[r].id;
		}
		create_project('admin');
	}, function (status, resp) {
		console.log('ERROR: ', resp, status);
		create_project('admin');

	});
}

var create_project = function (name) {

	var id = pad(Math.floor(Math.random()*10000000000000000000), 32) + '';

	var project = {project: {id: id, name: name, description: 'Cloud ' + name, domain_id: 'default'}};

	if (migration_config.debug) {
		console.log(project);
		if (name === 'admin') {
			admins_project_id = id;
			create_project('service');
		} else {
			services_project_id = id;
			create_users(0);
		}
	} else {
		client.sendData("http", options1, project, undefined, function (status, resp) {
			console.log('OK ', status, 'project ', project);
			if (name === 'admin') {
				admins_project_id = id;
				create_project('service');
			} else {
				services_project_id = id;
				create_users(0);
			}
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, 'project ', project);
			if (name === 'admin') {
				create_project('service');
			} else {
				create_users(0);
			}
		});
	}
}

var keys = Object.keys(users);

var create_users = function (u) {

	var ui = keys[u];

	var body = {user: {
		name: ui,
		password: users[ui].password,
		domain_id: 'default',
	}};

	if (users[ui].isAdmin) {
		body.user.default_project_id = admins_project_id;
	} else {
		body.user.default_project_id = services_project_id;
	}


	//console.log(body);

	client.sendData("http", options, body, undefined, function (status, resp) {
		var id = JSON.parse(resp).user.id;
		users[ui].id = id;
		console.log('OK ', status, 'resp ', resp, 'id', id);

		if (u < keys.length - 1) {
			create_users(u+1);
		} else {
			create_roles(0);
		}

	}, function (status, resp) {
		console.log('ERROR: ', resp, status);
		create_users(u+1);
	});
}

var create_roles = function (u) {

	var ui = keys[u];

	var path;

	if (users[ui].isAdmin) {
		path = '/v3/projects/' + admins_project_id + '/users/' + users[ui].id + '/roles/' + keystone_admin_role_id; 
	} else {
		path = '/v3/projects/' + services_project_id + '/users/' + users[ui].id + '/roles/' + keystone_member_role_id; 
	}

	options2.path = path;

	//console.log(options2.path);

	client.sendData("http", options2, undefined, undefined, function (status, resp) {
		console.log('OK ', status, options2.path);
		create_roles(u+1);
		
	}, function (status, resp) {
		console.log('ERROR: ', resp, status, options2.path);
		create_roles(u+1);
	});
}

getRoles();