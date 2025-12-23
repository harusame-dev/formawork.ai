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

export const steps: Step[] = [
	{
		content: <>FORMAWORK.AI CRMへようこそ！</>,
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
			<>
				顧客の管理や接客ノートの記録、AIによる接客アドバイス・顧客メモリなどが確認できます。
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
		content: <>姓名、電話番号、メールアドレスで検索可能です。</>,
		icon: <Search className="size-5" />,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.SearchForm}`,
		showControls: true,
		side: "bottom",
		title: "顧客を検索",
	},
	{
		content: <>顧客名を選択すると詳細画面に遷移します。</>,
		icon: <User className="size-5" />,
		nextRoute: "/customers/00000000-0000-0000-0000-000000000001",
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.FirstCustomer}`,
		showControls: true,
		side: "top-left",
		title: "顧客を選択",
	},
	{
		content: <>顧客の生年月日や住所など、基本情報が閲覧できます。</>,
		icon: <Info className="size-5" />,

		nextRoute: "/customers/00000000-0000-0000-0000-000000000001/notes",
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
				接客内容を記録できます。自動で AI
				が接客内容のアドバイスと顧客情報をメモリに記録していきます。
			</>
		),
		icon: <NotebookPen className="size-5" />,
		nextRoute: "/customers/00000000-0000-0000-0000-000000000001/memories",
		pointerPadding: 10,
		pointerRadius: 10,
		selector: `#${OnboardingId.NotesTab}`,
		showControls: true,
		side: "bottom",
		title: "接客ノート",
	},
	{
		content: (
			<div>
				<div>
					接客ノートからAIが自動で重要な事柄を記録します。手動での管理も行えます。
				</div>
				<div className="mt-8">
					以上で使い方ガイドは完了です。 ご自由にお試しください。
				</div>
			</div>
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
