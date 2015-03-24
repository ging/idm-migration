var client = require('./../lib/HTTPClient.js');
var fs = require('fs');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var media_folder = '/OrganizationAvatar/';

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/projects',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.organizations.length) return;

	for (var i in db.organizations[u]) {
		if (db.organizations[u][i] === null) {
			db.organizations[u][i] = '';
		}
	}

	if (db.organizations[u].avatar !== '/assets/logos/original/group.png') {

		var file = db.organizations[u].avatar.split('?')[0].substring(1);
		var file_small = file.split('original')[0] + 'small' + file.split('original')[1];
		var file_medium = file.split('original')[0] + 'medium' + file.split('original')[1];

		var copy_file_original = 'cp ' + file + ' media' + media_folder + 'original/\n';
		var copy_file_small = 'cp ' + file_small + ' media' + media_folder + 'small/\n';
		var copy_file_medium = 'cp ' + file_medium + ' media' + media_folder + 'medium/\n';

		fs.appendFileSync('dist/shell/orgs_files.sh', copy_file_original);
		fs.appendFileSync('dist/shell/orgs_files.sh', copy_file_small);
		fs.appendFileSync('dist/shell/orgs_files.sh', copy_file_medium);

		var sp = file.split('/');

		db.organizations[u].img_original = media_folder + 'original/' + sp[sp.length - 1];
		db.organizations[u].img_medium = media_folder + 'medium/' + sp[sp.length - 1];
		db.organizations[u].img_small = media_folder + 'small/' + sp[sp.length - 1];

	}

	db.organizations[u].domain_id = 'default';
	db.organizations[u].id = db.organizations[u].id + '';
	delete db.organizations[u].avatar;
	delete db.organizations[u].members;
	delete db.organizations[u].owner;
	delete db.organizations[u].owners;

	if (migration_config.problematic_orgs.indexOf(db.organizations[u].id) !== -1) {
		db.organizations[u].name = 'Please update the name';
	}

	var body = {project: db.organizations[u]};

	if (migration_config.debug) {
		console.log(body);
		sendReq(u+1);
	} else {

		client.sendData("http", options, body, undefined, function (status, resp) {
			console.log('OK ', status, 'user ', db.organizations[u].name, db.organizations[u].id);
			sendReq(u+1);
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, 'user ', db.organizations[u].name, db.organizations[u].id);
			sendReq(u+1);
		});
	}
}

sendReq(0);