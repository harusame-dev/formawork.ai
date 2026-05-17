import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Heart, ListTodo, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "お見送りサポートチャット",
};

export default function Page() {
	return (
		<main className="container mx-auto p-6 max-w-4xl">
			<section className="flex flex-col gap-4 py-12 text-center">
				<h1 className="text-3xl font-bold sm:text-4xl">
					相続・終活・資産活用のチャット相談
				</h1>
				<p className="text-base text-muted-foreground">
					AI
					コンシェルジュが状況をヒアリングし、必要な手続きと関連業種の組織への相談をサポートします。
				</p>
				<div className="flex justify-center gap-2 pt-4">
					<Button asChild size="lg">
						<Link href="/login">管理者ログイン</Link>
					</Button>
				</div>
			</section>

			<section className="grid gap-4 py-8 sm:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<MessagesSquare className="size-5" />
							LLM 対話
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						終活から相続後の資産活用まで、状況に応じて最適なタスクを提案します。
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<ListTodo className="size-5" />
							TODO 自動抽出
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						会話内容から相続手続きの TODO を自動で抽出し、優先度順に表示します。
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Heart className="size-5" />
							業種への相談
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						行政書士、葬儀屋、リフォーム業者など、関連業種に直接相談を依頼できます。
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
