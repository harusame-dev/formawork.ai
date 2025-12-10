import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function EndDemoSection() {
	return (
		<section className="py-16 px-4 text-center">
			<Button asChild size="lg" variant="outline">
				<Link href="/customers">デモを体験する</Link>
			</Button>
		</section>
	);
}
