import { EndDemoSection } from "./_components/top/end-demo-section";
import { FeaturesSection } from "./_components/top/features-section";
import { HeroSection } from "./_components/top/hero-section";
import { ScreenshotsSection } from "./_components/top/screenshots-section";
import { TechStackSection } from "./_components/top/tech-stack-section";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI が接客をサポートする顧客管理システム',
  description: '顧客情報の管理から、次回接客のアドバイスまで。AI が日々の業務をスマートに支援する顧客管理システムのデモを体験できます。',
  openGraph: {
    title: 'AI が接客をサポートする顧客管理システム',
    description: '顧客情報の管理から、次回接客のアドバイスまで。AI が日々の業務をスマートに支援します。',
    type: 'website',
  },
}

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
