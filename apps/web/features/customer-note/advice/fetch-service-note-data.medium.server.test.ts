import { db } from "@workspace/db/client";
import { customersTable } from "@workspace/db/schema/customer";
import { customerNotesTable } from "@workspace/db/schema/customer-note";
import { staffsTable } from "@workspace/db/schema/staff";
import { eq, inArray } from "drizzle-orm";
import { v4 } from "uuid";
import { test as base, expect } from "vitest";
import { fetchServiceNoteData } from "./fetch-service-note-data";

interface TestData {
  targetCustomer: {
    customerId: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: number;
    remarks: string;
  };
  otherCustomer: {
    customerId: string;
  };
  staff: {
    staffId: string;
  };
  targetNotes: {
    customerNoteId: string;
    serviceDate: string;
    content: string;
  }[];
  otherCustomerNotes: {
    customerNoteId: string;
  }[];
  targetNoteId: string;
}

const test = base.extend<{ testData: TestData }>({
  // biome-ignore lint/correctness/noEmptyPattern: Vitestのfixtureパターンで使用する標準的な記法
  testData: async ({}, use) => {
    const staffId = v4();
    const targetCustomerId = v4();
    const otherCustomerId = v4();

    await db.insert(staffsTable).values({
      firstName: "テスト",
      lastName: "スタッフ",
      staffId,
    });

    await db.insert(customersTable).values([
      {
        birthDate: "1990-05-15",
        customerId: targetCustomerId,
        email: `target-${v4()}@example.com`,
        firstName: "太郎",
        gender: 1,
        lastName: "テスト",
        phone: "09012345678",
        remarks: "テスト用備考",
      },
      {
        customerId: otherCustomerId,
        email: `other-${v4()}@example.com`,
        firstName: "花子",
        lastName: "他顧客",
        phone: "09087654321",
      },
    ]);

    const targetNotes: TestData["targetNotes"] = [
      {
        content: "対象顧客ノート1",
        customerNoteId: v4(),
        serviceDate: "2024-01-01",
      },
      {
        content: "対象顧客ノート2",
        customerNoteId: v4(),
        serviceDate: "2024-01-02",
      },
      {
        content: "対象顧客ノート3",
        customerNoteId: v4(),
        serviceDate: "2024-01-03",
      },
      {
        content: "対象顧客ノート4",
        customerNoteId: v4(),
        serviceDate: "2024-01-04",
      },
      {
        content: "対象顧客ノート5",
        customerNoteId: v4(),
        serviceDate: "2024-01-05",
      },
      {
        content: "対象顧客ノート6",
        customerNoteId: v4(),
        serviceDate: "2024-01-06",
      },
      {
        content: "対象顧客ノート7",
        customerNoteId: v4(),
        serviceDate: "2024-01-07",
      },
      {
        content: "対象顧客ノート8",
        customerNoteId: v4(),
        serviceDate: "2024-01-08",
      },
      {
        content: "対象顧客ノート9",
        customerNoteId: v4(),
        serviceDate: "2024-01-09",
      },
      {
        content: "対象顧客ノート10",
        customerNoteId: v4(),
        serviceDate: "2024-01-10",
      },
      {
        content: "対象顧客ノート11",
        customerNoteId: v4(),
        serviceDate: "2024-01-11",
      },
      {
        content: "対象顧客ノート12",
        customerNoteId: v4(),
        serviceDate: "2024-01-12",
      },
    ];

    const otherCustomerNotes = [
      {
        content: "他顧客ノートA",
        customerNoteId: v4(),
        serviceDate: "2024-01-05",
      },
      {
        content: "他顧客ノートB",
        customerNoteId: v4(),
        serviceDate: "2024-01-08",
      },
    ];

    await db.insert(customerNotesTable).values([
      ...targetNotes.map((note) => ({
        content: note.content,
        customerId: targetCustomerId,
        customerNoteId: note.customerNoteId,
        serviceDate: note.serviceDate,
        staffId,
      })),
      ...otherCustomerNotes.map((note) => ({
        content: note.content,
        customerId: otherCustomerId,
        customerNoteId: note.customerNoteId,
        serviceDate: note.serviceDate,
        staffId,
      })),
    ]);

    const testData: TestData = {
      otherCustomer: {
        customerId: otherCustomerId,
      },
      otherCustomerNotes,
      staff: {
        staffId,
      },
      targetCustomer: {
        birthDate: "1990-05-15",
        customerId: targetCustomerId,
        firstName: "太郎",
        gender: 1,
        lastName: "テスト",
        remarks: "テスト用備考",
      },
      // biome-ignore lint/style/noNonNullAssertion: テスト用データは必ず10件以上作成しているため安全
      targetNoteId: targetNotes[9]!.customerNoteId,
      targetNotes,
    };

    await use(testData);

    const allNoteIds = [
      ...targetNotes.map((n) => n.customerNoteId),
      ...otherCustomerNotes.map((n) => n.customerNoteId),
    ];
    await db
      .delete(customerNotesTable)
      .where(inArray(customerNotesTable.customerNoteId, allNoteIds));
    await db
      .delete(customersTable)
      .where(
        inArray(customersTable.customerId, [targetCustomerId, otherCustomerId]),
      );
    await db.delete(staffsTable).where(eq(staffsTable.staffId, staffId));
  },
});

