import type { Metadata } from "next";
import { AiAdviceSection } from "./_components/top/ai-advice-section";
import { CustomerMemorySection } from "./_components/top/customer-memory-section";
import { CustomerNoteSection } from "./_components/top/customer-note-section";
import { EndDemoSection } from "./_components/top/end-demo-section";
import { HeroSection } from "./_components/top/hero-section";
import { PermissionSection } from "./_components/top/permission-section";
import { TechStackSection } from "./_components/top/tech-stack-section";

export const metadata: Metadata = {
  description:
    "FORMAWORK.ai CRM - 接客ノートを AI が分析し、顧客一人ひとりの「記憶」を自動で蓄積。次の接客に活かせる情報を届けます。",
  openGraph: {
    description:
      "接客ノートを AI が分析し、顧客一人ひとりの「記憶」を自動で蓄積。次の接客に活かせる情報を届けます。",
    title: "FORMAWORK.ai CRM - AI があなたの接客を強くする顧客関係管理システム",
    type: "website",
  },
  title: "FORMAWORK.ai CRM - AI があなたの接客を強くする顧客関係管理システム",
};

export default function Page(): JSX.Element {
  return (
    <div className="h-dvh overflow-auto *:odd:bg-background">
      <HeroSection />
      <CustomerNoteSection />
      <CustomerMemorySection />
      <AiAdviceSection />
      <PermissionSection />
      <TechStackSection />
      <EndDemoSection />
    </div>
  );
}
