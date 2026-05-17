import type { Metadata } from "next";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
	description:
		"終活から相続手続き、相続後の資産活用までを AI がサポートするチャットサービス",
	title: {
		default: "お見送りサポートチャット",
		template: "%s - お見送りサポートチャット",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className="antialiased font-sans bg-white overflow-hidden">
				{children}
			</body>
		</html>
	);
}
