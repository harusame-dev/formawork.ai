import { db } from "./client.js";
import { projectAssigneesFixture } from "./fixtures/project-assignees.js";
import { projectsFixture } from "./fixtures/projects.js";
import { staffsFixture } from "./fixtures/staffs.js";
import { taskActivitiesFixture } from "./fixtures/task-activities.js";
import { taskAssigneesFixture } from "./fixtures/task-assignees.js";
import { tasksFixture } from "./fixtures/tasks.js";
import { projectAssigneesTable } from "./schema/project-assignees";
import { projectsTable } from "./schema/projects";
import { staffsTable } from "./schema/staff";
import { taskActivitiesTable } from "./schema/task-activities";
import { taskAssigneesTable } from "./schema/task-assignees";
import { tasksTable } from "./schema/tasks";

async function seed() {
	console.log("⭐️ シーディング");

	// スタッフデータを投入
	await db.insert(staffsTable).values(staffsFixture);
	console.log(`💾 スタッフ追加： ${staffsFixture.length} 件`);

	// 案件データを投入
	await db.insert(projectsTable).values(projectsFixture);
	console.log(`💾 案件追加： ${projectsFixture.length} 件`);

	// 案件担当者データを投入
	if (projectAssigneesFixture.length > 0) {
		await db.insert(projectAssigneesTable).values(projectAssigneesFixture);
	}
	console.log(`💾 案件担当者追加： ${projectAssigneesFixture.length} 件`);

	// タスクデータを投入
	await db.insert(tasksTable).values(tasksFixture);
	console.log(`💾 タスク追加： ${tasksFixture.length} 件`);

	// タスク担当者データを投入
	if (taskAssigneesFixture.length > 0) {
		await db.insert(taskAssigneesTable).values(taskAssigneesFixture);
	}
	console.log(`💾 タスク担当者追加： ${taskAssigneesFixture.length} 件`);

	// タスクアクティビティデータを投入
	await db.insert(taskActivitiesTable).values(taskActivitiesFixture);
	console.log(
		`💾 タスクアクティビティ追加： ${taskActivitiesFixture.length} 件`,
	);
}

seed()
	.then(() => {
		console.log("✅️ シーディング完了");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌️ シーディング失敗", error);
		process.exit(1);
	});
