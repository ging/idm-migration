MIGRATION PROCEDURE

0. Configure migration_config.js
1. Copy fi-ware-idm/shared/system remote folder to data/ local folder
2. Copy fi-ware-idm/current/migrationdata.json remote file to data/ local folder
3. Run scripts/migrate_json.js It will generate data/migrate_json_new.js
4. Run scripts: 
	scripts/users.js
	scripts/orgs.js
	scripts/apps.js
	scripts/ruser_org.js  -- not debug mode available
	scripts/roles.js
	scripts/rusers.js
	scripts/.js
	scripts/.js








// dudas: 

en roles.js qué pasaba si app id es undefined


// { id: 106, name: 'Provider', is_internal: true }
// { id: 191, name: 'Purchaser', is_internal: true }

// { id: 4, name: 'manage', is_internal: true } --- manage the app
// { id: 5, name: 'manage relation/custom', is_internal: true } --- manage roles
// { id: 6, name: 'manage contact', is_internal: true } --- manage auth
// { id: 8, name: 'get relation/custom', is_internal: true } --- get and assign roles