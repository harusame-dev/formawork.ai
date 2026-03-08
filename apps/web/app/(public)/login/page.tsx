import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/features/auth/login/login-form";
import Logo from "../../../public/icon-512x512.png";

export const metadata: Metadata = {
	description: "AI とともに仕事を形作る社内システムプラットフォーム",
	openGraph: {
		description: "AI とともに仕事を形作る社内システムプラットフォーム",
		images: [{ height: 512, url: "/icon-512x512.png", width: 512 }],
		siteName: "FORMAWORK.ai",
		title: "ログイン - FORMAWORK.ai",
		type: "website",
	},
	title: "ログイン",
};

export default function LoginPage() {
	return (
		<main className="flex flex-col min-h-screen items-center p-4 bg-background">
			<div className="w-16 mx-auto mt-16">
				<Image alt="" sizes="64px" src={Logo} />
			</div>
			<p className="font-mono text-sm">FORMAWORK.ai</p>
			<Card className="w-full max-w-sm mt-8">
				<CardHeader>
					<CardTitle className="text-2xl mx-auto">ログイン</CardTitle>
					<CardDescription className="text-sm mx-auto">
						デモ環境
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</main>
	);
}
