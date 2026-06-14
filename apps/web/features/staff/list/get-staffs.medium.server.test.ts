import { randomUUID } from "node:crypto";
import { test as base, expect, vi } from "vitest";
import { deleteStaff } from "@/features/staff/delete/delete-staff";
import { registerStaff } from "@/features/staff/register/register-staff";
import { getStaffs } from "./get-staffs";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("@repo/logger/nextjs/server", () => ({
  getLogger: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  })),
}));

const test = base.extend<{
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}>({
  async staff({}, use) {
    const email = `test-staff-${randomUUID()}@example.com`;
    const firstName = randomUUID();
    const lastName = randomUUID();

    const result = await registerStaff({
      email,
      firstName,
      lastName,
      password: "TestPassword123!",
      role: "user",
    });

    if (!result.success) {
      throw new Error("Failed to create staff");
    }

    await use({
      email,
      firstName,
      id: result.data.staffId,
      lastName,
    });

    await deleteStaff({
      currentUserStaffId: "dummy-user-id",
      staffId: result.data.staffId,
    });
  },
});

test("firstName で完全一致検索できる", async ({ staff }) => {
  const nameSearchResult = await getStaffs({
    keyword: staff.firstName,
    page: 1,
  });

  expect(nameSearchResult.staffs.length).toBe(1);
  expect(nameSearchResult.staffs[0]?.firstName).toBe(staff.firstName);
});

test("lastName で完全一致検索できる", async ({ staff }) => {
  const nameSearchResult = await getStaffs({
    keyword: staff.lastName,
    page: 1,
  });

  expect(nameSearchResult.staffs.length).toBe(1);
  expect(nameSearchResult.staffs[0]?.lastName).toBe(staff.lastName);
});

test("lastName の部分一致では検索できない", async ({ staff }) => {
  const partialLastName = staff.lastName.slice(0, 8);

  const nameSearchResult = await getStaffs({
    keyword: partialLastName,
    page: 1,
  });

  expect(nameSearchResult.staffs.length).toBe(0);
});

test("firstName の部分一致では検索できない", async ({ staff }) => {
  const partialFirstName = staff.firstName.slice(0, 8);

  const nameSearchResult = await getStaffs({
    keyword: partialFirstName,
    page: 1,
  });

  expect(nameSearchResult.staffs.length).toBe(0);
});
