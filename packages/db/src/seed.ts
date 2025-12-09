import { db } from "./client.js";
import { customerNoteAdviceFixture } from "./fixtures/customer-note-advice.js";
import { customerNoteImagesFixture } from "./fixtures/customer-note-images.js";
import { customerNotesFixture } from "./fixtures/customer-notes.js";
import { customersFixture } from "./fixtures/customers.js";
import { staffsFixture } from "./fixtures/staffs.js";
import { customersTable } from "./schema/customer.js";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "./schema/customer-note";
import { customerNoteAdviceTable } from "./schema/customer-note-advice";
import { staffsTable } from "./schema/staff";

async function seed() {
	console.log("⭐️ シーディング");

	// スタッフデータを投入
	await db.insert(staffsTable).values(staffsFixture);
	console.log(`💾 スタッフ追加： ${staffsFixture.length} 件`);

	// 顧客データを投入
	await db.insert(customersTable).values(customersFixture);
	console.log(`💾 顧客追加： ${customersFixture.length} 件`);

	// 顧客ノートデータを投入
	await db.insert(customerNotesTable).values(customerNotesFixture);
	console.log(`💾 顧客ノート追加： ${customerNotesFixture.length} 件`);

	// 顧客ノート画像データを投入
	await db.insert(customerNoteImagesTable).values(customerNoteImagesFixture);
	console.log(`💾 顧客ノート画像追加： ${customerNoteImagesFixture.length} 件`);

	// 接客アドバイスデータを投入
	await db.insert(customerNoteAdviceTable).values(customerNoteAdviceFixture);
	console.log(`💾 接客アドバイス追加： ${customerNoteAdviceFixture.length} 件`);
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
