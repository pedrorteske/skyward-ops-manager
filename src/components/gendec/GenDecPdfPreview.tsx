import { useState, useEffect } from 'react';
import { GeneralDeclaration } from '@/types/gendec';
import { generateGenDecPdfUrl, downloadGenDecPdf } from '@/lib/gendecPdfGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface GenDecPdfPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gendec: GeneralDeclaration;
}

export const GenDecPdfPreview = ({ open, onOpenChange, gendec }: GenDecPdfPreviewProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && gendec) {
      setIsLoading(true);
      generateGenDecPdfUrl(gendec)
        .then((url) => {
          setPdfUrl(url);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setPdfUrl(null);
    }
  }, [open, gendec]);

  const handleDownload = () => {
    downloadGenDecPdf(gendec);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview - GenDec {gendec.number}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 bg-muted rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Gerando preview...</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Erro ao gerar preview
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleDownload} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
