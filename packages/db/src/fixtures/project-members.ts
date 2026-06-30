import type { InsertProjectMember } from "../schema/project";
import { ProjectMemberRole } from "../schema/project";
import { PROJECT_CATALOG_ID, PROJECT_HANDBOOK_ID } from "./projects";

const STAFF_1 = "00000000-0000-0000-0000-000000000001";
const STAFF_2 = "00000000-0000-0000-0000-000000000002";
const STAFF_3 = "00000000-0000-0000-0000-000000000003";

export const projectMembersFixture: InsertProjectMember[] = [
  {
    projectId: PROJECT_CATALOG_ID,
    role: ProjectMemberRole.Owner,
    userId: STAFF_1,
  },
  {
    projectId: PROJECT_CATALOG_ID,
    role: ProjectMemberRole.Editor,
    userId: STAFF_2,
  },
  {
    projectId: PROJECT_CATALOG_ID,
    role: ProjectMemberRole.Editor,
    userId: STAFF_3,
  },
  {
    projectId: PROJECT_HANDBOOK_ID,
    role: ProjectMemberRole.Owner,
    userId: STAFF_1,
  },
];
