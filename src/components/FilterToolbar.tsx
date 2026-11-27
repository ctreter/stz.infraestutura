import { ChevronDown, ChevronUp, Download, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import type { ColumnGroupKey, FilterState, QuickInfraFilter, TipoLoja } from '../types/store.ts';

interface FilterToolbarProps {
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  availableStates: string[];
  columnGroup: ColumnGroupKey;
  onColumnGroupChange: (group: ColumnGroupKey) => void;
  onExportCsv: () => void;
  onResetFilters: () => void;
}

const COLUMN_GROUPS: { id: ColumnGroupKey; label: string }[] = [
  { id: 'geral', label: 'Visão Geral' },
  { id: 'contatos', label: 'Contatos & Horários' },
  { id: 'retaguarda', label: 'Retaguarda & Téc.' },
  { id: 'pavimentos', label: 'Pavimentos' },
  { id: 'acessos', label: 'Acessos' },
  { id: 'arCondicionado', label: 'Ar Condicionado' },
  { id: 'completa', label: 'Completa' },
];

const INFRA_FILTERS: { id: QuickInfraFilter; label: string }[] = [
  { id: 'all', label: 'Todos os indicadores' },
  { id: 'arCondicionado', label: 'Com Ar Condicionado' },
  { id: 'acSplit', label: 'AC: Com Split' },
  { id: 'acSplitaoSelf', label: 'AC: Com Splitão/Self' },
  { id: 'acFancoil', label: 'AC: Com Fancoil' },
  { id: 'acVrf', label: 'AC: Com VRF' },
  { id: 'elevador', label: 'Com Elevador' },
  { id: 'plataformaPne', label: 'Com Plataforma PNE' },
  { id: 'escadaRolante', label: 'Com Escada Rolante' },
  { id: 'subestacao', label: 'Com Subestação' },
  { id: 'casaMaq', label: 'Com Casa de Máquinas' },
  { id: 'mezanino', label: 'Com Mezanino' },
  { id: 'estacionamento', label: 'Com Estacionamento' },
  { id: 'comObs', label: 'Com Pendência / *obs' },
];

export function FilterToolbar({
  filters,
  onFiltersChange,
  availableStates,
  columnGroup,
  onColumnGroupChange,
  onExportCsv,
  onResetFilters,
}: FilterToolbarProps) {
  const [expanded, setExpanded] = useState(false);

  const activeFilterCount =
    (filters.estado !== 'ALL' ? 1 : 0) +
    (filters.tipoLoja !== 'ALL' ? 1 : 0) +
    (filters.infraFilter !== 'all' ? 1 : 0) +
    (columnGroup !== 'geral' ? 1 : 0);

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.estado !== 'ALL' ||
    filters.tipoLoja !== 'ALL' ||
    filters.infraFilter !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2.5">
      {/* Linha slim principal: Busca + botão Filtros + Exportar CSV */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Buscar loja, nº, cidade, UF..."
            aria-label="Pesquisa rápida de unidades e indicadores"
            className="w-full h-10 pl-9 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              aria-label="Limpar pesquisa"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold rounded-md border transition-colors shrink-0 cursor-pointer ${
            expanded || activeFilterCount > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          title="Exportar CSV"
          aria-label="Exportar CSV"
          className="inline-flex items-center justify-center gap-1.5 h-10 px-2.5 sm:px-3 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>

      {/* Painel retrátil de filtros avançados */}
      {expanded && (
        <div className="pt-2.5 border-t border-slate-100 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <select
              value={filters.estado}
              onChange={(e) => onFiltersChange({ ...filters, estado: e.target.value })}
              aria-label="Filtrar por Estado (UF)"
              className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">Todas as UFs ({availableStates.length})</option>
              {availableStates.map((uf) => (
                <option key={uf} value={uf}>
                  UF: {uf}
                </option>
              ))}
            </select>

            <select
              value={filters.infraFilter}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  infraFilter: e.target.value as QuickInfraFilter,
                })
              }
              aria-label="Filtrar por indicador técnico"
              className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {INFRA_FILTERS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={columnGroup}
              onChange={(e) => onColumnGroupChange(e.target.value as ColumnGroupKey)}
              aria-label="Resumo exibido na lista"
              className="w-full h-10 px-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {COLUMN_GROUPS.map((grp) => (
                <option key={grp.id} value={grp.id}>
                  Resumo: {grp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              role="group"
              aria-label="Filtrar por tipo de unidade"
              className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md w-full sm:w-auto"
            >
              {(
                [
                  { id: 'ALL', label: 'Todas' },
                  { id: 'RUA', label: 'Rua' },
                  { id: 'SHOPPING', label: 'Shopping' },
                  { id: 'CD', label: 'CD' },
                  { id: 'ESCRITÓRIO', label: 'Escritório' },
                ] as const
              ).map((opt) => {
                const active = filters.tipoLoja === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onFiltersChange({ ...filters, tipoLoja: opt.id as 'ALL' | TipoLoja })
                    }
                    className={`flex-1 sm:flex-initial min-h-[34px] px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
