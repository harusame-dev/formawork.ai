import { schemaName } from "./pgschema";
import { systemManageDatabaseUrl } from "./postgres-role-db-client";

export const pgRoleName = `custom_${schemaName}_user`;

// TODO: パスワード検討
export const pgRolePassword = systemManageDatabaseUrl.password;
