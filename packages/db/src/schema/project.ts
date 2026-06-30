import {
  index,
  pgSchema,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { schemaName } from "../pgschema";
import { staffsTable } from "./staff";

/**
 * プロジェクトの可視性
 * - Public: ログインユーザー全員が閲覧可能
 * - Private: project_members に登録されたユーザーのみ
 */
export const ProjectVisibility = {
  Private: 2,
  Public: 1,
} as const;

export type ProjectVisibility =
  (typeof ProjectVisibility)[keyof typeof ProjectVisibility];

export const PROJECT_VISIBILITY_LABEL: Record<ProjectVisibility, string> = {
  [ProjectVisibility.Public]: "Public",
  [ProjectVisibility.Private]: "Private",
};

/**
 * プロジェクトメンバーのロール
 */
export const ProjectMemberRole = {
  Editor: 2,
  Owner: 1,
  Viewer: 3,
} as const;

export type ProjectMemberRole =
  (typeof ProjectMemberRole)[keyof typeof ProjectMemberRole];

export const PROJECT_MEMBER_ROLE_LABEL: Record<ProjectMemberRole, string> = {
  [ProjectMemberRole.Owner]: "オーナー",
  [ProjectMemberRole.Editor]: "編集者",
  [ProjectMemberRole.Viewer]: "閲覧者",
};

export const projectsTable = pgSchema(schemaName)
  .table(
    "projects",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      description: text("description").notNull().default(""),
      id: uuid("id").primaryKey().defaultRandom(),
      name: text("name").notNull(),
      // 作成者の staffId（= 認証ユーザー識別子）。staff 削除時も案件は残すため FK は張らない
      ownerUserId: uuid("owner_user_id").notNull(),
      updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
      visibility: smallint("visibility")
        .notNull()
        .default(ProjectVisibility.Private),
    },
    (table) => [index("idx_projects_owner").on(table.ownerUserId)],
  )
  .enableRLS();

export const projectMembersTable = pgSchema(schemaName)
  .table(
    "project_members",
    {
      createdAt: timestamp("created_at").defaultNow().notNull(),
      projectId: uuid("project_id")
        .notNull()
        .references(() => projectsTable.id, { onDelete: "cascade" }),
      role: smallint("role").notNull().default(ProjectMemberRole.Editor),
      userId: uuid("user_id")
        .notNull()
        .references(() => staffsTable.staffId, { onDelete: "cascade" }),
    },
    (table) => [primaryKey({ columns: [table.projectId, table.userId] })],
  )
  .enableRLS();

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type SelectProjectMember = typeof projectMembersTable.$inferSelect;
export type InsertProjectMember = typeof projectMembersTable.$inferInsert;
