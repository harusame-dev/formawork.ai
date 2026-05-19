import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Brain, ImageIcon, NotebookPen } from "lucide-react";
import Image from "next/image";
import { LpSection } from "./lp-section";
import screenshotImage from "./ss-customer-note.png";

const features = [
  {
    description:
      "施術内容や会話の詳細を記録。顧客ごとの接客履歴を蓄積できます。",
    icon: NotebookPen,
    title: "接客内容の記録",
  },
  {
    description: "仕上がりや参考画像を添付可能。視覚的な情報も一緒に残せます。",
    icon: ImageIcon,
    title: "画像添付",
  },
  {
    description:
      "記録した内容を AI が自動で分析。メモリ抽出やアドバイス生成に活用されます。",
    icon: Brain,
    title: "AI 連携",
  },
] as const;

export function CustomerNoteSection(): React.JSX.Element {
  return (
    <LpSection
      description="接客の記録が、AI 活用の基盤になる"
      title="顧客ノートで接客を記録"
    >
      <p className="mx-auto mb-8 max-w-3xl text-center text-muted-foreground">
        接客内容を画像付きで記録できる顧客ノート機能。蓄積したノートは AI
        が自動で分析し、重要情報の抽出や次回接客のアドバイス生成に活用されます。
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="size-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm/relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Image
        alt="顧客ノートの画面。接客内容と画像が記録され、AIアドバイスが表示されている"
        className="mx-auto mt-20 aspect-auto w-full max-w-md rounded-2xl shadow-xl/20"
        sizes="(max-width: 768px) 100vw, 448px"
        src={screenshotImage}
      />
    </LpSection>
  );
}
