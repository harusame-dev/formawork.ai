import { Badge } from "@workspace/ui/components/badge";

const techStack = [
	{
		category: "フロントエンド",
		items: [
			"Next.js 16 (App Router)",
			"React 19",
			"TypeScript",
			"Tailwind CSS 4",
		],
	},
	{
		category: "バックエンド",
		items: ["Drizzle ORM", "PostgreSQL", "Supabase"],
	},
	{
		category: "AI",
		items: ["Vercel AI SDK", "Google Gemini 2.5 Flash"],
	},
	{
		category: "設計品質",
		items: ["モノレポ構成", "多層テスト戦略", "型安全設計"],
	},
] as const;

export function TechStackSection() {
	return (
		<section className="py-16 px-4">
			<div className="container mx-auto max-w-5xl">
				<h2 className="text-2xl font-bold text-center mb-4">技術スタック</h2>
				<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
					モダンな技術スタックで構築されています。
				</p>
				<div className="grid gap-8 md:grid-cols-2">
					{techStack.map((stack) => (
						<div className="space-y-3" key={stack.category}>
							<h3 className="font-semibold text-sm text-muted-foreground">
								{stack.category}
							</h3>
							<div className="flex flex-wrap gap-2">
								{stack.items.map((item) => (
									<Badge key={item} variant="secondary">
										{item}
									</Badge>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
