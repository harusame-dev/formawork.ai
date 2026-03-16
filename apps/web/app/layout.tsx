import type { Metadata } from "next";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
	description: "ボランティア来場管理",
	title: {
		default: "ボランティア管理",
		template: "%s - ボランティア管理",
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
