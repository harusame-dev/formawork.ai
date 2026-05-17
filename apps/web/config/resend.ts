/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import * as v from "valibot";

const configSchema = v.object({
	apiKey: v.optional(v.string(), ""),
	fromAddress: v.optional(v.string(), "no-reply@example.com"),
});

let cached: v.InferOutput<typeof configSchema> | null = null;

export function getResendConfig(): v.InferOutput<typeof configSchema> {
	if (cached) {
		return cached;
	}
	cached = v.parse(configSchema, {
		apiKey: process.env["RESEND_API_KEY"] ?? "",
		fromAddress: process.env["RESEND_FROM_ADDRESS"] ?? "no-reply@example.com",
	});
	return cached;
}
