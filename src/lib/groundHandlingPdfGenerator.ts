// Ground Handling Quotation PDF Generator
// Uses the standardized PDF core module with specific sections for ground handling

import jsPDF from 'jspdf';
import type { IncludedService, AdditionalService } from '@/types/groundHandling';
import { companyConfig, getFullAddress } from '@/config/companyConfig';
import {
  createPDF,
  addText,
  drawLine,
  drawRoundedRect,
  formatCurrency,
  checkPageBreak,
  drawHeader,
  drawFooter,
  defaultColors,
} from './pdf/pdfCore';
import { documentColorSchemes } from './pdf/types';

export interface GroundHandlingPDFData {
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
  const { pdf, config } = createPDF();
  
  // Get color scheme for ground handling
  const colorScheme = documentColorSchemes.ground_handling;
  const primaryColor = colorScheme.primary;
  const accentColor = colorScheme.accent;
  const successColor = defaultColors.success;

  // Use provided company data or fallback to config
  const pdfCompany = {
    name: data.company.name || companyConfig.name,
    cnpj: companyConfig.cnpj,
    address: getFullAddress(),
    phone: data.company.responsiblePhone || companyConfig.phone,
    email: data.company.responsibleEmail || companyConfig.email,
    responsibleName: data.company.responsibleName || companyConfig.responsibleName,
    responsibleRole: data.company.responsibleRole || companyConfig.responsibleRole,
  };

  // Draw header
  let yPosition = drawHeader(pdf, config, {
    companyName: pdfCompany.name,
    subtitle: 'Ground Handling Services',
    documentTitle: 'Cotação de Serviços',
    documentNumber: data.quotationNumber,
    createdAt: data.createdAt,
    primaryColor,
    accentColor,
  });

  // ===== CLIENT & OPERATION INFO =====
  const colWidth = (config.contentWidth - 10) / 2;
  
  // Client box
  drawRoundedRect(pdf, config.margin, yPosition, colWidth, 55, 3, config.colors.lightBg);
  
