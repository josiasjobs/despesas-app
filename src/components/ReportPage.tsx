
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SubcategoryData {
  name: string;
  value: number;
  color: string;
  categoryName: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const ReportPage = () => {
  const navigate = useNavigate();
  const { categories, expenses } = useExpense();
  const [viewType, setViewType] = useState<'category' | 'subcategory'>('category');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Gerar opções de anos baseado nas despesas
  const availableYears = Array.from(new Set(expenses.map(expense => 
    new Date(expense.date).getFullYear()
  ))).sort((a, b) => b - a);

  // Filtrar despesas por mês e ano
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();

    const monthMatch = selectedMonth === 'all' || expenseMonth.toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || expenseYear.toString() === selectedYear;

    return monthMatch && yearMatch;
  });

  // Calcular dados para o gráfico por categoria usando despesas filtradas
  const categoryData: CategoryData[] = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(expense => expense.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      value: total,
      color: category.color
    };
  }).filter(item => item.value > 0);

  // Calcular dados para o gráfico por subcategoria usando despesas filtradas
  const subcategoryData: SubcategoryData[] = categories.flatMap(category => 
    category.subcategories.map(subcategory => {
      const subcategoryExpenses = filteredExpenses.filter(expense => expense.subcategoryId === subcategory.id);
      const total = subcategoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: subcategory.name,
        value: total,
        color: category.color,
        categoryName: category.name
      };
    })
  ).filter(item => item.value > 0);

  // Filtrar subcategorias baseado no filtro selecionado
  const filteredSubcategoryData = subcategoryFilter === 'all' 
    ? subcategoryData 
    : subcategoryData.filter(item => {
        const subcategory = categories.flatMap(cat => cat.subcategories).find(sub => sub.name === item.name);
        return subcategory?.id === subcategoryFilter;
      });

  const currentData = viewType === 'category' ? categoryData : filteredSubcategoryData;
  const totalGeral = currentData.reduce((sum, item) => sum + item.value, 0);

  // Lista de todas as subcategorias para o filtro
  const allSubcategories = categories.flatMap(category => 
    category.subcategories.map(sub => ({
      id: sub.id,
      name: sub.name,
      categoryName: category.name,
      categoryColor: category.color
    }))
  ).filter(sub => {
    // Só mostrar subcategorias que têm despesas nas despesas filtradas
    const hasExpenses = filteredExpenses.some(expense => expense.subcategoryId === sub.id);
    return hasExpenses;
  });

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Relatório</h1>
        </div>

        {/* Filtros de Data */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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

        {/* Filtro de subcategorias - só mostra quando viewType é subcategory */}
        {viewType === 'subcategory' && (
          <div className="mb-6">
            <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por subcategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as subcategorias</SelectItem>
                {allSubcategories.map(subcategory => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {`${subcategory.name} (${subcategory.categoryName})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
                      <span className="text-gray-500 text-sm ml-1">({(item as SubcategoryData).categoryName})</span>
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
            <p className="text-gray-500">Nenhuma despesa encontrada para o período selecionado.</p>
          </div>
        )}

        {/* Botão de ação */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/nova-despesa')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-lg"
          >
            Adicionar Mais Despesas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
