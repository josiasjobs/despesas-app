
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NewExpensePage = () => {
  const navigate = useNavigate();
  const { categories, addExpense, getSubcategory, getCategory } = useExpense();
  const { toast } = useToast();
  
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentValue, setCurrentValue] = useState('');
  const [sessionValues, setSessionValues] = useState<number[]>([]);

  const allSubcategories = categories.flatMap(cat => 
    cat.subcategories.map(sub => ({
      ...sub,
      categoryName: cat.name,
      categoryColor: cat.color
    }))
  );

  const sessionTotal = sessionValues.reduce((sum, val) => sum + val, 0);

  const handleValueSubmit = () => {
    console.log('handleValueSubmit called');
    console.log('currentValue:', currentValue);
    console.log('selectedSubcategory:', selectedSubcategory);
    
    const value = parseFloat(currentValue.replace(',', '.'));
    console.log('parsed value:', value);
    
    if (value > 0 && selectedSubcategory) {
      console.log('Adding value to session:', value);
      setSessionValues(prev => {
        const newValues = [...prev, value];
        console.log('new sessionValues:', newValues);
        return newValues;
      });
      setCurrentValue('');
    } else {
      console.log('Value not added. Conditions not met:', {
        valueGreaterThanZero: value > 0,
        hasSubcategory: !!selectedSubcategory,
        isValidNumber: !isNaN(value)
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValueSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleValueSubmit();
    }
  };

  const removeSessionValue = (index: number) => {
    setSessionValues(prev => prev.filter((_, i) => i !== index));
  };

  const finalizarCategoria = () => {
    if (sessionValues.length > 0 && selectedSubcategory) {
      const subcategory = getSubcategory(selectedSubcategory);
      if (subcategory) {
        sessionValues.forEach(value => {
          addExpense(value, date, selectedSubcategory, subcategory.categoryId);
        });
        
        // Limpar os dados da sessão
        setSessionValues([]);
        setCurrentValue('');
        setSelectedSubcategory('');
        
        // Mostrar toast de sucesso
        toast({
          title: "Despesas adicionadas com sucesso!",
          description: `${sessionValues.length} despesa(s) foram registradas.`,
        });
        
        // Permanecer na mesma tela ao invés de navegar
      }
    }
  };

  const limpar = () => {
    setSessionValues([]);
    setCurrentValue('');
  };

  const selectedSubcategoryData = allSubcategories.find(sub => sub.id === selectedSubcategory);

  // Log para debug
  useEffect(() => {
    console.log('sessionValues updated:', sessionValues);
  }, [sessionValues]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nova Despesa</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategoria
            </label>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma subcategoria" />
              </SelectTrigger>
              <SelectContent>
                {allSubcategories.map(sub => (
                  <SelectItem key={sub.id} value={sub.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: sub.categoryColor }}
                      />
                      <span className="font-medium">{sub.name}</span>
                      <span className="text-gray-500 ml-2">({sub.categoryName})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSubcategoryData && (
              <div className="mt-1 text-sm text-gray-600">
                {selectedSubcategoryData.categoryName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor
            </label>
            <form onSubmit={handleFormSubmit}>
              <div className="relative flex">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                  R$
                </span>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="0,00"
                  className="pl-10 pr-12 text-lg font-medium border-2 border-blue-500 focus:border-blue-600 flex-1"
                />
                <Button
                  type="button"
                  onClick={handleValueSubmit}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
                  disabled={!currentValue || !selectedSubcategory}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <p className="text-sm text-gray-500 mt-1">
              Pressione Enter ou clique no + para adicionar rapidamente
            </p>
          </div>

          {sessionValues.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Valores desta sessão:
              </h3>
              <div className="space-y-2">
                {sessionValues.map((value, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium">R$ {value.toFixed(2).replace('.', ',')}</span>
                    <button
                      onClick={() => removeSessionValue(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total da sessão:</span>
                  <span className="text-xl font-bold text-blue-600">
                    R$ {sessionTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={finalizarCategoria}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 text-lg"
              disabled={sessionValues.length === 0 || !selectedSubcategory}
            >
              Finalizar Categoria
            </Button>
            <Button
              onClick={limpar}
              variant="secondary"
              className="px-6 py-3 text-lg"
              disabled={sessionValues.length === 0}
            >
              Limpar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExpensePage;
