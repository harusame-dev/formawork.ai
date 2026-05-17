import { SYSTEM_CATEGORY_ID } from "./organization-categories";

// admin が所属するシステム管理組織
export const SYSTEM_ORGANIZATION_ID = "10000000-0000-4000-8000-000000000001";

export const organizationsFixture = [
	{
		categoryId: SYSTEM_CATEGORY_ID,
		description: "",
		email: "",
		name: "システム管理組織",
		organizationId: SYSTEM_ORGANIZATION_ID,
		url: "",
	},
	// 省エネルギー
	{
		categoryId: "00000000-0000-4000-8000-000000000011",
		description:
			"省エネ家電・断熱リフォーム・太陽光発電など、住まいの省エネルギー化を総合的にサポートする相談センターです。各種補助金の申請支援から施工業者の紹介まで、ワンストップで対応いたします。",
		email: "info@eco-life-saving.example.com",
		name: "エコライフ省エネ相談センター",
		organizationId: "10000000-0000-4000-8000-000000000011",
		url: "https://eco-life-saving.example.com",
	},
	// ファイナンシャルプランナー
	{
		categoryId: "00000000-0000-4000-8000-000000000012",
		description:
			"相続税対策・資産運用・保険の見直しなど、人生100年時代のお金の悩みに寄り添うファイナンシャルプランナー事務所です。CFP・1級FP技能士の有資格者が中立的な立場でアドバイスいたします。",
		email: "info@anshin-fp.example.com",
		name: "あんしんライフFP事務所",
		organizationId: "10000000-0000-4000-8000-000000000012",
		url: "https://anshin-fp.example.com",
	},
	// 旅行
	{
		categoryId: "00000000-0000-4000-8000-000000000013",
		description:
			"シニア世代の思い出づくりを応援する旅行会社です。バリアフリー対応の宿泊施設や、ゆったり日程のツアーをご用意。記念日旅行や家族旅行のオーダーメイドもお任せください。",
		email: "info@omoide-travel.example.com",
		name: "おもいで旅行社",
		organizationId: "10000000-0000-4000-8000-000000000013",
		url: "https://omoide-travel.example.com",
	},
	// 介護
	{
		categoryId: "00000000-0000-4000-8000-000000000014",
		description:
			"在宅介護・訪問看護・デイサービスを提供する地域密着型の介護事業者です。利用者様一人ひとりに寄り添い、ご家族の負担軽減もサポート。ケアマネジャーが無料でご相談を承ります。",
		email: "info@kokoro-care.example.com",
		name: "こころ介護サービス",
		organizationId: "10000000-0000-4000-8000-000000000014",
		url: "https://kokoro-care.example.com",
	},
	// 葬儀屋
	{
		categoryId: "00000000-0000-4000-8000-000000000015",
		description:
			"家族葬・一日葬・直葬まで幅広いプランをご用意する葬儀社です。事前相談無料、24時間365日対応。明朗会計でご家族のご希望に沿ったお別れの場をご提供いたします。",
		email: "info@sakura-sougi.example.com",
		name: "さくら葬祭",
		organizationId: "10000000-0000-4000-8000-000000000015",
		url: "https://sakura-sougi.example.com",
	},
	// 遺産相続・行政書士手続き
	{
		categoryId: "00000000-0000-4000-8000-000000000016",
		description:
			"遺言書作成・相続手続き・成年後見など、相続に関する各種書類作成と手続きを行政書士がサポートします。初回相談無料。煩雑な書類手続きをわかりやすくご案内いたします。",
		email: "info@tsuzuki-gyosei.example.com",
		name: "つづき行政書士事務所",
		organizationId: "10000000-0000-4000-8000-000000000016",
		url: "https://tsuzuki-gyosei.example.com",
	},
	// 家財整理
	{
		categoryId: "00000000-0000-4000-8000-000000000017",
		description:
			"遺品整理・生前整理・空き家の家財整理を専門に行う整理業者です。遺品整理士の有資格者が、思い出の品を丁寧に仕分け。買取査定も同時対応で費用負担を軽減します。",
		email: "info@katazuke-bin.example.com",
		name: "かたづけ便",
		organizationId: "10000000-0000-4000-8000-000000000017",
		url: "https://katazuke-bin.example.com",
	},
	// ごみ処理
	{
		categoryId: "00000000-0000-4000-8000-000000000018",
		description:
			"一般廃棄物・粗大ごみ・産業廃棄物の収集運搬を行う認可事業者です。大量のごみ処分や引っ越し・解体に伴う廃棄物処理もスピーディーに対応。お見積りは無料です。",
		email: "info@clean-mate.example.com",
		name: "クリーンメイトサービス",
		organizationId: "10000000-0000-4000-8000-000000000018",
		url: "https://clean-mate.example.com",
	},
	// リフォーム
	{
		categoryId: "00000000-0000-4000-8000-000000000019",
		description:
			"水回り・内装・外装・バリアフリー化など住宅リフォーム全般を手掛ける工務店です。一級建築士在籍。耐震診断や介護保険を利用した住宅改修にも対応いたします。",
		email: "info@my-home-reform.example.com",
		name: "マイホームリフォーム工房",
		organizationId: "10000000-0000-4000-8000-000000000019",
		url: "https://my-home-reform.example.com",
	},
	// 解体
	{
		categoryId: "00000000-0000-4000-8000-00000000001a",
		description:
			"木造住宅から鉄骨・鉄筋コンクリート造まで対応する総合解体業者です。建設リサイクル法に基づく適切な分別解体を実施。アスベスト調査・除去工事もお任せください。",
		email: "info@daichi-kaitai.example.com",
		name: "大地解体工業",
		organizationId: "10000000-0000-4000-8000-00000000001a",
		url: "https://daichi-kaitai.example.com",
	},
	// 不動産
	{
		categoryId: "00000000-0000-4000-8000-00000000001b",
		description:
			"地域密着の総合不動産会社です。相続不動産の売却・空き家活用・賃貸管理まで幅広く対応。査定無料、宅地建物取引士が誠実にサポートいたします。",
		email: "info@machinami-estate.example.com",
		name: "まちなみ不動産",
		organizationId: "10000000-0000-4000-8000-00000000001b",
		url: "https://machinami-estate.example.com",
	},
];
