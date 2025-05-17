"use server"

import { deleteOldFiles } from "@/lib/actions"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		// Set the expiration time to 1 day
		const result = await deleteOldFiles(24)

		// Return the result as JSON
		return NextResponse.json(result)
	} catch (error) {
		console.error("Error in cleanup API route:", error)
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "An unknown error occurred"
			},
			{ status: 500 }
		)
	}
}
