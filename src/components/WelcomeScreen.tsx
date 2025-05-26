
import React, { useState } from 'react';
import { X, Plus, List, Settings, BarChart3, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onClose: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('welcome-screen-hidden', 'true');
    }
    onClose();
  };

  const features = [
    {
      icon: Plus,
      title: 'Nova Despesa',
      description: 'Registre suas despesas facilmente com categorias e subcategorias'
    },
    {
      icon: List,
      title: 'Listas de Compras',
      description: 'Crie e gerencie suas listas de compras com valores e quantidades'
    },
    {
      icon: Settings,
      title: 'Categorias',
      description: 'Personalize suas categorias e subcategorias de despesas'
    },
    {
      icon: BarChart3,
      title: 'Relatórios',
      description: 'Visualize seus gastos com gráficos e análises detalhadas'
    },
    {
      icon: History,
      title: 'Histórico',
      description: 'Acesse todo o histórico de suas despesas com filtros e edição'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo ao Controle de Despesas!
          </h1>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Gerencie seus gastos de forma simples e organizada. Aqui estão as principais funcionalidades:
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-gray-600">
              Não mostrar novamente
            </label>
          </div>

          <Button 
            onClick={handleClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Começar a usar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
