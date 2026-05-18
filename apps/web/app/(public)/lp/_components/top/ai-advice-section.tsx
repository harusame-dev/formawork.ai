import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AlertCircle, Lightbulb, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { LpSection } from "./lp-section";
import screenshotImage from "./ss-ai-advice.png";

const features = [
  {
    description: "接客の成功ポイントを明確化し、再現性を高めます。",
    icon: ThumbsUp,
    title: "良かった点の可視化",
  },
  {
    description: "見落としがちな改善ポイントを客観的に指摘。",
    icon: AlertCircle,
    title: "改善点の提案",
  },
  {
    description: "次の接客で意識すべきポイントを具体的に提案。",
    icon: Lightbulb,
    title: "次回アクションの提案",
  },
] as const;

export function AiAdviceSection(): JSX.Element {
  return (
    <LpSection
      description="接客内容を分析し、次回に活かせるフィードバックを自動生成"
      title="AI が接客をアドバイス"
    >
      <p className="mx-auto mb-8 max-w-3xl text-center text-muted-foreground">
        記録した接客内容を AI が分析。良かった点・改善点・次回の接客アドバイスを
        自動で生成します。振り返りの手間を省き、接客品質の向上を支援します。
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
        alt="サービスノートをもとに AI が出力した良かった点、改善点"
        className="mx-auto mt-20 aspect-auto w-full max-w-md rounded-2xl shadow-xl/20"
        sizes="(max-width: 768px) 100vw, 448px"
        src={screenshotImage}
      />
    </LpSection>
  );
}
