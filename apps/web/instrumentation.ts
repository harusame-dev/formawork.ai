import { registerOTel } from "@vercel/otel";

export function register(): void {
  registerOTel({ serviceName: process.env["SERVICE_NAME"] ?? "web" });
}
