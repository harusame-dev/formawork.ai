import type { Step } from "onborda";

export const onboardingSteps: Step[] = [
	{
		content: (
			<>FORMAWORK.AI CRMへようこそ！このガイドでは主要な機能をご紹介します。</>
		),
		icon: <>👋</>,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-welcome",
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
		icon: <>⚠️</>,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-caution",
		showControls: true,
		side: "bottom",
		title: "ご注意",
	},
	{
		content: (
			<>左上のメニューボタンをクリックすると、各機能にアクセスできます。</>
		),
		icon: <>📋</>,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-menu-button",
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
		icon: <>👥</>,
		nextRoute: "/customers",
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-customer-menu",
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
		icon: <>🔍</>,
		pointerPadding: 10,
		pointerRadius: 10,
		prevRoute: "/",
		selector: "#onboarding-search-form",
		showControls: true,
		side: "bottom",
		title: "顧客を検索",
	},
	{
		content: <>顧客名をクリックして詳細を確認しましょう。</>,
		icon: <>👤</>,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-first-customer",
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
		icon: <>📝</>,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-basic-info-tab",
		showControls: true,
		side: "bottom-left",
		title: "顧客詳細",
	},
	{
		content: (
			<>
				接客ノートで顧客との対応履歴を管理できます。画像の添付も可能で、記載したノートに対してAIが自動でアドバイスを提供します。以上でガイドは終了です。FORMAWORK.AIをお楽しみください！
			</>
		),
		icon: <>📝</>,
		pointerPadding: 10,
		pointerRadius: 10,
		selector: "#onboarding-notes-tab",
		showControls: true,
		side: "bottom-left",
		title: "接客ノート",
	},
];
