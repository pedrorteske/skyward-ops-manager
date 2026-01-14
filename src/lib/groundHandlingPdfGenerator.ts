import jsPDF from 'jspdf';
import type { 
  GroundHandlingQuotation, 
  IncludedService, 
  AdditionalService,
  chargeUnitLabels 
} from '@/types/groundHandling';

interface GroundHandlingPDFData {
  quotationNumber: string;
  client: {
    name: string;
    type: string;
    operator: string;
    cnpj?: string;
    email: string;
    observations?: string;
  };
  operation: {
    airport: string;
    operationDate: string;
    aircraftType: string;
    aircraftPrefix: string;
    flightType: string;
    eta?: string;
    etd?: string;
    observations?: string;
  };
  serviceValue: number;
  currency: 'BRL' | 'USD';
  includedServices: IncludedService[];
  additionalServices: AdditionalService[];
  applyAdminFee: boolean;
  adminFeePercentage: number;
  adminFeeText: string;
  taxObservation: string;
  payment: {
    method: string;
    pixData: string;
    observations?: string;
  };
  summary: {
    serviceValue: number;
    additionalServicesTotal: number;
    adminFee: number;
    grandTotal: number;
  };
  company: {
    name: string;
    responsibleName: string;
    responsibleRole: string;
    responsiblePhone: string;
    responsibleEmail: string;
  };
  createdAt: string;
}

const chargeUnitLabelsMap: Record<string, string> = {
  utilizacao: 'por utilização',
  hora: 'por hora ou fração',
  movimento: 'por movimento',
};

const paymentMethodLabelsMap: Record<string, string> = {
  antecipado: 'Pagamento Antecipado',
  link: 'Link de Pagamento',
  transferencia: 'Transferência Bancária',
};

