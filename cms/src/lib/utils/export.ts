export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printSalesReportPdf(
  title: string,
  period: string,
  stats: { label: string; value: string; delta: string }[],
  monthlyRows: { month: string; revenueMillions: number }[]
): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    window.print();
    return;
  }

  const statHtml = stats
    .map(
      (s) => `
      <div style="border:1px solid #A9997C;border-radius:10px;padding:16px;background:#FBF9F4;">
        <div style="font-size:12px;color:#52615B;margin-bottom:6px;">${s.label}</div>
        <div style="font-size:24px;font-weight:700;color:#18352B;">${s.value}</div>
        <div style="font-size:11px;color:#18352B;margin-top:4px;">${s.delta}</div>
      </div>`
    )
    .join("");

  const tableRows = monthlyRows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #DDD2BC;">${r.month} 2026</td>
        <td style="padding:8px 12px;border-bottom:1px solid #DDD2BC;text-align:right;font-weight:600;">Rp${r.revenueMillions}.000.000</td>
      </tr>`
    )
    .join("");

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${title} - ${period}</title>
        <style>
          body { font-family: Georgia, serif; background: #FBF9F4; color: #18352B; padding: 36px; }
          .brand { font-size: 28px; font-weight: 700; color: #18352B; margin-bottom: 4px; }
          .sub { font-family: sans-serif; font-size: 12px; color: #52615B; letter-spacing: 0.12em; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; font-family: sans-serif; }
          table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; margin-top: 16px; }
          th { background: #18352B; color: #FBF9F4; text-align: left; padding: 10px 12px; }
        </style>
      </head>
      <body>
        <div class="brand">Layah Catering</div>
        <div class="sub">${title} · ${period} · Cabang Tidar Atas, Malang</div>
        <div class="grid">${statHtml}</div>
        <h3 style="margin-top:24px;">Tren Penjualan Bulanan (2026)</h3>
        <table>
          <thead><tr><th>Bulan</th><th style="text-align:right;">Pendapatan Bersih</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}
