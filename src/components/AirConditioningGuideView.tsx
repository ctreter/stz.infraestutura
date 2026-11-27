import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calculator,
  Check,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  Copy,
  MessageCircle,
  Search,
  ShieldAlert,
  Snowflake,
  Square,
  ThermometerSnowflake,
  Wrench,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AC_SYSTEMS,
  DIAGNOSTIC_STAGES,
  ESCALATION_CRITERIA,
  FIELD_CHECKLIST_ITEMS,
  FIELD_INSTRUMENTS,
  MANDATORY_SAFETY_RULES,
  MEASUREMENT_MATRIX,
  PREVENTIVE_VISIT_CHECKS,
  QUICK_SYMPTOM_MATRIX,
  RETURN_DEEP_DIVES,
  type AcSystemId,
  type AcSystemSpec,
} from '../data/acTechnicalGuide.ts';
import { getStoreFacades } from '../data/storeFacades.ts';
import { formatCount, getStoreAcTotal, normalizeText } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface AirConditioningGuideViewProps {
  stores: StoreAreaRecord[];
  onSelectStore: (store: StoreAreaRecord) => void;
}

type GuideSubView = 'sistemas' | 'sintomas' | 'ensaios' | 'avaliacao';

export function AirConditioningGuideView({
  stores,
  onSelectStore,
}: AirConditioningGuideViewProps) {
  const [subView, setSubView] = useState<GuideSubView>('sistemas');
  const [openedSystemId, setOpenedSystemId] = useState<AcSystemId | null>(null);
  const [failureSearch, setFailureSearch] = useState('');
  const [symptomFilter, setSymptomFilter] = useState('');
  const systemScrollRef = useRef<HTMLDivElement | null>(null);

  // Avaliação de Campo (Checklist interativo)
  const [evalStoreKey, setEvalStoreKey] = useState<string>('');
  const [evalSystemId, setEvalSystemId] = useState<AcSystemId>('hi-wall');
  const [evalEquipmentCode, setEvalEquipmentCode] = useState('');
  const [evalSymptom, setEvalSymptom] = useState('');
  const [evalMeasurements, setEvalMeasurements] = useState('');
  const [evalRootCause, setEvalRootCause] = useState('');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [selectedEscalations, setSelectedEscalations] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  // Calculadoras de triagem (Seção 3.1 do manual)
  const [vAB, setVAB] = useState('380');
  const [vBC, setVBC] = useState('378');
  const [vCA, setVCA] = useState('382');
  const [tSuc, setTSuc] = useState('12');
  const [tSatEvap, setTSatEvap] = useState('4');
  const [tSatCond, setTSatCond] = useState('42');
  const [tLiq, setTLiq] = useState('36');
  const [tRetAir, setTRetAir] = useState('25');
  const [tSupAir, setTSupAir] = useState('14');
  const [tWaterRet, setTWaterRet] = useState('12');
  const [tWaterSup, setTWaterSup] = useState('7');

  const selectedSystem: AcSystemSpec = useMemo(
    () => AC_SYSTEMS.find((s) => s.id === openedSystemId) ?? AC_SYSTEMS[0],
    [openedSystemId],
  );

  const openSystemWindow = useCallback((id: AcSystemId) => {
    setOpenedSystemId(id);
    setFailureSearch('');
    try {
      window.history.pushState({ stzAcWindow: id }, '');
    } catch {
      // ignore history errors in sandboxed frames
    }
  }, []);

  const closeSystemWindow = useCallback(() => {
    setOpenedSystemId(null);
    try {
      if (window.history.state && window.history.state.stzAcWindow) {
        window.history.back();
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      // Only close AC window if we navigated back past stzAcWindow (and not just closing a nested store window)
      if (!e.state?.stzAcWindow && !e.state?.stzStoreWindow) {
        setOpenedSystemId(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (openedSystemId && systemScrollRef.current) {
      systemScrollRef.current.scrollTop = 0;
    }
  }, [openedSystemId]);

  // Estatísticas da rede STZ por tipo de equipamento do catálogo
  const networkStats = useMemo(() => {
    const storesWithAc = stores.filter((s) => (getStoreAcTotal(s) ?? 0) > 0);
    const sumField = (field: 'acSplit' | 'acSplitaoSelf' | 'acFancoil' | 'acVrf') => {
      const matchingStores = stores.filter((s) => (s[field] ?? 0) > 0);
      const totalEquip = matchingStores.reduce((acc, s) => acc + (s[field] ?? 0), 0);
      return { storeCount: matchingStores.length, totalEquip, stores: matchingStores };
    };
    const totalEquipAll = stores.reduce((acc, s) => acc + (getStoreAcTotal(s) ?? 0), 0);
    return {
      storesWithAcCount: storesWithAc.length,
      totalEquipAll,
      acSplit: sumField('acSplit'),
      acSplitaoSelf: sumField('acSplitaoSelf'),
      acFancoil: sumField('acFancoil'),
      acVrf: sumField('acVrf'),
    };
  }, [stores]);

  const matchingStoresForSelectedSystem = useMemo(
    () => networkStats[selectedSystem.storeField].stores,
    [networkStats, selectedSystem.storeField],
  );

  const filteredFailures = useMemo(() => {
    const q = normalizeText(failureSearch);
    if (!q) return selectedSystem.falhas;
    return selectedSystem.falhas.filter((f) =>
      [f.sintoma, ...f.causas, ...f.acoes].some((txt) => normalizeText(txt).includes(q)),
    );
  }, [selectedSystem, failureSearch]);

  const filteredQuickSymptoms = useMemo(() => {
    const q = normalizeText(symptomFilter);
    if (!q) return QUICK_SYMPTOM_MATRIX;
    return QUICK_SYMPTOM_MATRIX.filter((row) =>
      [row.sintoma, row.primeiroVerificar, row.naoFazerPrimeiro].some((txt) =>
        normalizeText(txt).includes(q),
      ),
    );
  }, [symptomFilter]);

  const evalChecklistItems = useMemo(
    () =>
      FIELD_CHECKLIST_ITEMS.filter(
        (item) => !item.appliesTo || item.appliesTo.includes(evalSystemId),
      ),
    [evalSystemId],
  );

  const selectedEvalStore = useMemo(
    () => stores.find((s) => (s.id ?? s.numero) === evalStoreKey) ?? null,
    [stores, evalStoreKey],
  );

  const evalSystemSpec = useMemo(
    () => AC_SYSTEMS.find((s) => s.id === evalSystemId) ?? AC_SYSTEMS[0],
    [evalSystemId],
  );

  const toggleCheck = (id: string) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEscalation = (item: string) => {
    setSelectedEscalations((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  };

  const handleStartEvaluationForStore = (store: StoreAreaRecord, systemId: AcSystemId) => {
    setEvalStoreKey(store.id ?? store.numero);
    setEvalSystemId(systemId);
    setOpenedSystemId(null);
    setSubView('avaliacao');
  };

  const resetEvaluation = () => {
    setEvalEquipmentCode('');
    setEvalSymptom('');
    setEvalMeasurements('');
    setEvalRootCause('');
    setCheckedSteps({});
    setSelectedEscalations([]);
  };

  const evaluationReportText = useMemo(() => {
    const doneItems = evalChecklistItems.filter((i) => checkedSteps[i.id]);
    const pendingItems = evalChecklistItems.filter((i) => !checkedSteps[i.id]);
    const storeLabel = selectedEvalStore
      ? `Loja ${selectedEvalStore.numero} - ${selectedEvalStore.nome} (${selectedEvalStore.cidade}/${selectedEvalStore.estado})`
      : 'Unidade não selecionada';

    const lines = [
      '*AVALIAÇÃO TÉCNICA DE AR CONDICIONADO — STZ*',
      `Unidade: ${storeLabel}`,
      `Sistema avaliado: ${evalSystemSpec.nome} (${evalSystemSpec.ciclo})`,
      evalEquipmentCode.trim() ? `Equipamento / Ativo: ${evalEquipmentCode.trim()}` : '',
      evalSymptom.trim() ? `Sintoma / Reclamação: ${evalSymptom.trim()}` : '',
      `Checklist concluído: ${doneItems.length} de ${evalChecklistItems.length} etapas`,
      pendingItems.length > 0
        ? `Pendências de inspeção: ${pendingItems.map((i) => i.etapa).join(', ')}`
        : 'Pendências de inspeção: Nenhuma (todas as etapas verificadas)',
      evalMeasurements.trim() ? `Medições registradas: ${evalMeasurements.trim()}` : '',
      evalRootCause.trim() ? `Diagnóstico / Causa-raiz: ${evalRootCause.trim()}` : '',
      selectedEscalations.length > 0
        ? `CRITÉRIOS DE ESCALONAMENTO ATIVADOS:\n- ${selectedEscalations.join('\n- ')}`
        : 'Escalonamento: Não requerido até o momento',
    ];
    return lines.filter(Boolean).join('\n');
  }, [
    evalChecklistItems,
    checkedSteps,
    selectedEvalStore,
    evalSystemSpec,
    evalEquipmentCode,
    evalSymptom,
    evalMeasurements,
    evalRootCause,
    selectedEscalations,
  ]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(evaluationReportText);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      setCopySuccess(false);
    }
  };

  // Cálculos técnicos em tempo real
  const imbalanceCalc = useMemo(() => {
    const a = Number(vAB);
    const b = Number(vBC);
    const c = Number(vCA);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a <= 0 || b <= 0 || c <= 0) {
      return null;
    }
    const mean = (a + b + c) / 3;
    const maxDev = Math.max(Math.abs(a - mean), Math.abs(b - mean), Math.abs(c - mean));
    const pct = (maxDev / mean) * 100;
    return { mean, pct, alert: pct > 1 };
  }, [vAB, vBC, vCA]);

  const thermalCalcs = useMemo(() => {
    const sh = Number(tSuc) - Number(tSatEvap);
    const sc = Number(tSatCond) - Number(tLiq);
    const dtAir = Number(tRetAir) - Number(tSupAir);
    const dtWater = Number(tWaterRet) - Number(tWaterSup);
    return {
      superheat: Number.isFinite(sh) ? sh : null,
      subcooling: Number.isFinite(sc) ? sc : null,
      dtAir: Number.isFinite(dtAir) ? dtAir : null,
      dtWater: Number.isFinite(dtWater) ? dtWater : null,
    };
  }, [tSuc, tSatEvap, tSatCond, tLiq, tRetAir, tSupAir, tWaterRet, tWaterSup]);

  const completedCount = evalChecklistItems.filter((i) => checkedSteps[i.id]).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Cabeçalho slim e abas do módulo de Ar Condicionado */}
      <section className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Guia Técnico de Ar Condicionado
            </h2>
            <p className="text-[11px] text-slate-500 font-mono tabular-nums">
              6 sistemas · {networkStats.storesWithAcCount} lojas · {formatCount(networkStats.totalEquipAll, true)}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Seções do módulo de Ar Condicionado"
            className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto"
          >
            {[
              { id: 'sistemas' as const, label: 'Tipos (6)' },
              { id: 'sintomas' as const, label: 'Sintomas' },
              { id: 'ensaios' as const, label: 'Ensaios' },
              { id: 'avaliacao' as const, label: 'Avaliação' },
            ].map((tab) => {
              const active = subView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSubView(tab.id)}
                  className={`min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    active
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABA 1: LISTA SLIM DOS 6 TIPOS DE AR CONDICIONADO (toque para abrir nova janela) */}
      {subView === 'sistemas' && (
        <div className="space-y-2.5">
          <p className="px-0.5 text-xs text-slate-500">
            Toque em um tipo de ar condicionado para abrir em nova janela as falhas, manutenção e lojas STZ:
          </p>

          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
            {AC_SYSTEMS.map((sys) => {
              const stat = networkStats[sys.storeField];
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => openSystemWindow(sys.id)}
                  className="w-full text-left px-3.5 py-3 hover:bg-blue-50/50 active:bg-blue-50 transition-colors flex items-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                >
                  <div
                    aria-hidden="true"
                    className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-700"
                  >
                    <Snowflake className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] leading-none">
                      <span className="font-mono font-semibold text-blue-700">
                        {sys.secaoManual}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {stat.storeCount} lojas · {formatCount(stat.totalEquip)} un.
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-bold text-slate-900 truncate leading-tight">
                      {sys.nome}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                      {sys.subtitulo} · {sys.falhas.length} falhas mapeadas
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* NOVA JANELA EM TELA CHEIA DO TIPO DE AR CONDICIONADO SELECIONADO */}
      {openedSystemId && (
        <div
          className="fixed inset-0 z-40 bg-slate-50 flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ac-system-window-title"
        >
          {/* Barra superior slim da janela */}
          <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={closeSystemWindow}
                aria-label="Voltar para a tela anterior"
                className="inline-flex items-center gap-1 min-h-[34px] px-2 -ml-1 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
              <span className="text-slate-200" aria-hidden="true">|</span>
              <span className="text-xs sm:text-sm font-bold text-blue-700 truncate">
                {selectedSystem.nome}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEvalSystemId(selectedSystem.id);
                setOpenedSystemId(null);
                setSubView('avaliacao');
              }}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Avaliar</span>
            </button>
          </header>

          {/* Conteúdo rolável na vertical */}
          <div
            ref={systemScrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="max-w-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4">
              {/* Identificação e funcionamento */}
              <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="font-mono text-xs text-blue-700 font-semibold">
                    {selectedSystem.secaoManual} · {selectedSystem.ciclo}
                  </p>
                  <h3
                    id="ac-system-window-title"
                    className="mt-0.5 text-lg font-bold text-slate-900"
                  >
                    {selectedSystem.nome}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedSystem.subtitulo}</p>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {selectedSystem.descricao}
                </p>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Arquitetura e componentes principais
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedSystem.componentesPrincipais.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Foco de manutenção preventiva
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedSystem.manutencaoPreventivaFoco.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Wrench className="w-3.5 h-3.5 text-blue-700 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Falhas possíveis e sequência de correção */}
              <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-200 space-y-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Falhas Possíveis e Sequência de Correção
                    </h4>
                    <p className="text-xs text-slate-500">
                      Causas prováveis e ordem recomendada de intervenção.
                    </p>
                  </div>
                  <div className="relative w-full">
                    <Search
                      className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={failureSearch}
                      onChange={(e) => setFailureSearch(e.target.value)}
                      placeholder="Filtrar sintoma ou causa..."
                      aria-label="Filtrar falhas do sistema"
                      className="w-full h-10 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {filteredFailures.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Nenhuma falha encontrada para "{failureSearch}".
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredFailures.map((falha) => (
                      <div key={falha.sintoma} className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-900">
                            {falha.sintoma}
                          </h5>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              falha.criticidade === 'alta'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                            {falha.criticidade === 'alta'
                              ? 'Atenção imediata / risco operacional'
                              : 'Desempenho / preventiva'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-1">
                              Causas a investigar
                            </p>
                            <ul className="space-y-1 text-xs text-slate-600">
                              {falha.causas.map((c) => (
                                <li key={c} className="flex items-start gap-2">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                                  <span>{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-blue-800 mb-1">
                              Sequência de ação e correção
                            </p>
                            <ol className="space-y-1 text-xs text-slate-700">
                              {falha.acoes.map((a, idx) => (
                                <li key={a} className="flex items-start gap-2">
                                  <span className="font-mono text-[11px] font-semibold text-blue-700 shrink-0 mt-0.5">
                                    {idx + 1}.
                                  </span>
                                  <span>{a}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Premissas de retorno */}
              <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Premissas de Retorno e Instalação
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedSystem.premissasRetorno.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-700 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                {selectedSystem.sintomasRetornoInadequado && (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <p className="text-xs font-bold text-amber-800">
                      Sintomas típicos de retorno inadequado
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {selectedSystem.sintomasRetornoInadequado.map((s) => (
                        <li key={s} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Roteiro específico */}
              <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedSystem.roteiroEspecificoTitulo}
                </h4>
                <ol className="space-y-2 text-xs text-slate-700">
                  {selectedSystem.roteiroEspecifico.map((step, idx) => (
                    <li key={step} className="flex items-start gap-2.5">
                      <span className="font-mono text-xs font-bold text-blue-700 tabular-nums shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Lojas STZ com este sistema (lista slim clicável) */}
              <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Lojas STZ com {selectedSystem.storeFieldLabel}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Toque na loja para abrir fachada e ficha técnica.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums shrink-0">
                    {matchingStoresForSelectedSystem.length} lojas
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {matchingStoresForSelectedSystem.map((s) => {
                    const thumb = getStoreFacades(s.numero)[0];
                    return (
                      <div
                        key={s.id ?? s.numero}
                        className="px-3.5 py-2.5 hover:bg-blue-50/50 transition-colors flex items-center gap-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectStore(s)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={`Fachada ${s.numero}`}
                              loading="lazy"
                              className="w-10 h-8 rounded object-cover border border-slate-200 bg-slate-100 shrink-0"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="w-10 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              <span className="font-mono text-blue-700 mr-1.5">{s.numero}</span>
                              {s.nome}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 tabular-nums truncate">
                              {s.cidade}/{s.estado} · {selectedSystem.storeFieldLabel}:{' '}
                              <strong className="text-slate-800">
                                {formatCount(s[selectedSystem.storeField])}
                              </strong>
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEvaluationForStore(s, selectedSystem.id)}
                          className="min-h-[34px] px-2.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded shrink-0 cursor-pointer"
                        >
                          Avaliar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DIAGNÓSTICO POR SINTOMA (Seções 3, 10, 11 e 14.4) */}
      {subView === 'sintomas' && (
        <div className="space-y-6">
          {/* Matriz rápida por sintoma (Seção 11) */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Matriz de Diagnóstico Rápido por Sintoma (Seção 11)
                </h3>
                <p className="text-xs text-slate-500">
                  Triagem imediata do que verificar primeiro e erros comuns a evitar em campo.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={symptomFilter}
                  onChange={(e) => setSymptomFilter(e.target.value)}
                  placeholder="Buscar sintoma (ex.: gelo, ruído)..."
                  aria-label="Filtrar matriz de sintomas"
                  className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredQuickSymptoms.map((row) => (
                <div key={row.sintoma} className="p-4 sm:p-5 space-y-2 text-xs">
                  <h4 className="text-sm font-bold text-slate-900">{row.sintoma}</h4>
                  <div>
                    <span className="font-semibold text-slate-700 block">Primeiro verificar:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{row.primeiroVerificar}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-rose-800 block">
                      Não fazer como primeira ação:
                    </span>
                    <p className="text-rose-700 font-medium mt-0.5 leading-relaxed">
                      {row.naoFazerPrimeiro}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Roteiro geral de diagnóstico em 7 etapas (Seção 3) */}
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Roteiro Geral de Diagnóstico em Campo — 7 Etapas (Seção 3)
              </h3>
              <p className="text-xs text-slate-500">
                Sequência lógica obrigatória para evitar substituições de peças e cargas de gás desnecessárias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIAGNOSTIC_STAGES.map((stage) => (
                <div
                  key={stage.etapa}
                  className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {stage.etapa}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{stage.titulo}</h4>
                  <p className="text-xs text-slate-500">{stage.objetivo}</p>
                  <ul className="pt-2 border-t border-slate-200/70 space-y-1.5 text-xs text-slate-700">
                    {stage.itens.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Análise aprofundada dos problemas de retorno (Seção 10) */}
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Análise Aprofundada de Retorno e Pressão da Loja (Seção 10)
              </h3>
              <p className="text-xs text-slate-500">
                O retorno não é apenas "uma grelha de sucção": problemas de retorno reproduzem sintomas de falta de capacidade, congelamento e alto consumo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RETURN_DEEP_DIVES.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-slate-200 rounded-lg space-y-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.titulo}</h4>
                    <p className="mt-0.5 text-xs text-slate-600">{item.resumo}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">Causas ou sinais</p>
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {item.causasOuSinais.map((c) => (
                          <li key={c} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-amber-800">Efeitos e riscos</p>
                      <ul className="mt-1 space-y-1 text-slate-600">
                        {item.efeitosOuRiscos.map((e) => (
                          <li key={e} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-600 shrink-0" />
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-blue-800">Correção recomendada</p>
                      <ul className="mt-1 space-y-1 text-slate-700">
                        {item.correcao.map((cor) => (
                          <li key={cor} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-700 shrink-0" />
                            <span>{cor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ABA 3: ENSAIOS, SEGURANÇA E ESCALONAMENTO (Seções 1, 3.1, 12, 13, 14) */}
      {subView === 'ensaios' && (
        <div className="space-y-6">
          {/* Segurança obrigatória + Instrumentos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h3 className="text-base font-bold text-slate-900">
                  Segurança Obrigatória Antes de Qualquer Intervenção (Seção 1)
                </h3>
              </div>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-700 pt-1">
                {MANDATORY_SAFETY_RULES.map((rule, idx) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-rose-700 tabular-nums shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Instrumentos Úteis de Campo
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {FIELD_INSTRUMENTS.map((inst) => (
                  <li key={inst} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-700 shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Calculadoras de apoio técnico (fórmulas exatas do guia) */}
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Calculadoras de Triagem e Medições do Guia (Seção 3.1)
                </h3>
                <p className="text-xs text-slate-500">
                  Valores auxiliares para interpretar leituras com o equipamento estabilizado. Não substituem o alvo oficial do fabricante.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Desequilíbrio trifásico */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">Desequilíbrio Trifásico (%)</p>
                  <p className="text-[11px] text-slate-500">Triagem de referência: até 1%</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'V AB', val: vAB, set: setVAB },
                    { label: 'V BC', val: vBC, set: setVBC },
                    { label: 'V CA', val: vCA, set: setVCA },
                  ].map((f) => (
                    <label key={f.label} className="block">
                      <span className="block text-[11px] text-slate-500">{f.label}</span>
                      <input
                        type="number"
                        value={f.val}
                        onChange={(e) => f.set(e.target.value)}
                        className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                      />
                    </label>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Resultado:</span>
                  {imbalanceCalc ? (
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        imbalanceCalc.alert ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {imbalanceCalc.pct.toFixed(2)}%{' '}
                      {imbalanceCalc.alert ? '(Investigar rede)' : '(Dentro triagem ≤1%)'}
                    </span>
                  ) : (
                    <span className="font-mono text-slate-400">—</span>
                  )}
                </div>
              </div>

              {/* Superaquecimento e Sub-resfriamento */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Superaquecimento & Sub-resfriamento
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Orvalho p/ SH e bolha p/ SC se houver glide
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T sucção (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tSuc}
                      onChange={(e) => setTSuc(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T sat. evap (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tSatEvap}
                      onChange={(e) => setTSatEvap(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T sat. cond (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tSatCond}
                      onChange={(e) => setTSatCond(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T líquido (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tLiq}
                      onChange={(e) => setTLiq(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-700">
                    SH:{' '}
                    <strong className="text-blue-700">
                      {thermalCalcs.superheat !== null ? `${thermalCalcs.superheat.toFixed(1)} K` : '—'}
                    </strong>
                  </span>
                  <span className="text-slate-700">
                    SC:{' '}
                    <strong className="text-blue-700">
                      {thermalCalcs.subcooling !== null ? `${thermalCalcs.subcooling.toFixed(1)} K` : '—'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Delta T do Ar */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">ΔT do Ar na Evaporadora</p>
                  <p className="text-[11px] text-slate-500">
                    ΔT alto com baixa vazão pode indicar restrição
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T retorno (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tRetAir}
                      onChange={(e) => setTRetAir(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T insuflação (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tSupAir}
                      onChange={(e) => setTSupAir(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">ΔT ar:</span>
                  <span className="font-mono font-bold text-blue-700 tabular-nums">
                    {thermalCalcs.dtAir !== null ? `${thermalCalcs.dtAir.toFixed(1)} °C` : '—'}
                  </span>
                </div>
              </div>

              {/* Delta T da Água (Fan Coil) */}
              <div className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">ΔT da Água (Fan Coil)</p>
                  <p className="text-[11px] text-slate-500">
                    Comparar com seleção da serpentina/projeto
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T saída/ret. (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tWaterRet}
                      onChange={(e) => setTWaterRet(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-[11px] text-slate-500">T entrada/alim. (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tWaterSup}
                      onChange={(e) => setTWaterSup(e.target.value)}
                      className="mt-0.5 w-full h-8 px-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded"
                    />
                  </label>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">ΔT água:</span>
                  <span className="font-mono font-bold text-blue-700 tabular-nums">
                    {thermalCalcs.dtWater !== null ? `${thermalCalcs.dtWater.toFixed(1)} °C` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Matriz resumida de medições e critérios de aceitação */}
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Matriz Resumida de Medições e Critérios de Aceitação (Seção 3.1.7)
              </h3>
              <p className="text-xs text-slate-500">
                Ordem de referência: 1º Manual do fabricante → 2º Projeto/comissionamento → 3º Normas aplicáveis → 4º Triagem deste guia.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {MEASUREMENT_MATRIX.map((row) => (
                <div key={row.ensaio} className="p-4 sm:p-5 space-y-2 text-xs">
                  <h4 className="text-sm font-bold text-slate-900">{row.ensaio}</h4>
                  <div>
                    <span className="font-semibold text-slate-700 block">Onde e como medir:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{row.ondeComo}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800 block">Critério de aceitação:</span>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{row.criterioAceitacao}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Inspeção preventiva + Critérios de escalonamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Inspeção Preventiva — Em Cada Visita (Seção 12)
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {PREVENTIVE_VISIT_CHECKS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                Critérios para Escalar Atendimento à Engenharia / Especialista (Seção 13)
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {ESCALATION_CRITERIA.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* ABA 4: AVALIAÇÃO INTERATIVA EM CAMPO */}
      {subView === 'avaliacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Painel de preenchimento e checklist */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Avaliação Técnica em Campo por Equipamento
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione a loja, o sistema e execute o roteiro de manutenção para gerar o registro técnico ou enviar via WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={resetEvaluation}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap shrink-0"
              >
                Limpar formulário
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade / Loja STZ
                </span>
                <select
                  value={evalStoreKey}
                  onChange={(e) => setEvalStoreKey(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Selecionar unidade (opcional)...</option>
                  {stores.map((s) => {
                    const key = s.id ?? s.numero;
                    return (
                      <option key={key} value={key}>
                        {s.numero} — {s.nome} ({s.cidade}/{s.estado})
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Sistema de Ar Condicionado
                </span>
                <select
                  value={evalSystemId}
                  onChange={(e) => setEvalSystemId(e.target.value as AcSystemId)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {AC_SYSTEMS.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.nome} ({sys.ciclo})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Identificação do ativo / tag / modelo
                </span>
                <input
                  type="text"
                  value={evalEquipmentCode}
                  onChange={(e) => setEvalEquipmentCode(e.target.value)}
                  placeholder="Ex.: EVAP-02 Salão / VRF 12HP / Série..."
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Sintoma ou falha observada
                </span>
                <select
                  value={evalSymptom}
                  onChange={(e) => setEvalSymptom(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Manutenção preventiva de rotina / selecionar falha...</option>
                  {evalSystemSpec.falhas.map((f) => (
                    <option key={f.sintoma} value={f.sintoma}>
                      {f.sintoma}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedEvalStore && (
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">
                    Parque instalado na loja {selectedEvalStore.numero}:
                  </span>{' '}
                  <span className="font-mono tabular-nums">
                    Split: {formatCount(selectedEvalStore.acSplit)} · Splitão/Self:{' '}
                    {formatCount(selectedEvalStore.acSplitaoSelf)} · Fan Coil:{' '}
                    {formatCount(selectedEvalStore.acFancoil)} · VRF:{' '}
                    {formatCount(selectedEvalStore.acVrf)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectStore(selectedEvalStore)}
                  className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Abrir ficha da loja
                </button>
              </div>
            )}

            {/* Checklist interativo das etapas do manual */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Checklist de Inspeção e Manutenção — {evalSystemSpec.nome}
                </h4>
                <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                  {completedCount} / {evalChecklistItems.length} verificados
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {evalChecklistItems.map((item) => {
                  const checked = !!checkedSteps[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
                        checked ? 'bg-emerald-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 mr-1.5">
                          [{item.etapa}]
                        </span>
                        <span className={checked ? 'text-slate-600 line-through' : 'text-slate-700'}>
                          {item.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medições e diagnóstico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Medições registradas (T retorno/insuf., tensão, corrente, código de falha)
                </span>
                <textarea
                  rows={3}
                  value={evalMeasurements}
                  onChange={(e) => setEvalMeasurements(e.target.value)}
                  placeholder="Ex.: T ret 24,8°C · T insuf 13,2°C · 380V trifásico · Sem código ativo..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold text-slate-700 mb-1">
                  Causa-raiz identificada, ação executada e recomendações
                </span>
                <textarea
                  rows={3}
                  value={evalRootCause}
                  onChange={(e) => setEvalRootCause(e.target.value)}
                  placeholder="Ex.: Filtro saturado e retorno bloqueado por estoque; realizada limpeza e liberação do fluxo..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
            </div>

            {/* Critérios de escalonamento acionáveis */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">
                Critérios de escalonamento detectados (marque se aplicável)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ESCALATION_CRITERIA.slice(0, 6).map((crit) => {
                  const active = selectedEscalations.includes(crit);
                  return (
                    <button
                      key={crit}
                      type="button"
                      onClick={() => toggleEscalation(crit)}
                      className={`text-left px-3 py-2 rounded-md border text-xs flex items-start gap-2 transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          active ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      />
                      <span>{crit}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Coluna direita: Registro gerado e envio */}
          <aside className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-900">
                Resumo Técnico da Avaliação
              </h3>
            </div>

            <pre className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words overflow-x-hidden font-mono">
              {evaluationReportText}
            </pre>

            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(evaluationReportText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar avaliação via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyReport}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-800">Resumo copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar registro técnico</span>
                  </>
                )}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
