import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportToCSV(data: any[], filename = "job_applications.csv") {
  if (!data || data.length === 0) return;

  // Flatten and format data for CSV
  const formattedData = data.map((item) => ({
    Company: item.company,
    Role: item.role,
    Location: item.location || "N/A",
    Salary: item.salary || "N/A",
    Status: item.status,
    "Date Applied": new Date(item.createdAt).toLocaleDateString(),
    "Job URL": item.jobUrl || "",
  }));

  const csv = Papa.unparse(formattedData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: any[], filename = "job_applications_report.pdf") {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("Job Applications Report", 14, 22);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Table Data
  const tableColumn = ["Company", "Role", "Status", "Date", "Location"];
  const tableRows = data.map(item => [
    item.company,
    item.role,
    item.status,
    new Date(item.createdAt).toLocaleDateString(),
    item.location || "N/A"
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
  });

  doc.save(filename);
}
