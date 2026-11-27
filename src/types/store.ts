export type TipoLoja = 'RUA' | 'SHOPPING' | 'CD' | 'ESCRITÓRIO';

export type AcessoStatus = 'SIM' | 'SIM*' | 'NÃO' | '*obs' | '-';

export interface StoreAreaRecord {
  id?: string;
  numero: string;
  nome: string;
  cidade: string;
  estado: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  regiao?: string;
  cnpj: string;
  tipoLoja: TipoLoja;

  // Contato e operação (Lista 2)
  gerenteResponsavel?: string;
  ramal?: string;
  telComerciais?: string;
  regionalResponsavel?: string;
  abreDom?: string;
  horarioSemana?: string;
  horarioSabado?: string;
  horarioDomingo?: string;

  // Áreas principais
  areaTotal: number;
  areaVendas: number;

  // Retaguarda
  copa: number | null;
  salaTi: number | null;
  salaVm: number | null;
  almox: number | null;
  casaMaq: number | null;
  subestacao: number | null;
  deposito: number | null;

  // Retaguarda loja de rua
  sanitFem: number | null;
  sanitMasc: number | null;
  sanitPne: number | null;
  sanitPneObs?: string;

  // Área técnica consolidada
  areaTecnica: number | null;

  // Totais por pavimento
  areaTerreo: number | null;
  areaMezanino: number | null;
  area1Pav: number | null;
  area2Pav: number | null;
  areaTotalConstruida: number | null;

  // Estacionamento
  estacionamento: number | null;
  estacionamentoObs?: string;

  // Acesso ao mezanino
  escadaRolante: AcessoStatus | string;
  escada: AcessoStatus | string;
  elevador: AcessoStatus | string;
  plataformaPne: AcessoStatus | string;

  // Climatização (Ar Condicionado)
  acSplit?: number | null;
  acSplitaoSelf?: number | null;
  acFancoil?: number | null;
  acVrf?: number | null;

  // Auditoria e observações de engenharia
  observacoes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type ColumnGroupKey =
  | 'geral'
  | 'contatos'
  | 'retaguarda'
  | 'pavimentos'
  | 'acessos'
  | 'arCondicionado'
  | 'completa';

export type ActiveTab =
  | 'inicio'
  | 'base'
  | 'indicadores'
  | 'comparativo'
  | 'arCondicionado';

export type QuickInfraFilter =
  | 'all'
  | 'elevador'
  | 'plataformaPne'
  | 'escadaRolante'
  | 'subestacao'
  | 'casaMaq'
  | 'mezanino'
  | 'estacionamento'
  | 'arCondicionado'
  | 'acSplit'
  | 'acSplitaoSelf'
  | 'acFancoil'
  | 'acVrf'
  | 'comObs';

export interface FilterState {
  search: string;
  estado: string;
  tipoLoja: 'ALL' | TipoLoja;
  infraFilter: QuickInfraFilter;
}

export type SortField =
  | 'numero'
  | 'nome'
  | 'cidade'
  | 'estado'
  | 'tipoLoja'
  | 'areaTotal'
  | 'areaVendas'
  | 'copa'
  | 'salaTi'
  | 'salaVm'
  | 'almox'
  | 'casaMaq'
  | 'subestacao'
  | 'deposito'
  | 'sanitFem'
  | 'sanitMasc'
  | 'sanitPne'
  | 'areaTecnica'
  | 'areaTerreo'
  | 'areaMezanino'
  | 'area1Pav'
  | 'area2Pav'
  | 'areaTotalConstruida'
  | 'estacionamento'
  | 'acSplit'
  | 'acSplitaoSelf'
  | 'acFancoil'
  | 'acVrf'
  | 'acTotal';

export type SortDirection = 'asc' | 'desc';

export interface IndicatorMeta {
  key: keyof StoreAreaRecord;
  label: string;
  shortLabel: string;
  group: 'dados' | 'areas' | 'retaguarda' | 'sanitarios' | 'pavimentos' | 'acessos' | 'climatizacao';
  unit?: 'm²' | 'un';
  description: string;
}
