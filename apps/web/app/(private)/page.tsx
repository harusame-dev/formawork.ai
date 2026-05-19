import type React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AlertTriangle, Sparkles } from "lucide-react";
import { StartTourButton } from "@/features/onboarding/components/start-tour-button.client";
import { OnboardingId } from "@/features/onboarding/constants/steps.universal";

export default function Page(): React.JSX.Element {
  return (
    <div className="container mx-auto space-y-4 p-4">
      <Card id={OnboardingId.Welcome}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            FORMAWORK.AI CRM へようこそ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            顧客管理を効率的に行うための CRM システムです。
            左上のメニューから各機能にアクセスできます。
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50" id={OnboardingId.Caution}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="size-5" />
            ご注意ください
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">
            このデモ環境は誰でも閲覧可能です。機密情報や実際の個人情報は登録しないでください。
            また、データは予告なくリセットされる場合があります。
          </p>
        </CardContent>
      </Card>

      {/* 使い方ガイドボタン */}
      <StartTourButton />

      {/* オンボーディング用スペーサー */}
      <div aria-hidden="true" className="h-[50dvh]" />
    </div>
  );
}
