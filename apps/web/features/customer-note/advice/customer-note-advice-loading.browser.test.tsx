import type { SelectCustomerNoteAdvice } from "@workspace/db/schema/customer-note-advice";
import { HttpResponse, http } from "msw";
import type { SetupWorker } from "msw/browser";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { test as base, expect } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { worker } from "@/mocks/browser";
import { CustomerNoteAdviceLoading } from "./customer-note-advice-loading";

function TestWrapper({ children }: { children: ReactNode }) {
	return (
		<SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
			{children}
		</SWRConfig>
	);
}

type MswFixtures = {
	worker: SetupWorker;
};

const test = base.extend<MswFixtures>({
	worker: [
		async (
			// biome-ignore lint/correctness/noEmptyPattern: Vitest の fixture パターンで使用する標準的な記法
			{},
			// biome-ignore lint/suspicious/noExplicitAny: Vitest の fixture パターンで use の型は any
			use: any,
		) => {
			await worker.start({
				onUnhandledRequest: "bypass",
				quiet: true,
			});

			await use(worker);

			worker.resetHandlers();
			worker.stop();
		},
		{ auto: true },
	],
});

test("タイムアウトの場合、エラーメッセージが表示される", async ({ worker }) => {
	worker.use(
		http.get("/api/customer-notes/:noteId/advice", () => {
			return HttpResponse.json(null);
		}),
	);

	await render(
		<TestWrapper>
			<CustomerNoteAdviceLoading isTimeout={true} noteId="test-note-id" />
		</TestWrapper>,
	);

	await expect
		.element(
			page.getByText(
				"アドバイスの生成中にエラーが発生した可能性があります。ノートを編集して保存すると再生成されます。",
			),
		)
		.toBeInTheDocument();
});

test("初回表示時にローディング表示後、定期更新でデータが取得できたら自動でアドバイスが表示される", async ({
	worker,
}) => {
	// 最初は null を返す
	worker.use(
		http.get("/api/customer-notes/:noteId/advice", () => {
			return HttpResponse.json(null);
		}),
	);

	await render(
		<TestWrapper>
			<CustomerNoteAdviceLoading isTimeout={false} noteId="test-note-id" />
		</TestWrapper>,
	);

	// 最初はローディング表示
	await expect
		.element(page.getByText("AIアドバイスを生成中です"))
		.toBeInTheDocument();

	worker.use(
		http.get("/api/customer-notes/:noteId/advice", () => {
			return HttpResponse.json({
				advice: {
					currentEvaluation: {
						good: "良かった点のテスト",
						improvement: "改善ポイントのテスト",
					},
					nextAdvice: {
						caution: "注意点のテスト",
						followUpItems: "フォローアップ項目のテスト",
						nextActions: "次回アクションのテスト",
						openingTopics: "冒頭トピックのテスト",
						salesOpportunities: "提案機会のテスト",
					},
				},
				createdAt: new Date(),
				customerNoteId: "test-note-id",
				id: "test-advice-id",
			} satisfies SelectCustomerNoteAdvice);
		}),
	);

	await expect
		.element(page.getByText("今回の接客振り返り"))
		.toBeInTheDocument();
});
