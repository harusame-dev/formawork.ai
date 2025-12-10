import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function HeroSection() {
	return (
		<section className="py-16 px-4">
			<div className="container mx-auto max-w-4xl text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
					AI が接客をサポートする
					<br />
					顧客管理システム
				</h1>
				<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
					顧客情報の管理から、次回接客のアドバイスまで。
					<br />
					AI が日々の業務をスマートに支援します。
				</p>
				<Button asChild size="lg">
					<Link href="/login">デモを体験する</Link>
				</Button>
			</div>
		</section>
	);
}
