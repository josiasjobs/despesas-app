
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { 
    expenses, 
    categories, 
    deleteExpense, 
    updateExpense, 
    getSubcategory, 
    getCategory 
  } = useExpense();
  
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [filter, setFilter] = useState('all');

  // Ordenar despesas por data (mais recente primeiro)
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filtrar despesas
  const filteredExpenses = filter === 'all' 
    ? sortedExpenses 
    : sortedExpenses.filter(expense => expense.categoryId === filter);

  const allSubcategories = categories.flatMap(cat => 
    cat.subcategories.map(sub => ({
      ...sub,
      categoryName: cat.name,
      categoryColor: cat.color
    }))
  );

  const startEdit = (expense: any) => {
    setEditingExpense(expense.id);
    setEditAmount(expense.amount.toFixed(2).replace('.', ','));
    setEditDate(expense.date);
    setEditSubcategory(expense.subcategoryId);
  };

  const saveEdit = () => {
    if (editingExpense) {
      const amount = parseFloat(editAmount.replace(',', '.'));
      const subcategory = getSubcategory(editSubcategory);
      
      if (amount > 0 && subcategory) {
        updateExpense(editingExpense, amount, editDate, editSubcategory, subcategory.categoryId);
        setEditingExpense(null);
      }
    }
  };

  const cancelEdit = () => {
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        </div>

        {/* Filtro */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as despesas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de despesas */}
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(expense => {
              const subcategory = getSubcategory(expense.subcategoryId);
              const category = getCategory(expense.categoryId);
              
              if (!subcategory || !category) return null;

              const isEditing = editingExpense === expense.id;

              return (
                <div key={expense.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-xl font-bold text-gray-900">
                          R$ {expense.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <div 
                          className="ml-3 px-3 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: category.color }}
                        >
                          {subcategory.name}
                        </div>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {new Date(expense.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => startEdit(expense)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Despesa</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Subcategoria</label>
                              <Select value={editSubcategory} onValueChange={setEditSubcategory}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {allSubcategories.map(sub => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                      <div className="flex items-center">
                                        <div 
                                          className="w-3 h-3 rounded-full mr-2" 
                                          style={{ backgroundColor: sub.categoryColor }}
                                        />
                                        <span>{sub.name}</span>
                                        <span className="text-gray-500 ml-2">({sub.categoryName})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Data</label>
                              <Input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Valor</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  R$
                                </span>
                                <Input
                                  type="text"
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button onClick={saveEdit} className="flex-1">
                                Salvar
                              </Button>
                              <Button onClick={cancelEdit} variant="outline" className="flex-1">
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <p className="text-gray-500">Nenhuma despesa encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
