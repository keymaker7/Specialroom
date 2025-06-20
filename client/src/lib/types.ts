// Type definitions for CSV export functions
export type CSVRow = string[];
export type CSVData = CSVRow[];

// Type-safe CSV export helper
export function mapToCSVField(value: any): string {
  return String(value || "");
}

// Type-safe CSV content generator
export function generateCSVContent(data: CSVData): string {
  return data.map((row: CSVRow) => 
    row.map((field: string) => `"${field}"`).join(",")
  ).join("\n");
}