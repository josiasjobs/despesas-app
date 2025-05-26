
import React, { useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DataExportImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataExportImportDialog: React.FC<DataExportImportDialogProps> = ({ isOpen, onClose }) => {
  const { exportData, importData } = useExpense();
  const { toast } = useToast();

  const handleExportData = () => {
    try {
      const dataStr = exportData();
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `despesas_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Dados exportados com sucesso!",
        description: "O arquivo foi baixado para seu dispositivo.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Ocorreu um erro durante a exportação.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);
        
        if (success) {
          toast({
            title: "Dados importados com sucesso!",
            description: "Todos os dados foram restaurados.",
          });
          onClose();
        } else {
          toast({
            title: "Erro ao importar dados",
            description: "O arquivo não possui o formato correto.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao importar dados",
          description: "Ocorreu um erro durante a importação.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Backup e Restauração</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <p>Faça backup dos seus dados ou restaure de um arquivo anterior.</p>
          </div>

          <Button
            onClick={handleExportData}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-file-dialog"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <label htmlFor="import-file-dialog" className="cursor-pointer flex items-center justify-center w-full h-full">
                <Upload className="w-4 h-4 mr-2" />
                Restaurar Dados
              </label>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataExportImportDialog;
