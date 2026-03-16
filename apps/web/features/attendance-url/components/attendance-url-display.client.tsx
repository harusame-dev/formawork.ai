"use client";

import { Button } from "@workspace/ui/components/button";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { RegenerateUrlDialog } from "./regenerate-url-dialog.client";

type AttendanceUrlDisplayProps = {
	eventId: string;
	token: string;
};

export function AttendanceUrlDisplay({
	eventId,
	token,
}: AttendanceUrlDisplayProps) {
	const [copied, setCopied] = useState(false);
	const [origin, setOrigin] = useState("");

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const attendanceUrl = origin ? `${origin}/attendance/${token}` : "";

	async function handleCopy() {
		await navigator.clipboard.writeText(attendanceUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium">来場ページURL</p>
				<div className="flex items-center gap-2">
					<span className="flex-1 break-all rounded-md border bg-muted px-3 py-2 text-sm">
						{attendanceUrl}
					</span>
					<Button
						onClick={handleCopy}
						size="sm"
						type="button"
						variant="outline"
					>
						<Copy className="h-4 w-4" />
						{copied ? "コピーしました" : "コピー"}
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<p className="text-sm font-medium">QRコード</p>
				<div className="w-fit rounded-md border bg-white p-4">
					<QRCodeSVG size={200} value={attendanceUrl} />
				</div>
			</div>

			<div>
				<RegenerateUrlDialog eventId={eventId} />
			</div>
		</div>
	);
}
