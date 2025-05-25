
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, BarChart3, History, ShoppingCart } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Despesas</h1>
          <p className="text-gray-600">Gerencie seus gastos de forma simples</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/nova-despesa')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">Nova Despesa</span>
          </button>

          <button
            onClick={() => navigate('/lista-compras')}
            className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
          >
            <ShoppingCart className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">Lista de Compras</span>
          </button>

          <button
            onClick={() => navigate('/categorias')}
            className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
          >
            <Settings className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">Categorias</span>
          </button>

          <button
            onClick={() => navigate('/relatorio')}
            className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
          >
            <BarChart3 className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">Relatório</span>
          </button>

          <button
            onClick={() => navigate('/historico')}
            className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors col-span-2"
          >
            <History className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">Histórico</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
