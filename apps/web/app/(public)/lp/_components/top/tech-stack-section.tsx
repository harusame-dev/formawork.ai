import { Badge } from "@workspace/ui/components/badge";
import { LpSection } from "./lp-section";

const techStack = [
	{
		category: "フロントエンド",
		items: ["Next.js 16 (App Router)", "TypeScript", "shadcn/ui"],
	},
	{
		category: "インフラ",
		items: ["Vercel", "Supabase"],
	},
	{
		category: "AI",
		items: ["Vercel AI SDK", "Google Gemini 2.5 Flash"],
	},
	{
		category: "テスト",
		items: ["Playwright", "Vitest（Browser mode）", "Vitest"],
	},
] as const;

export function TechStackSection() {
	return (
		<LpSection
			description="モダンな技術スタックで構築されています。"
			title="技術スタック"
		>
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
		</LpSection>
	);
}
