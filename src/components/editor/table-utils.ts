// Table utility functions for creating and manipulating tables

export interface TableTemplate {
	rows: number;
	cols: number;
	header?: boolean;
	data?: string[][];
}

// Create a basic table with specified dimensions
export function createTableHTML(
	rows: number,
	cols: number,
	header: boolean = true,
): string {
	let html = "<table><tbody>";

	if (header) {
		html += "<thead><tr>";
		for (let c = 0; c < cols; c++) {
			html += `<th>Header ${c + 1}</th>`;
		}
		html += "</tr></thead>";
	}

	html += "<tbody>";
	for (let r = 0; r < rows - (header ? 1 : 0); r++) {
		html += "<tr>";
		for (let c = 0; c < cols; c++) {
			html += `<td>Cell ${r + 1}-${c + 1}</td>`;
		}
		html += "</tr>";
	}
	html += "</tbody></table>";

	return html;
}

// Create table with custom data
export function createTableWithData(
	data: string[][],
	headerRow: boolean = true,
): string {
	if (data.length === 0) return createTableHTML(1, 1);

	const cols = Math.max(...data.map((row) => row.length));

	let html = "<table><tbody>";

	data.forEach((row, rowIndex) => {
		const isHeader = headerRow && rowIndex === 0;
		const tag = isHeader ? "th" : "td";

		html += "<tr>";
		for (let c = 0; c < cols; c++) {
			const cellContent = row[c] || "";
			html += `<${tag}>${cellContent}</${tag}>`;
		}
		html += "</tr>";
	});

	html += "</tbody></table>";
	return html;
}

// Advanced table templates with predefined content
export const advancedTableTemplates: Record<
	string,
	{ name: string; template: TableTemplate; data?: string[][] }
