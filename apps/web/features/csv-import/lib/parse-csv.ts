const EXPECTED_HEADERS = ["name", "code", "gender", "participationDates"];

type ParsedVolunteerRow = {
	code: string;
	gender: string;
	name: string;
	participationDates: string[];
};

export type CsvParseError = {
	message: string;
	row: number | null;
};

type CsvParseResult =
	| { errors: CsvParseError[]; success: false }
	| { rows: ParsedVolunteerRow[]; success: true };

export function parseCsv(
	csvContent: string,
	eventDates: string[],
): CsvParseResult {
	const lines = csvContent.split("\n").map((line) => line.trimEnd());

	// Remove empty trailing lines
	while (lines.length > 0 && lines[lines.length - 1] === "") {
		lines.pop();
	}

	if (lines.length === 0) {
		return {
			errors: [{ message: "CSVファイルが空です", row: null }],
			success: false,
		};
	}

	const headerLine = lines[0];
	if (!headerLine) {
		return {
			errors: [{ message: "CSVファイルが空です", row: null }],
			success: false,
		};
	}

	const headers = headerLine.split(",").map((h) => h.trim());

	// Validate headers
	const isValidHeader =
		headers.length === EXPECTED_HEADERS.length &&
		EXPECTED_HEADERS.every((h, i) => headers[i] === h);

	if (!isValidHeader) {
		return {
			errors: [
				{
					message: `CSVのヘッダーが不正です。期待されるヘッダー: ${EXPECTED_HEADERS.join(",")}`,
					row: null,
				},
			],
			success: false,
		};
	}

	const dataLines = lines.slice(1);

	if (dataLines.length === 0) {
		return {
			errors: [{ message: "データ行がありません", row: null }],
			success: false,
		};
	}

	const errors: CsvParseError[] = [];
	const rows: ParsedVolunteerRow[] = [];
	const seenCodes = new Set<string>();

	for (let i = 0; i < dataLines.length; i++) {
		const line = dataLines[i];
		if (!line) continue;

		const rowNumber = i + 2; // 1-indexed, +1 for header
		const rowErrors: CsvParseError[] = [];

		// Simple CSV parsing: name, code, gender are first 3 columns
		// participationDates may contain commas (multiple dates), handled by joining remaining columns
		const columns = line.split(",");

		if (columns.length < 4) {
			errors.push({
				message: "カラム数が不足しています",
				row: rowNumber,
			});
			continue;
		}

		const name = columns[0]?.trim() ?? "";
		const code = columns[1]?.trim() ?? "";
		const gender = columns[2]?.trim() ?? "";
		// participationDates is the 4th+ columns joined (handles embedded commas in dates list)
		const participationDatesRaw = columns.slice(3).join(",").trim();

		// Validate name
		if (!name) {
			rowErrors.push({
				message: "氏名が空です",
				row: rowNumber,
			});
		} else if (name.length > 100) {
			rowErrors.push({
				message: "氏名は100文字以内で入力してください",
				row: rowNumber,
			});
		}

		// Validate code
		if (!code) {
			rowErrors.push({
				message: "IDが空です",
				row: rowNumber,
			});
		} else if (!/^\d{6}$/.test(code)) {
			rowErrors.push({
				message: "IDは数字6桁で入力してください",
				row: rowNumber,
			});
		} else if (seenCodes.has(code)) {
			rowErrors.push({
				message: `ID「${code}」がCSV内で重複しています`,
				row: rowNumber,
			});
		} else {
			seenCodes.add(code);
		}

		// Validate participationDates
		let parsedDates: string[] = [];
		if (!participationDatesRaw) {
			rowErrors.push({
				message: "参加予定日が空です",
				row: rowNumber,
			});
		} else {
			const dates = participationDatesRaw
				.split(",")
				.map((d) => d.trim())
				.filter((d) => d !== "");

			if (dates.length === 0) {
				rowErrors.push({
					message: "参加予定日が空です",
					row: rowNumber,
				});
			} else {
				const invalidDates = dates.filter((d) => !eventDates.includes(d));
				if (invalidDates.length > 0) {
					rowErrors.push({
						message: `参加予定日「${invalidDates.join(",")}」はイベント開催日に含まれていません`,
						row: rowNumber,
					});
				} else {
					parsedDates = dates;
				}
			}
		}

		if (rowErrors.length > 0) {
			errors.push(...rowErrors);
		} else {
			rows.push({
				code,
				gender,
				name,
				participationDates: parsedDates,
			});
		}
	}

	if (errors.length > 0) {
		return { errors, success: false };
	}

	return { rows, success: true };
}
