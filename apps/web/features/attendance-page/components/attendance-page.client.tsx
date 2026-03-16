"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useState, useTransition } from "react";
import { lookupVolunteerAction } from "../actions/lookup-volunteer.action";
import { recordAttendanceAction } from "../actions/record-attendance.action";

type Props = {
	eventId: string;
	eventName: string;
};

type Step =
	| { type: "input" }
	| { type: "confirm"; name: string; volunteerId: string }
	| { type: "error"; message: string }
	| { type: "complete"; name: string; recordedAt: Date };

export function AttendancePage({ eventId, eventName }: Props) {
	const [step, setStep] = useState<Step>({ type: "input" });
	const [code, setCode] = useState("");
	const [isPending, startTransition] = useTransition();

	const handleLookup = () => {
		startTransition(async () => {
			const result = await lookupVolunteerAction({ code, eventId });
			if (!result.success) {
				setStep({ message: result.error, type: "error" });
				return;
			}
			setStep({
				name: result.data.name,
				type: "confirm",
				volunteerId: result.data.volunteerId,
			});
		});
	};

	const handleRecord = (volunteerId: string, name: string) => {
		startTransition(async () => {
			const result = await recordAttendanceAction({ volunteerId });
			if (!result.success) {
				setStep({ message: result.error, type: "error" });
				return;
			}
			setStep({
				name,
				recordedAt: result.data.recordedAt,
				type: "complete",
			});
		});
	};

	const handleReset = () => {
		setCode("");
		setStep({ type: "input" });
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
			<div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
				<h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
					{eventName}
				</h1>
				<p className="mb-8 text-center text-lg text-gray-500">来場受付</p>

				{step.type === "input" && (
					<div className="flex flex-col gap-6">
						<div>
							<label
								className="mb-2 block text-center text-xl font-medium text-gray-700"
								htmlFor="code-input"
							>
								IDを入力してください
							</label>
							<Input
								className="h-16 text-center text-3xl font-mono tracking-widest"
								disabled={isPending}
								id="code-input"
								inputMode="numeric"
								maxLength={6}
								onChange={(e) =>
									setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
								}
								pattern="\d{6}"
								placeholder="000000"
								type="text"
								value={code}
							/>
						</div>
						<Button
							className="h-16 text-xl"
							disabled={code.length !== 6 || isPending}
							onClick={handleLookup}
							type="button"
						>
							{isPending ? "照合中..." : "確認する"}
						</Button>
					</div>
				)}

				{step.type === "confirm" && (
					<div className="flex flex-col gap-6 text-center">
						<div className="rounded-xl bg-blue-50 p-6">
							<p className="text-xl text-gray-600">こんにちは</p>
							<p className="mt-2 text-3xl font-bold text-blue-700">
								{step.name} さん
							</p>
						</div>
						<Button
							className="h-16 text-xl"
							disabled={isPending}
							onClick={() => handleRecord(step.volunteerId, step.name)}
							type="button"
						>
							{isPending ? "記録中..." : "来場を記録する"}
						</Button>
						<Button
							className="h-12"
							disabled={isPending}
							onClick={handleReset}
							type="button"
							variant="outline"
						>
							キャンセル
						</Button>
					</div>
				)}

				{step.type === "error" && (
					<div className="flex flex-col gap-6 text-center">
						<div className="rounded-xl bg-red-50 p-6">
							<p className="text-2xl font-bold text-red-600">{step.message}</p>
						</div>
						<Button
							className="h-16 text-xl"
							onClick={handleReset}
							type="button"
						>
							再入力する
						</Button>
					</div>
				)}

				{step.type === "complete" && (
					<div className="flex flex-col gap-6 text-center">
						<div className="rounded-xl bg-green-50 p-6">
							<p className="text-2xl font-bold text-green-600">
								来場を記録しました
							</p>
							<p className="mt-2 text-xl font-medium text-gray-700">
								{step.name} さん
							</p>
							<p className="mt-3 text-gray-500">
								{step.recordedAt.toLocaleString("ja-JP", {
									day: "2-digit",
									hour: "2-digit",
									minute: "2-digit",
									month: "2-digit",
									second: "2-digit",
									timeZone: "Asia/Tokyo",
									year: "numeric",
								})}
							</p>
						</div>
						<Button
							className="h-16 text-xl"
							onClick={handleReset}
							type="button"
						>
							次の人へ
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