test("指定したserviceNoteIdのノート情報と顧客情報が取得できる", async ({
  testData,
}) => {
  const result = await fetchServiceNoteData(testData.targetNoteId);

  expect(result).not.toBeNull();
  if (!result) {
    throw new Error("取得エラー");
  }
  expect(result.customerId).toBe(testData.targetCustomer.customerId);
  expect(result.content).toBe("対象顧客ノート10");
  expect(result.serviceDate).toBe("2024-01-10");
  expect(result.firstName).toBe("太郎");
  expect(result.lastName).toBe("テスト");
  expect(result.birthDate).toBe("1990-05-15");
  expect(result.gender).toBe(1);
  expect(result.remarks).toBe("テスト用備考");
});

test("recentNotesに直近10件のノートが接客日以前のもののみ含まれる", async ({
  testData,
}) => {
  const result = await fetchServiceNoteData(testData.targetNoteId);

  expect(result).not.toBeNull();
  expect(result?.recentNotes).toHaveLength(10);

  const serviceDates = result?.recentNotes?.map((n) => n.serviceDate) ?? [];
  expect(serviceDates.every((date) => date <= "2024-01-10")).toBe(true);
  expect(serviceDates).not.toContain("2024-01-11");
  expect(serviceDates).not.toContain("2024-01-12");
});

test("recentNotesが接客日降順でソートされている", async ({ testData }) => {
  const result = await fetchServiceNoteData(testData.targetNoteId);

  expect(result).not.toBeNull();
  const serviceDates = result?.recentNotes?.map((n) => n.serviceDate) ?? [];

  for (let index = 0; index < serviceDates.length - 1; index++) {
    const current = serviceDates[index];
    const next = serviceDates[index + 1];
    if (current && next) {
      expect(current >= next).toBe(true);
    }
  }
});

test("他の顧客のノートがrecentNotesに含まれない", async ({ testData }) => {
  const result = await fetchServiceNoteData(testData.targetNoteId);

  expect(result).not.toBeNull();
  const contents = result?.recentNotes?.map((n) => n.content) ?? [];

  expect(contents).not.toContain("他顧客ノートA");
  expect(contents).not.toContain("他顧客ノートB");
  expect(
    contents.every((content) => content.startsWith("対象顧客ノート")),
  ).toBe(true);
});

test("存在しないserviceNoteIdの場合nullを返す", async () => {
  const nonExistentId = v4();
  const result = await fetchServiceNoteData(nonExistentId);

  expect(result).toBeNull();
});
