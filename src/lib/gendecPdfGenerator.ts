import jsPDF from 'jspdf';
import { GeneralDeclaration } from '@/types/gendec';
import { format } from 'date-fns';

// Convert hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [30, 58, 95]; // Default navy blue
};

export const generateGenDecPdf = async (gendec: GeneralDeclaration) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  const primaryColor = hexToRgb(gendec.primaryColor || '#1E3A5F');
  let currentY = margin;

  // Helper functions
  const drawLine = (y: number, color: [number, number, number] = primaryColor) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const drawRect = (x: number, y: number, w: number, h: number, fill = false) => {
    doc.setDrawColor(...primaryColor);
    if (fill) {
      doc.setFillColor(...primaryColor);
      doc.rect(x, y, w, h, 'F');
    } else {
      doc.rect(x, y, w, h, 'S');
    }
  };

  // === HEADER ===
  // Logo (if available)
  if (gendec.logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = gendec.logoUrl!;
      });
      doc.addImage(img, 'PNG', margin, currentY, 30, 15);
    } catch (e) {
      // Skip logo if loading fails
    }
  }

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('GENERAL DECLARATION', pageWidth / 2, currentY + 8, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`(${gendec.declarationType.charAt(0).toUpperCase() + gendec.declarationType.slice(1)})`, pageWidth / 2, currentY + 14, { align: 'center' });
  
  currentY += 22;
  drawLine(currentY);
  currentY += 5;

  // === OPERATOR/AIRCRAFT INFO (ICAO Standard 3-line format) ===
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  // LINHA 1 - Owner or Operator
  doc.setFont('helvetica', 'bold');
  doc.text('Owner or Operator:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.operator, margin + 35, currentY);
  currentY += 6;

  // LINHA 2 - Marks of Nationality and Registration | Flight No. | Date
  doc.setFont('helvetica', 'bold');
  doc.text('Marks of Nationality and Registration:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.marksOfRegistration, margin + 70, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Flight No.:', pageWidth / 2 + 10, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.flightNumber || '', pageWidth / 2 + 30, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', pageWidth - margin - 30, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(gendec.dateDeparture), 'dd/MM/yyyy'), pageWidth - margin - 15, currentY);
  currentY += 6;

  // LINHA 3 - Departure from | Arrival at
  doc.setFont('helvetica', 'bold');
  doc.text('Departure from:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.airportDeparture, margin + 30, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Arrival at:', pageWidth / 2, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.airportArrival, pageWidth / 2 + 22, currentY);

  currentY += 6;
  drawLine(currentY);
  currentY += 5;

  // === TABLE HELPER FUNCTION ===
  const drawTable = (
    headers: string[],
    colWidths: number[],
    rows: string[][],
    startY: number,
    title: string
  ): number => {
    const rowHeight = 6;
    const headerHeight = 5;
    let y = startY;
    
    // Title bar
    doc.setFillColor(...primaryColor);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title, pageWidth / 2, y + 4, { align: 'center' });
    y += 6;
    
    // Header row with borders
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setDrawColor(...primaryColor);
    
    let x = margin;
    headers.forEach((header, i) => {
      doc.rect(x, y, colWidths[i], headerHeight, 'S');
      doc.text(header, x + colWidths[i] / 2, y + 3.5, { align: 'center' });
      x += colWidths[i];
    });
    y += headerHeight;
    
    // Data rows with borders
    doc.setFont('helvetica', 'normal');
    rows.forEach(row => {
      x = margin;
      row.forEach((cell, i) => {
        doc.rect(x, y, colWidths[i], rowHeight, 'S');
        doc.text(cell, x + colWidths[i] / 2, y + 4, { align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    });
    
    return y;
  };

  // Unified column widths for alignment between tables
  const colWidths = [20, 50, 35, 25, 25, 25]; // Total: 180mm

  // === CREW MEMBERS TABLE ===
  const crewRows = gendec.crewMembers.map(crew => [
    crew.crewType,
    crew.crewName.substring(0, 25),
    crew.passportOrId,
    crew.documentExpiration ? format(new Date(crew.documentExpiration), 'dd/MM/yy') : '',
    crew.dateOfBirth ? format(new Date(crew.dateOfBirth), 'dd/MM/yy') : '',
    crew.nationality
  ]);

  currentY = drawTable(
    ['Type', 'Name', 'Passport/ID', 'Exp. Date', 'D.O.B.', 'Nationality'],
    colWidths,
    crewRows,
    currentY,
    'CREW MEMBERS'
  );
  currentY += 5;

  // === PASSENGERS TABLE ===
  if (gendec.passengers.length > 0) {
    const paxRows = gendec.passengers.map(pax => [
      '', // Empty first column to align with Crew Type column
      pax.passengerName.substring(0, 25),
      pax.passportOrId,
      pax.documentExpiration ? format(new Date(pax.documentExpiration), 'dd/MM/yy') : '',
      pax.dateOfBirth ? format(new Date(pax.dateOfBirth), 'dd/MM/yy') : '',
      pax.nationality
    ]);

    currentY = drawTable(
      ['', 'Name', 'Passport/ID', 'Exp. Date', 'D.O.B.', 'Nationality'],
      colWidths,
      paxRows,
      currentY,
      'PASSENGERS'
    );
    currentY += 5;
  }

  // === DECLARATION OF HEALTH + FOR OFFICIAL USE ONLY (Side by Side) ===
  const leftColWidth = contentWidth * 0.58;
  const rightColWidth = contentWidth * 0.40;
  const gapBetween = contentWidth * 0.02;
  const sectionStartY = currentY;
  
  // Left column: DECLARATION OF HEALTH header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, leftColWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DECLARATION OF HEALTH', margin + leftColWidth / 2, currentY + 4, { align: 'center' });
  
  // Right column: FOR OFFICIAL USE ONLY header
  doc.setFillColor(...primaryColor);
  doc.rect(margin + leftColWidth + gapBetween, currentY, rightColWidth, 6, 'F');
  doc.text('FOR OFFICIAL USE ONLY', margin + leftColWidth + gapBetween + rightColWidth / 2, currentY + 4, { align: 'center' });
  
  currentY += 8;
  const healthStartY = currentY;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  
  // Health table box dimensions
  const tableWidth = leftColWidth - 2;
  const tableX = margin + 1;
  
  // Table 1 - Persons with illness
  let tableY = currentY;
  const healthText1 = 'Persons on board known to be suffering from illness other than airsickness or the effects of accidents: as well as those cases of illness disembarked during the flight';
  const splitHealth1 = doc.splitTextToSize(healthText1, tableWidth - 4);
  const table1Height = splitHealth1.length * 2.5 + 8;
  
  doc.setDrawColor(...primaryColor);
  doc.rect(tableX, tableY, tableWidth, table1Height, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text(splitHealth1, tableX + 2, tableY + 3);
  doc.line(tableX, tableY + splitHealth1.length * 2.5 + 2, tableX + tableWidth, tableY + splitHealth1.length * 2.5 + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.healthDeclaration.personsIllness || 'NIL', tableX + 2, tableY + splitHealth1.length * 2.5 + 5);
  tableY += table1Height + 2;
  
  // Table 2 - Other conditions
  const healthText2 = 'Any other condition on board which may lead to the spread of disease:';
  const splitHealth2 = doc.splitTextToSize(healthText2, tableWidth - 4);
  const table2Height = splitHealth2.length * 2.5 + 8;
  
  doc.rect(tableX, tableY, tableWidth, table2Height, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text(splitHealth2, tableX + 2, tableY + 3);
  doc.line(tableX, tableY + splitHealth2.length * 2.5 + 2, tableX + tableWidth, tableY + splitHealth2.length * 2.5 + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.healthDeclaration.otherConditions || 'NIL', tableX + 2, tableY + splitHealth2.length * 2.5 + 5);
  tableY += table2Height + 2;
  
  // Table 3 - Disinsecting details
  const healthText3 = 'Details of each disinsecting or sanitary treatment (place, date, time, method) during the flight. If no disinsecting has been carried out during the flight give details of most recent disinsecting:';
  const splitHealth3 = doc.splitTextToSize(healthText3, tableWidth - 4);
  const table3Height = splitHealth3.length * 2.5 + 8;
  
  doc.rect(tableX, tableY, tableWidth, table3Height, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text(splitHealth3, tableX + 2, tableY + 3);
  doc.line(tableX, tableY + splitHealth3.length * 2.5 + 2, tableX + tableWidth, tableY + splitHealth3.length * 2.5 + 2);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.healthDeclaration.disinsectingDetails || 'NIL', tableX + 2, tableY + splitHealth3.length * 2.5 + 5);
  tableY += table3Height;
  
  // Right column: Empty box for officials (matching health section height)
  const officialBoxHeight = tableY - healthStartY;
  doc.setDrawColor(...primaryColor);
  doc.rect(margin + leftColWidth + gapBetween, healthStartY, rightColWidth, officialBoxHeight, 'S');
  
  currentY = tableY + 5;

  // === FINAL DECLARATION ===
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  const declaration = 'I declare that all statements and particulars contained in this General Declaration, and in any supplementary forms required to be presented with this General Declaration, are complete, exact and true to the best of my knowledge, and that all through passengers will continue/have continued on the flight.';
  const splitDeclaration = doc.splitTextToSize(declaration, contentWidth);
  doc.text(splitDeclaration, margin, currentY);
  currentY += splitDeclaration.length * 3.5 + 5;

  // Final signature
  doc.setFont('helvetica', 'normal');
  doc.text('Signature: ____________________________', margin, currentY);
  doc.text('Date: ______________', pageWidth - margin - 45, currentY);
  currentY += 4;
  doc.setFontSize(6);
  doc.text('(Authorized Agent or Pilot-in-command)', margin + 20, currentY);

  // === FOOTER ===
  currentY = pageHeight - 10;
  doc.setFontSize(6);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, currentY);
  doc.text('ICAO Standard Format', pageWidth - margin, currentY, { align: 'right' });

  // Save PDF
  doc.save(`GenDec-${gendec.number}.pdf`);
};
