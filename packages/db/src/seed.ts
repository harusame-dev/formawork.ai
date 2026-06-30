import { db } from "./client.js";
import { glossariesFixture } from "./fixtures/glossaries.js";
import { projectMembersFixture } from "./fixtures/project-members.js";
import { projectsFixture } from "./fixtures/projects.js";
import { segmentsFixture } from "./fixtures/segments.js";
import { staffsFixture } from "./fixtures/staffs.js";
import { translationMemoriesFixture } from "./fixtures/translation-memories.js";
import { worksFixture } from "./fixtures/works.js";
import { glossariesTable } from "./schema/glossary";
import { projectMembersTable, projectsTable } from "./schema/project";
import { segmentsTable } from "./schema/segment";
import { staffsTable } from "./schema/staff";
import { translationMemoriesTable } from "./schema/translation-memory";
import { worksTable } from "./schema/work";

const isProduction = process.env["VERCEL_ENV"];

async function seed() {
  console.log(`⭐️ シーディング（${isProduction}）`);

  // スタッフ（= 翻訳者 / 認証ユーザー）データを投入
  await db.insert(staffsTable).values(staffsFixture);
  console.log(`💾 スタッフ追加： ${staffsFixture.length} 件`);

  // プロジェクトを投入
  await db.insert(projectsTable).values(projectsFixture);
  console.log(`💾 プロジェクト追加： ${projectsFixture.length} 件`);

  // プロジェクトメンバーを投入
  await db.insert(projectMembersTable).values(projectMembersFixture);
  console.log(
    `💾 プロジェクトメンバー追加： ${projectMembersFixture.length} 件`,
  );

  // ワークを投入
  await db.insert(worksTable).values(worksFixture);
  console.log(`💾 ワーク追加： ${worksFixture.length} 件`);

  // セグメントを投入
  await db.insert(segmentsTable).values(segmentsFixture);
  console.log(`💾 セグメント追加： ${segmentsFixture.length} 件`);

  // 用語集を投入
  await db.insert(glossariesTable).values(glossariesFixture);
  console.log(`💾 用語集追加： ${glossariesFixture.length} 件`);

  // 翻訳メモリを投入（原文埋め込みは fixture に固定値として保持済み）
  if (translationMemoriesFixture.length > 0) {
    await db.insert(translationMemoriesTable).values(translationMemoriesFixture);
    console.log(`💾 翻訳メモリ追加： ${translationMemoriesFixture.length} 件`);
  }
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
