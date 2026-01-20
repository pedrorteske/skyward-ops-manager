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

  // === OPERATOR/AIRCRAFT INFO ===
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Operator:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.operator, margin + 20, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Marks of Registration:', pageWidth / 2 - 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.marksOfRegistration, pageWidth / 2 + 25, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Aircraft Type:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.aircraftType, margin + 25, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('GenDec No.:', pageWidth / 2 - 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.number, pageWidth / 2 + 15, currentY);

  currentY += 6;
  drawLine(currentY);
  currentY += 5;

  // === FLIGHT INFO ===
  doc.setFont('helvetica', 'bold');
  doc.text('Departure:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${gendec.airportDeparture} - ${format(new Date(gendec.dateDeparture), 'dd/MM/yyyy')}`, margin + 22, currentY);

  doc.setFont('helvetica', 'bold');
  doc.text('Arrival:', pageWidth / 2 - 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${gendec.airportArrival} - ${format(new Date(gendec.dateArrival), 'dd/MM/yyyy')}`, pageWidth / 2, currentY);

  currentY += 6;
  drawLine(currentY);
  currentY += 5;

  // === CREW MEMBERS TABLE ===
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CREW MEMBERS', pageWidth / 2, currentY + 4, { align: 'center' });
  currentY += 7;

  // Table header
  const crewColWidths = [20, 45, 30, 25, 25, 25];
  const crewHeaders = ['Type', 'Name', 'Passport/ID', 'Exp. Date', 'D.O.B.', 'Nationality'];
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  let colX = margin;
  crewHeaders.forEach((header, i) => {
    doc.text(header, colX + 1, currentY + 3);
    colX += crewColWidths[i];
  });
  currentY += 5;
  drawLine(currentY, [200, 200, 200]);
  
  // Crew rows
  doc.setFont('helvetica', 'normal');
  gendec.crewMembers.forEach(crew => {
    colX = margin;
    doc.text(crew.crewType, colX + 1, currentY + 4);
    colX += crewColWidths[0];
    doc.text(crew.crewName.substring(0, 25), colX + 1, currentY + 4);
    colX += crewColWidths[1];
    doc.text(crew.passportOrId, colX + 1, currentY + 4);
    colX += crewColWidths[2];
    doc.text(crew.documentExpiration ? format(new Date(crew.documentExpiration), 'dd/MM/yy') : '', colX + 1, currentY + 4);
    colX += crewColWidths[3];
    doc.text(crew.dateOfBirth ? format(new Date(crew.dateOfBirth), 'dd/MM/yy') : '', colX + 1, currentY + 4);
    colX += crewColWidths[4];
    doc.text(crew.nationality, colX + 1, currentY + 4);
    currentY += 5;
  });

  currentY += 3;
  drawLine(currentY);
  currentY += 5;

  // === PASSENGERS TABLE ===
  if (gendec.passengers.length > 0) {
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PASSENGERS', pageWidth / 2, currentY + 4, { align: 'center' });
    currentY += 7;

    const paxColWidths = [50, 35, 30, 30, 25];
    const paxHeaders = ['Name', 'Passport/ID', 'Exp. Date', 'D.O.B.', 'Nationality'];

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    colX = margin;
    paxHeaders.forEach((header, i) => {
      doc.text(header, colX + 1, currentY + 3);
      colX += paxColWidths[i];
    });
    currentY += 5;
    drawLine(currentY, [200, 200, 200]);

    doc.setFont('helvetica', 'normal');
    gendec.passengers.forEach(pax => {
      colX = margin;
      doc.text(pax.passengerName.substring(0, 30), colX + 1, currentY + 4);
      colX += paxColWidths[0];
      doc.text(pax.passportOrId, colX + 1, currentY + 4);
      colX += paxColWidths[1];
      doc.text(pax.documentExpiration ? format(new Date(pax.documentExpiration), 'dd/MM/yy') : '', colX + 1, currentY + 4);
      colX += paxColWidths[2];
      doc.text(pax.dateOfBirth ? format(new Date(pax.dateOfBirth), 'dd/MM/yy') : '', colX + 1, currentY + 4);
      colX += paxColWidths[3];
      doc.text(pax.nationality, colX + 1, currentY + 4);
      currentY += 5;
    });

    currentY += 3;
    drawLine(currentY);
    currentY += 5;
  }

  // === DECLARATION OF HEALTH ===
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DECLARATION OF HEALTH', pageWidth / 2, currentY + 4, { align: 'center' });
  currentY += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Persons with illness:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.healthDeclaration.personsIllness || 'NIL', margin + 35, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Other conditions:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.healthDeclaration.otherConditions || 'NIL', margin + 30, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Disinsecting details:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(gendec.healthDeclaration.disinsectingDetails || 'NIL', margin + 35, currentY);
  currentY += 7;

  // Signature line for health
  doc.text('Signature: ____________________________', margin, currentY);
  doc.text('Date: ______________', pageWidth - margin - 45, currentY);
  currentY += 4;
  doc.setFontSize(6);
  doc.text('(Crew Member Concerned)', margin + 20, currentY);

  currentY += 6;
  drawLine(currentY);
  currentY += 5;

  // === FOR OFFICIAL USE ONLY ===
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FOR OFFICIAL USE ONLY', pageWidth / 2, currentY + 4, { align: 'center' });
  currentY += 7;

  // Empty box for officials
  doc.setDrawColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 25, 'S');
  currentY += 28;

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
