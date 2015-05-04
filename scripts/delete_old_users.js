var client = require('./../lib/HTTPClient.js');
var db = require('./../data/migrationdata.json');
var fs = require('fs');

var options1 = {
    host: 'terms.lab.fiware.org',
    port: 80,
    path: '/api/v1/all_accepted?version=1.1',
    method: 'GET',
    headers: {}
};

var accepted_users;

var users_antes = db.users.length;
var orgs_antes = db.organizations.length;
var apps_antes = db.applications.length; 
var roles_antes = db.roles.length;
var perms_antes = db.permissions.length;
var rperms_antes = db.rpermissions.length;
var rusers_antes = db.rusers.length;
var admins_antes = db.administrators.length;

client.sendData("http", options1, undefined, undefined, function (status, resp) {
	console.log('OK ', status);
	accepted_users = JSON.parse(resp);
	console.log(accepted_users.length);
	delete_users();
}, function (status, resp) {
	console.log('ERROR: ', resp, status);
});

var delete_users = function () {

	var count = 0;
	var deleted_apps = [];
	var deleted_orgs = [];
	var deleted_roles = [];
	var deleted_perms = [];
		
	for (var u = db.users.length - 1; u >= 0; u--) {
		if (accepted_users.indexOf(db.users[u].nick) === -1 && db.users[u].id < 13693) {
			count++;
			// borro todo lo de este usuario
			var user_id = db.users[u].id;

			for (var o =  db.organizations.length - 1; o >= 0; o--) {
				if (db.organizations[o].owner === user_id) {
					deleted_orgs.push(db.organizations[o].id);
					db.organizations.splice(o, 1);
				} else if (db.organizations[o].owners.length === 1 && db.organizations[o].owners[0] === user_id) {
					deleted_orgs.push(db.organizations[o].id);
					db.organizations.splice(o, 1);
				} else {
					for (var m = db.organizations[o].members.length - 1; m >= 0; m--) {
						if (db.organizations[o].members[m] === user_id) {
							db.organizations[o].members.splice(m, 1);
						}
					}
					for (var w = db.organizations[o].owners.length - 1; w >= 0; w--) {
						if (db.organizations[o].owners[w] === user_id) {
							db.organizations[o].owners.splice(w, 1);
						}
					}

				}
			}

			for (var a = db.applications.length - 1; a >= 0; a--) {
				if (db.applications[a].owner === user_id) {
					deleted_apps.push(db.applications[a].id);
					db.applications.splice(a, 1);
				} 
			}

			for (var ra = db.roles.length - 1; ra >= 0; ra--) {
				if (deleted_apps.indexOf(db.roles[ra].application_id) !== -1) {
					deleted_roles.push(db.roles[ra].id);
					db.roles.splice(ra, 1);
				} 
			}

			for (var pa = db.permissions.length - 1; pa >= 0; pa--) {
				if (deleted_apps.indexOf(db.permissions[pa].application_id) !== -1) {
					deleted_perms.push(db.permissions[pa].id);
					db.permissions.splice(pa, 1);
					
				} 
			}

			for (var rp = db.rpermissions.length - 1; rp >= 0; rp--) {
				if (deleted_roles.indexOf(db.rpermissions[rp].role_id) !== -1 || 
					deleted_perms.indexOf(db.rpermissions[rp].permission_id) !== -1) {

					db.rpermissions.splice(rp, 1);
				}
			}

			for (var ru = db.rusers.length - 1; ru >= 0; ru--) {
				if (
					(db.rusers[ru].role_id && deleted_roles.indexOf(db.rusers[ru].role_id) !== -1) || 
					(db.rusers[ru].user_id && db.rusers[ru].user_id === user_id) || 
					(db.rusers[ru].organization_id && deleted_orgs.indexOf(db.rusers[ru].organization_id) !== -1) || 
					(db.rusers[ru].application_id && deleted_apps.indexOf(db.rusers[ru].application_id) !== -1)
					) {

					db.rusers.splice(ru, 1);
				}
			}

			for (var ad = db.administrators.length - 1; ad >= 0; ad--) {
				if (db.administrators[ad] === user_id) {
					db.administrators.splice(ad, 1);
				}
			}

			db.users.splice(u, 1);

		}
	}

	//console.log('He borrado ', count, 'y habían aceptado ', accepted_users.length);
	console.log('He borrado ', count, ' users y había ', users_antes, '. Tengo ', users_antes - count, 'y habían aceptado ', accepted_users.length);

	var users_desp = db.users.length;
	var orgs_desp = db.organizations.length;
	var apps_desp = db.applications.length;
	var roles_desp = db.roles.length;
	var perms_desp = db.permissions.length;
	var rperms_desp = db.rpermissions.length;
	var rusers_desp = db.rusers.length;
	var admins_despues = db.administrators.length;


	console.log('users antes', users_antes, 'users despues', users_desp);
	console.log('orgs antes', orgs_antes, 'orgs despues', orgs_desp);
	console.log('apps antes', apps_antes, 'apps despues', apps_desp);
	console.log('roles antes', roles_antes, 'roles despues', roles_desp);
	console.log('perms antes', perms_antes, 'perms despues', perms_desp);
	console.log('rperms antes', rperms_antes, 'rperms despues', rperms_desp);
	console.log('rusers antes', rusers_antes, 'rusers despues', rusers_desp);
	console.log('admins antes', admins_antes, 'admins despues', admins_despues);




	// var outputFilename = 'data/migrationdata_med.json';

	// fs.writeFile(outputFilename, JSON.stringify(db), function(err) {
	//     if(err) {
	//       console.log(err);
	//     } else {
	//       console.log("JSON saved to " + outputFilename);
	//     }
	// });
};

