
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Eye, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

const SavedShoppingListsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [expandedList, setExpandedList] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const savedLists = localStorage.getItem('shopping-lists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
  };

  const deleteList = (id: string) => {
    const updatedLists = lists.filter(list => list.id !== id);
    setLists(updatedLists);
    localStorage.setItem('shopping-lists', JSON.stringify(updatedLists));
    
    toast({
      title: "Lista excluída",
      description: "A lista foi removida com sucesso.",
    });
  };

  const editList = (listId: string) => {
    // Navegar para a página de edição passando o ID da lista
    navigate(`/lista-compras?edit=${listId}`);
  };

  const toggleExpandList = (listId: string) => {
    setExpandedList(expandedList === listId ? null : listId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalValue = (items: ShoppingItem[]) => {
    return items.reduce((sum, item) => sum + (item.value * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Listas Salvas</h1>
        </div>

        {lists.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma lista criada ainda.</p>
            <Button
              onClick={() => navigate('/lista-compras')}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Criar Nova Lista
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => (
              <div key={list.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{list.title}</h3>
                    <p className="text-sm text-gray-500">
                      {list.items.length} itens • {formatDate(list.createdAt)}
                    </p>
                    <p className="text-sm font-medium text-purple-600">
                      Total: R$ {getTotalValue(list.items).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleExpandList(list.id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => editList(list.id)}
                      className="p-2 text-blue-500 hover:text-blue-700"
                      title="Editar lista"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Excluir lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a lista "{list.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteList(list.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {expandedList === list.id && (
                  <div className="border-t pt-3 mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Itens da lista:</h4>
                    <div className="space-y-2">
                      {list.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">({item.quantity}x)</span>
                          </div>
                          <span className="text-sm">
                            R$ {(item.quantity * item.value).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={() => navigate('/lista-compras')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 text-lg"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Nova Lista de Compras
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavedShoppingListsPage;
