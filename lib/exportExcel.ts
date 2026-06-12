import ExcelJS from "exceljs";

export interface SheetSpec {
  name: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

const thinBorder = () => {
  const c = { style: "thin" as const, color: { argb: "FFE2E8F0" } };
  return { top: c, bottom: c, left: c, right: c };
};

/**
 * Δημιουργεί στοιχισμένο .xlsx με ExcelJS:
 * - bold/μπλε κεφαλίδες, παγωμένη 1η γραμμή, autofilter
 * - αυτόματα πλάτη στηλών, περιγράμματα, zebra rows
 */
export async function exportWorkbook(sheets: SheetSpec[], filename: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "EduFlow";
  wb.created = new Date();

  sheets.forEach((s) => {
    const ws = wb.addWorksheet(s.name.slice(0, 31).replace(/[\\/?*\[\]:]/g, " "));

    ws.addRow(s.headers);
    (s.rows || []).forEach((r) => ws.addRow(r));

    // Κεφαλίδα
    const header = ws.getRow(1);
    header.height = 22;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
      cell.alignment = { vertical: "middle", horizontal: "left" };
      cell.border = thinBorder();
    });

    // Πλάτη στηλών (αυτόματα από περιεχόμενο)
    for (let i = 0; i < s.headers.length; i++) {
      let max = String(s.headers[i] ?? "").length;
      (s.rows || []).forEach((r) => {
        const v = r[i];
        const len = v == null ? 0 : String(v).length;
        if (len > max) max = len;
      });
      ws.getColumn(i + 1).width = Math.min(Math.max(max + 2, 10), 55);
    }

    // Σώμα: περιγράμματα + zebra
    for (let rn = 2; rn <= ws.rowCount; rn++) {
      const row = ws.getRow(rn);
      row.eachCell((cell) => {
        cell.border = thinBorder();
        cell.alignment = { vertical: "middle" };
      });
      if (rn % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        });
      }
    }

    ws.views = [{ state: "frozen", ySplit: 1 }];
    if (s.headers.length > 0) {
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: s.headers.length } };
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
