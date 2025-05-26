import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  value: number;
}

interface ShoppingList {
  id: string;
  title: string;
  items: ShoppingItem[];
  createdAt: string;
}

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [listTitle, setListTitle] = useState('');
  const [currentItem, setCurrentItem] = useState({
    name: '',
    quantity: 1,
    value: ''
  });
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editId) {
      loadListForEditing(editId);
    }
  }, [editId]);

  const loadListForEditing = (listId: string) => {
    const savedLists = localStorage.getItem('shopping-lists');
    if (savedLists) {
      const lists: ShoppingList[] = JSON.parse(savedLists);
      const listToEdit = lists.find(list => list.id === listId);
      
      if (listToEdit) {
        setListTitle(listToEdit.title);
        setItems(listToEdit.items);
        setIsEditing(true);
      }
    }
  };

  const addItem = () => {
    if (currentItem.name && currentItem.value) {
      const value = parseFloat(currentItem.value.replace(',', '.'));
      if (value > 0) {
        const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name: currentItem.name,
          quantity: currentItem.quantity,
          value: value
        };
        
        setItems(prev => [...prev, newItem]);
        setCurrentItem({ name: '', quantity: 1, value: '' });
      }
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const saveList = () => {
    if (listTitle && items.length > 0) {
      const savedLists = localStorage.getItem('shopping-lists');
      const lists: ShoppingList[] = savedLists ? JSON.parse(savedLists) : [];

      if (isEditing && editId) {
        // Atualizar lista existente
        const updatedLists = lists.map(list => 
          list.id === editId 
            ? { ...list, title: listTitle, items: items }
            : list
        );
        localStorage.setItem('shopping-lists', JSON.stringify(updatedLists));
        
        toast({
          title: "Lista atualizada com sucesso!",
          description: `Lista "${listTitle}" foi atualizada com ${items.length} itens.`,
        });
      } else {
        // Criar nova lista
        const newList: ShoppingList = {
          id: Date.now().toString(),
          title: listTitle,
          items: items,
          createdAt: new Date().toISOString()
        };
        
        lists.push(newList);
        localStorage.setItem('shopping-lists', JSON.stringify(lists));
        
        toast({
          title: "Lista salva com sucesso!",
          description: `Lista "${listTitle}" foi criada com ${items.length} itens.`,
        });
      }

      // Limpar formulário
      setListTitle('');
      setItems([]);
      setCurrentItem({ name: '', quantity: 1, value: '' });
      setIsEditing(false);
      
      // Navegar para as listas salvas
      navigate('/listas-salvas');
    }
  };

  const totalValue = items.reduce((sum, item) => sum + (item.value * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Lista' : 'Lista de Compras'}
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Lista
            </label>
            <Input
              type="text"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              placeholder="Ex: Compras do Supermercado"
              className="w-full"
            />
          </div>

          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Adicionar Item</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Item
              </label>
              <Input
                type="text"
                value={currentItem.name}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Ex: Arroz"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade
                </label>
                <Input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Unitário
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <Input
                    type="text"
                    value={currentItem.value}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, value: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={addItem}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              disabled={!currentItem.name || !currentItem.value}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          {items.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Itens da Lista ({items.length})
              </h3>
              
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity}x R$ {item.value.toFixed(2).replace('.', ',')} = 
                        R$ {(item.quantity * item.value).toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total da Lista:</span>
                  <span className="text-xl font-bold text-purple-600">
                    R$ {totalValue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={saveList}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg"
            disabled={!listTitle || items.length === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Lista
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;
