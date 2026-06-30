"use client";

import type React from "react";
import { Button } from "@workspace/ui/components/button";
import { Download } from "lucide-react";

export function TmCsvExportButton(): React.JSX.Element {
  return (
    <a download href="/api/translation-memory/export">
      <Button size="sm" variant="outline">
        <Download className="mr-2 size-4" />
        CSV 出力
      </Button>
    </a>
  );
}
