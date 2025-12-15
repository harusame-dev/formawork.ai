export function sanitizeUserInput(input: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: 制御文字の除去はセキュリティ対策として意図的に実施（タブ・改行は除外）
	const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
	return input
		.replace(controlCharRegex, "")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
