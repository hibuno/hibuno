/**
 * Convert text to basic markdown
 */
export async function convertToBasicMarkdown(text: string): Promise<string> {
	if (!text || text.trim().length === 0) {
		return "# Document Extraction Results\n\nNo text content could be extracted from this document."
	}

	// Split into paragraphs
	const paragraphs = text.split(/\n\s*\n/)

	// Process each paragraph
	return paragraphs
		.map((paragraph) => {
			const trimmed = paragraph.trim()

			// Skip empty paragraphs
			if (!trimmed) return ""

			// Check if it might be a heading (short line, ends with no punctuation)
			if (trimmed.length < 100 && !trimmed.match(/[.,:;?!]$/)) {
				return `## ${trimmed}\n`
			}

			// Regular paragraph
			return trimmed + "\n\n"
		})
		.join("")
}
