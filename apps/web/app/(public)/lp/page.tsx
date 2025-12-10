import type { Metadata } from "next";
import { EndDemoSection } from "./_components/top/end-demo-section";
import { FeaturesSection } from "./_components/top/features-section";
import { HeroSection } from "./_components/top/hero-section";
import { ScreenshotsSection } from "./_components/top/screenshots-section";
import { TechStackSection } from "./_components/top/tech-stack-section";

export const metadata: Metadata = {
	description:
		"顧客情報の管理から、次回接客のアドバイスまで。AI が日々の業務をスマートに支援する顧客管理システムのデモを体験できます。",
	openGraph: {
		description:
			"顧客情報の管理から、次回接客のアドバイスまで。AI が日々の業務をスマートに支援します。",
		title: "AI が接客をサポートする顧客管理システム",
		type: "website",
	},
	title: "AI が接客をサポートする顧客管理システム",
};

export default function Page() {
	return (
		<div className="overflow-auto h-dvh *:odd:bg-background">
			<HeroSection />
			<ScreenshotsSection />
			<FeaturesSection />
			<TechStackSection />
			<EndDemoSection />
		</div>
	);
}
