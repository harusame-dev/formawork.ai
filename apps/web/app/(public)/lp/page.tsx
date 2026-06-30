import type React from "react";
import type { Metadata } from "next";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { FileText, Languages, Library, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "TransDesk - 和文 → 英訳の翻訳支援（CAT）ツール。AI 英訳・翻訳メモリ・用語集を参照しながら効率的に翻訳します。",
  openGraph: {
    description:
      "和文 → 英訳の翻訳支援（CAT）ツール。AI 英訳・翻訳メモリ・用語集を参照しながら効率的に翻訳します。",
    title: "TransDesk - AI 翻訳支援ツール",
    type: "website",
  },
  title: "TransDesk - AI 翻訳支援ツール",
};

const features = [
  {
    description:
      "Word から原文を抽出し、1 文単位のセグメントに分割。対訳エディタで効率的に翻訳します。",
    icon: FileText,
    title: "ドキュメント取り込み",
  },
  {
    description:
      "Claude による AI 英訳に、類似の過去訳と用語集をヒントとして同梱し、文脈に沿った訳を生成します。",
    icon: Languages,
    title: "AI 英訳 + RAG",
  },
  {
    description:
      "確定した対訳を翻訳メモリへ蓄積。pgvector による意味的類似検索で次の翻訳に再利用します。",
    icon: Library,
    title: "翻訳メモリ・用語集",
  },
];

export default function Page(): React.JSX.Element {
  return (
    <div className="h-dvh overflow-auto">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm text-muted-foreground">
          <Sparkles className="size-4" />
          AI 翻訳支援（CAT）ツール
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          TransDesk
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          和文 → 英訳の翻訳を、AI 英訳・翻訳メモリ・用語集で支援します。
          確定した訳は翻訳メモリへ蓄積し、次の翻訳で再利用します。
        </p>
        <Button asChild size="lg">
          <Link href="/login">ログインして始める</Link>
        </Button>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {features.map(({ description, icon: Icon, title }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="size-5" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
