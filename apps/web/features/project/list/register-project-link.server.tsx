import Link from "next/link";

export async function RegisterProjectLink() {
	return (
		<Link className="text-primary underline" href="/projects/new">
			新規登録
		</Link>
	);
}
