import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { INDICATOR_DEFINITIONS } from '../data/initialStores.ts';
import { formatArea, formatCount, getStoreKey, normalizeText } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface StoreComparisonViewProps {
  stores: StoreAreaRecord[];
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  onSelectStore: (store: StoreAreaRecord) => void;
}

export function StoreComparisonView({
  stores,
  selectedIds,
  onChangeSelectedIds,
  onSelectStore,
}: StoreComparisonViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const selectedStores = selectedIds
    .map((id) => stores.find((s) => getStoreKey(s) === id))
    .filter((s): s is StoreAreaRecord => Boolean(s));

  const candidateStores = stores
    .filter((s) => !selectedIds.includes(getStoreKey(s)))
    .filter((s) => {
      if (!searchTerm.trim()) return true;
      const q = normalizeText(searchTerm);
      return (
        normalizeText(s.numero).includes(q) ||
        normalizeText(s.nome).includes(q) ||
        normalizeText(s.cidade).includes(q) ||
        normalizeText(s.estado).includes(q)
      );
    })
    .slice(0, 8);

  const handleAdd = (storeKey: string) => {
    if (selectedIds.length >= 4 || selectedIds.includes(storeKey)) return;
    onChangeSelectedIds([...selectedIds, storeKey]);
    setSearchTerm('');
  };

  const handleRemove = (storeKey: string) => {
    onChangeSelectedIds(selectedIds.filter((id) => id !== storeKey));
  };

  return (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Comparativo Técnico entre Unidades
            </h2>
            <p className="text-xs text-slate-500">
              Compare até 4 lojas lado a lado em todos os indicadores cadastrais, técnicos, climatização e acessibilidade.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {selectedStores.length} / 4 selecionadas
          </span>
        </div>

        {/* Unidades selecionadas + seletor rápido */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {selectedStores.map((s) => {
              const storeKey = getStoreKey(s);
              return (
              <div
                key={storeKey}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs"
              >
                <button
                  type="button"
                  onClick={() => onSelectStore(s)}
                  className="font-medium text-slate-900 hover:text-blue-700 cursor-pointer"
                >
                  <span className="font-mono font-bold text-blue-700 mr-1">{s.numero}</span>
                  {s.nome}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(storeKey)}
                  aria-label={`Remover ${s.nome} do comparativo`}
                  className="text-slate-400 hover:text-rose-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              );
            })}
          </div>

          {selectedIds.length < 4 && (
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Adicionar unidade por nº, nome ou cidade..."
                aria-label="Buscar unidade para comparar"
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {searchTerm.trim() !== '' && candidateStores.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {candidateStores.map((cand) => {
                    const candKey = getStoreKey(cand);
                    return (
                    <button
                      key={candKey}
                      type="button"
                      onClick={() => handleAdd(candKey)}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate text-slate-900">
                        <span className="font-mono font-bold text-blue-700 mr-1.5">
                          {cand.numero}
                        </span>
                        {cand.nome}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {selectedStores.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Nenhuma unidade selecionada para comparação
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Use o campo acima para adicionar de 2 a 4 lojas e comparar suas áreas lado a lado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {INDICATOR_DEFINITIONS.map((ind) => {
            const numericVals =
              ind.unit === 'm²' || ind.unit === 'un'
                ? selectedStores.map((s) =>
                    typeof s[ind.key] === 'number' ? (s[ind.key] as number) : null,
                  )
                : [];
            const validNums = numericVals.filter((v): v is number => v !== null && v > 0);
            const maxVal = validNums.length > 1 ? Math.max(...validNums) : null;

            return (
              <div
                key={ind.key}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5"
              >
                <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">
                    {ind.label}
                  </h3>
                  {ind.unit && (
                    <span className="font-mono text-[11px] text-slate-400">({ind.unit})</span>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedStores.map((s) => {
                    const raw = s[ind.key];
                    const isMax =
                      maxVal !== null && typeof raw === 'number' && raw === maxVal;

                    let display = '—';
                    if (ind.unit === 'm²') {
                      display = formatArea(typeof raw === 'number' ? raw : null);
                    } else if (ind.unit === 'un') {
                      display = formatCount(typeof raw === 'number' ? raw : null);
                    } else if (raw !== undefined && raw !== null && raw !== '') {
                      display = String(raw);
                    }

                    return (
                      <div
                        key={getStoreKey(s)}
                        className="py-1.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectStore(s)}
                          className="text-left text-slate-600 hover:text-blue-700 min-w-0 cursor-pointer"
                        >
                          <span className="font-mono font-bold text-blue-700 mr-1.5">
                            {s.numero}
                          </span>
                          <span className="break-words">{s.nome}</span>
                        </button>
                        <span
                          className={`font-mono tabular-nums text-right shrink-0 ${
                            isMax ? 'font-bold text-blue-700' : 'text-slate-900'
                          }`}
                        >
                          {display}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
