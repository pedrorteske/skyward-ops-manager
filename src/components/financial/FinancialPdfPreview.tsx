import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import type { FinancialDocument } from '@/types/financial';
import { documentTypeLabels } from '@/types/financial';
import { generateFinancialPdfUrl, generateProformaPdfUrl, generateInvoicePdfUrl } from '@/lib/financialPdfPreview';

interface ClientInfo {
  name: string;
  email?: string;
  document?: string;
  address?: string;
  phone?: string;
}

interface FlightInfo {
  prefix: string;
  aircraftType?: string;
  route: string;
  date: string;
  eta?: string;
  etd?: string;
}

interface FinancialPdfPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: FinancialDocument;
  clientInfo: ClientInfo;
  flightInfo?: FlightInfo;
}

export function FinancialPdfPreview({
  open,
  onOpenChange,
  document,
  clientInfo,
  flightInfo,
}: FinancialPdfPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && document) {
      setIsLoading(true);
      generatePdfUrl();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, document]);

  const generatePdfUrl = async () => {
    try {
      let url: string;
      
      switch (document.type) {
        case 'proforma':
          url = await generateProformaPdfUrl(document, clientInfo, flightInfo);
          break;
        case 'invoice':
          url = await generateInvoicePdfUrl(document, clientInfo, flightInfo, undefined, document.validUntil);
          break;
        default:
          url = await generateFinancialPdfUrl(document, clientInfo, flightInfo);
      }
      
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      setPdfUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = window.document.createElement('a');
      link.href = pdfUrl;
      link.download = `${document.type}_${document.number.replace(/\//g, '-')}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Preview - {documentTypeLabels[document.type]} {document.number}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 bg-muted rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Gerando preview...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">Erro ao gerar preview</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleDownload} disabled={!pdfUrl}>
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
