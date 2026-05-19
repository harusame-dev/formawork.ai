import type { SelectCustomerMemory } from "@workspace/db/schema/customer-memory";
import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { EditCustomerMemoryDialog } from "./edit-customer-memory-dialog.client";

vi.mock("./edit-customer-memory.action", () => ({
  editCustomerMemoryAction: vi.fn(),
}));

vi.mock("../register/register-customer-memory.action", () => ({
  registerCustomerMemoryAction: vi.fn(),
}));

const test = base.extend<{
  editCustomerMemoryActionMock: Mock;
}>({
  editCustomerMemoryActionMock: async ({}, use: any) => {
    const module = await import("./edit-customer-memory.action");
    const mock = vi.mocked(module.editCustomerMemoryAction);
    await use(mock);
    vi.clearAllMocks();
  },
});

const createTestMemory = (): SelectCustomerMemory => ({
  category: 1,
  content: "テスト内容",
  createdAt: new Date(),
  customerId: "00000000-0000-0000-0000-000000000002",
  id: "00000000-0000-0000-0000-000000000001",
  importance: 5,
  isProtected: false,
  sourceNoteId: null,
  updatedAt: new Date(),
});

test("初期値が正しく表示される", async () => {
  const memory = createTestMemory();

  render(
    <EditCustomerMemoryDialog customerId={memory.customerId} memory={memory} />,
  );

  await page.getByRole("button", { name: "編集" }).click();

  await expect.element(page.getByLabelText("内容")).toHaveValue("テスト内容");
  await expect.element(page.getByLabelText("重要度")).toHaveValue(5);
});

test("内容が空の場合、バリデーションエラーが表示される", async ({
  editCustomerMemoryActionMock,
}) => {
  const memory = createTestMemory();

  render(
    <EditCustomerMemoryDialog customerId={memory.customerId} memory={memory} />,
  );

  await page.getByRole("button", { name: "編集" }).click();
  await page.getByLabelText("内容").fill("");
  await page.getByRole("button", { name: "更新" }).click();

  await expect
    .element(page.getByText("内容を入力してください"))
    .toBeInTheDocument();

  expect(editCustomerMemoryActionMock).not.toHaveBeenCalled();
});

test("キャンセルボタンでダイアログが閉じる", async () => {
  const memory = createTestMemory();

  render(
    <EditCustomerMemoryDialog customerId={memory.customerId} memory={memory} />,
  );

  await page.getByRole("button", { name: "編集" }).click();
  await page.getByRole("button", { name: "キャンセル" }).click();

  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});
