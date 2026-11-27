import type { StoreAreaRecord } from '../types/store.ts';

export interface StoresApiResponse {
  stores: StoreAreaRecord[];
  lastModified: string;
}

export async function fetchStores(): Promise<StoresApiResponse> {
  const res = await fetch('/api/stores');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao carregar unidades.');
  }
  return res.json();
}

export async function createStore(payload: StoreAreaRecord): Promise<{ store: StoreAreaRecord; lastModified: string }> {
  const res = await fetch('/api/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao cadastrar unidade.');
  }
  return res.json();
}

export function getStoreKey(store: Pick<StoreAreaRecord, 'id' | 'numero'>): string {
  return store.id ?? store.numero;
}

export async function updateStore(storeKey: string, payload: StoreAreaRecord): Promise<{ store: StoreAreaRecord; lastModified: string }> {
  const res = await fetch(`/api/stores/${encodeURIComponent(storeKey)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao atualizar unidade.');
  }
  return res.json();
}

export async function deleteStore(storeKey: string): Promise<{ deleted: string; lastModified: string }> {
  const res = await fetch(`/api/stores/${encodeURIComponent(storeKey)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao remover unidade.');
  }
  return res.json();
}

export async function resetStoresBaseline(): Promise<StoresApiResponse> {
  const res = await fetch('/api/stores/reset', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao restaurar base original.');
  }
  return res.json();
}

export function formatArea(val: number | null | undefined, includeUnit = false): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const formatted = val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return includeUnit ? `${formatted} m²` : formatted;
}

export function formatCount(val: number | null | undefined, includeUnit = false): string {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const formatted = Math.round(val).toLocaleString('pt-BR');
  return includeUnit ? `${formatted} un.` : formatted;
}

export function getStoreAcTotal(
  store: Pick<StoreAreaRecord, 'acSplit' | 'acSplitaoSelf' | 'acFancoil' | 'acVrf'>,
): number | null {
  const vals = [store.acSplit, store.acSplitaoSelf, store.acFancoil, store.acVrf];
  if (vals.every((v) => v === null || v === undefined)) return null;
  return (store.acSplit ?? 0) + (store.acSplitaoSelf ?? 0) + (store.acFancoil ?? 0) + (store.acVrf ?? 0);
}

export function formatPercent(part: number, total: number): string {
  if (!total || total <= 0) return '0,0%';
  return `${((part / total) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function exportStoresToCsv(stores: StoreAreaRecord[], filename = 'stz-areas-consolidadas.csv'): void {
  const headers = [
    'NÚMERO',
    'NOME',
    'CIDADE',
    'ESTADO',
    'BAIRRO',
    'ENDEREÇO',
    'CEP',
    'REGIÃO',
    'CNPJ',
    'TIPO UNIDADE',
    'GERENTE RESPONSÁVEL',
    'RAMAL',
    'TEL. COMERCIAIS',
    'REGIONAL RESPONSÁVEL',
    'ABRE DOM?',
    'HORÁRIO SEMANA',
    'HORÁRIO SÁBADO',
    'HORÁRIO DOMINGO',
    'ÁREA FÍSICA TOTAL (m²)',
    'ÁREA DE VENDAS (m²)',
    'COPA (m²)',
    'SALA TI (m²)',
    'SALA VM (m²)',
    'ALMOX. (m²)',
    'CASA MÁQ. (m²)',
    'SUBESTAÇÃO (m²)',
    'DEPÓSITO (m²)',
    'SANIT. FEM. (m²)',
    'SANIT. MASC. (m²)',
    'SAN. PNE (m²)',
    'ÁREA TÉCNICA ÚTIL (m²)',
    'ÁREA TOTAL TÉRREO (m²)',
    'ÁREA TOTAL MEZANINO (m²)',
    'ÁREA TOTAL 1º PAV. (m²)',
    'ÁREA TOTAL 2º PAV. (m²)',
    'ÁREA TOTAL CONSTRUÍDA (m²)',
    'ESTACIONAMENTO (m²)',
    'ESCADA ROLANTE',
    'ESCADA',
    'ELEVADOR',
    'PLATAFORMA PNE',
    'AC SPLIT',
    'AC SPLITÃO/SELF',
    'AC FANCOIL',
    'AC VRF',
    'TOTAL AR CONDICIONADO',
    'OBSERVAÇÕES',
  ];

  const fmtNum = (n: number | null | undefined, obs?: string) => {
    if (obs && (n === null || n === undefined)) return obs;
    if (n === null || n === undefined) return '';
    return n.toFixed(2).replace('.', ',');
  };

  const fmtInt = (n: number | null | undefined) => {
    if (n === null || n === undefined) return '';
    return String(Math.round(n));
  };

  const escapeCsv = (cell: string) => {
    if (cell.includes(';') || cell.includes('"') || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const rows = stores.map((s) =>
    [
      s.numero,
      s.nome,
      s.cidade,
      s.estado,
      s.bairro || '',
      s.endereco || '',
      s.cep || '',
      s.regiao || '',
      s.cnpj,
      s.tipoLoja,
      s.gerenteResponsavel || '',
      s.ramal || '',
      s.telComerciais || '',
      s.regionalResponsavel || '',
      s.abreDom || '',
      s.horarioSemana || '',
      s.horarioSabado || '',
      s.horarioDomingo || '',
      fmtNum(s.areaTotal),
      fmtNum(s.areaVendas),
      fmtNum(s.copa),
      fmtNum(s.salaTi),
      fmtNum(s.salaVm),
      fmtNum(s.almox),
      fmtNum(s.casaMaq),
      fmtNum(s.subestacao),
      fmtNum(s.deposito),
      fmtNum(s.sanitFem),
      fmtNum(s.sanitMasc),
      s.sanitPneObs ? s.sanitPneObs : fmtNum(s.sanitPne),
      fmtNum(s.areaTecnica),
      fmtNum(s.areaTerreo),
      fmtNum(s.areaMezanino),
      fmtNum(s.area1Pav),
      fmtNum(s.area2Pav),
      fmtNum(s.areaTotalConstruida),
      s.estacionamentoObs ? s.estacionamentoObs : fmtNum(s.estacionamento),
      s.escadaRolante,
      s.escada,
      s.elevador,
      s.plataformaPne,
      fmtInt(s.acSplit),
      fmtInt(s.acSplitaoSelf),
      fmtInt(s.acFancoil),
      fmtInt(s.acVrf),
      fmtInt(getStoreAcTotal(s)),
      s.observacoes || '',
    ]
      .map((c) => escapeCsv(String(c)))
      .join(';'),
  );

  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(';'), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
