import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  description: "AI とともに仕事を形作る社内システムプラットフォーム",
  title: {
    default: "FORMAWORK.ai",
    template: "%s - FORMAWORK.ai",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">): React.JSX.Element {
  return (
    <html lang="ja">
      <body className="overflow-hidden bg-white font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
