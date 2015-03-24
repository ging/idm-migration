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
}

for (var p in db.roles) {
	if (db.roles[p].application_id) {
		db.roles[p].application_id = app_map[db.roles[p].application_id];
	}
}

for (var p in db.rusers) {
	if (db.rusers[p].application_id) {
		db.rusers[p].application_id = app_map[db.rusers[p].application_id];
	}
}

var outputFilename = 'data/migrationdata_new.json';

fs.writeFile(outputFilename, JSON.stringify(db), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
});