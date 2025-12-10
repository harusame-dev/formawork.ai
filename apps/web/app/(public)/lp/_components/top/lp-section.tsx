import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	title: string;
	description: string;
}>;

export function LpSection({ title, description, children }: Props) {
	return (
		<section className="py-16 px-4">
			<div className="container mx-auto max-w-5xl">
				<h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
				<p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
					{description}
				</p>
				{children}
			</div>
		</section>
	);
}
