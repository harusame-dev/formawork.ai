import type React from "react";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function LpSection({
  title,
  description,
  children,
}: Props): React.JSX.Element {
  return (
    <section className="px-4 py-16">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}
