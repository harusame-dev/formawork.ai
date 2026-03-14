import type { ReactNode } from "react";

type ProjectDetailLayoutProps = LayoutProps<"/projects/[projectId]"> & {
	action: ReactNode;
};

export default async function ProjectDetailLayout({
	children,
	action,
}: ProjectDetailLayoutProps) {
	return (
		<div className="container mx-auto p-2 space-y-4">
			{action}
			{children}
		</div>
	);
}
