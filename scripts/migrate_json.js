var db = require('./../data/migrationdata.json');
var fs = require('fs');

var pad = function(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

};

for (var o in db.organizations) {
	db.organizations[o].id = pad(db.organizations[o].id, 32);
}

for (var r in db.rusers) {
	if (db.rusers[r].organization_id) {
		db.rusers[r].organization_id = pad(db.rusers[r].organization_id, 32);
	}
}

var app_map = {};

for (var a in db.applications) {
	app_map[db.applications[a].id] = db.applications[a].oauth2_client_id;
}

for (var p in db.permissions) {
	if (db.permissions[p].application_id) {
		db.permissions[p].application_id = app_map[db.permissions[p].application_id];
	}
	if (db.permissions[p].is_internal) {
		console.log('INTERNAL PERM', db.permissions[p]);
	}
}

for (var p in db.roles) {
	if (db.roles[p].application_id) {
		db.roles[p].application_id = app_map[db.roles[p].application_id];
	}
	if (db.roles[p].is_internal) {
		console.log('INTERNAL ROLE', db.roles[p]);
	}
}

for (var p in db.rusers) {
	if (db.rusers[p].application_id) {
		db.rusers[p].application_id = app_map[db.rusers[p].application_id];
	}
}

// actor_id: slug
var users_map = {};

for (var u in db.users) {
	users_map[db.users[u].id] = db.users[u].nick;
	db.users[u].actor_id = db.users[u].id;
	db.users[u].cloud_project_id = pad(db.users[u].id, 32);
	db.users[u].id = db.users[u].nick;
	delete db.users[u].nick;
}

for (var o in db.organizations) {

	for (var m in db.organizations[o].members) {
		db.organizations[o].members[m] = users_map[db.organizations[o].members[m]];
	}
	for (var m in db.organizations[o].owners) {
		db.organizations[o].owners[m] = users_map[db.organizations[o].owners[m]];
	}
	if (db.organizations[o].owner) db.organizations[o].owner = users_map[db.organizations[o].owner];
}

for (var a in db.applications) {
	if (db.applications[a].owner) db.applications[a].owner = users_map[db.applications[a].owner];
}

for (var r in db.rusers) {
	if (db.rusers[r].user_id) db.rusers[r].user_id = users_map[db.rusers[r].user_id];
}

for (var a in db.administrators) {
	db.administrators[a].user_id = users_map[db.administrators[a].user_id];
}

var outputFilename = 'data/migrationdata_new.json';

fs.writeFile(outputFilename, JSON.stringify(db), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
});