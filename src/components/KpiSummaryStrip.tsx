import { formatArea, formatCount, formatPercent, getStoreAcTotal } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface KpiSummaryStripProps {
  filteredStores: StoreAreaRecord[];
  totalStoresCount: number;
}

export function KpiSummaryStrip({ filteredStores, totalStoresCount }: KpiSummaryStripProps) {
  const count = filteredStores.length;
  const ruaCount = filteredStores.filter((s) => s.tipoLoja === 'RUA').length;
  const shoppingCount = filteredStores.filter((s) => s.tipoLoja === 'SHOPPING').length;

  const totalAreaFisica = filteredStores.reduce((sum, s) => sum + (s.areaTotal || 0), 0);
  const totalAreaVendas = filteredStores.reduce((sum, s) => sum + (s.areaVendas || 0), 0);
  const totalAreaTecnica = filteredStores.reduce((sum, s) => sum + (s.areaTecnica || 0), 0);
  const totalAcEquipments = filteredStores.reduce((sum, s) => sum + (getStoreAcTotal(s) || 0), 0);

  const isFiltered = count !== totalStoresCount;

  return (
    <section
      aria-label="Resumo consolidado de áreas"
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3"
    >
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-[11px] font-medium text-slate-500">Unidades</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
            {count}
          </span>
          {isFiltered && (
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              / {totalStoresCount}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500 truncate">
          {ruaCount} Rua · {shoppingCount} Shop.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-[11px] font-medium text-slate-500">Área Física</p>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums truncate">
            {formatArea(totalAreaFisica)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">m²</span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500 truncate font-mono tabular-nums">
          Méd. {formatArea(count > 0 ? totalAreaFisica / count : 0, true)}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-[11px] font-medium text-slate-500">Área de Vendas</p>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums truncate">
            {formatArea(totalAreaVendas)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">m²</span>
        </div>
        <p className="mt-0.5 text-[11px] text-emerald-700 font-mono font-medium tabular-nums truncate">
          {formatPercent(totalAreaVendas, totalAreaFisica)} da física
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <p className="text-[11px] font-medium text-slate-500">Climatização & Téc.</p>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCount(totalAcEquipments)}
          </span>
          <span className="text-[11px] font-medium text-slate-500">AC</span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums truncate">
          Téc. {formatArea(totalAreaTecnica, true)}
        </p>
      </div>
    </section>
  );
}
