var client = require('./../lib/HTTPClient.js');
var fs = require('fs');
var db = require('./../data/migrationdata_new.json');
var migration_config = require('./../migration_config.js');

var media_folder = '/ApplicationAvatar/';

var options = {
    host: migration_config.keystone_host,
    port: migration_config.keystone_port,
    path: '/v3/OS-OAUTH2/consumers',
    method: 'POST',
    headers: {	'X-Auth-Token': migration_config.keystone_token, 
				'content-type': 'application/json'}
};

var sendReq = function (u) {

	if (u >= db.applications.length) return;

	for (var i in db.applications[u]) {
		if (db.applications[u][i] === null) {
			db.applications[u][i] = '';
		}
	}

	if (db.applications[u].avatar !== '/assets/logos/original/site.png') {

		var file = db.applications[u].avatar.split('?')[0].substring(1);
		var file_small = file.split('original')[0] + 'small' + file.split('original')[1];
		var file_medium = file.split('original')[0] + 'medium' + file.split('original')[1];

		var copy_file_original = 'cp ' + file + ' media' + media_folder + 'original/\n';
		var copy_file_small = 'cp ' + file_small + ' media' + media_folder + 'small/\n';
		var copy_file_medium = 'cp ' + file_medium + ' media' + media_folder + 'medium/\n';

		fs.appendFileSync('dist/shell/app_files.sh', copy_file_original);
		fs.appendFileSync('dist/shell/app_files.sh', copy_file_small);
		fs.appendFileSync('dist/shell/app_files.sh', copy_file_medium);

		var sp = file.split('/');

		db.applications[u].img_original = media_folder + 'original/' + sp[sp.length - 1];
		db.applications[u].img_medium = media_folder + 'medium/' + sp[sp.length - 1];
		db.applications[u].img_small = media_folder + 'small/' + sp[sp.length - 1];

	}


	db.applications[u].domain_id = 'default';
	db.applications[u].id = db.applications[u].oauth2_client_id + '';
	db.applications[u].secret = db.applications[u].oauth2_secret;
	db.applications[u].redirect_uris = [db.applications[u].callback_url];

	db.applications[u].client_type = 'confidential';
	db.applications[u].grant_type = 'authorization_code';
	db.applications[u].response_type = 'code';
	db.applications[u].allowed_scopes = ['all_info'];

	delete db.applications[u].callback_url;
	delete db.applications[u].oauth2_secret;
	delete db.applications[u].avatar;
	delete db.applications[u].oauth2_client_id;
	delete db.applications[u].owner;

	var body = {consumer: db.applications[u]};

	if (migration_config.debug) {
		console.log(body);
		sendReq(u+1);
	} else {
		client.sendData("http", options, body, undefined, function (status, resp) {
			console.log('OK ', status, 'user ', db.applications[u].name, db.applications[u].id);
			sendReq(u+1);
			//console.log('RESP: ', resp);
		}, function (status, resp) {
			console.log('ERROR: ', resp, status, 'user ', db.applications[u].name, db.applications[u].id);
			sendReq(u+1);
		});
	}
}

sendReq(0);