> = {
	"pricing-table": {
		name: "Pricing Table",
		template: { rows: 4, cols: 4, header: true },
		data: [
			["Plan", "Basic", "Pro", "Enterprise"],
			["Price", "$9/month", "$29/month", "$99/month"],
			["Features", "Up to 5 users", "Up to 25 users", "Unlimited users"],
			["Storage", "10 GB", "100 GB", "1 TB"],
		],
	},
	"comparison-table": {
		name: "Feature Comparison",
		template: { rows: 5, cols: 4, header: true },
		data: [
			["Feature", "Product A", "Product B", "Product C"],
			["Speed", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
			["Ease of Use", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐⭐"],
			["Support", "⭐⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐"],
			["Value", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐"],
		],
	},
	"schedule-table": {
		name: "Weekly Schedule",
		template: { rows: 6, cols: 6, header: true },
		data: [
			["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
			["9:00 AM", "Meeting", "Work", "Meeting", "Work", "Work"],
			["10:00 AM", "Work", "Meeting", "Work", "Work", "Meeting"],
			["11:00 AM", "Break", "Break", "Break", "Break", "Break"],
			["12:00 PM", "Lunch", "Lunch", "Lunch", "Lunch", "Lunch"],
			["1:00 PM", "Work", "Work", "Work", "Work", "Work"],
		],
	},
	"data-table": {
		name: "Data Analysis",
		template: { rows: 5, cols: 5, header: true },
		data: [
			["Metric", "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
			["Revenue", "$10,000", "$12,000", "$15,000", "$18,000"],
			["Users", "1,200", "1,450", "1,800", "2,100"],
			["Growth", "+15%", "+20%", "+25%", "+30%"],
			["Satisfaction", "4.2/5", "4.3/5", "4.4/5", "4.5/5"],
		],
	},
};

// Get table dimensions from HTML
export function getTableDimensions(tableHtml: string): {
	rows: number;
	cols: number;
} {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return { rows: 0, cols: 0 };

	const rows = table.querySelectorAll("tr").length;
	const cols =
		table.querySelector("tr")?.querySelectorAll("td, th").length || 0;

	return { rows, cols };
}

// Add row to existing table
export function addTableRow(tableHtml: string, insertAfter?: number): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table tbody");
	if (!table) return tableHtml;

	const rows = table.querySelectorAll("tr");
	const cols = rows[0]?.querySelectorAll("td, th").length || 1;

	const newRow = document.createElement("tr");
	for (let c = 0; c < cols; c++) {
		const newCell = document.createElement("td");
		newCell.textContent = `Cell ${rows.length + 1}-${c + 1}`;
		newRow.appendChild(newCell);
	}

	if (
		insertAfter !== undefined &&
		insertAfter < rows.length &&
		rows[insertAfter]
	) {
		rows[insertAfter]!.insertAdjacentElement("afterend", newRow);
	} else {
		table.appendChild(newRow);
	}

	return tempDiv.innerHTML;
}

// Advanced table operations

// Convert table to different formats
export function tableToMarkdown(tableHtml: string): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return "";

	const rows = table.querySelectorAll("tr");
	const markdownRows: string[] = [];

	rows.forEach((row, index) => {
		const cells = row.querySelectorAll("th, td");
		const rowData: string[] = [];

		cells.forEach((cell) => {
			// Escape pipe characters in cell content
			const content = cell.textContent?.replace(/\|/g, "\\|") || "";
			rowData.push(content);
		});

		markdownRows.push(`| ${rowData.join(" | ")} |`);

		// Add header separator after first row
		if (index === 0 && rowData.length > 0) {
			markdownRows.push(`| ${rowData.map(() => "---").join(" | ")} |`);
		}
	});

	return markdownRows.join("\n");
}

// Convert table to CSV
export function tableToCSV(tableHtml: string): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return "";

	const rows = table.querySelectorAll("tr");
	const csvRows: string[] = [];

	rows.forEach((row) => {
		const cells = row.querySelectorAll("th, td");
		const rowData: string[] = [];

		cells.forEach((cell) => {
			// Escape quotes and wrap in quotes if contains comma, quote, or newline
			const content = cell.textContent?.replace(/"/g, '""') || "";
			if (
				content.includes(",") ||
				content.includes('"') ||
				content.includes("\n")
			) {
				rowData.push(`"${content}"`);
			} else {
				rowData.push(content);
			}
		});

		csvRows.push(rowData.join(","));
	});

	return csvRows.join("\n");
}

// Import CSV data into table
export function csvToTable(csvText: string, hasHeader: boolean = true): string {
	const lines = csvText.split("\n").filter((line) => line.trim());
	if (lines.length === 0) return createTableHTML(1, 1);

	const data: string[][] = lines.map((line) => {
		const result: string[] = [];
		let current = "";
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++; // Skip next quote
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === "," && !inQuotes) {
				result.push(current);
				current = "";
			} else {
				current += char;
			}
		}
		result.push(current);
		return result;
	});

	return createTableWithData(data, hasHeader);
}

// Get table statistics
export function getTableStats(tableHtml: string): {
	rows: number;
	cols: number;
	cells: number;
	mergedCells: number;
	emptyCells: number;
} {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table)
		return { rows: 0, cols: 0, cells: 0, mergedCells: 0, emptyCells: 0 };

	const rows = table.querySelectorAll("tr");
	const rowCount = rows.length;
	const colCount = rows[0]?.querySelectorAll("td, th").length || 0;
	const totalCells = rowCount * colCount;

	let mergedCells = 0;
	let emptyCells = 0;

	rows.forEach((row) => {
		const cells = row.querySelectorAll("td, th");
		cells.forEach((cell) => {
			if (cell.hasAttribute("colspan") || cell.hasAttribute("rowspan")) {
				mergedCells++;
			}
			if (!cell.textContent?.trim()) {
				emptyCells++;
			}
		});
	});

	return {
		rows: rowCount,
		cols: colCount,
		cells: totalCells,
		mergedCells,
		emptyCells,
	};
}

