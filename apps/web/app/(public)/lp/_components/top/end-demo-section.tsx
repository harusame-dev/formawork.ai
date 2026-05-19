import type React from "react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function EndDemoSection(): React.JSX.Element {
  return (
    <section className="px-4 py-16 text-center">
      <p className="mb-6 text-lg text-muted-foreground">
        FORMAWORK.ai CRM を体験してみませんか？
      </p>
      <Button asChild size="lg" variant="outline">
        <Link href="/login">無料でデモを体験する</Link>
      </Button>
    </section>
  );
}
