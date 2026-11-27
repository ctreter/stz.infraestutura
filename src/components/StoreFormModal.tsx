import { ArrowLeft, Calculator, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StoreAreaRecord, TipoLoja } from '../types/store.ts';

interface StoreFormModalProps {
  isOpen: boolean;
  editingStore: StoreAreaRecord | null;
  onClose: () => void;
  onSubmit: (payload: StoreAreaRecord, isEdit: boolean) => Promise<void>;
}

type FormSection = 'dados' | 'contatos' | 'retaguarda' | 'pavimentos';

const ACCESS_OPTIONS = ['-', 'SIM', 'SIM*', 'NÃO', '*obs'];
const ABRE_DOM_OPTIONS = ['', 'Sim', 'Não'];

function toInputStr(val: number | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

function toNullableFloat(str: string): number | null {
  const cleaned = str.trim().replace(',', '.');
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

function toNullableInt(str: string): number | null {
  const cleaned = str.trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}

export function StoreFormModal({
  isOpen,
  editingStore,
  onClose,
  onSubmit,
}: StoreFormModalProps) {
  const isEdit = Boolean(editingStore);
  const [section, setSection] = useState<FormSection>('dados');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [numero, setNumero] = useState('');
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [regiao, setRegiao] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [tipoLoja, setTipoLoja] = useState<TipoLoja>('SHOPPING');

  const [gerenteResponsavel, setGerenteResponsavel] = useState('');
  const [regionalResponsavel, setRegionalResponsavel] = useState('');
  const [ramal, setRamal] = useState('');
  const [telComerciais, setTelComerciais] = useState('');
  const [abreDom, setAbreDom] = useState('');
  const [horarioSemana, setHorarioSemana] = useState('');
  const [horarioSabado, setHorarioSabado] = useState('');
  const [horarioDomingo, setHorarioDomingo] = useState('');

  const [areaTotal, setAreaTotal] = useState('');
  const [areaVendas, setAreaVendas] = useState('');

  const [copa, setCopa] = useState('');
  const [salaTi, setSalaTi] = useState('');
  const [salaVm, setSalaVm] = useState('');
  const [almox, setAlmox] = useState('');
  const [casaMaq, setCasaMaq] = useState('');
  const [subestacao, setSubestacao] = useState('');
  const [deposito, setDeposito] = useState('');

  const [sanitFem, setSanitFem] = useState('');
  const [sanitMasc, setSanitMasc] = useState('');
  const [sanitPne, setSanitPne] = useState('');
  const [sanitPneObs, setSanitPneObs] = useState('');
  const [areaTecnica, setAreaTecnica] = useState('');

  const [areaTerreo, setAreaTerreo] = useState('');
  const [areaMezanino, setAreaMezanino] = useState('');
  const [area1Pav, setArea1Pav] = useState('');
  const [area2Pav, setArea2Pav] = useState('');
  const [areaTotalConstruida, setAreaTotalConstruida] = useState('');
  const [estacionamento, setEstacionamento] = useState('');
  const [estacionamentoObs, setEstacionamentoObs] = useState('');

  const [escadaRolante, setEscadaRolante] = useState('-');
  const [escada, setEscada] = useState('-');
  const [elevador, setElevador] = useState('-');
  const [plataformaPne, setPlataformaPne] = useState('-');

  const [acSplit, setAcSplit] = useState('');
  const [acSplitaoSelf, setAcSplitaoSelf] = useState('');
  const [acFancoil, setAcFancoil] = useState('');
  const [acVrf, setAcVrf] = useState('');

  const [observacoes, setObservacoes] = useState('');
  const [updatedBy, setUpdatedBy] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSection('dados');
    setErrorMsg(null);
    if (editingStore) {
      setNumero(editingStore.numero);
      setNome(editingStore.nome);
      setCidade(editingStore.cidade);
      setEstado(editingStore.estado);
      setEndereco(editingStore.endereco || '');
      setBairro(editingStore.bairro || '');
      setCep(editingStore.cep || '');
      setRegiao(editingStore.regiao || '');
      setCnpj(editingStore.cnpj);
      setTipoLoja(editingStore.tipoLoja);
      setGerenteResponsavel(editingStore.gerenteResponsavel || '');
      setRegionalResponsavel(editingStore.regionalResponsavel || '');
      setRamal(editingStore.ramal || '');
      setTelComerciais(editingStore.telComerciais || '');
      setAbreDom(editingStore.abreDom || '');
      setHorarioSemana(editingStore.horarioSemana || '');
      setHorarioSabado(editingStore.horarioSabado || '');
      setHorarioDomingo(editingStore.horarioDomingo || '');
      setAreaTotal(toInputStr(editingStore.areaTotal));
      setAreaVendas(toInputStr(editingStore.areaVendas));
      setCopa(toInputStr(editingStore.copa));
      setSalaTi(toInputStr(editingStore.salaTi));
      setSalaVm(toInputStr(editingStore.salaVm));
      setAlmox(toInputStr(editingStore.almox));
      setCasaMaq(toInputStr(editingStore.casaMaq));
      setSubestacao(toInputStr(editingStore.subestacao));
      setDeposito(toInputStr(editingStore.deposito));
      setSanitFem(toInputStr(editingStore.sanitFem));
      setSanitMasc(toInputStr(editingStore.sanitMasc));
      setSanitPne(toInputStr(editingStore.sanitPne));
      setSanitPneObs(editingStore.sanitPneObs || '');
      setAreaTecnica(toInputStr(editingStore.areaTecnica));
      setAreaTerreo(toInputStr(editingStore.areaTerreo));
      setAreaMezanino(toInputStr(editingStore.areaMezanino));
      setArea1Pav(toInputStr(editingStore.area1Pav));
      setArea2Pav(toInputStr(editingStore.area2Pav));
      setAreaTotalConstruida(toInputStr(editingStore.areaTotalConstruida));
      setEstacionamento(toInputStr(editingStore.estacionamento));
      setEstacionamentoObs(editingStore.estacionamentoObs || '');
      setEscadaRolante(editingStore.escadaRolante || '-');
      setEscada(editingStore.escada || '-');
      setElevador(editingStore.elevador || '-');
      setPlataformaPne(editingStore.plataformaPne || '-');
      setAcSplit(toInputStr(editingStore.acSplit));
      setAcSplitaoSelf(toInputStr(editingStore.acSplitaoSelf));
      setAcFancoil(toInputStr(editingStore.acFancoil));
      setAcVrf(toInputStr(editingStore.acVrf));
      setObservacoes(editingStore.observacoes || '');
      setUpdatedBy(editingStore.updatedBy || '');
    } else {
      setNumero('');
      setNome('');
      setCidade('');
      setEstado('');
      setEndereco('');
      setBairro('');
      setCep('');
      setRegiao('');
      setCnpj('');
      setTipoLoja('SHOPPING');
      setGerenteResponsavel('');
      setRegionalResponsavel('');
      setRamal('');
      setTelComerciais('');
      setAbreDom('');
      setHorarioSemana('');
      setHorarioSabado('');
      setHorarioDomingo('');
      setAreaTotal('');
      setAreaVendas('');
      setCopa('');
      setSalaTi('');
      setSalaVm('');
      setAlmox('');
      setCasaMaq('');
      setSubestacao('');
      setDeposito('');
      setSanitFem('');
      setSanitMasc('');
      setSanitPne('');
      setSanitPneObs('');
      setAreaTecnica('');
      setAreaTerreo('');
      setAreaMezanino('');
      setArea1Pav('');
      setArea2Pav('');
      setAreaTotalConstruida('');
      setEstacionamento('');
      setEstacionamentoObs('');
      setEscadaRolante('-');
      setEscada('-');
      setElevador('-');
      setPlataformaPne('-');
      setAcSplit('');
      setAcSplitaoSelf('');
      setAcFancoil('');
      setAcVrf('');
      setObservacoes('');
      setUpdatedBy('');
    }
  }, [isOpen, editingStore]);

  if (!isOpen) return null;

  const handleSumTechnical = () => {
    const sum =
      (toNullableFloat(copa) || 0) +
      (toNullableFloat(salaTi) || 0) +
      (toNullableFloat(salaVm) || 0) +
      (toNullableFloat(almox) || 0) +
      (toNullableFloat(casaMaq) || 0) +
      (toNullableFloat(subestacao) || 0) +
      (toNullableFloat(deposito) || 0) +
      (toNullableFloat(sanitFem) || 0) +
      (toNullableFloat(sanitMasc) || 0) +
      (toNullableFloat(sanitPne) || 0);
    setAreaTecnica((Math.round(sum * 100) / 100).toFixed(2));
  };

  const handleSumFloors = () => {
    const sum =
      (toNullableFloat(areaTerreo) || 0) +
      (toNullableFloat(areaMezanino) || 0) +
      (toNullableFloat(area1Pav) || 0) +
      (toNullableFloat(area2Pav) || 0);
    setAreaTotalConstruida((Math.round(sum * 100) / 100).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!numero.trim()) {
      setSection('dados');
      setErrorMsg('Informe o número da unidade.');
      return;
    }
    if (!nome.trim() || !cidade.trim() || estado.trim().length !== 2) {
      setSection('dados');
      setErrorMsg('Preencha Nome, Cidade e UF (2 letras).');
      return;
    }

    const parsedTotal = toNullableFloat(areaTotal);
    const parsedVendas = toNullableFloat(areaVendas);
    const isNonRetail = tipoLoja === 'CD' || tipoLoja === 'ESCRITÓRIO';
    if (parsedTotal === null || (!isNonRetail && parsedVendas === null)) {
      setSection('dados');
      setErrorMsg('Área Física Total e Área de Vendas são obrigatórias (valores numéricos).');
      return;
    }

    const payload: StoreAreaRecord = {
      ...(editingStore?.id ? { id: editingStore.id } : {}),
      numero: numero.trim(),
      nome: nome.trim().toUpperCase(),
      cidade: cidade.trim().toUpperCase(),
      estado: estado.trim().toUpperCase(),
      endereco: endereco.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cep: cep.trim() || undefined,
      regiao: regiao.trim().toUpperCase() || undefined,
      cnpj: cnpj.trim() || '-',
      tipoLoja,
      gerenteResponsavel: gerenteResponsavel.trim() || undefined,
      regionalResponsavel: regionalResponsavel.trim() || undefined,
      ramal: ramal.trim() || undefined,
      telComerciais: telComerciais.trim() || undefined,
      abreDom: abreDom.trim() || undefined,
      horarioSemana: horarioSemana.trim() || undefined,
      horarioSabado: horarioSabado.trim() || undefined,
      horarioDomingo: horarioDomingo.trim() || undefined,
      areaTotal: parsedTotal,
      areaVendas: parsedVendas ?? 0,
      copa: toNullableFloat(copa),
      salaTi: toNullableFloat(salaTi),
      salaVm: toNullableFloat(salaVm),
      almox: toNullableFloat(almox),
      casaMaq: toNullableFloat(casaMaq),
      subestacao: toNullableFloat(subestacao),
      deposito: toNullableFloat(deposito),
      sanitFem: toNullableFloat(sanitFem),
      sanitMasc: toNullableFloat(sanitMasc),
      sanitPne: toNullableFloat(sanitPne),
      sanitPneObs: sanitPneObs.trim() || undefined,
      areaTecnica: toNullableFloat(areaTecnica),
      areaTerreo: toNullableFloat(areaTerreo),
      areaMezanino: toNullableFloat(areaMezanino),
      area1Pav: toNullableFloat(area1Pav),
      area2Pav: toNullableFloat(area2Pav),
      areaTotalConstruida: toNullableFloat(areaTotalConstruida),
      estacionamento: toNullableFloat(estacionamento),
      estacionamentoObs: estacionamentoObs.trim() || undefined,
      escadaRolante,
      escada,
      elevador,
      plataformaPne,
      acSplit: toNullableInt(acSplit),
      acSplitaoSelf: toNullableInt(acSplitaoSelf),
      acFancoil: toNullableInt(acFancoil),
      acVrf: toNullableInt(acVrf),
      observacoes: observacoes.trim() || undefined,
      updatedBy: updatedBy.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload, isEdit);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar unidade.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white sm:border sm:border-slate-200 sm:rounded-lg shadow-xl flex flex-col h-full sm:h-auto sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-3 sm:px-6 py-3 sm:py-3.5 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 bg-white">
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
            <span className="text-slate-200 shrink-0" aria-hidden="true">|</span>
            <div className="min-w-0">
              <h2 id="form-modal-title" className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {isEdit ? `Editar Unidade ${editingStore?.numero}` : 'Nova Unidade'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegação entre blocos do formulário */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center gap-2 bg-slate-50">
          {(
            [
              { id: 'dados', label: '1. Dados & Áreas' },
              { id: 'contatos', label: '2. Contatos & Horários' },
              { id: 'retaguarda', label: '3. Retaguarda' },
              { id: 'pavimentos', label: '4. Pavimentos & AC' },
            ] as const
          ).map((tab) => {
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-medium text-rose-800"
            >
              {errorMsg}
            </div>
          )}

          {section === 'dados' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={numero}
                    disabled={isEdit}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ex: 1195"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nome da Unidade *
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: SC - FLORIANÓPOLIS - CENTRO"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: FLORIANÓPOLIS"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estado (UF) *
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    placeholder="SC"
                    className="w-full h-9 px-3 text-sm font-mono uppercase bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tipo de Loja *
                  </label>
                  <select
                    value={tipoLoja}
                    onChange={(e) => setTipoLoja(e.target.value as TipoLoja)}
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="SHOPPING">SHOPPING</option>
                    <option value="RUA">RUA</option>
                    <option value="CD">CD</option>
                    <option value="ESCRITÓRIO">ESCRITÓRIO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Endereço Completo (Logradouro, nº e complemento)
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Av. Hercílio Luz, 639"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Centro"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="88020-000"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="15.048.754/0000-00"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Área Física Total (m²) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={areaTotal}
                    onChange={(e) => setAreaTotal(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Área de Vendas (m²) *
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={areaVendas}
                    onChange={(e) => setAreaVendas(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Responsável pela atualização (Engenharia/Manutenção)
                  </label>
                  <input
                    type="text"
                    value={updatedBy}
                    onChange={(e) => setUpdatedBy(e.target.value)}
                    placeholder="Nome do colaborador"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Observações Técnicas Gerais
                  </label>
                  <input
                    type="text"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Notas de manutenção, reformas ou pendências"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {section === 'contatos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Região
                  </label>
                  <input
                    type="text"
                    value={regiao}
                    onChange={(e) => setRegiao(e.target.value.toUpperCase())}
                    placeholder="Ex: GRANDE FLORIANÓPOLIS"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gerente Responsável
                  </label>
                  <input
                    type="text"
                    value={gerenteResponsavel}
                    onChange={(e) => setGerenteResponsavel(e.target.value)}
                    placeholder="Nome do gerente da loja"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Regional Responsável
                  </label>
                  <input
                    type="text"
                    value={regionalResponsavel}
                    onChange={(e) => setRegionalResponsavel(e.target.value)}
                    placeholder="Nome do regional"
                    className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ramal
                  </label>
                  <input
                    type="text"
                    value={ramal}
                    onChange={(e) => setRamal(e.target.value)}
                    placeholder="Ex: 5601"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Telefones Comerciais
                  </label>
                  <input
                    type="text"
                    value={telComerciais}
                    onChange={(e) => setTelComerciais(e.target.value)}
                    placeholder="Ex: (48) 3211-8854 / (48) 99982-9843"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800 mb-2">
                  Horário de Funcionamento
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Abre aos Domingos?
                    </label>
                    <select
                      value={abreDom}
                      onChange={(e) => setAbreDom(e.target.value)}
                      className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {ABRE_DOM_OPTIONS.map((opt) => (
                        <option key={opt || 'empty'} value={opt}>
                          {opt || 'Não informado'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Segunda a Sexta
                    </label>
                    <input
                      type="text"
                      value={horarioSemana}
                      onChange={(e) => setHorarioSemana(e.target.value)}
                      placeholder="10:00 às 22:00"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sábado
                    </label>
                    <input
                      type="text"
                      value={horarioSabado}
                      onChange={(e) => setHorarioSabado(e.target.value)}
                      placeholder="10:00 às 22:00"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Domingo
                    </label>
                    <input
                      type="text"
                      value={horarioDomingo}
                      onChange={(e) => setHorarioDomingo(e.target.value)}
                      placeholder="14:00 às 20:00"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'retaguarda' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Copa (m²)', value: copa, setter: setCopa },
                  { label: 'Sala TI (m²)', value: salaTi, setter: setSalaTi },
                  { label: 'Sala VM (m²)', value: salaVm, setter: setSalaVm },
                  { label: 'Almox. (m²)', value: almox, setter: setAlmox },
                  { label: 'Casa Máq. (m²)', value: casaMaq, setter: setCasaMaq },
                  { label: 'Subestação (m²)', value: subestacao, setter: setSubestacao },
                  { label: 'Depósito (m²)', value: deposito, setter: setDeposito },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder="—"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800 mb-2">
                  Sanitários (Retaguarda Loja de Rua)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sanit. Fem. (m²)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sanitFem}
                      onChange={(e) => setSanitFem(e.target.value)}
                      placeholder="—"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sanit. Masc. (m²)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sanitMasc}
                      onChange={(e) => setSanitMasc(e.target.value)}
                      placeholder="—"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      San. PNE (m²)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sanitPne}
                      onChange={(e) => setSanitPne(e.target.value)}
                      placeholder="—"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Obs. San. PNE
                    </label>
                    <input
                      type="text"
                      value={sanitPneObs}
                      onChange={(e) => setSanitPneObs(e.target.value)}
                      placeholder="Ex: *obs ou 4,1 + 3,14"
                      className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1 max-w-xs">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Área Técnica Útil Consolidada (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={areaTecnica}
                    onChange={(e) => setAreaTecnica(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 text-sm font-mono font-semibold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSumTechnical}
                  className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Recalcular soma das áreas técnicas</span>
                </button>
              </div>
            </div>
          )}

          {section === 'pavimentos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Térreo (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={areaTerreo}
                    onChange={(e) => setAreaTerreo(e.target.value)}
                    placeholder="—"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mezanino (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={areaMezanino}
                    onChange={(e) => setAreaMezanino(e.target.value)}
                    placeholder="—"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    1º Pavimento (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={area1Pav}
                    onChange={(e) => setArea1Pav(e.target.value)}
                    placeholder="—"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    2º Pavimento (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={area2Pav}
                    onChange={(e) => setArea2Pav(e.target.value)}
                    placeholder="—"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Construída (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={areaTotalConstruida}
                    onChange={(e) => setAreaTotalConstruida(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 px-3 text-sm font-mono font-semibold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleSumFloors}
                    className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Somar pavimentos</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estacionamento (m²)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={estacionamento}
                    onChange={(e) => setEstacionamento(e.target.value)}
                    placeholder="—"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Obs. Estacionamento
                  </label>
                  <input
                    type="text"
                    value={estacionamentoObs}
                    onChange={(e) => setEstacionamentoObs(e.target.value)}
                    placeholder="Ex: * obs"
                    className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800 mb-2">
                  Acesso ao Mezanino e Mobilidade
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Escada Rolante', value: escadaRolante, setter: setEscadaRolante },
                    { label: 'Escada', value: escada, setter: setEscada },
                    { label: 'Elevador', value: elevador, setter: setElevador },
                    { label: 'Plataforma PNE', value: plataformaPne, setter: setPlataformaPne },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {field.label}
                      </label>
                      <select
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {ACCESS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800 mb-2">
                  Climatização — Ar Condicionado (Qtd. de equipamentos)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Split', value: acSplit, setter: setAcSplit },
                    { label: 'Splitão / Self', value: acSplitaoSelf, setter: setAcSplitaoSelf },
                    { label: 'Fancoil', value: acFancoil, setter: setAcFancoil },
                    { label: 'VRF', value: acVrf, setter: setAcVrf },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder="—"
                        className="w-full h-9 px-3 text-sm font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rodapé do Modal */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Campos com * são obrigatórios.
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[42px] px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? 'Salvando...'
                  : isEdit
                  ? 'Salvar Alterações'
                  : 'Cadastrar Unidade'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
