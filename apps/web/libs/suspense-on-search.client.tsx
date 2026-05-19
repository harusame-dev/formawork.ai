"use client";
import type React from "react";
import { useSearchParams } from "next/navigation";
import { Suspense, type SuspenseProps } from "react";

function SuspenseOnSearchInner({
  children,
  fallback,
}: SuspenseProps): React.JSX.Element {
  const search = useSearchParams();

  return (
    <Suspense fallback={fallback} key={search.toString()}>
      {children}
    </Suspense>
  );
}

export function SuspenseOnSearch({
  children,
  fallback,
}: SuspenseProps): React.JSX.Element {
  return (
    <Suspense fallback={fallback}>
      <SuspenseOnSearchInner fallback={fallback}>
        {children}
      </SuspenseOnSearchInner>
    </Suspense>
  );
}
