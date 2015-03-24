var client = require('./../lib/HTTPClient.js');
var fs = require('fs');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var media_folder = '/UserAvatar/';

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-REGISTRATION/users',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.users.length) return;

	for (var i in db.users[u]) {
		if (db.users[u][i] === null) {
			db.users[u][i] = '';
		}
	}

	if (db.users[u].avatar !== '/assets/logos/original/user.png') {

		var file = db.users[u].avatar.split('?')[0].substring(1);
		var file_small = file.split('original')[0] + 'small' + file.split('original')[1];
		var file_medium = file.split('original')[0] + 'medium' + file.split('original')[1];

		var copy_file_original = 'cp ' + file + ' media' + media_folder + 'original/\n';
		var copy_file_small = 'cp ' + file_small + ' media' + media_folder + 'small/\n';
		var copy_file_medium = 'cp ' + file_medium + ' media' + media_folder + 'medium/\n';

		fs.appendFileSync('dist/shell/users_files.sh', copy_file_original);
		fs.appendFileSync('dist/shell/users_files.sh', copy_file_small);
		fs.appendFileSync('dist/shell/users_files.sh', copy_file_medium);

		var sp = file.split('/');

		db.users[u].img_original = media_folder + 'original/' + sp[sp.length - 1];
		db.users[u].img_medium = media_folder + 'medium/' + sp[sp.length - 1];
		db.users[u].img_small = media_folder + 'small/' + sp[sp.length - 1];

	}

	db.users[u].domain_id = 'default';
	db.users[u].username = db.users[u].name;
	db.users[u].name = db.users[u].email;
	delete db.users[u].email;
	delete db.users[u].avatar;

	if (migration_config.admin_users.indexOf(db.users[u].name) !== -1) {
		db.users[u].password = '123';
	} else {
		db.users[u].password = Math.random()*100000000000000000 + '';
	}

	if (migration_config.duplicated_users.indexOf(db.users[u].name) !== -1) {
		migration_config.duplicated_users.splice(migration_config.duplicated_users.indexOf(db.users[u].name), 1);
		db.users[u].name = db.users[u].name + '2';
	}

	db.users[u].id = db.users[u].id + '';

	var body = {user: db.users[u]};

	if (migration_config.debug) {
		console.log(body);
		sendReq(u+1);
	} else {
		client.sendData("http", options, body, undefined, function (status, resp) {
			console.log('OK ', status, 'user ', db.users[u].name, db.users[u].id);
			sendReq(u+1);
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, 'user ', db.users[u].name, db.users[u].id);
			sendReq(u+1);
		});
	}
}

sendReq(0);