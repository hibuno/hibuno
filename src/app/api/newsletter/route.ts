import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/db/server";

export async function POST(req: Request) {
	try {
		const { email, source } = await req.json();
		if (typeof email !== "string" || !email.includes("@")) {
			return NextResponse.json({ error: "Invalid email" }, { status: 400 });
		}

		const supabase = getSupabaseServerClient();
		const { error } = await supabase
			.from("newsletter")
			.upsert(
				{ email, source, is_active: true },
				{ onConflict: "email", ignoreDuplicates: true },
			);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		return NextResponse.json({ ok: true });
	} catch (e: unknown) {
		const errorMessage = e instanceof Error ? e.message : "Unexpected error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
