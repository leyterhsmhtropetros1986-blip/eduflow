import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToExcel(data: any[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportToPDF(
  title: string,
  headers: string[],
  rows: any[][],
  fileName: string
) {
  const doc = new jsPDF();

  doc.text(title, 14, 15);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
  });

  doc.save(`${fileName}.pdf`);
}