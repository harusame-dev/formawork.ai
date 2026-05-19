export const adminUser = {
  email: "admin@example.com",
  id: "a0000000-0000-0000-0000-000000000003",
  password: "Admin@789!",
  role: "admin",
  staffId: "00000000-0000-0000-0000-000000000003",
};
export const genericUser = {
  email: "generic@example.com",
  id: "a0000000-0000-0000-0000-000000000002",
  password: "Secure@456",
  role: "user",
  staffId: "00000000-0000-0000-0000-000000000002",
};

export const usersFixture = [
  {
    email: "test1@example.com",
    id: "a0000000-0000-0000-0000-000000000001",
    password: "Test@Pass123",
    role: "user",
    staffId: "00000000-0000-0000-0000-000000000001",
  },
  genericUser,
  adminUser,
  {
    email: "test1@formawork.example.com",
    id: "a0000000-0000-0000-0000-000000000004",
    password: "Test@Pass123",
    role: "user",
    staffId: "00000000-0000-0000-0000-000000000001",
  },
  {
    email: "test2@formawork.example.com",
    id: "a0000000-0000-0000-0000-000000000005",
    password: "Secure@456",
    role: "user",
    staffId: "00000000-0000-0000-0000-000000000002",
  },
  {
    email: "admin@formawork.example.com",
    id: "a0000000-0000-0000-0000-000000000006",
    password: "Admin@789!",
    role: "admin",
    staffId: "00000000-0000-0000-0000-000000000003",
  },
];
