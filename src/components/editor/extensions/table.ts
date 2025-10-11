import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";

export const CustomTable = Table.configure({
  resizable: true,
  allowTableNodeSelection: true,
  HTMLAttributes: {
    class: "border-collapse table-auto w-full my-4",
  },
});

export const CustomTableRow = TableRow.configure({
  HTMLAttributes: {
    class: "border-b border-gray-200",
  },
});

export const CustomTableHeader = TableHeader.configure({
  HTMLAttributes: {
    class:
      "bg-gray-50 border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 relative",
  },
});

export const CustomTableCell = TableCell.configure({
  HTMLAttributes: {
    class: "border border-gray-200 px-4 py-3 text-gray-700 relative",
  },
});

// TableKit configuration for easy setup
export const TableKit = {
  table: CustomTable,
  tableRow: CustomTableRow,
  tableHeader: CustomTableHeader,
  tableCell: CustomTableCell,
};
