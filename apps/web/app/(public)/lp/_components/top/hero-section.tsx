import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import icon from "@/public/icon-512x512.png";

export function HeroSection(): JSX.Element {
  return (
    <section className="px-4 py-16">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="mb-8 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-3">
            <Image alt="" height={48} src={icon} width={48} />
            <span className="font-mono text-2xl">FORMAWORK.ai</span>
          </div>
          <span className="text-sm text-muted-foreground">
            AI で業務を形作る
          </span>
        </div>
        <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          AI があなたの接客を強くする
          <br />
          顧客関係管理システム
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          接客ノートを AI が分析し、顧客一人ひとりの「記憶」を自動で蓄積。
          <br />
          次の接客に活かせる情報を、AI があなたに届けます。
        </p>
        <Button asChild size="lg">
          <Link href="/login">無料でデモを体験する</Link>
        </Button>
      </div>
    </section>
  );
}
