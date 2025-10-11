import {
  Calendar,
  DollarSign,
  Grid3X3,
  Table2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { advancedTableTemplates, createTableWithData } from "./table-utils";

interface TableTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tableHtml: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  preview: string[][];
}

const templates: Template[] = [
  {
    id: "pricing-table",
    name: "Pricing Table",
    description: "Compare different pricing plans and features",
    icon: <DollarSign size={20} />,
    category: "Business",
    preview: [
      ["Plan", "Basic", "Pro", "Enterprise"],
      ["Price", "$9/mo", "$29/mo", "$99/mo"],
      ["Users", "5", "25", "∞"],
    ],
  },
  {
    id: "comparison-table",
    name: "Feature Comparison",
    description: "Compare features across multiple products",
    icon: <Grid3X3 size={20} />,
    category: "Comparison",
    preview: [
      ["Feature", "Product A", "Product B"],
      ["Speed", "⭐⭐⭐", "⭐⭐⭐⭐⭐"],
      ["Support", "⭐⭐⭐⭐", "⭐⭐⭐"],
    ],
  },
  {
    id: "schedule-table",
    name: "Weekly Schedule",
    description: "Plan your weekly activities and meetings",
    icon: <Calendar size={20} />,
    category: "Planning",
    preview: [
      ["Time", "Monday", "Tuesday"],
      ["9:00 AM", "Meeting", "Work"],
      ["10:00 AM", "Work", "Meeting"],
    ],
  },
  {
    id: "data-table",
    name: "Data Analysis",
    description: "Display metrics and KPIs over time",
    icon: <TrendingUp size={20} />,
    category: "Analytics",
    preview: [
      ["Metric", "Q1", "Q2", "Q3"],
      ["Revenue", "$10K", "$12K", "$15K"],
      ["Growth", "+15%", "+20%", "+25%"],
    ],
  },
];

export default function TableTemplateSelector({
  open,
  onClose,
  onSelect,
}: TableTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);
  const [includeHeader, setIncludeHeader] = useState(true);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCreateCustomTable = () => {
    const tableHtml = createTableWithData(
      Array(customRows).fill(Array(customCols).fill("")),
      includeHeader,
    );
    onSelect(tableHtml);
    onClose();
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;

    const template = advancedTableTemplates[selectedTemplate];
    if (template && template.data) {
      const tableHtml = createTableWithData(template.data, true);
      onSelect(tableHtml);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    setCustomRows(3);
    setCustomCols(3);
    setIncludeHeader(true);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Table Template</DialogTitle>
          <DialogDescription>
            Select a pre-designed table template or create a custom table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedTemplate === template.id
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>

                      {/* Preview Table */}
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          Preview:
                        </div>
                        <div className="space-y-1">
                          {template.preview.slice(0, 3).map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                              {row.map((cell, cellIndex) => (
                                <div
                                  key={cellIndex}
                                  className={`text-xs px-2 py-1 rounded ${
                                    rowIndex === 0
                                      ? "bg-gray-200 font-medium"
                                      : "bg-white"
                                  }`}
                                >
                                  {cell}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Table Creator */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Custom Table</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={customRows}
                  onChange={(e) => setCustomRows(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="cols">Columns</Label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  max="10"
                  value={customCols}
                  onChange={(e) => setCustomCols(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="header"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="header">Include header row</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateCustomTable}>Create Custom Table</Button>
          {selectedTemplate && (
            <Button onClick={handleCreateFromTemplate}>Use Template</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
