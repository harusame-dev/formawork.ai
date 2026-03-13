import { db } from "./client.js";
import { projectsFixture } from "./fixtures/projects.js";
import { staffsFixture } from "./fixtures/staffs.js";
import { taskActivitiesFixture } from "./fixtures/task-activities.js";
import { tasksFixture } from "./fixtures/tasks.js";
import { projectsTable } from "./schema/projects";
import { staffsTable } from "./schema/staff";
import { taskActivitiesTable } from "./schema/task-activities";
import { tasksTable } from "./schema/tasks";

async function seed() {
	console.log("⭐️ シーディング");

	// スタッフデータを投入
	await db.insert(staffsTable).values(staffsFixture);
	console.log(`💾 スタッフ追加： ${staffsFixture.length} 件`);

	// 案件データを投入
	await db.insert(projectsTable).values(projectsFixture);
	console.log(`💾 案件追加： ${projectsFixture.length} 件`);

	// タスクデータを投入
	await db.insert(tasksTable).values(tasksFixture);
	console.log(`💾 タスク追加： ${tasksFixture.length} 件`);

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
