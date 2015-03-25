MIGRATION PROCEDURE

1. Clone migration_config.js.template file to migration_config.js
2. Clone data_template folder to data
3. Create dist folder (and shell folder inside)
4. Configure migration_config.js
5. Fill data/keystone_users.json and data/service_catalogue.json
6. Copy fi-ware-idm/current/migrationdata.json remote file to data/ local folder
7. Run scripts/migrate_json.js It will generate data/migrate_json_new.js
8. Run scripts: 
	- scripts/users.js -->logs/users.logs
	- scripts/orgs.js -->logs/orgs.logs
	- scripts/apps.js -->logs/apps.logs
	- scripts/ruser_org.js -->logs/ruser_org.logs  -- not debug mode available
	- scripts/roles.js -->logs/roles.logs
	- scripts/rusers.js -->logs/rusers.logs
	- scripts/perms.js -->logs/perms.logs
	- scripts/rperms.js -->logs/rperms.logs
	- scripts/horizon_admins.js -->logs/horizon_admins.logs
	- scripts/keystone_users.js -->logs/keystone_users.logs  -- partial debug mode available
	- scripts/service_catalogue.js  -- not debug mode available
9. Copy fi-ware-idm/shared/system remote folder to horizon server	
10. In the horizon server create media folder
11. In the horizon server run dist/shell scripts
