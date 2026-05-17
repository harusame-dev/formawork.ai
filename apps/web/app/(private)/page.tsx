import { Suspense } from "react";
import { DashboardContainer } from "@/features/dashboard/dashboard.server";

export default function Page() {
	return (
		<Suspense fallback={null}>
			<DashboardContainer />
		</Suspense>
	);
}
