import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
	const client = createServerClient(
		// biome-ignore lint/style/noNonNullAssertion: Environment variables are required
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		// biome-ignore lint/style/noNonNullAssertion: Environment variables are required
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get() {
					return undefined;
				},
				set() {
					// no-op on server in this app
				},
				remove() {
					// no-op on server in this app
				},
			},
		},
	);
	return client;
}

export function getServerSupabase() {
	return getSupabaseServerClient();
}
