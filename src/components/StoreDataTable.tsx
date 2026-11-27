import { ArrowDown, ArrowUp, Building2, ChevronRight } from 'lucide-react';
import { getStoreFacades } from '../data/storeFacades.ts';
import { formatArea, formatCount, getStoreAcTotal } from '../services/storeApi.ts';
import type {
  ColumnGroupKey,
  SortDirection,
  SortField,
  StoreAreaRecord,
} from '../types/store.ts';

interface StoreDataTableProps {
  stores: StoreAreaRecord[];
  columnGroup: ColumnGroupKey;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectStore: (store: StoreAreaRecord) => void;
  onEditStore: (store: StoreAreaRecord) => void;
  onResetFilters: () => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'numero', label: 'Número da loja' },
  { value: 'nome', label: 'Nome da unidade' },
  { value: 'cidade', label: 'Cidade' },
  { value: 'areaTotal', label: 'Área Física (m²)' },
  { value: 'areaVendas', label: 'Área de Vendas (m²)' },
  { value: 'areaTecnica', label: 'Área Técnica (m²)' },
  { value: 'acTotal', label: 'Total Ar Condicionado' },
  { value: 'areaTotalConstruida', label: 'Área Construída (m²)' },
];

function getSlimSummary(store: StoreAreaRecord, group: ColumnGroupKey): string {
  const acTotal = getStoreAcTotal(store);
  switch (group) {
    case 'contatos':
      return [
        store.gerenteResponsavel ? `Ger.: ${store.gerenteResponsavel}` : 'Ger.: —',
        store.telComerciais || store.ramal || '',
      ]
        .filter(Boolean)
        .join(' · ');
    case 'retaguarda':
      return `Téc.: ${formatArea(store.areaTecnica, true)} · Subest.: ${formatArea(store.subestacao, true)} · Dep.: ${formatArea(store.deposito, true)}`;
    case 'pavimentos':
      return `Térreo: ${formatArea(store.areaTerreo, true)} · Mez.: ${formatArea(store.areaMezanino, true)} · Const.: ${formatArea(store.areaTotalConstruida, true)}`;
    case 'acessos':
      return `Elev.: ${store.elevador} · PNE: ${store.plataformaPne} · Esc. Rol.: ${store.escadaRolante}`;
    case 'arCondicionado':
      return `AC Total: ${formatCount(acTotal, true)} (Split ${formatCount(store.acSplit)} · Splitão ${formatCount(store.acSplitaoSelf)} · Fan ${formatCount(store.acFancoil)} · VRF ${formatCount(store.acVrf)})`;
    case 'completa':
    case 'geral':
    default:
      return `Física: ${formatArea(store.areaTotal, true)} · Vendas: ${formatArea(store.areaVendas, true)}${acTotal !== null ? ` · AC: ${formatCount(acTotal)}` : ''}`;
  }
}

export function StoreDataTable({
  stores,
  columnGroup,
  sortField,
  sortDirection,
  onSort,
  onSelectStore,
  onResetFilters,
}: StoreDataTableProps) {
  if (stores.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-base font-semibold text-slate-900">
          Nenhuma unidade encontrada com os filtros atuais
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Ajuste os critérios de busca por número, cidade, CNPJ ou indicador técnico.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 min-h-[42px] px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
        >
          Restaurar todos os filtros
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Barra slim de contagem e ordenação */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-xs font-medium text-slate-500 font-mono tabular-nums">
          {stores.length} {stores.length === 1 ? 'unidade' : 'unidades'}
        </span>

        <div className="flex items-center gap-1.5">
          <select
            value={SORT_OPTIONS.some((o) => o.value === sortField) ? sortField : 'numero'}
            onChange={(e) => onSort(e.target.value as SortField)}
            aria-label="Ordenar lista de lojas"
            className="h-9 px-2.5 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onSort(sortField)}
            title={sortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
            aria-label="Alternar direção da ordenação"
            className="h-9 w-9 inline-flex items-center justify-center text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md cursor-pointer shrink-0"
          >
            {sortDirection === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-blue-700" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-blue-700" />
            )}
          </button>
        </div>
      </div>

      {/* Lista slim de lojas: toque para abrir em nova janela */}
      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
        {stores.map((store) => {
          const thumb = getStoreFacades(store.numero)[0];
          const summaryLine = getSlimSummary(store, columnGroup);

          return (
            <button
              key={store.id ?? store.numero}
              type="button"
              onClick={() => onSelectStore(store)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/50 active:bg-blue-50 transition-colors flex items-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={`Fachada ${store.numero}`}
                  loading="lazy"
                  className="w-12 h-10 rounded object-cover border border-slate-200 bg-slate-100 shrink-0"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-12 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400"
                >
                  <Building2 className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] leading-none">
                  <span className="font-mono font-bold text-blue-700 tabular-nums">
                    {store.numero}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span
                    className={`font-semibold ${
                      store.tipoLoja === 'RUA'
                        ? 'text-blue-700'
                        : store.tipoLoja === 'CD'
                        ? 'text-amber-700'
                        : store.tipoLoja === 'ESCRITÓRIO'
                        ? 'text-emerald-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {store.tipoLoja}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 truncate">
                    {store.cidade}/{store.estado}
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-slate-900 truncate leading-tight">
                  {store.nome}
                </p>

                <p className="mt-0.5 text-[11px] font-mono text-slate-500 truncate tabular-nums">
                  {summaryLine}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
