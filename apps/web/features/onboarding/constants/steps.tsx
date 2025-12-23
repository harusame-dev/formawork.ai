import {
	Brain,
	Hand,
	Info,
	Menu,
	NotebookPen,
	Search,
	TriangleAlert,
	User,
	Users,
} from "lucide-react";
import type { Step } from "onborda";

/** オンボーディングで使用する要素のID定数 */
export const OnboardingId = {
	BasicInfoTab: "onboarding-basic-info-tab",
	Caution: "onboarding-caution",
	CustomerMenu: "onboarding-customer-menu",
	FirstCustomer: "onboarding-first-customer",
	MemoriesTab: "onboarding-memories-tab",
	MenuButton: "onboarding-menu-button",
	NotesTab: "onboarding-notes-tab",
	SearchForm: "onboarding-search-form",
	Welcome: "onboarding-welcome",
} as const;

export const onboardingSteps: Step[] = [
	{
		content: (
			<>FORMAWORK.AI CRMへようこそ！このガイドでは主要な機能をご紹介します。</>
		),
		icon: <Hand className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.Welcome}`,
		showControls: true,
		side: "bottom",
		title: "ようこそ！",
	},
	{
		content: (
			<>
				【ご注意】このデモ環境は誰でも閲覧可能です。機密情報や実際の個人情報は登録しないでください。また、データは予告なくリセットされる場合があります。
			</>
		),
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
			<>
				顧客一覧では、登録されている顧客情報を確認できます。クリックして移動しましょう。
			</>
		),
		icon: <Users className="size-5" />,
		nextRoute: "/customers",
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.CustomerMenu}`,
		showControls: true,
		side: "bottom-left",
		title: "顧客一覧",
	},
	{
		content: (
			<>
				キーワード検索で顧客を絞り込めます。姓名、電話番号、メールアドレスで検索可能です。
			</>
		),
		icon: <Search className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.SearchForm}`,
		showControls: true,
		side: "bottom",
		title: "顧客を検索",
	},
	{
		content: <>顧客名をクリックして詳細を確認しましょう。</>,
		icon: <User className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.FirstCustomer}`,
		showControls: true,
		side: "bottom-left",
		title: "顧客を選択",
	},
	{
		content: (
			<>
				顧客の基本情報を確認できます。タブを切り替えて、ノートやメモリも確認できます。
			</>
		),
		icon: <Info className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.BasicInfoTab}`,
		showControls: true,
		side: "bottom-left",
		title: "顧客詳細",
	},
	{
		content: (
			<>
				接客ノートで顧客との対応履歴を管理できます。画像の添付も可能で、記載したノートに対してAIが自動でアドバイスを提供します。
			</>
		),
		icon: <NotebookPen className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.NotesTab}`,
		showControls: true,
		side: "bottom",
		title: "接客ノート",
	},
	{
		content: (
			<>
				メモリは接客ノートからAIが自動で重要な事柄を記録します。手動での登録・編集・削除も可能です。ロック機能でAIによる削除を防ぐこともできます。記録されたメモリは接客アドバイスの生成にも活用されます。以上でガイドは終了です。FORMAWORK.AIをお楽しみください！
			</>
		),
		icon: <Brain className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.MemoriesTab}`,
		showControls: true,
		side: "bottom-right",
		title: "メモリ",
	},
];
