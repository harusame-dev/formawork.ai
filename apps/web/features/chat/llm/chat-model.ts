import { createOpenAI } from "@ai-sdk/openai";
import { getOpenAIConfig } from "@/config/openai";

// gpt-5.4-mini を使う LLM クライアントを取得（コスト最適化のため）
export function getChatModel() {
	const config = getOpenAIConfig();
	const openai = createOpenAI({ apiKey: config.apiKey });
	return openai("gpt-5.4-mini");
}
