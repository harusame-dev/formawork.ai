import type { Metadata } from "next";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
	description: "プロジェクト管理",
	title: {
		default: "PROJECTIST",
		template: "%s - PROJECTIST",
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
