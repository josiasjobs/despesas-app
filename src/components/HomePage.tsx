
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, BarChart3, History, List, Shield, Download } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import DataExportImportDialog from './DataExportImportDialog';

const HomePage = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const welcomeHidden = localStorage.getItem('welcome-screen-hidden');
    if (!welcomeHidden) {
      setShowWelcome(true);
    }

    // Detectar se o app já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col">
      <div className="max-w-md mx-auto flex-1">
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
            onClick={() => navigate('/listas-salvas')}
            className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
          >
            <List className="w-8 h-8 mb-2" />
            <span className="text-lg font-medium">Listas</span>
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

          {/* Botão de Histórico - ocupa 2 colunas quando o app está instalado ou não há prompt de instalação */}
          {(isInstalled || !deferredPrompt) && (
            <button
              onClick={() => navigate('/historico')}
              className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors col-span-2"
            >
              <History className="w-8 h-8 mb-2" />
              <span className="text-lg font-medium">Histórico</span>
            </button>
          )}

          {/* Botões separados quando o app não está instalado e há prompt disponível */}
          {!isInstalled && deferredPrompt && (
            <>
              <button
                onClick={() => navigate('/historico')}
                className="bg-gray-600 hover:bg-gray-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
              >
                <History className="w-8 h-8 mb-2" />
                <span className="text-lg font-medium">Histórico</span>
              </button>

              <button
                onClick={handleInstallClick}
                className="bg-indigo-500 hover:bg-indigo-600 text-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors"
              >
                <Download className="w-8 h-8 mb-2" />
                <span className="text-lg font-medium">Instalar App</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Banner discreto no rodapé */}
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="mb-1">
                <strong>Segurança:</strong> Seus dados são salvos localmente no dispositivo.
              </p>
              <p>
                Para maior segurança, faça backup regularmente.{' '}
                <button
                  onClick={() => setShowDataDialog(true)}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Clique aqui para exportar/restaurar
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé com créditos */}
      <div className="max-w-md mx-auto mt-4">
        <div className="text-center text-xs text-gray-500 py-3">
          Desenvolvido por Josias da Rosa
        </div>
      </div>

      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
      
      <DataExportImportDialog 
        isOpen={showDataDialog} 
        onClose={() => setShowDataDialog(false)} 
      />
    </div>
  );
};

export default HomePage;
