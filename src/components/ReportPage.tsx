import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SubcategoryData {
  name: string;
  value: number;
  color: string;
  categoryName: string;
}

const ReportPage = () => {
  const navigate = useNavigate();
  const { categories, expenses, exportData, importData } = useExpense();
  const { toast } = useToast();
  const [viewType, setViewType] = useState<'category' | 'subcategory'>('category');

  // Calcular dados para o gráfico por categoria
  const categoryData = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color
    };
  }).filter(item => item.value > 0);

  // Calcular dados para o gráfico por subcategoria
  const subcategoryData: SubcategoryData[] = categories.flatMap(category => 
    category.subcategories.map(subcategory => {
      const subcategoryExpenses = expenses.filter(expense => expense.subcategoryId === subcategory.id);
      const total = subcategoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: subcategory.name,
        value: total,
        color: category.color,
        categoryName: category.name
      };
    })
  ).filter(item => item.value > 0);

  const currentData = viewType === 'category' ? categoryData : subcategoryData;
  const totalGeral = currentData.reduce((sum, item) => sum + item.value, 0);

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Relatório</h1>
        </div>

        {/* Botões de alternância */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewType('category')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewType === 'category'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Por Categoria
          </button>
          <button
            onClick={() => setViewType('subcategory')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewType === 'subcategory'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Por Subcategoria
          </button>
        </div>

        {currentData.length > 0 ? (
          <>
            {/* Gráfico de Pizza */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {currentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legenda customizada */}
              <div className="mt-4 space-y-2">
                {currentData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-3" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                    {viewType === 'subcategory' && 'categoryName' in item && (
                      <span className="text-gray-500 text-sm ml-1">({item.categoryName})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detalhamento */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Detalhamento por {viewType === 'category' ? 'Categoria' : 'Subcategoria'}
              </h3>
              <div className="space-y-3">
                {currentData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-medium">R$ {item.value.toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Geral */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Total Geral:</span>
                <span className="text-2xl font-bold text-blue-600">
                  R$ {totalGeral.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg p-8 mb-6 text-center shadow-sm">
            <p className="text-gray-500">Nenhuma despesa registrada ainda.</p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/nova-despesa')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg"
          >
            Adicionar Mais Despesas
          </Button>

          <Button
            onClick={handleExportData}
            variant="secondary"
            className="w-full py-3 text-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar Dados
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-file"
            />
            <Button
              variant="outline"
              className="w-full py-3 text-lg border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <label htmlFor="import-file" className="cursor-pointer flex items-center justify-center w-full h-full">
                <Upload className="w-5 h-5 mr-2" />
                Restaurar Dados
              </label>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