export function generateGroundHandlingPDF(data: GroundHandlingPDFData): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Colors
  const primaryColor: [number, number, number] = [30, 64, 175]; // Deep blue
  const accentColor: [number, number, number] = [59, 130, 246]; // Lighter blue
  const successColor: [number, number, number] = [34, 197, 94]; // Green
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const borderColor: [number, number, number] = [226, 232, 240];
  const lightBg: [number, number, number] = [248, 250, 252];

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold' | 'italic';
      color?: [number, number, number];
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    }
  ) => {
    const { fontSize = 10, fontStyle = 'normal', color = textColor, align = 'left', maxWidth } = options || {};
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    pdf.setTextColor(...color);
    if (maxWidth) {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y, { align });
      return lines.length;
    }
    pdf.text(text, x, y, { align });
    return 1;
  };

  // Helper function to draw a line
  const drawLine = (y: number, color: [number, number, number] = borderColor, width: number = 0.3) => {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(width);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // Helper function to draw rounded rect
  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fill: [number, number, number]) => {
    pdf.setFillColor(...fill);
    pdf.roundedRect(x, y, w, h, r, r, 'F');
  };

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: data.currency,
    }).format(value);
  };

  // ===== HEADER =====
  // Header background with gradient effect
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Add accent stripe
  pdf.setFillColor(...accentColor);
  pdf.rect(0, 45, pageWidth, 5, 'F');

  // Logo placeholder / Company name
  addText(data.company.name.toUpperCase(), margin, 20, {
    fontSize: 20,
    fontStyle: 'bold',
    color: [255, 255, 255],
  });
  
  addText('Ground Handling Services', margin, 28, {
    fontSize: 10,
    color: [200, 220, 255],
  });

  // Document type and number
  addText('COTAÇÃO DE SERVIÇOS', pageWidth - margin, 18, {
    fontSize: 14,
    fontStyle: 'bold',
    color: [255, 255, 255],
    align: 'right',
  });
  
  addText(`Nº ${data.quotationNumber}`, pageWidth - margin, 26, {
    fontSize: 11,
    color: [200, 220, 255],
    align: 'right',
  });

  // Date
  addText(`Emissão: ${new Date(data.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - margin, 40, {
    fontSize: 9,
    color: [200, 220, 255],
    align: 'right',
  });

  yPosition = 60;

  // ===== CLIENT & OPERATION INFO =====
  // Two columns layout
  const colWidth = (contentWidth - 10) / 2;
  
  // Client box
  drawRoundedRect(margin, yPosition, colWidth, 55, 3, lightBg);
  
  addText('DADOS DO CLIENTE', margin + 5, yPosition + 8, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  addText(data.client.name || 'Cliente não informado', margin + 5, yPosition + 16, {
    fontSize: 11,
    fontStyle: 'bold',
  });
  
  if (data.client.operator) {
    addText(`Operador: ${data.client.operator}`, margin + 5, yPosition + 23, {
      fontSize: 9,
      color: mutedColor,
    });
  }
  
  if (data.client.cnpj) {
    addText(`CNPJ: ${data.client.cnpj}`, margin + 5, yPosition + 29, {
      fontSize: 9,
      color: mutedColor,
    });
  }
  
  if (data.client.email) {
    addText(`Email: ${data.client.email}`, margin + 5, yPosition + 35, {
      fontSize: 9,
      color: mutedColor,
    });
  }

  // Operation box
  const opBoxX = margin + colWidth + 10;
  drawRoundedRect(opBoxX, yPosition, colWidth, 55, 3, lightBg);
  
  addText('DADOS DA OPERAÇÃO', opBoxX + 5, yPosition + 8, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  addText(data.operation.airport || 'Aeroporto não informado', opBoxX + 5, yPosition + 16, {
    fontSize: 11,
    fontStyle: 'bold',
  });
  
  if (data.operation.operationDate) {
    addText(`Data: ${new Date(data.operation.operationDate).toLocaleDateString('pt-BR')}`, opBoxX + 5, yPosition + 23, {
      fontSize: 9,
      color: mutedColor,
    });
  }
  
  addText(`Aeronave: ${data.operation.aircraftType} - ${data.operation.aircraftPrefix}`, opBoxX + 5, yPosition + 29, {
    fontSize: 9,
    color: mutedColor,
  });
  
  if (data.operation.eta || data.operation.etd) {
    addText(`ETA: ${data.operation.eta || '-'} | ETD: ${data.operation.etd || '-'}`, opBoxX + 5, yPosition + 35, {
      fontSize: 9,
      color: mutedColor,
    });
  }
  
  if (data.operation.flightType) {
    addText(`Tipo: ${data.operation.flightType}`, opBoxX + 5, yPosition + 41, {
      fontSize: 9,
      color: mutedColor,
    });
  }

  yPosition += 65;

  // ===== SERVICE VALUE HIGHLIGHT =====
  drawRoundedRect(margin, yPosition, contentWidth, 25, 3, primaryColor);
  
  addText('VALOR DO ATENDIMENTO', margin + 10, yPosition + 10, {
    fontSize: 10,
    color: [200, 220, 255],
  });
  
  addText(formatCurrency(data.serviceValue), margin + 10, yPosition + 19, {
    fontSize: 16,
    fontStyle: 'bold',
    color: [255, 255, 255],
  });
  
  addText('(impostos não incluídos)', pageWidth - margin - 10, yPosition + 15, {
    fontSize: 9,
    color: [200, 220, 255],
    align: 'right',
  });

  yPosition += 35;

  // ===== INCLUDED SERVICES =====
  const checkedServices = data.includedServices.filter(s => s.checked);
  
  addText('SERVIÇOS INCLUSOS NO ATENDIMENTO', margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  yPosition += 6;
  drawLine(yPosition, accentColor, 0.5);
  yPosition += 6;

  if (checkedServices.length > 0) {
    checkedServices.forEach((service) => {
      // Checkmark icon simulation
      pdf.setFillColor(...successColor);
      pdf.circle(margin + 3, yPosition - 1, 2, 'F');
      
      addText('✓', margin + 1.5, yPosition + 0.5, {
        fontSize: 7,
        fontStyle: 'bold',
        color: [255, 255, 255],
      });
      
      addText(service.name, margin + 10, yPosition, {
        fontSize: 9,
      });
      yPosition += 6;
    });
  } else {
    addText('Nenhum serviço incluso selecionado', margin + 10, yPosition, {
      fontSize: 9,
      color: mutedColor,
    });
    yPosition += 6;
  }

  yPosition += 8;

  // ===== ADDITIONAL SERVICES =====
  const activeAdditionalServices = data.additionalServices.filter(s => s.unitPrice > 0);
  
  addText('SERVIÇOS ADICIONAIS (NÃO INCLUSOS)', margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  yPosition += 6;
  drawLine(yPosition, accentColor, 0.5);
  yPosition += 6;

  if (activeAdditionalServices.length > 0) {
    // Table header
    pdf.setFillColor(...lightBg);
    pdf.rect(margin, yPosition - 3, contentWidth, 8, 'F');
    
    addText('Serviço', margin + 5, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: mutedColor });
    addText('Valor Unit.', margin + contentWidth * 0.5, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: mutedColor, align: 'center' });
    addText('Cobrança', margin + contentWidth * 0.75, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: mutedColor, align: 'center' });
    
    yPosition += 8;
    
    activeAdditionalServices.forEach((service, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(252, 252, 253);
        pdf.rect(margin, yPosition - 3, contentWidth, 7, 'F');
      }
      
      addText(service.name, margin + 5, yPosition + 1, { fontSize: 9 });
      addText(formatCurrency(service.unitPrice), margin + contentWidth * 0.5, yPosition + 1, { fontSize: 9, align: 'center' });
      addText(chargeUnitLabelsMap[service.chargeUnit] || service.chargeUnit, margin + contentWidth * 0.75, yPosition + 1, { fontSize: 8, color: mutedColor, align: 'center' });
      
      if (service.unavailableNote) {
        yPosition += 5;
        addText(`* ${service.unavailableNote}`, margin + 8, yPosition + 1, { fontSize: 7, color: mutedColor });
      }
      
      yPosition += 7;
    });
  } else {
    addText('Não há serviços adicionais nesta cotação', margin + 5, yPosition, {
      fontSize: 9,
      color: mutedColor,
    });
    yPosition += 6;
  }

  yPosition += 10;

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = margin;
  }

  // ===== FINANCIAL SUMMARY =====
  drawRoundedRect(margin, yPosition, contentWidth, 45, 3, lightBg);
  
  addText('RESUMO FINANCEIRO', margin + 5, yPosition + 8, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  const summaryStartY = yPosition + 15;
  const summaryCol1 = margin + 10;
  const summaryCol2 = pageWidth - margin - 10;
  
  addText('Valor do Atendimento:', summaryCol1, summaryStartY, { fontSize: 9, color: mutedColor });
  addText(formatCurrency(data.summary.serviceValue), summaryCol2, summaryStartY, { fontSize: 9, align: 'right' });
  
  addText('Serviços Adicionais:', summaryCol1, summaryStartY + 6, { fontSize: 9, color: mutedColor });
  addText(formatCurrency(data.summary.additionalServicesTotal), summaryCol2, summaryStartY + 6, { fontSize: 9, align: 'right' });
  
  if (data.applyAdminFee) {
    addText(`Taxa Administrativa (${data.adminFeePercentage}%):`, summaryCol1, summaryStartY + 12, { fontSize: 9, color: mutedColor });
    addText(formatCurrency(data.summary.adminFee), summaryCol2, summaryStartY + 12, { fontSize: 9, align: 'right' });
  }
  
  drawLine(summaryStartY + 18, borderColor);
  
  addText('TOTAL GERAL:', summaryCol1, summaryStartY + 26, { fontSize: 11, fontStyle: 'bold' });
  addText(formatCurrency(data.summary.grandTotal), summaryCol2, summaryStartY + 26, { fontSize: 12, fontStyle: 'bold', color: primaryColor, align: 'right' });

  yPosition += 55;

  // ===== OBSERVATIONS =====
  if (data.adminFeeText || data.taxObservation) {
    addText('OBSERVAÇÕES', margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold',
      color: primaryColor,
    });
    
    yPosition += 6;
    drawLine(yPosition, accentColor, 0.5);
    yPosition += 6;
    
    if (data.adminFeeText) {
      addText(`• ${data.adminFeeText}`, margin + 3, yPosition, {
        fontSize: 8,
        color: mutedColor,
        maxWidth: contentWidth - 10,
      });
      yPosition += 10;
    }
    
    if (data.taxObservation) {
      addText(`• ${data.taxObservation}`, margin + 3, yPosition, {
        fontSize: 8,
        color: mutedColor,
        maxWidth: contentWidth - 10,
      });
      yPosition += 10;
    }
  }

  yPosition += 5;

  // ===== PAYMENT INFO =====
  if (data.payment.pixData) {
    addText('DADOS PARA PAGAMENTO', margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold',
      color: primaryColor,
    });
    
    yPosition += 6;
    drawLine(yPosition, accentColor, 0.5);
    yPosition += 6;
    
    addText(`Forma: ${paymentMethodLabelsMap[data.payment.method] || data.payment.method}`, margin + 3, yPosition, {
      fontSize: 9,
    });
    yPosition += 6;
    
    addText(`PIX / Dados bancários: ${data.payment.pixData}`, margin + 3, yPosition, {
      fontSize: 9,
    });
    yPosition += 10;
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 35;
  
  drawLine(footerY - 5, borderColor);
  
  // Contact info
  addText(data.company.name, margin, footerY, { fontSize: 9, fontStyle: 'bold', color: primaryColor });
  addText(data.company.responsibleName, margin, footerY + 5, { fontSize: 8, color: mutedColor });
  addText(data.company.responsibleRole, margin, footerY + 10, { fontSize: 8, color: mutedColor });
  
  if (data.company.responsiblePhone) {
    addText(`Tel: ${data.company.responsiblePhone}`, pageWidth / 2, footerY + 5, { fontSize: 8, color: mutedColor, align: 'center' });
  }
  if (data.company.responsibleEmail) {
    addText(data.company.responsibleEmail, pageWidth / 2, footerY + 10, { fontSize: 8, color: mutedColor, align: 'center' });
  }
  
  addText(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth - margin, footerY + 5, {
    fontSize: 7,
    color: mutedColor,
    align: 'right',
  });

  // Validity notice
  pdf.setFillColor(255, 251, 235);
  pdf.rect(margin, footerY + 15, contentWidth, 12, 'F');
  pdf.setDrawColor(245, 158, 11);
  pdf.setLineWidth(0.3);
  pdf.rect(margin, footerY + 15, contentWidth, 12, 'S');
  
  addText('⚠ Esta cotação é válida por 7 dias a partir da data de emissão. Valores sujeitos a alteração após este período.', pageWidth / 2, footerY + 22, {
    fontSize: 8,
    color: [180, 83, 9],
    align: 'center',
  });

  // Save the PDF
  const fileName = `cotacao_ground_handling_${data.quotationNumber.replace(/\//g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
