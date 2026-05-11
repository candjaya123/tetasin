/**
 * Utility to export hierarchical report data to CSV
 */
export const exportToCSV = (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n"
    + rows.map(e => e.join(",")).join("\n");
    
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportHierarchicalReport = (filename: string, data: any[]) => {
  const headers = ["Kategori/Akun", "Kode", "Saldo"];
  const rows: any[][] = [];

  data.forEach(cat => {
    // Category row
    rows.push([cat.title.toUpperCase(), "", cat.total]);
    // Account rows
    cat.accounts.forEach((acc: any) => {
      rows.push(["  " + acc.name, acc.code, acc.amount]);
    });
    // Spacer
    rows.push(["", "", ""]);
  });

  exportToCSV(filename, headers, rows);
};
