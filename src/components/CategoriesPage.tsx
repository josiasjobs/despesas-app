
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useExpense } from '../contexts/ExpenseContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { categories, addCategory, deleteCategory, addSubcategory, deleteSubcategory } = useExpense();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim() && selectedCategoryForSub) {
      addSubcategory(newSubcategoryName.trim(), selectedCategoryForSub);
      setNewSubcategoryName('');
      setSelectedCategoryForSub('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        </div>

        <div className="space-y-8">
          {/* Nova Categoria */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Nova Categoria</h2>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button 
                onClick={handleAddCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                disabled={!newCategoryName.trim()}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Nova Subcategoria */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Nova Subcategoria</h2>
            <div className="space-y-3">
              <Select value={selectedCategoryForSub} onValueChange={setSelectedCategoryForSub}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
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
              
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="Nome da subcategoria"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory()}
                />
                <Button 
                  onClick={handleAddSubcategory}
                  className="bg-green-500 hover:bg-green-600 text-white px-6"
                  disabled={!newSubcategoryName.trim() || !selectedCategoryForSub}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Categorias e Subcategorias */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Categorias e Subcategorias</h2>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-lg font-medium text-gray-900">{category.name}</span>
                    </div>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {category.subcategories.length > 0 && (
                    <div className="p-2">
                      {category.subcategories.map(subcategory => (
                        <div key={subcategory.id} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50">
                          <span className="text-gray-700 ml-6">{subcategory.name}</span>
                          <button
                            onClick={() => deleteSubcategory(subcategory.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
