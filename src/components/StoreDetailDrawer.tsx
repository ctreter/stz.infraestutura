import {
  ArrowLeft,
  ArrowLeftRight,
  Camera,
  Pencil,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getStoreFacades } from '../data/storeFacades.ts';
import {
  formatArea,
  formatCount,
  formatPercent,
  getStoreAcTotal,
  getStoreKey,
} from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface StoreDetailDrawerProps {
  store: StoreAreaRecord | null;
  onClose: () => void;
  onEdit: (store: StoreAreaRecord) => void;
  onDelete: (numero: string) => Promise<void>;
  onAddToCompare: (numero: string) => void;
}

function MetricRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-600 shrink-0">{label}</span>
      <span
        className={`font-mono text-xs tabular-nums text-right break-words min-w-0 ${
          highlight ? 'font-semibold text-slate-900' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TextRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-4 py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className="text-xs font-medium text-slate-800 sm:text-right break-words min-w-0">
        {value?.trim() || '—'}
      </span>
    </div>
  );
}

function AccessStatusRow({ label, status }: { label: string; status: string }) {
  const upper = status.trim().toUpperCase();
  const colorClass =
    upper === 'SIM'
      ? 'text-emerald-700 font-semibold'
      : upper === 'SIM*' || upper === '*OBS'
      ? 'text-amber-700 font-semibold'
      : upper === 'NÃO' || upper === 'NAO'
      ? 'text-rose-700 font-semibold'
      : 'text-slate-400';

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-600">{label}</span>
      <span className={`font-mono text-xs ${colorClass}`}>{status || '—'}</span>
    </div>
  );
}

export function StoreDetailDrawer({
  store,
  onClose,
  onEdit,
  onDelete,
  onAddToCompare,
}: StoreDetailDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [targetWhatsapp, setTargetWhatsapp] = useState('');
  const [includeExtraDetails, setIncludeExtraDetails] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!store) return;
    setConfirmDelete(false);
    setFailedImages({});
    setZoomedPhoto(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [store?.id, store?.numero]);

  if (!store) return null;

  const storeKey = getStoreKey(store);
  const facadePhotos = getStoreFacades(store.numero).filter((src) => !failedImages[src]);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(storeKey);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const composedFullAddress = [
    store.endereco?.trim(),
    store.bairro?.trim() &&
    !store.endereco?.toLowerCase().includes(store.bairro.trim().toLowerCase())
      ? store.bairro.trim()
      : '',
    !store.endereco?.toLowerCase().includes(store.cidade.toLowerCase())
      ? `${store.cidade} - ${store.estado}`
      : '',
    store.cep?.trim() ? `CEP ${store.cep.trim()}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const rawLines: Array<string | null> = [
    `*STZ Engenharia e Manutenção — Dados da Loja*`,
    ``,
    `Número da Loja: ${store.numero} (${store.nome})`,
    `CNPJ: ${store.cnpj}`,
    `Endereço Completo: ${composedFullAddress || `${store.cidade} - ${store.estado}`}`,
    ``,
    `*Dados do Gerente da Loja:*`,
    `Gerente Responsável: ${store.gerenteResponsavel?.trim() || 'Não informado'}`,
    `Tel. Comerciais: ${store.telComerciais?.trim() || 'Não informado'}`,
    store.ramal?.trim() ? `Ramal: ${store.ramal.trim()}` : null,
    store.regionalResponsavel?.trim()
      ? `Regional Responsável: ${store.regionalResponsavel.trim()}`
      : null,
  ];

  const acTotal = getStoreAcTotal(store);

  if (includeExtraDetails) {
    rawLines.push(
      ``,
      `*Operação & Áreas:*`,
      `- Tipo: ${store.tipoLoja}${store.regiao ? ` | Região: ${store.regiao}` : ''}`,
      store.horarioSemana ? `- Horário Semana: ${store.horarioSemana}` : null,
      store.horarioSabado ? `- Sábado: ${store.horarioSabado}` : null,
      store.horarioDomingo ? `- Domingo: ${store.horarioDomingo}` : null,
      `- Área Física Total: ${formatArea(store.areaTotal, true)}`,
      `- Área de Vendas: ${formatArea(store.areaVendas, true)}`,
      `- Área Técnica Útil: ${formatArea(store.areaTecnica, true)}`,
      `- Elevador: ${store.elevador} | Plataforma PNE: ${store.plataformaPne}`,
      acTotal !== null
        ? `- Ar Condicionado (${acTotal} un.): Split ${formatCount(store.acSplit)}, Splitão/Self ${formatCount(store.acSplitaoSelf)}, Fancoil ${formatCount(store.acFancoil)}, VRF ${formatCount(store.acVrf)}`
        : null,
    );
  }

  const formattedMessage = rawLines
    .filter((line): line is string => line !== null)
    .join('\n');

  const cleanDigits = targetWhatsapp.replace(/\D/g, '');
  const waPhone = cleanDigits
    ? cleanDigits.startsWith('55')
      ? cleanDigits
      : `55${cleanDigits}`
    : '';
  const whatsappHref = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(formattedMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`;

  const retaguardaSum =
    (store.copa || 0) +
    (store.salaTi || 0) +
    (store.salaVm || 0) +
    (store.almox || 0) +
    (store.casaMaq || 0) +
    (store.subestacao || 0) +
    (store.deposito || 0) +
    (store.sanitFem || 0) +
    (store.sanitMasc || 0) +
    (store.sanitPne || 0);

  return (
    <div
      className="fixed inset-0 z-[45] bg-slate-50 flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-store-title"
    >
      {/* Barra superior slim da nova janela da loja */}
      <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Voltar para a tela anterior"
            className="inline-flex items-center gap-1 min-h-[34px] px-2 -ml-1 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
          <span className="text-slate-200" aria-hidden="true">|</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 truncate">
            Loja {store.numero}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => onEdit(store)}
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
        </div>
      </header>

      {/* Conteúdo dedicado rolável na vertical */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="max-w-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 space-y-5">
          {/* Título da unidade */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-mono font-bold text-blue-700">
                Loja {store.numero}
              </span>
              <span aria-hidden="true">·</span>
              <span>{store.tipoLoja}</span>
              <span aria-hidden="true">·</span>
              <span>
                {store.cidade} / {store.estado}
              </span>
            </div>
            <h2
              id="drawer-store-title"
              className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-snug"
            >
              {store.nome}
            </h2>
          </div>

          {/* 1. FOTO(S) DA FACHADA DA LOJA */}
          <section aria-label="Fotos da fachada da loja" className="space-y-2.5">
            {facadePhotos.length > 0 ? (
              <div className="space-y-3">
                {facadePhotos.map((photoSrc, idx) => (
                  <button
                    key={photoSrc}
                    type="button"
                    onClick={() => setZoomedPhoto(photoSrc)}
                    className="block w-full text-left rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                  >
                    <img
                      src={photoSrc}
                      alt={`Fachada da loja ${store.numero} - ${store.nome} (${idx + 1})`}
                      loading="eager"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [photoSrc]: true }))
                      }
                      className="w-full max-h-60 sm:max-h-72 object-cover block"
                    />
                    <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>
                        {facadePhotos.length > 1
                          ? `Foto ${idx + 1} de ${facadePhotos.length}`
                          : 'Fachada da unidade'}
                      </span>
                      <span>Toque para ampliar</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-300 bg-white flex items-center gap-3 text-xs text-slate-500">
                <Camera className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Foto da fachada não disponível no catálogo para esta unidade.</span>
              </div>
            )}
          </section>

          {/* 2. ENVIO AO FORNECEDOR POR WHATSAPP */}
          <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900">
                Enviar ao Fornecedor via WhatsApp
              </span>
              <span className="text-[11px] text-slate-500">Inclui gerente</span>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeExtraDetails}
                onChange={(e) => setIncludeExtraDetails(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span>Incluir horários, áreas e AC no envio</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={targetWhatsapp}
                onChange={(e) => setTargetWhatsapp(e.target.value)}
                placeholder="WhatsApp destinatário (opcional, DDD)"
                aria-label="WhatsApp do destinatário"
                className="flex-1 h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar ao Fornecedor</span>
              </a>
            </div>
          </section>

          {/* 3. CARACTERÍSTICAS DA LOJA — TODAS UMA ABAIXO DA OUTRA */}
          <section className="space-y-4">
            {/* Identificação & Áreas Principais (uma abaixo da outra) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Identificação e Áreas Principais
              </h3>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <MetricRow label="Número da Unidade" value={store.numero} highlight />
                <TextRow label="Nome da Unidade" value={store.nome} />
                <MetricRow label="Tipo" value={store.tipoLoja} />
                <MetricRow label="CNPJ" value={store.cnpj} />
                <MetricRow
                  label="Área Física Total"
                  value={formatArea(store.areaTotal, true)}
                  highlight
                />
                <MetricRow
                  label="Área de Vendas"
                  value={`${formatArea(store.areaVendas, true)} (${formatPercent(store.areaVendas, store.areaTotal)})`}
                  highlight
                />
                <MetricRow
                  label="Área Técnica Útil"
                  value={`${formatArea(store.areaTecnica, true)} (${formatPercent(store.areaTecnica || 0, store.areaTotal)})`}
                  highlight
                />
              </div>
            </div>

            {/* Localização & Contatos da Unidade */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Localização, Gerência e Contatos
              </h3>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <TextRow label="Endereço" value={store.endereco} />
                <TextRow label="Bairro" value={store.bairro} />
                <TextRow label="Cidade / UF" value={`${store.cidade} / ${store.estado}`} />
                <MetricRow label="CEP" value={store.cep || '—'} />
                <TextRow label="Região" value={store.regiao} />
                <TextRow label="Gerente Responsável" value={store.gerenteResponsavel} />
                <TextRow label="Regional Responsável" value={store.regionalResponsavel} />
                <MetricRow label="Ramal" value={store.ramal || '—'} />
                <TextRow label="Tel. Comerciais" value={store.telComerciais} />
              </div>
            </div>

            {/* Horário de Funcionamento */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Horário de Funcionamento
              </h3>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <MetricRow label="Abre aos Domingos?" value={store.abreDom || '—'} />
                <MetricRow label="Segunda a Sexta" value={store.horarioSemana || '—'} />
                <MetricRow label="Sábado" value={store.horarioSabado || '—'} />
                <MetricRow label="Domingo" value={store.horarioDomingo || '—'} />
              </div>
            </div>

            {/* Climatização — Ar Condicionado */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Climatização (Ar Condicionado)
                </h3>
                <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                  Total: {formatCount(acTotal, true)}
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <MetricRow label="Split" value={formatCount(store.acSplit, true)} />
                <MetricRow label="Splitão / Self" value={formatCount(store.acSplitaoSelf, true)} />
                <MetricRow label="Fancoil" value={formatCount(store.acFancoil, true)} />
                <MetricRow label="VRF" value={formatCount(store.acVrf, true)} />
                <MetricRow
                  label="Total de Equipamentos (AC)"
                  value={formatCount(acTotal, true)}
                  highlight
                />
              </div>
            </div>

            {/* Retaguarda & Áreas Técnicas */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Retaguarda e Ambientes Técnicos
                </h3>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  Soma: {formatArea(retaguardaSum, true)}
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <MetricRow label="Copa" value={formatArea(store.copa, true)} />
                <MetricRow label="Sala TI" value={formatArea(store.salaTi, true)} />
                <MetricRow label="Sala VM" value={formatArea(store.salaVm, true)} />
                <MetricRow label="Almoxarifado" value={formatArea(store.almox, true)} />
                <MetricRow label="Casa de Máquinas" value={formatArea(store.casaMaq, true)} />
                <MetricRow label="Subestação" value={formatArea(store.subestacao, true)} />
                <MetricRow label="Depósito" value={formatArea(store.deposito, true)} />
                <MetricRow
                  label="Área Técnica Útil (Registrada)"
                  value={formatArea(store.areaTecnica, true)}
                  highlight
                />
              </div>
            </div>

            {/* Sanitários Retaguarda Loja de Rua */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Sanitários (Retaguarda Loja de Rua)
              </h3>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <MetricRow label="Sanitário Feminino" value={formatArea(store.sanitFem, true)} />
                <MetricRow label="Sanitário Masculino" value={formatArea(store.sanitMasc, true)} />
                <MetricRow
                  label="Sanitário PNE"
                  value={
                    store.sanitPneObs
                      ? `${store.sanitPne !== null ? formatArea(store.sanitPne, true) : ''} (${store.sanitPneObs})`.trim()
                      : formatArea(store.sanitPne, true)
                  }
                />
              </div>
            </div>

            {/* Distribuição por Pavimentos e Estacionamento */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Totais por Pavimento e Estacionamento
              </h3>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <MetricRow label="Área Total Térreo" value={formatArea(store.areaTerreo, true)} />
                <MetricRow label="Área Total Mezanino" value={formatArea(store.areaMezanino, true)} />
                <MetricRow label="Área Total 1º Pavimento" value={formatArea(store.area1Pav, true)} />
                <MetricRow label="Área Total 2º Pavimento" value={formatArea(store.area2Pav, true)} />
                <MetricRow
                  label="Área Total Construída"
                  value={formatArea(store.areaTotalConstruida, true)}
                  highlight
                />
                <MetricRow
                  label="Estacionamento"
                  value={
                    store.estacionamentoObs
                      ? store.estacionamentoObs
                      : formatArea(store.estacionamento, true)
                  }
                />
              </div>
            </div>

            {/* Acesso ao Mezanino */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Acesso ao Mezanino e Mobilidade
              </h3>
              <div className="border border-slate-200 rounded-lg px-4 py-1 bg-white">
                <AccessStatusRow label="Escada Rolante" status={store.escadaRolante} />
                <AccessStatusRow label="Escada" status={store.escada} />
                <AccessStatusRow label="Elevador" status={store.elevador} />
                <AccessStatusRow label="Plataforma PNE" status={store.plataformaPne} />
              </div>
            </div>

            {/* Observações e Registro de Alteração */}
            {(store.observacoes || store.updatedAt) && (
              <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5">
                {store.observacoes && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Observações de Engenharia
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed break-words">
                      {store.observacoes}
                    </p>
                  </div>
                )}
                {store.updatedAt && (
                  <p className="text-[11px] text-slate-500">
                    Última atualização: {new Date(store.updatedAt).toLocaleString('pt-BR')}
                    {store.updatedBy ? ` · por ${store.updatedBy}` : ''}
                  </p>
                )}
              </div>
            )}

            {/* Ações secundárias ao final da ficha */}
            <div className="pt-2 pb-6 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => onAddToCompare(storeKey)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Comparar Unidade</span>
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Unidade</span>
                </button>
              ) : (
                <div className="flex-1 flex flex-wrap items-center justify-between gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-xs font-semibold text-rose-800">Confirmar exclusão?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleConfirmDelete}
                      className="min-h-[36px] px-3 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Removendo...' : 'Sim, excluir'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="min-h-[36px] px-3 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal de ampliação da foto da fachada */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <div className="fixed top-0 inset-x-0 px-3 h-14 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              aria-label="Voltar para a ficha da loja"
              className="inline-flex items-center gap-1 min-h-[34px] px-2.5 rounded-md bg-white/10 text-xs font-medium text-white/85 hover:text-white hover:bg-white/20 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
            <button
              type="button"
              onClick={() => setZoomedPhoto(null)}
              aria-label="Fechar ampliação da foto"
              className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <img
            src={zoomedPhoto}
            alt={`Fachada ampliada da loja ${store.numero}`}
            className="max-w-full max-h-[82vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
