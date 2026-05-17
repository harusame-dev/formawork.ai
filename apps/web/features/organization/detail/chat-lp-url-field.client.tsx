"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Check, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function ChatLpUrlField({ url }: { url: string }) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex flex-col gap-2">
			<span className="text-xs text-muted-foreground">紹介用チャット URL</span>
			<div className="flex gap-2">
				<Input
					aria-label="紹介用チャット URL"
					className="font-mono text-sm"
					readOnly
					value={url}
				/>
				<Button
					aria-label="URL をコピー"
					onClick={handleCopy}
					size="icon"
					type="button"
					variant="outline"
				>
					{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
				</Button>
			</div>
			<div className="flex flex-col items-center gap-1 mt-1">
				<div className="rounded-md border bg-white p-3">
					<QRCodeSVG
						aria-label="紹介用チャット URL の QR コード"
						level="M"
						size={160}
						value={url}
					/>
				</div>
				<span className="text-xs text-muted-foreground">
					スマートフォンで読み取って紹介用チャットを開けます
				</span>
			</div>
		</div>
	);
}
