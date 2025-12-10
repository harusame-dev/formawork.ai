import { EndDemoSection } from "./_components/top/end-demo-section";
import { FeaturesSection } from "./_components/top/features-section";
import { HeroSection } from "./_components/top/hero-section";
import { ScreenshotsSection } from "./_components/top/screenshots-section";
import { TechStackSection } from "./_components/top/tech-stack-section";

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
