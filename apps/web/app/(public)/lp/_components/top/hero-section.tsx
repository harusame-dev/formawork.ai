import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import icon from "../../../../../public/icon-512x512.png";

export function HeroSection() {
	return (
		<section className="py-16 px-4">
			<div className="container mx-auto max-w-4xl text-center">
				<div className="flex items-center justify-center gap-3 mb-8">
					<Image alt="" height={48} src={icon} width={48} />
					<span className="text-2xl font-mono">FORMAWORK.ai</span>
				</div>
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
