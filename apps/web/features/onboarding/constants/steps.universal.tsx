import { FolderKanban, Hand, Menu, TriangleAlert } from "lucide-react";
import type { Step } from "onborda";

/** オンボーディングで使用する要素のID定数 */
export const OnboardingId = {
  Caution: "onboarding-caution",
  MenuButton: "onboarding-menu-button",
  ProjectsMenu: "onboarding-projects-menu",
  Welcome: "onboarding-welcome",
} as const;

export const steps: Step[] = [
  {
    content: <>翻訳支援ツール TransDesk へようこそ！</>,
    icon: <Hand className="size-5" />,
    pointerPadding: 10,
    pointerRadius: 10,
    selector: `#${OnboardingId.Welcome}`,
    showControls: true,
    side: "bottom",
    title: "ようこそ！",
  },
  {
    content: <>注意事項です。ご確認ください。</>,
    icon: <TriangleAlert className="size-5" />,
    pointerPadding: 10,
    pointerRadius: 10,
    selector: `#${OnboardingId.Caution}`,
    showControls: true,
    side: "bottom",
    title: "ご注意",
  },
  {
    content: (
      <>左上のメニューボタンをクリックすると、各機能にアクセスできます。</>
    ),
    icon: <Menu className="size-5" />,
    pointerPadding: 10,
    pointerRadius: 10,
    selector: `#${OnboardingId.MenuButton}`,
    showControls: true,
    side: "bottom-left",
    title: "メニューを開く",
  },
  {
    content: (
      <div>
        <div>
          プロジェクト単位で翻訳案件を管理します。ワークをアップロードし、対訳エディタで
          AI 英訳・翻訳メモリ・用語集を参照しながら翻訳します。
        </div>
        <div className="mt-8">
          以上で使い方ガイドは完了です。ご自由にお試しください。
        </div>
      </div>
    ),
    icon: <FolderKanban className="size-5" />,
    pointerPadding: 10,
    pointerRadius: 10,
    selector: `#${OnboardingId.ProjectsMenu}`,
    showControls: true,
    side: "bottom-left",
    title: "プロジェクト",
  },
];
