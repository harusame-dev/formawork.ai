import { randomUUIDv7 } from "node:crypto";

export function generateUniqueId(): string {
  return randomUUIDv7();
}
