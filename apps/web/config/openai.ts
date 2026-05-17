/** biome-ignore-all lint/complexity/useLiteralKeys: ts(4111) */
import * as v from "valibot";

const configSchema = v.object({
	apiKey: v.optional(v.string(), ""),
});

let cached: v.InferOutput<typeof configSchema> | null = null;

export function getOpenAIConfig(): v.InferOutput<typeof configSchema> {
	if (cached) {
		return cached;
	}
	cached = v.parse(configSchema, {
		apiKey: process.env["OPENAI_API_KEY"] ?? "",
	});
	return cached;
}
