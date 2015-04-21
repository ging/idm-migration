#!/bin/bash
node scripts/migrate_json.js -->logs/migrate_json.log
node scripts/users.js -->logs/users.log
node scripts/orgs.js -->logs/orgs.log
node scripts/apps.js -->logs/apps.log
node scripts/ruser_org.js -->logs/ruser_org.log
node scripts/roles.js -->logs/roles.log
node scripts/rusers.js -->logs/rusers.log
node scripts/perms.js -->logs/perms.log
node scripts/rperms.js -->logs/rperms.log
node scripts/rcloud.js -->logs/rcloud.log
node scripts/horizon_admins.js -->logs/horizon_admins.log
node scripts/keystone_users.js -->logs/keystone_users.log
node scripts/service_catalogue.js -->logs/service_catalogue.log