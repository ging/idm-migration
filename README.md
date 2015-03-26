MIGRATION PROCEDURE
 
1. Clone data_template folder to data
2. Create dist folder (and shell folder inside)
3. Clone migration_config.js.template file to migration_config.js
4. Configure migration_config.js
5. Fill data/keystone_users.json and data/service_catalogue.json
6. Copy fi-ware-idm/current/migrationdata.json remote file to data/ local folder
7. Run scripts/migrate_json.js It will generate data/migrate_json_new.js
8. Run scripts: 
	- scripts/users.js -->logs/users.log
	- scripts/orgs.js -->logs/orgs.log
	- scripts/apps.js -->logs/apps.log
	- scripts/ruser_org.js -->logs/ruser_org.log  -- not debug mode available
	- scripts/roles.js -->logs/roles.log
	- scripts/rusers.js -->logs/rusers.log
	- scripts/perms.js -->logs/perms.log
	- scripts/rperms.js -->logs/rperms.log
	- scripts/horizon_admins.js -->logs/horizon_admins.log
	- scripts/keystone_users.js -->logs/keystone_users.log  -- partial debug mode available
	- scripts/service_catalogue.js -->logs/service_catalogue.log -- not debug mode available
9. Copy fi-ware-idm/shared/system remote folder to horizon server	
10. In the horizon server create media folder with the structure: 
	media/
		ApplicationAvatar/
			medium/
			small/
			original/
		OrganizationAvatar/
			medium/
			small/
			original/
		UserAvatar/
			medium/
			small/
			original/
11. In the horizon server run dist/shell scripts
