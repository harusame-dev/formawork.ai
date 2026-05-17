import { createClient } from "@supabase/supabase-js";
import { usersFixture } from "./fixtures/users-fixture";

async function seedUsers() {
	const supabaseUrl = process.env["SUPABASE_URL"];
	const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error(
			"Missing environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
		);
	}

	const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});

	console.log("Starting admin user seed...\n");

	for (const user of usersFixture) {
		try {
			// 既存ユーザーをメールアドレスで検索（旧データ・ID違いがあっても確実に消す）
			const { data: list, error: listError } =
				await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
			if (listError) {
				throw listError;
			}
			const existing = list.users.find((u) => u.email === user.email);
			if (existing) {
				await supabase.auth.admin.deleteUser(existing.id);
				console.log(`🗑️  ${user.email} - Removed existing (id=${existing.id})`);
			}

			const { data, error } = await supabase.auth.admin.createUser({
				app_metadata: { role: user.role, userId: user.userId },
				email: user.email,
				email_confirm: true,
				id: user.id,
				password: user.password,
			});

			if (error) {
				console.error(`❌ ${user.email} - Error: ${error.message}`);
			} else {
				console.log(
					`✅ ${user.email} - Created successfully (ID: ${data.user?.id})`,
				);
			}
		} catch (err) {
			console.error(
				`❌ ${user.email} - Unexpected error:`,
				err instanceof Error ? err.message : err,
			);
		}
	}

	console.log("\nAdmin user seed completed");
}

seedUsers().catch((error) => {
	console.error("Error during seed execution:", error);
	process.exit(1);
});
