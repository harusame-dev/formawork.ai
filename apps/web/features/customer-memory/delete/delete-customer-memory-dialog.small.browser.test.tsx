import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { DeleteCustomerMemoryDialog } from "./delete-customer-memory-dialog.client";

vi.mock("./delete-customer-memory.action", () => ({
  deleteCustomerMemoryAction: vi.fn(),
}));

const test = base.extend<{
  deleteCustomerMemoryActionMock: Mock;
}>({
  deleteCustomerMemoryActionMock: async ({}, use: any) => {
    const module = await import("./delete-customer-memory.action");
    const mock = vi.mocked(module.deleteCustomerMemoryAction);
    await use(mock);
    vi.clearAllMocks();
  },
});

test("確認ダイアログが表示される", async () => {
  const testCustomerId = "00000000-0000-0000-0000-000000000001";
  const testMemoryId = "00000000-0000-0000-0000-000000000002";

  render(
    <DeleteCustomerMemoryDialog
      customerId={testCustomerId}
      memoryId={testMemoryId}
    />,
  );

  await page.getByRole("button", { name: "削除" }).click();

  await expect
    .element(page.getByText("このメモリを削除してもよろしいですか？"))
    .toBeInTheDocument();
});

test("キャンセルボタンでダイアログが閉じる", async ({
  deleteCustomerMemoryActionMock,
}) => {
  const testCustomerId = "00000000-0000-0000-0000-000000000001";
  const testMemoryId = "00000000-0000-0000-0000-000000000002";

  render(
    <DeleteCustomerMemoryDialog
      customerId={testCustomerId}
      memoryId={testMemoryId}
    />,
  );

  await page.getByRole("button", { name: "削除" }).click();
  await page.getByRole("button", { name: "キャンセル" }).click();

  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();

  expect(deleteCustomerMemoryActionMock).not.toHaveBeenCalled();
});
