import { Card, CardContent } from "@workspace/ui/components/card";
import Image from "next/image";
import aiAdviceSS from "./ai-advice.png";
import serviceNoteSS from "./service-note.png";

const screenshots = [
	{
		alt: "サービスノートの編集ダイアログ。テキストを入力する欄と画像が３枚選択されている",
		description: "接客内容を画像付きでデータとして残せます。",
		image: serviceNoteSS,
		title: "サービスノート",
	},
	{
		alt: "サービスノートをもとに AI が出力した良かった点、改善点",
		description:
			"AI が接客内容を分析し、良かった点・改善点・次回のアドバイスを自動生成します。",
		image: aiAdviceSS,
		title: "AI 接客アドバイス",
	},
] as const;

export function ScreenshotsSection() {
	return (
		<section className="py-16 px-4 bg-muted/60">
			<div className="container mx-auto max-w-5xl">
				<h2 className="text-2xl font-bold text-center mb-4">画面イメージ</h2>
				<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
					実際のシステム画面をご覧いただけます。
				</p>
				<div className="grid gap-8 md:grid-cols-2">
					{screenshots.map((screenshot) => (
						<Card className="overflow-hidden" key={screenshot.title}>
							<div className="aspect-video bg-muted relative m-4">
								<Image
									alt={screenshot.alt}
									className="rounded-2xl object-cover"
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									src={screenshot.image}
								/>
							</div>
							<CardContent className="pt-4">
								<h3 className="font-semibold mb-1">{screenshot.title}</h3>
								<p className="text-sm text-muted-foreground">
									{screenshot.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
