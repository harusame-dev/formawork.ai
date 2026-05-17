// パスワードを暗号論的に安全な乱数で生成する
// 大文字・小文字・数字・記号を最低1文字ずつ含む 16 文字
const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*";
const ALL = UPPERCASE + LOWERCASE + DIGITS + SYMBOLS;

function randomChar(charset: string): string {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const value = array[0];
	if (value === undefined) {
		throw new Error("乱数生成に失敗しました");
	}
	const index = value % charset.length;
	const char = charset[index];
	if (char === undefined) {
		throw new Error("乱数生成に失敗しました");
	}
	return char;
}

export function generatePassword(length = 16): string {
	if (length < 4) {
		throw new Error("パスワード長は 4 以上である必要があります");
	}
	const required = [
		randomChar(UPPERCASE),
		randomChar(LOWERCASE),
		randomChar(DIGITS),
		randomChar(SYMBOLS),
	];
	const rest = Array.from({ length: length - required.length }, () =>
		randomChar(ALL),
	);
	const chars = [...required, ...rest];
	// Fisher-Yates shuffle
	for (let i = chars.length - 1; i > 0; i--) {
		const array = new Uint32Array(1);
		crypto.getRandomValues(array);
		const value = array[0];
		if (value === undefined) {
			throw new Error("乱数生成に失敗しました");
		}
		const j = value % (i + 1);
		const tmp = chars[i];
		const other = chars[j];
		if (tmp === undefined || other === undefined) {
			throw new Error("乱数生成に失敗しました");
		}
		chars[i] = other;
		chars[j] = tmp;
	}
	return chars.join("");
}
