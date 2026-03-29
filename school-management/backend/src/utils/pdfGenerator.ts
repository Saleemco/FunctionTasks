import PDFDocument from "pdfkit";
import { Response } from "express";

interface ReportCardData {
  student: any;
  class: any;
  term: any;
  session: any;
  results: any[];
  gpa: number;
  position: number;
  totalStudents: number;
  attendance: { present: number; absent: number };
}

export const generateReportCardPDF = (data: ReportCardData, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=report-card-${data.student.admissionNo}.pdf`);

  doc.pipe(res);

  // School Header
  doc.fontSize(20).font("Helvetica-Bold").text("EXCELLENCE HIGH SCHOOL", 50, 50, { align: "center" });
  doc.fontSize(12).font("Helvetica").text("123 Education Street, Knowledge City", { align: "center" });
  doc.text("Phone: (123) 456-7890 | Email: info@excellencehigh.edu", { align: "center" });
  doc.moveDown(2);

  // Report Title
  doc.fontSize(16).font("Helvetica-Bold").text("STUDENT REPORT CARD", { align: "center" });
  doc.moveDown(1);

  // Student Info Box
  doc.fontSize(10);
  const infoStartY = doc.y;
  doc.font("Helvetica-Bold").text("STUDENT INFORMATION:", 50, infoStartY);
  doc.font("Helvetica");
  doc.text(`Name: ${data.student.user.firstName} ${data.student.user.lastName}`, 50, infoStartY + 15);
  doc.text(`Admission No: ${data.student.admissionNo}`, 50, infoStartY + 30);
  doc.text(`Class: ${data.class.name}`, 50, infoStartY + 45);
  doc.text(`Session: ${data.session.year}`, 50, infoStartY + 60);

  // Term Info (Right side)
  doc.font("Helvetica-Bold").text("ACADEMIC INFORMATION:", 300, infoStartY);
  doc.font("Helvetica");
  doc.text(`Term: ${data.term.name}`, 300, infoStartY + 15);
  doc.text(`Position: ${data.position} of ${data.totalStudents}`, 300, infoStartY + 30);
  doc.text(`GPA: ${data.gpa}`, 300, infoStartY + 45);

  doc.moveDown(4);

  // Results Table
  const tableTop = doc.y;
  const colWidths = [150, 50, 50, 50, 50, 50, 80];
  const colPositions = [50, 200, 250, 300, 350, 400, 480];

  // Table Header
  doc.fillColor("#f0f0f0").rect(50, tableTop, 510, 20).fill();
  doc.fillColor("#000000").font("Helvetica-Bold");

  const headers = ["Subject", "CA1", "CA2", "Exam", "Total", "Grade", "Remark"];
  headers.forEach((header, i) => {
    doc.text(header, colPositions[i] + 5, tableTop + 5, { width: colWidths[i] - 10, align: "center" });
  });

  // Table Rows
  let rowY = tableTop + 25;
  doc.font("Helvetica").fontSize(9);

  data.results.forEach((result, index) => {
    if (index % 2 === 0) {
      doc.fillColor("#f9f9f9").rect(50, rowY - 2, 510, 18).fill();
    }
    doc.fillColor("#000000");

    doc.text(result.subject.name, colPositions[0] + 5, rowY, { width: colWidths[0] - 10 });
    doc.text(result.ca1.toString(), colPositions[1] + 5, rowY, { width: colWidths[1] - 10, align: "center" });
    doc.text(result.ca2.toString(), colPositions[2] + 5, rowY, { width: colWidths[2] - 10, align: "center" });
    doc.text(result.exam.toString(), colPositions[3] + 5, rowY, { width: colWidths[3] - 10, align: "center" });
    doc.text(result.total.toString(), colPositions[4] + 5, rowY, { width: colWidths[4] - 10, align: "center" });
    doc.text(result.grade, colPositions[5] + 5, rowY, { width: colWidths[5] - 10, align: "center" });

    const remark = getRemark(result.grade);
    doc.text(remark, colPositions[6] + 5, rowY, { width: colWidths[6] - 10, align: "center" });

    rowY += 20;
  });

  // Border
  doc.rect(50, tableTop, 510, rowY - tableTop).stroke();

  doc.moveDown(2);

  // Grading Scale
  doc.fontSize(9).font("Helvetica-Bold").text("GRADING SCALE:", 50);
  doc.font("Helvetica");
  doc.text("A = 70-100 (Excellent) | B = 60-69 (Very Good) | C = 50-59 (Good) | D = 45-49 (Pass) | E = 40-44 (Fair) | F = 0-39 (Fail)", 50, doc.y + 5);

  doc.moveDown(2);

  // Signatures
  const signY = doc.y;
  doc.text("_".repeat(30), 50, signY);
  doc.text("Class Teacher", 50, signY + 10);

  doc.text("_".repeat(30), 250, signY);
  doc.text("Principal", 250, signY + 10);

  doc.text("_".repeat(30), 450, signY);
  doc.text("Parent/Guardian", 450, signY + 10);

  // Footer
  doc.fontSize(8).text(`Generated on: ${new Date().toLocaleDateString()} | This is a computer-generated document.`, 50, 750, { align: "center" });

  doc.end();
};

const getRemark = (grade: string): string => {
  const remarks: Record<string, string> = {
    A: "Excellent",
    B: "Very Good",
    C: "Good",
    D: "Pass",
    E: "Fair",
    F: "Fail",
  };
  return remarks[grade] || "";
};
