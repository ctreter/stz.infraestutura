import { ArrowLeft, Menu, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { ActiveTab } from '../types/store.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onBack: () => void;
  onAddStore: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'inicio', label: 'Início' },
  { id: 'base', label: 'Infraestrutura' },
  { id: 'arCondicionado', label: 'Ar Condicionado' },
  { id: 'indicadores', label: 'Indicadores' },
  { id: 'comparativo', label: 'Comparativo' },
];

export function TopBar({ activeTab, onTabChange, onBack, onAddStore }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLabel = NAV_ITEMS.find((i) => i.id === activeTab)?.label ?? 'STZ';

  const handleSelectTab = (tab: ActiveTab) => {
    setMenuOpen(false);
    onTabChange(tab);
  };

  const handleBack = () => {
    setMenuOpen(false);
    onBack();
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Esquerda: opção discreta e fixa de voltar para a tela anterior (mobile e desktop) */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Voltar para a tela anterior"
              title="Voltar para a tela anterior"
              className="inline-flex items-center gap-1 min-h-[34px] px-2 -ml-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Voltar</span>
            </button>

            <span className="text-slate-200 shrink-0" aria-hidden="true">|</span>

            {/* Mobile: título compacto da seção atual */}
            <div className="min-w-0 md:hidden">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-none">
                STZ Engenharia
              </span>
              <span className="block text-sm font-bold text-slate-900 truncate leading-tight">
                {currentLabel}
              </span>
            </div>

            {/* Desktop: nome do aplicativo */}
            <button
              type="button"
              onClick={() => handleSelectTab('inicio')}
              className="hidden md:block text-left text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              STZ ENGENHARIA E MANUTENÇÃO
            </button>
          </div>

        {/* Desktop: Navegação inline */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center flex-wrap gap-x-5 gap-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Ações compactas à direita */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton variant="light" />
          <button
            type="button"
            onClick={onAddStore}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 min-h-[38px] text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">Nova</span>
            <span className="hidden sm:inline">Nova Unidade</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fechar menu de seções' : 'Abrir menu de seções'}
            className="md:hidden min-w-[38px] min-h-[38px] inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu vertical retrátil mobile (mantém cabeçalho slim em 56px) */}
      {menuOpen && (
        <nav
          aria-label="Menu de seções mobile"
          className="md:hidden border-t border-slate-200 bg-white px-3 py-2 space-y-1 shadow-md"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full text-left px-3 min-h-[42px] rounded-md text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-700" />}
              </button>
            );
          })}
        </nav>
      )}
      </header>
      <div className="h-14 sm:h-16 shrink-0" aria-hidden="true" />
    </>
  );
}
