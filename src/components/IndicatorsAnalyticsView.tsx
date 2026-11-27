import { useMemo, useState } from 'react';
import { INDICATOR_DEFINITIONS } from '../data/initialStores.ts';
import { formatArea, formatCount, formatPercent } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface IndicatorsAnalyticsViewProps {
  stores: StoreAreaRecord[];
  onSelectStore: (store: StoreAreaRecord) => void;
  onFilterByState: (uf: string) => void;
}

const NUMERIC_INDICATOR_KEYS = INDICATOR_DEFINITIONS.filter(
  (d) => d.unit === 'm²' || d.unit === 'un',
);

export function IndicatorsAnalyticsView({
  stores,
  onSelectStore,
  onFilterByState,
}: IndicatorsAnalyticsViewProps) {
  const [selectedMetricKey, setSelectedMetricKey] = useState<keyof StoreAreaRecord>('areaVendas');

  const stateSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        uf: string;
        count: number;
        rua: number;
        shopping: number;
        areaTotal: number;
        areaVendas: number;
        areaTecnica: number;
      }
    >();
    for (const s of stores) {
      const curr = map.get(s.estado) ?? {
        uf: s.estado,
        count: 0,
        rua: 0,
        shopping: 0,
        areaTotal: 0,
        areaVendas: 0,
        areaTecnica: 0,
      };
      curr.count += 1;
      if (s.tipoLoja === 'RUA') curr.rua += 1;
      else if (s.tipoLoja === 'SHOPPING') curr.shopping += 1;
      curr.areaTotal += s.areaTotal || 0;
      curr.areaVendas += s.areaVendas || 0;
      curr.areaTecnica += s.areaTecnica || 0;
      map.set(s.estado, curr);
    }
    return Array.from(map.values()).sort((a, b) => b.areaTotal - a.areaTotal);
  }, [stores]);

  const metricStats = useMemo(() => {
    const def =
      NUMERIC_INDICATOR_KEYS.find((d) => d.key === selectedMetricKey) ??
      NUMERIC_INDICATOR_KEYS[0];

    const populated = stores
      .map((s) => ({
        store: s,
        value: typeof s[def.key] === 'number' ? (s[def.key] as number) : null,
      }))
      .filter((item): item is { store: StoreAreaRecord; value: number } => item.value !== null && item.value > 0);

    const totalSum = populated.reduce((acc, item) => acc + item.value, 0);
    const avg = populated.length > 0 ? totalSum / populated.length : 0;
    const sorted = [...populated].sort((a, b) => b.value - a.value);
    const maxVal = sorted[0]?.value || 1;

    return {
      def,
      populatedCount: populated.length,
      totalSum,
      avg,
      topStores: sorted.slice(0, 12),
      maxVal,
    };
  }, [stores, selectedMetricKey]);

  const tipoComparison = useMemo(() => {
    const calc = (tipo: 'RUA' | 'SHOPPING' | 'CD' | 'ESCRITÓRIO') => {
      const list = stores.filter((s) => s.tipoLoja === tipo);
      const areaTotal = list.reduce((a, s) => a + (s.areaTotal || 0), 0);
      const areaVendas = list.reduce((a, s) => a + (s.areaVendas || 0), 0);
      const areaTecnica = list.reduce((a, s) => a + (s.areaTecnica || 0), 0);
      const withMez = list.filter((s) => (s.areaMezanino ?? 0) > 0).length;
      const withElev = list.filter((s) => s.elevador.toUpperCase().includes('SIM')).length;
      return {
        count: list.length,
        areaTotal,
        areaVendas,
        areaTecnica,
        avgTotal: list.length ? areaTotal / list.length : 0,
        withMez,
        withElev,
      };
    };
    return {
      rua: calc('RUA'),
      shopping: calc('SHOPPING'),
      cd: calc('CD'),
      escritorio: calc('ESCRITÓRIO'),
    };
  }, [stores]);

  const maxStateArea = stateSummary[0]?.areaTotal || 1;

  return (
    <div className="space-y-6">
      {/* Explorador Rápido por Indicador */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pesquisa por Indicador de Engenharia
            </h2>
            <p className="text-xs text-slate-500">
              Selecione qualquer indicador de área ou ar condicionado para inspecionar cobertura da rede, soma consolidada e unidades com maior demanda.
            </p>
          </div>
          <select
            value={selectedMetricKey}
            onChange={(e) => setSelectedMetricKey(e.target.value as keyof StoreAreaRecord)}
            aria-label="Selecionar indicador de engenharia"
            className="h-10 px-3 text-sm font-medium bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            {NUMERIC_INDICATOR_KEYS.map((ind) => (
              <option key={ind.key} value={ind.key}>
                {ind.label} ({ind.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Métricas do Indicador Selecionado */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Indicador</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{metricStats.def.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{metricStats.def.description}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Cobertura na Rede</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
              {metricStats.populatedCount} <span className="text-xs font-normal text-slate-500">de {stores.length} lojas</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Soma Consolidada</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
              {metricStats.def.unit === 'un'
                ? formatCount(metricStats.totalSum, true)
                : formatArea(metricStats.totalSum, true)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Média (Unidades com o indicador)</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
              {metricStats.def.unit === 'un'
                ? `${metricStats.avg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} un.`
                : formatArea(metricStats.avg, true)}
            </p>
          </div>
        </div>

        {/* Ranking das 12 maiores unidades no indicador */}
        {metricStats.topStores.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            Nenhuma unidade possui registro maior que zero para este indicador.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 pt-2">
            {metricStats.topStores.map(({ store, value }, idx) => (
              <button
                key={store.id ?? store.numero}
                type="button"
                onClick={() => onSelectStore(store)}
                className="text-left p-2.5 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-900 truncate">
                    <span className="font-mono text-slate-400 mr-1.5">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-mono text-blue-700 mr-1">{store.numero}</span>
                    {store.nome}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                    {metricStats.def.unit === 'un'
                      ? formatCount(value, true)
                      : formatArea(value, true)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-blue-700"
                    style={{ width: `${Math.max(4, (value / metricStats.maxVal) * 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Perfil RUA vs SHOPPING + Consolidação por UF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Perfil Operacional */}
        <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Perfil Operacional da Rede</h2>
            <p className="text-xs text-slate-500">
              Comparativo estrutural entre lojas de rua, shopping, CDs e escritórios.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              { title: 'Lojas de Rua', data: tipoComparison.rua, accent: 'text-blue-700' },
              { title: 'Lojas em Shopping', data: tipoComparison.shopping, accent: 'text-slate-900' },
              { title: 'Centros de Distribuição (CD)', data: tipoComparison.cd, accent: 'text-amber-700' },
              { title: 'Escritórios', data: tipoComparison.escritorio, accent: 'text-emerald-700' },
            ]
              .filter((grp) => grp.data.count > 0)
              .map((grp) => (
              <div key={grp.title} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className={`text-sm font-bold ${grp.accent}`}>{grp.title}</h3>
                  <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                    {grp.data.count} unidades
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Área Física</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatArea(grp.data.areaTotal, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Média / Unidade</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatArea(grp.data.avgTotal, true)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Aproveit. Vendas</span>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {formatPercent(grp.data.areaVendas, grp.data.areaTotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Elevadores / Mezanino</span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {grp.data.withElev} elev. · {grp.data.withMez} mez.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consolidação por UF */}
        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Consolidação por Estado (UF)
              </h2>
              <p className="text-xs text-slate-500">
                Toque em qualquer UF para filtrar diretamente em Infraestrutura.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {stateSummary.length} estados
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {stateSummary.map((row) => (
              <button
                key={row.uf}
                type="button"
                onClick={() => onFilterByState(row.uf)}
                className="w-full text-left px-4 sm:px-5 py-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-700">{row.uf}</span>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      ({row.rua} Rua · {row.shopping} Shop.)
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                    {row.count} {row.count === 1 ? 'loja' : 'lojas'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Área Física</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      {formatArea(row.areaTotal)} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Área Vendas</span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {formatArea(row.areaVendas)} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Área Téc.</span>
                    <span className="font-mono text-slate-700 tabular-nums">
                      {formatArea(row.areaTecnica)} m²
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-blue-700"
                    style={{ width: `${Math.max(4, (row.areaTotal / maxStateArea) * 100)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
