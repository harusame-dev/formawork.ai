import Link from "next/link";

export async function RegisterTaskLink() {
	return (
		<Link className="text-primary underline" href="/tasks/new">
			新規登録
		</Link>
	);
}