// Validate table structure
export function validateTable(tableHtml: string): {
	isValid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) {
		errors.push("No table found");
		return { isValid: false, errors, warnings };
	}

	const rows = table.querySelectorAll("tr");
	if (rows.length === 0) {
		errors.push("Table has no rows");
		return { isValid: false, errors, warnings };
	}

	// Check for consistent column count
	const firstRow = rows[0];
	if (!firstRow) {
		errors.push("Table has no valid rows");
		return { isValid: false, errors, warnings };
	}

	const firstRowCols = firstRow.querySelectorAll("td, th").length;
	let inconsistentCols = false;

	rows.forEach((row, index) => {
		const cols = row.querySelectorAll("td, th").length;
		if (cols !== firstRowCols) {
			inconsistentCols = true;
			warnings.push(
				`Row ${index + 1} has ${cols} columns, expected ${firstRowCols}`,
			);
		}
	});

	if (inconsistentCols) {
		warnings.push("Table has inconsistent column counts across rows");
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
}

// Auto-format table (clean up spacing, alignment)
export function formatTable(tableHtml: string): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return tableHtml;

	// Add proper classes and structure
	table.className = "border-collapse table-auto w-full my-4";

	// Ensure all cells have proper padding
	const cells = table.querySelectorAll("td, th");
	cells.forEach((cell) => {
		if (!cell.className.includes("px-") && !cell.className.includes("py-")) {
			cell.className = (cell.className + " px-4 py-3").trim();
		}
	});

	return tempDiv.innerHTML;
}

// Add column to existing table
export function addTableColumn(
	tableHtml: string,
	insertAfter?: number,
): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return tableHtml;

	const rows = table.querySelectorAll("tr");
	const insertIndex = insertAfter !== undefined ? insertAfter + 1 : -1;

	rows.forEach((row, rowIndex) => {
		const cells = row.querySelectorAll("td, th");
		const newCell = document.createElement(
			rowIndex === 0 && row.closest("thead") ? "th" : "td",
		);
		newCell.textContent = `Cell ${rowIndex + 1}-${cells.length + 1}`;

		if (insertIndex >= 0 && insertIndex < cells.length && cells[insertIndex]) {
			cells[insertIndex]!.insertAdjacentElement("afterend", newCell);
		} else {
			row.appendChild(newCell);
		}
	});

	return tempDiv.innerHTML;
}

// Delete row from table
export function deleteTableRow(tableHtml: string, rowIndex: number): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return tableHtml;

	const rows = table.querySelectorAll("tr");
	if (rowIndex < rows.length && rows[rowIndex]) {
		rows[rowIndex]!.remove();
	}

	return tempDiv.innerHTML;
}

// Delete column from table
export function deleteTableColumn(tableHtml: string, colIndex: number): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return tableHtml;

	const rows = table.querySelectorAll("tr");
	rows.forEach((row) => {
		const cells = row.querySelectorAll("td, th");
		if (colIndex < cells.length && cells[colIndex]) {
			cells[colIndex]!.remove();
		}
	});

	return tempDiv.innerHTML;
}

// Merge cells in table
export function mergeTableCells(
	tableHtml: string,
	startRow: number,
	startCol: number,
	endRow: number,
	endCol: number,
): string {
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = tableHtml;

	const table = tempDiv.querySelector("table");
	if (!table) return tableHtml;

	const rows = table.querySelectorAll("tr");
	const firstRow = rows[0];
	if (
		!firstRow ||
		startRow >= rows.length ||
		startCol >= firstRow.querySelectorAll("td, th").length
	) {
		return tableHtml;
	}

	// For simplicity, we'll just set colspan/rowspan on the first cell
	// In a real implementation, you'd want more sophisticated merging logic
	const firstCell = rows[startRow]?.querySelectorAll("td, th")[startCol];
	if (firstCell) {
		const colSpan = endCol - startCol + 1;
		const rowSpan = endRow - startRow + 1;

		if (colSpan > 1) firstCell.setAttribute("colspan", colSpan.toString());
		if (rowSpan > 1) firstCell.setAttribute("rowspan", rowSpan.toString());

		// Remove merged cells
		for (let r = startRow; r <= endRow; r++) {
			for (let c = startCol; c <= endCol; c++) {
				if (r === startRow && c === startCol) continue;
				const cell = rows[r]?.querySelectorAll("td, th")[c];
				if (cell) cell.remove();
			}
		}
	}

	return tempDiv.innerHTML;
}
