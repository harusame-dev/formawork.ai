import path from "node:path";

export const adminUserAuthFile = path.join(
  import.meta.dirname,
  "../playwright/.auth/admin-user.json",
);

export const genericUserAuthFile = path.join(
  import.meta.dirname,
  "../playwright/.auth/generic-user.json",
);
