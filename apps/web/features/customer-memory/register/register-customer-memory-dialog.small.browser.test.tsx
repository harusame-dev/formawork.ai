import type { Mock } from "vitest";
import { test as base, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { RegisterCustomerMemoryDialog } from "./register-customer-memory-dialog.client";

vi.mock("./register-customer-memory.action", () => ({
  registerCustomerMemoryAction: vi.fn(),
}));

vi.mock("../edit/edit-customer-memory.action", () => ({
  editCustomerMemoryAction: vi.fn(),
}));

const test = base.extend<{
  registerCustomerMemoryActionMock: Mock;
}>({
  registerCustomerMemoryActionMock: async (
    {},
    use: any,
  ) => {
    const module = await import("./register-customer-memory.action");
    const mock = vi.mocked(module.registerCustomerMemoryAction);
    await use(mock);
    vi.clearAllMocks();
  },
});

test("内容が空の場合、バリデーションエラーが表示される", async ({
  registerCustomerMemoryActionMock,
}) => {
  const testCustomerId = "00000000-0000-0000-0000-000000000001";

  render(<RegisterCustomerMemoryDialog customerId={testCustomerId} />);

  await page.getByRole("button", { name: "メモリを追加" }).click();
  await page.getByRole("button", { name: "登録" }).click();

  await expect
    .element(page.getByText("内容を入力してください"))
    .toBeInTheDocument();

  expect(registerCustomerMemoryActionMock).not.toHaveBeenCalled();
});

test("キャンセルボタンでダイアログが閉じる", async () => {
  const testCustomerId = "00000000-0000-0000-0000-000000000001";

  render(<RegisterCustomerMemoryDialog customerId={testCustomerId} />);

  await page.getByRole("button", { name: "メモリを追加" }).click();
  await page.getByLabelText("内容").fill("テスト内容");
  await page.getByRole("button", { name: "キャンセル" }).click();

  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
});

test("キャンセル後に再度開くとフォームがリセットされている", async () => {
  const testCustomerId = "00000000-0000-0000-0000-000000000001";

  render(<RegisterCustomerMemoryDialog customerId={testCustomerId} />);

  await page.getByRole("button", { name: "メモリを追加" }).click();
  await page.getByLabelText("内容").fill("テスト内容");
  await page.getByRole("button", { name: "キャンセル" }).click();

  await page.getByRole("button", { name: "メモリを追加" }).click();

  await expect.element(page.getByLabelText("内容")).toHaveValue("");
});
