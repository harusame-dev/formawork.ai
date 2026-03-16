import type { CsvParseError } from "./parse-csv";

const CSV_PARSE_ERROR_PREFIX = "CSV_PARSE_ERRORS:" as const;

export function serializeCsvErrors(errors: CsvParseError[]): string {
	return `${CSV_PARSE_ERROR_PREFIX}${JSON.stringify(errors)}`;
}

export function deserializeCsvErrors(error: string): CsvParseError[] | null {
	if (!error.startsWith(CSV_PARSE_ERROR_PREFIX)) return null;
	try {
		const json = error.slice(CSV_PARSE_ERROR_PREFIX.length);
		return JSON.parse(json) as CsvParseError[];
	} catch {
		return null;
	}
}
