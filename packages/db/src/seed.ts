import { db } from "./client.js";
import { customerMemoriesFixture } from "./fixtures/customer-memories.js";
import { customerNoteAdviceFixture } from "./fixtures/customer-note-advice.js";
import { customerNoteImagesFixture } from "./fixtures/customer-note-images.js";
import { customerNotesFixture } from "./fixtures/customer-notes.js";
import { customersFixture } from "./fixtures/customers.js";
import { productionCustomerMemories } from "./fixtures/production/customer-memories/index.js";
import { productionCustomerNoteAdvices } from "./fixtures/production/customer-note-advices/index.js";
import { productionCustomerNoteImages } from "./fixtures/production/customer-note-images/index.js";
import { productionCustomerNotes } from "./fixtures/production/customer-notes/index.js";
import { productionCustomers } from "./fixtures/production/customers/index.js";
import { staffsFixture } from "./fixtures/staffs.js";
import { customersTable } from "./schema/customer.js";
import { customerMemoriesTable } from "./schema/customer-memory.js";
import {
	customerNoteImagesTable,
	customerNotesTable,
} from "./schema/customer-note";
import { customerNoteAdviceTable } from "./schema/customer-note-advice";
import { staffsTable } from "./schema/staff";

// biome-ignore lint/complexity/useLiteralKeys: ts4111
const isProduction = process.env["VERCEL_ENV"];

async function seed() {
	console.log(`⭐️ シーディング（${isProduction}）`);

	// スタッフデータを投入
	await db.insert(staffsTable).values(staffsFixture);
	console.log(`💾 スタッフ追加： ${staffsFixture.length} 件`);

	// 顧客データを投入
	const customers = isProduction ? productionCustomers : customersFixture;
	await db.insert(customersTable).values(customers);
	console.log(`💾 顧客追加： ${customers.length} 件`);

	// 顧客ノートデータを投入
	const customerNotes = isProduction
		? productionCustomerNotes
		: customerNotesFixture;
	await db.insert(customerNotesTable).values(customerNotes);
	console.log(`💾 顧客ノート追加： ${customerNotes.length} 件`);

	// 顧客メモリーデータを投入
	const customerMemories = isProduction
		? productionCustomerMemories
		: customerMemoriesFixture;
	await db.insert(customerMemoriesTable).values(customerMemories);
	console.log(`💾 顧客メモリー追加： ${customerMemories.length} 件`);

	// 接客アドバイスデータを投入
	const customerNoteAdvices = isProduction
		? productionCustomerNoteAdvices
		: customerNoteAdviceFixture;
	await db.insert(customerNoteAdviceTable).values(customerNoteAdvices);
	console.log(`💾 接客アドバイス追加： ${customerNoteAdvices.length} 件`);

	// 顧客ノート画像データを投入
	const customerNoteImages = isProduction
		? productionCustomerNoteImages
		: customerNoteImagesFixture;
	await db.insert(customerNoteImagesTable).values(customerNoteImages);
	console.log(`💾 顧客ノート画像追加： ${customerNoteImages.length} 件`);
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
