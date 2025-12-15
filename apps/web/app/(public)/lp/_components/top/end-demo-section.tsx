import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function EndDemoSection() {
	return (
		<section className="py-16 px-4 text-center">
			<p className="text-lg text-muted-foreground mb-6">
				FORMAWORK.ai CRM を体験してみませんか？
			</p>
			<Button asChild size="lg" variant="outline">
				<Link href="/login">無料でデモを体験する</Link>
			</Button>
		</section>
	);
}
