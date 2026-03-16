import { db } from "./client.js";
import { attendanceRecordsFixture } from "./fixtures/attendance-records.js";
import { eventAttendanceUrlsFixture } from "./fixtures/event-attendance-urls.js";
import { eventsFixture } from "./fixtures/events.js";
import { staffsFixture } from "./fixtures/staffs.js";
import { volunteersFixture } from "./fixtures/volunteers.js";
import { attendanceRecordsTable } from "./schema/attendance-records";
import { eventAttendanceUrlsTable } from "./schema/event-attendance-urls";
import { eventsTable } from "./schema/events";
import { staffsTable } from "./schema/staff";
import { volunteersTable } from "./schema/volunteers";

async function seed() {
	console.log("⭐️ シーディング");

	// スタッフデータを投入
	await db.insert(staffsTable).values(staffsFixture);
	console.log(`💾 スタッフ追加： ${staffsFixture.length} 件`);

	// イベントデータを投入
	await db.insert(eventsTable).values(eventsFixture);
	console.log(`💾 イベント追加： ${eventsFixture.length} 件`);

	// ボランティアデータを投入
	await db.insert(volunteersTable).values(volunteersFixture);
	console.log(`💾 ボランティア追加： ${volunteersFixture.length} 件`);

	// 来場記録データを投入
	await db.insert(attendanceRecordsTable).values(attendanceRecordsFixture);
	console.log(`💾 来場記録追加： ${attendanceRecordsFixture.length} 件`);

	// 来場ページURLデータを投入
	await db.insert(eventAttendanceUrlsTable).values(eventAttendanceUrlsFixture);
	console.log(`💾 来場ページURL追加： ${eventAttendanceUrlsFixture.length} 件`);
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