  addText(pdf, 'DADOS DO CLIENTE', config.margin + 5, yPosition + 8, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  addText(pdf, data.client.name || 'Cliente não informado', config.margin + 5, yPosition + 16, {
    fontSize: 11,
    fontStyle: 'bold',
  });
  
  let clientY = yPosition + 23;
  
  if (data.client.operator) {
    addText(pdf, `Operador: ${data.client.operator}`, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    clientY += 6;
  }
  
  if (data.client.cnpj) {
    addText(pdf, `CNPJ: ${data.client.cnpj}`, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    clientY += 6;
  }
  
  if (data.client.email) {
    addText(pdf, `Email: ${data.client.email}`, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
    });
  }

  // Operation box
  const opBoxX = config.margin + colWidth + 10;
  drawRoundedRect(pdf, opBoxX, yPosition, colWidth, 55, 3, config.colors.lightBg);
  
  addText(pdf, 'DADOS DA OPERAÇÃO', opBoxX + 5, yPosition + 8, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  addText(pdf, data.operation.airport || 'Aeroporto não informado', opBoxX + 5, yPosition + 16, {
    fontSize: 11,
    fontStyle: 'bold',
  });
  
  let opY = yPosition + 23;
  
  if (data.operation.operationDate) {
    addText(pdf, `Data: ${new Date(data.operation.operationDate).toLocaleDateString('pt-BR')}`, opBoxX + 5, opY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    opY += 6;
  }
  
  addText(pdf, `Aeronave: ${data.operation.aircraftType} - ${data.operation.aircraftPrefix}`, opBoxX + 5, opY, {
    fontSize: 9,
    color: config.colors.muted,
  });
  opY += 6;
  
  if (data.operation.eta || data.operation.etd) {
    addText(pdf, `ETA: ${data.operation.eta || '-'} | ETD: ${data.operation.etd || '-'}`, opBoxX + 5, opY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    opY += 6;
  }
  
  if (data.operation.flightType) {
    addText(pdf, `Tipo: ${data.operation.flightType}`, opBoxX + 5, opY, {
      fontSize: 9,
      color: config.colors.muted,
    });
  }

  yPosition += 65;

  // ===== SERVICE VALUE HIGHLIGHT =====
  drawRoundedRect(pdf, config.margin, yPosition, config.contentWidth, 25, 3, primaryColor);
  
  addText(pdf, 'VALOR DO ATENDIMENTO', config.margin + 10, yPosition + 10, {
    fontSize: 10,
    color: [200, 220, 255],
  });
  
  addText(pdf, formatCurrency(data.serviceValue, data.currency), config.margin + 10, yPosition + 19, {
    fontSize: 16,
    fontStyle: 'bold',
    color: config.colors.white,
  });
  
  addText(pdf, '(impostos não incluídos)', config.pageWidth - config.margin - 10, yPosition + 15, {
    fontSize: 9,
    color: [200, 220, 255],
    align: 'right',
  });

  yPosition += 35;

  // ===== INCLUDED SERVICES =====
  const checkedServices = data.includedServices.filter(s => s.checked);
  
  addText(pdf, 'SERVIÇOS INCLUSOS NO ATENDIMENTO', config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  yPosition += 6;
  drawLine(pdf, config, yPosition, accentColor, 0.5);
  yPosition += 6;

  if (checkedServices.length > 0) {
    checkedServices.forEach((service) => {
      // Checkmark icon
      pdf.setFillColor(...successColor);
      pdf.circle(config.margin + 3, yPosition - 1, 2, 'F');
      
      addText(pdf, '✓', config.margin + 1.5, yPosition + 0.5, {
        fontSize: 7,
        fontStyle: 'bold',
        color: config.colors.white,
      });
      
      addText(pdf, service.name, config.margin + 10, yPosition, {
        fontSize: 9,
      });
      yPosition += 6;
    });
  } else {
    addText(pdf, 'Nenhum serviço incluso selecionado', config.margin + 10, yPosition, {
      fontSize: 9,
      color: config.colors.muted,
    });
    yPosition += 6;
  }

  yPosition += 8;

  // ===== ADDITIONAL SERVICES =====
  const activeAdditionalServices = data.additionalServices.filter(s => s.unitPrice > 0);
  
  addText(pdf, 'SERVIÇOS ADICIONAIS (NÃO INCLUSOS)', config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  yPosition += 6;
  drawLine(pdf, config, yPosition, accentColor, 0.5);
  yPosition += 6;

  if (activeAdditionalServices.length > 0) {
    // Table header
    pdf.setFillColor(...config.colors.lightBg);
    pdf.rect(config.margin, yPosition - 3, config.contentWidth, 8, 'F');
    
    addText(pdf, 'Serviço', config.margin + 5, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted });
    addText(pdf, 'Valor Unit.', config.margin + config.contentWidth * 0.5, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted, align: 'center' });
    addText(pdf, 'Cobrança', config.margin + config.contentWidth * 0.75, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted, align: 'center' });
    
    yPosition += 8;
    
    activeAdditionalServices.forEach((service, index) => {
      yPosition = checkPageBreak(pdf, config, yPosition, 12);

      if (index % 2 === 0) {
        pdf.setFillColor(252, 252, 253);
        pdf.rect(config.margin, yPosition - 3, config.contentWidth, 7, 'F');
      }
      
      addText(pdf, service.name, config.margin + 5, yPosition + 1, { fontSize: 9 });
      addText(pdf, formatCurrency(service.unitPrice, data.currency), config.margin + config.contentWidth * 0.5, yPosition + 1, { fontSize: 9, align: 'center' });
      addText(pdf, chargeUnitLabelsMap[service.chargeUnit] || service.chargeUnit, config.margin + config.contentWidth * 0.75, yPosition + 1, { fontSize: 8, color: config.colors.muted, align: 'center' });
      
      if (service.unavailableNote) {
        yPosition += 5;
        addText(pdf, `* ${service.unavailableNote}`, config.margin + 8, yPosition + 1, { fontSize: 7, color: config.colors.muted });
      }
      
      yPosition += 7;
    });
  } else {
    addText(pdf, 'Não há serviços adicionais nesta cotação', config.margin + 5, yPosition, {
      fontSize: 9,
      color: config.colors.muted,
    });
    yPosition += 6;
  }

  yPosition += 10;

  // Check if we need a new page
  yPosition = checkPageBreak(pdf, config, yPosition, 60);

  // ===== FINANCIAL SUMMARY =====
  drawRoundedRect(pdf, config.margin, yPosition, config.contentWidth, 45, 3, config.colors.lightBg);
  
  addText(pdf, 'RESUMO FINANCEIRO', config.margin + 5, yPosition + 8, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  const summaryStartY = yPosition + 15;
  const summaryCol1 = config.margin + 10;
  const summaryCol2 = config.pageWidth - config.margin - 10;
  
  addText(pdf, 'Valor do Atendimento:', summaryCol1, summaryStartY, { fontSize: 9, color: config.colors.muted });
  addText(pdf, formatCurrency(data.summary.serviceValue, data.currency), summaryCol2, summaryStartY, { fontSize: 9, align: 'right' });
  
  addText(pdf, 'Serviços Adicionais:', summaryCol1, summaryStartY + 6, { fontSize: 9, color: config.colors.muted });
  addText(pdf, formatCurrency(data.summary.additionalServicesTotal, data.currency), summaryCol2, summaryStartY + 6, { fontSize: 9, align: 'right' });
  
  if (data.applyAdminFee) {
    addText(pdf, `Taxa Administrativa (${data.adminFeePercentage}%):`, summaryCol1, summaryStartY + 12, { fontSize: 9, color: config.colors.muted });
    addText(pdf, formatCurrency(data.summary.adminFee, data.currency), summaryCol2, summaryStartY + 12, { fontSize: 9, align: 'right' });
  }
  
  drawLine(pdf, { ...config, margin: summaryCol1 - 5, pageWidth: summaryCol2 + 5 }, summaryStartY + 18, config.colors.border);
  
  addText(pdf, 'TOTAL GERAL:', summaryCol1, summaryStartY + 26, { fontSize: 11, fontStyle: 'bold' });
  addText(pdf, formatCurrency(data.summary.grandTotal, data.currency), summaryCol2, summaryStartY + 26, { fontSize: 12, fontStyle: 'bold', color: primaryColor, align: 'right' });

  yPosition += 55;

  // ===== OBSERVATIONS =====
  if (data.adminFeeText || data.taxObservation) {
    addText(pdf, 'OBSERVAÇÕES', config.margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold',
      color: primaryColor,
    });
    
    yPosition += 6;
    drawLine(pdf, config, yPosition, accentColor, 0.5);
    yPosition += 6;
    
    if (data.adminFeeText) {
      addText(pdf, `• ${data.adminFeeText}`, config.margin + 3, yPosition, {
        fontSize: 8,
        color: config.colors.muted,
        maxWidth: config.contentWidth - 10,
      });
      yPosition += 10;
    }
    
    if (data.taxObservation) {
      addText(pdf, `• ${data.taxObservation}`, config.margin + 3, yPosition, {
        fontSize: 8,
        color: config.colors.muted,
        maxWidth: config.contentWidth - 10,
      });
      yPosition += 10;
    }
  }

  yPosition += 5;

  // ===== PAYMENT INFO =====
  if (data.payment.pixData) {
    addText(pdf, 'DADOS PARA PAGAMENTO', config.margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold',
      color: primaryColor,
    });
    
    yPosition += 6;
    drawLine(pdf, config, yPosition, accentColor, 0.5);
    yPosition += 6;
    
    addText(pdf, `Forma: ${paymentMethodLabelsMap[data.payment.method] || data.payment.method}`, config.margin + 3, yPosition, {
      fontSize: 9,
    });
    yPosition += 6;
    
    addText(pdf, `PIX / Dados bancários: ${data.payment.pixData}`, config.margin + 3, yPosition, {
      fontSize: 9,
    });
  }

  // ===== FOOTER =====
  drawFooter(pdf, config, pdfCompany, primaryColor, true, 7);

  // Save the PDF
  const fileName = `ground_handling_${data.quotationNumber.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}
