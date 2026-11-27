import { Building2, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getStoreFacades } from '../data/storeFacades.ts';
import { formatArea, formatCount, getStoreAcTotal } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface InfrastructureMatrixViewProps {
  stores: StoreAreaRecord[];
  onSelectStore: (store: StoreAreaRecord) => void;
  onEditStore: (store: StoreAreaRecord) => void;
}

type AssetFocus =
  | 'arCondicionado'
  | 'subestacao'
  | 'casaMaq'
  | 'elevador'
  | 'plataformaPne'
  | 'escadaRolante'
  | 'observacoes';

const FOCUS_TABS: { id: AssetFocus; label: string }[] = [
  { id: 'arCondicionado', label: 'Ar Condicionado' },
  { id: 'subestacao', label: 'Subestações' },
  { id: 'casaMaq', label: 'Casas de Máquinas' },
  { id: 'elevador', label: 'Elevadores' },
  { id: 'plataformaPne', label: 'Plataformas PNE' },
  { id: 'escadaRolante', label: 'Escadas Rolantes' },
  { id: 'observacoes', label: 'Pendências / *obs' },
];

function hasObs(s: StoreAreaRecord): boolean {
  return (
    Boolean(s.sanitPneObs) ||
    Boolean(s.estacionamentoObs) ||
    Boolean(s.observacoes) ||
    s.escada.includes('*') ||
    s.elevador.includes('*') ||
    s.plataformaPne.includes('*') ||
    s.escadaRolante.includes('*')
  );
}

export function InfrastructureMatrixView({
  stores,
  onSelectStore,
}: InfrastructureMatrixViewProps) {
  const [focus, setFocus] = useState<AssetFocus>('arCondicionado');

  const counts = useMemo(
    () => ({
      arCondicionado: stores.filter((s) => (getStoreAcTotal(s) ?? 0) > 0).length,
      subestacao: stores.filter((s) => (s.subestacao ?? 0) > 0).length,
      casaMaq: stores.filter((s) => (s.casaMaq ?? 0) > 0).length,
      elevador: stores.filter((s) => s.elevador.toUpperCase().includes('SIM') || s.elevador === '*obs').length,
      plataformaPne: stores.filter((s) => s.plataformaPne.toUpperCase().includes('SIM') || s.plataformaPne === '*obs').length,
      escadaRolante: stores.filter((s) => s.escadaRolante.toUpperCase().includes('SIM')).length,
      observacoes: stores.filter(hasObs).length,
    }),
    [stores],
  );

  const filteredList = useMemo(() => {
    switch (focus) {
      case 'arCondicionado':
        return stores.filter((s) => (getStoreAcTotal(s) ?? 0) > 0);
      case 'subestacao':
        return stores.filter((s) => (s.subestacao ?? 0) > 0);
      case 'casaMaq':
        return stores.filter((s) => (s.casaMaq ?? 0) > 0);
      case 'elevador':
        return stores.filter((s) => s.elevador.toUpperCase().includes('SIM') || s.elevador === '*obs');
      case 'plataformaPne':
        return stores.filter((s) => s.plataformaPne.toUpperCase().includes('SIM') || s.plataformaPne === '*obs');
      case 'escadaRolante':
        return stores.filter((s) => s.escadaRolante.toUpperCase().includes('SIM'));
      case 'observacoes':
        return stores.filter(hasObs);
    }
  }, [stores, focus]);

  return (
    <div className="space-y-3">
      <section className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Matriz de Infraestrutura
          </h2>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {filteredList.length} lojas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-md w-full">
          {FOCUS_TABS.map((tab) => {
            const active = focus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFocus(tab.id)}
                className={`min-h-[34px] px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}{' '}
                <span className="ml-0.5 font-mono text-[11px] opacity-75">
                  ({counts[tab.id]})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
        {filteredList.map((s) => {
          const thumb = getStoreFacades(s.numero)[0];
          const acTotal = getStoreAcTotal(s);
          const obsSummary = [
            s.sanitPneObs ? `San. PNE: ${s.sanitPneObs}` : '',
            s.estacionamentoObs ? `Estac.: ${s.estacionamentoObs}` : '',
            s.observacoes || '',
          ]
            .filter(Boolean)
            .join(' · ');

          const detailLine =
            focus === 'arCondicionado'
              ? `AC Total: ${formatCount(acTotal, true)} (Split ${formatCount(s.acSplit)} · Splitão ${formatCount(s.acSplitaoSelf)} · Fan ${formatCount(s.acFancoil)} · VRF ${formatCount(s.acVrf)})`
              : focus === 'subestacao'
              ? `Subestação: ${formatArea(s.subestacao, true)} · Casa Máq.: ${formatArea(s.casaMaq, true)}`
              : focus === 'casaMaq'
              ? `Casa Máq.: ${formatArea(s.casaMaq, true)} · Subestação: ${formatArea(s.subestacao, true)}`
              : focus === 'observacoes'
              ? obsSummary || 'Com apontamento'
              : `Elevador: ${s.elevador} · PNE: ${s.plataformaPne} · Esc. Rol.: ${s.escadaRolante}`;

          return (
            <button
              key={s.id ?? s.numero}
              type="button"
              onClick={() => onSelectStore(s)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/50 transition-colors flex items-center gap-3 cursor-pointer"
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={`Fachada ${s.numero}`}
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
                    {s.numero}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{s.tipoLoja}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 truncate">
                    {s.cidade}/{s.estado}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900 truncate leading-tight">
                  {s.nome}
                </p>
                <p className="mt-0.5 text-[11px] font-mono text-slate-500 truncate tabular-nums">
                  {detailLine}
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
