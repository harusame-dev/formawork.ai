"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { importVolunteersCsvAction } from "../actions/import-volunteers-csv.action";
import { deserializeCsvErrors } from "../lib/csv-errors";
import type { CsvParseError } from "../lib/parse-csv";

type CsvImportFormProps = {
	eventId: string;
};

type FormState =
	| { errors: CsvParseError[]; type: "csv-errors" }
	| { message: string; type: "error" }
	| { count: number; type: "success" }
	| { type: "idle" };

export function CsvImportForm({ eventId }: CsvImportFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [state, setState] = useState<FormState>({ type: "idle" });

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setState({ type: "idle" });

		const formData = new FormData(e.currentTarget);
		const file = formData.get("csvFile") as File | null;

		if (!file || file.size === 0) {
			setState({ message: "CSVファイルを選択してください", type: "error" });
			return;
		}

		const csvContent = await file.text();

		startTransition(async () => {
			const result = await importVolunteersCsvAction({
				csvContent,
				eventId,
			});

			if (!result.success) {
				const csvErrors = deserializeCsvErrors(result.error);
				if (csvErrors) {
					setState({ errors: csvErrors, type: "csv-errors" });
				} else {
					setState({ message: result.error, type: "error" });
				}
				return;
			}

			setState({ count: result.data.count, type: "success" });
			router.push(`/events/${eventId}/volunteers`);
		});
	}

	return (
		<div className="flex flex-col gap-6">
			<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
				<div className="flex flex-col gap-2">
					<Label htmlFor="csvFile">CSVファイル</Label>
					<Input
						accept=".csv,text/csv"
						disabled={isPending}
						id="csvFile"
						name="csvFile"
						type="file"
					/>
					<p className="text-sm text-muted-foreground">
						ヘッダー行あり。カラム: name,code,gender,participationDates
					</p>
				</div>

				{state.type === "error" && (
					<div
						className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
						role="alert"
					>
						{state.message}
					</div>
				)}

				{state.type === "csv-errors" && (
					<div
						className="rounded-md border border-destructive bg-destructive/10 p-3"
						role="alert"
					>
						<p className="mb-2 text-sm font-medium text-destructive">
							以下のエラーを修正してから再度アップロードしてください：
						</p>
						<ul className="list-inside list-disc space-y-1">
							{state.errors.map((error, errorIndex) => (
								<li
									className="text-sm text-destructive"
									// biome-ignore lint/suspicious/noArrayIndexKey: エラー項目に安定した一意のIDがないため
									key={`${error.row ?? "null"}-${errorIndex}`}
								>
									{error.row !== null ? `${error.row}行目: ` : ""}
									{error.message}
								</li>
							))}
						</ul>
					</div>
				)}

				<div className="flex gap-2">
					<Button
						disabled={isPending}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						キャンセル
					</Button>
					<Button
						className="min-w-[120px]"
						disabled={isPending}
						isProcessing={isPending}
						processingLabel="取り込み中"
						type="submit"
					>
						取り込む
					</Button>
				</div>
			</form>
		</div>
	);
}
