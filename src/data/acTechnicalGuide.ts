import type { StoreAreaRecord } from '../types/store.ts';

export type AcSystemId =
  | 'hi-wall'
  | 'piso-teto'
  | 'cassete'
  | 'splitao-self'
  | 'fan-coil'
  | 'vrf-vrv';

export interface AcFailureEntry {
  sintoma: string;
  causas: string[];
  acoes: string[];
  criticidade: 'alta' | 'media';
}

export interface AcSystemSpec {
  id: AcSystemId;
  nome: string;
  subtitulo: string;
  ciclo: string;
  secaoManual: string;
  descricao: string;
  componentesPrincipais: string[];
  premissasRetorno: string[];
  sintomasRetornoInadequado?: string[];
  falhas: AcFailureEntry[];
  roteiroEspecificoTitulo: string;
  roteiroEspecifico: string[];
  manutencaoPreventivaFoco: string[];
  storeField: keyof Pick<StoreAreaRecord, 'acSplit' | 'acSplitaoSelf' | 'acFancoil' | 'acVrf'>;
  storeFieldLabel: string;
}

export interface QuickSymptomMatrixRow {
  sintoma: string;
  primeiroVerificar: string;
  naoFazerPrimeiro: string;
}

export interface DiagnosticStage {
  etapa: string;
  titulo: string;
  objetivo: string;
  itens: string[];
}

export interface ReturnProblemDeepDive {
  id: string;
  titulo: string;
  resumo: string;
  causasOuSinais: string[];
  efeitosOuRiscos: string[];
  correcao: string[];
}

export interface MeasurementMatrixRow {
  ensaio: string;
  ondeComo: string;
  criterioAceitacao: string;
}

export const AC_SYSTEMS: AcSystemSpec[] = [
  {
    id: 'hi-wall',
    nome: 'Split Hi-Wall',
    subtitulo: 'Expansão direta · parede',
    ciclo: 'Expansão direta',
    secaoManual: 'Seção 4',
    descricao:
      'Unidade interna montada na parede com filtro, serpentina evaporadora, ventilador tangencial, bandeja de condensado e sensores, interligada à unidade externa (compressor, condensador e expansão por capilar ou válvula eletrônica).',
    componentesPrincipais: [
      'Unidade interna de parede (filtro, serpentina evaporadora e ventilador tangencial)',
      'Bandeja de condensado, dreno e sensores de ambiente e serpentina',
      'Unidade externa (compressor, condensador, ventilador, placa de potência e capilar/VEE)',
      'Linhas frigoríficas de líquido e gás, alimentação elétrica e comunicação',
      'Controle remoto ou comando central (sensor pode estar no controle ou na unidade)',
    ],
    premissasRetorno: [
      'Manter a entrada de ar superior ou frontal totalmente livre conforme o projeto do equipamento.',
      'Cortinas, prateleiras, placas, luminárias, forro baixo, decoração e mercadorias não devem bloquear a sucção.',
      'Não instalar a unidade em nicho fechado nem sujeita ao retorno imediato do ar insuflado.',
      'Atenção ao ar quente estratificado próximo ao teto: a leitura do sensor pode não refletir a zona ocupada.',
      'Direcionar a aleta para que o ar resfriado se misture ao ambiente e não retorne diretamente à sucção.',
      'Em lojas, portas abertas, fachadas quentes e alta ocupação elevam a carga térmica além da capacidade nominal.',
      'Não utilizar o hi-wall como substituto de sistema de ventilação ou renovação de ar.',
    ],
    sintomasRetornoInadequado: [
      'Pouca vazão ou ruído característico de sucção restrita',
      'Serpentina congelando com frequência',
      'Equipamento ligado por longos períodos sem atingir conforto térmico',
      'Sensor indicando ambiente satisfeito enquanto a área ocupada continua quente',
      'Resfriamento muito localizado e ciclagem curta por curto-circuito de ar',
      'Aumento de poeira por entrada de ar de plenum ou área contaminada',
    ],
    falhas: [
      {
        sintoma: 'Liga, mas não resfria',
        causas: [
          'Modo de operação incorreto ou setpoint elevado',
          'Retorno quente ou restrito',
          'Filtro ou serpentina sujos',
          'Ventilador interno ou unidade externa parada',
          'Falha de sensor ou anomalia no circuito frigorífico',
        ],
        acoes: [
          'Confirmar modo refrigeração, setpoint e comando antes de qualquer intervenção.',
          'Inspecionar retorno, grelha e filtro.',
          'Verificar funcionamento dos ventiladores e registrar códigos de alarme.',
          'Medir temperaturas e parâmetros previstos pelo fabricante.',
          'Somente após validar fluxo de ar e elétrica, investigar circuito frigorífico.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Vazão de ar baixa',
        causas: [
          'Filtro obstruído ou saturado',
          'Turbina suja com acúmulo nas pás',
          'Motor ventilador ou capacitor defeituoso',
          'Velocidade selecionada baixa ou entrada bloqueada',
          'Serpentina suja ou congelada',
        ],
        acoes: [
          'Desenergizar o equipamento com segurança.',
          'Limpar filtro e serpentina conforme procedimento aprovado.',
          'Verificar rotação livre da turbina, motor e acionamento/capacitor.',
          'Medir pressão/fluxo quando possível e remover obstruções externas.',
          'Se houver gelo, investigar a causa do congelamento antes de religar.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Gelo na serpentina ou tubulação',
        causas: [
          'Baixo fluxo de ar por filtro ou serpentina sujos',
          'Ventilador lento ou turbina obstruída',
          'Sensor de serpentina deslocado ou com leitura errada',
          'Falha na válvula de expansão/capilar, carga inadequada, restrição ou vazamento',
        ],
        acoes: [
          'Desligar a refrigeração e permitir degelo natural e seguro (nunca quebrar gelo com ferramenta, chama ou água quente).',
          'Restaurar e confirmar o fluxo de ar primeiro.',
          'Verificar posicionamento, fixação e resistência do sensor de serpentina e rotação do ventilador.',
          'Se o congelamento persistir, técnico habilitado deve avaliar circuito frigorífico e estanqueidade.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Gotejamento pela unidade interna',
        causas: [
          'Dreno obstruído por biofilme ou sujeira',
          'Bandeja suja, trincada ou danificada',
          'Instalação desnivelada',
          'Isolamento térmico deficiente na linha fria',
          'Serpentina congelando ou falha/ausência de bomba de condensado',
        ],
        acoes: [
          'Desligar imediatamente se houver risco elétrico.',
          'Inspecionar bandeja, saída de dreno e verificar se há água parada.',
          'Confirmar caimento adequado, sifão e conexões sem vazamentos.',
          'Corrigir isolamento com barreira de vapor íntegra.',
          'Investigar fluxo de ar caso haja formação de gelo.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Ventilador interno não funciona',
        causas: [
          'Falha de comando ou bloqueio eletrônico',
          'Motor queimado ou com proteção térmica atuada',
          'Placa eletrônica, chicote ou capacitor com defeito',
          'Turbina mecanicamente travada',
        ],
        acoes: [
          'Verificar comando, modo e códigos de alarme.',
          'Com energia isolada, inspecionar giro livre da turbina e conectores.',
          'Testar motor, capacitor e placa conforme esquema do fabricante (não alimentar motor diretamente sem procedimento).',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Unidade externa não parte',
        causas: [
          'Falta de alimentação elétrica ou disjuntor/seccionador desarmado',
          'Erro de comunicação entre unidade interna e externa',
          'Atuação de proteção de pressão ou temperatura',
          'Falha de placa, capacitor, compressor ou atraso normal de partida',
        ],
        acoes: [
          'Verificar alimentação nos terminais e sinal de comando.',
          'Consultar código de falha antes de desligar.',
          'Examinar conexões, ventilador externo e componentes conforme manual.',
          'Não insistir em rearme repetido de disjuntor ou placa.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Ruído ou vibração',
        causas: [
          'Turbina suja ou desbalanceada',
          'Painel frontal solto ou suporte de fixação inadequado',
          'Tubulação encostando em estrutura ou carenagem',
          'Ventilador externo danificado ou desbalanceado',
        ],
        acoes: [
          'Identificar a origem exata do ruído (interno vs externo).',
          'Reapertar fixações e painel conforme especificação.',
          'Higienizar turbina e corrigir apoio/afastamento das tubulações.',
          'Substituir hélice, bucha ou componente danificado.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Odor ou mofo',
        causas: [
          'Filtro e serpentina contaminados por poeira e umidade',
          'Bandeja e linha de dreno com biofilme',
          'Umidade persistente ou água parada por caimento ruim',
        ],
        acoes: [
          'Limpar filtro e serpentina com produto compatível e método aprovado.',
          'Higienizar bandeja e linha de dreno.',
          'Corrigir caimento da drenagem e nunca mascarar odor com fragrância.',
        ],
        criticidade: 'media',
      },
    ],
    roteiroEspecificoTitulo: 'Roteiro de correção específico (Hi-Wall)',
    roteiroEspecifico: [
      'Confirme o código de falha e o modo selecionado.',
      'Desligue e isole a alimentação antes de remover a tampa.',
      'Inspecione a entrada de retorno, filtro, serpentina e turbina.',
      'Se houver gelo, não force a remoção com ferramentas; identifique primeiro a causa do congelamento.',
      'Verifique se a turbina gira livremente e se não há sujeira que altere seu balanceamento.',
      'Inspecione dreno e bandeja.',
      'Verifique sensores e conectores de acordo com a tabela do fabricante.',
      'Avalie a unidade externa, alimentação e comunicação.',
      'Se os sintomas persistirem após restaurar a vazão, encaminhe para diagnóstico frigorífico qualificado.',
      'Após o reparo, teste em operação estável e confirme que o ar não está retornando diretamente à entrada.',
    ],
    manutencaoPreventivaFoco: [
      'Limpeza de filtros e inspeção de deformação ou saturação em toda visita preventiva.',
      'Higienização periódica de turbina tangencial, serpentina e bandeja para evitar biofilme e gotejamento.',
      'Conferência do alinhamento das aletas e ausência de prateleiras/cartazes bloqueando o retorno superior.',
      'Teste de drenagem com água limpa e inspeção do isolamento da linha de sucção.',
    ],
    storeField: 'acSplit',
    storeFieldLabel: 'Unidades Split',
  },
  {
    id: 'piso-teto',
    nome: 'Split Piso-Teto',
    subtitulo: 'Expansão direta · teto ou piso',
    ciclo: 'Expansão direta',
    secaoManual: 'Seção 5',
    descricao:
      'Unidade interna de maior alcance instalada no teto (lançamento horizontal/angular) ou junto ao piso, equipada com ventilador centrífugo, serpentina evaporadora e aletas direcionáveis, ligada à unidade externa.',
    componentesPrincipais: [
      'Unidade interna configurável para instalação horizontal no teto ou vertical no piso',
      'Ventilador(es) centrífugo(s), motor e conjunto de aletas de distribuição',
      'Filtro de retorno (face frontal, inferior ou traseira conforme modelo)',
      'Serpentina evaporadora, bandeja de condensado e sensores',
      'Unidade condensadora externa e interligação frigorífica/elétrica',
    ],
    premissasRetorno: [
      'Confirmar no manual se a aspiração de retorno ocorre pela face frontal, inferior ou traseira.',
      'Manter totalmente livre a face de sucção e a área mínima de acesso para manutenção.',
      'Em instalação no teto, evitar que o retorno aspire ar quente de plenum diferente do ambiente atendido.',
      'Em instalação baixa (piso), evitar obstruções por móveis, araras de estoque, cortinas e caixas.',
      'Impedir que o jato de insuflação percorra o teto e retorne imediatamente à entrada de ar.',
      'Não cobrir a entrada com forro, grelha decorativa ou painel que reduza a área livre.',
      'Se houver duto ou caixa de retorno adaptada em campo, verificar pressão estática, vedação e compatibilidade do ventilador.',
    ],
    falhas: [
      {
        sintoma: 'Área atendida não uniformemente resfriada',
        causas: [
          'Aletas mal ajustadas para o alcance do salão',
          'Equipamento mal posicionado ou obstáculos no fluxo',
          'Retorno curto ou insuflação insuficiente',
          'Carga térmica desigual entre zonas da loja',
        ],
        acoes: [
          'Mapear temperaturas por zonas da loja.',
          'Ajustar direcionamento das aletas conforme manual.',
          'Remover obstáculos, confirmar vazão e avaliar reposicionamento ou balanceamento.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Unidade parece gelar, mas o salão continua quente',
        causas: [
          'Ar insuflado retorna imediatamente à sucção da unidade',
          'Aspiração de ar quente pelo plenum',
          'Capacidade insuficiente para carga de porta aberta/fachada',
          'Sensor de temperatura em local não representativo',
        ],
        acoes: [
          'Observar a trajetória real do ar insuflado e eliminar curto-circuito.',
          'Inspecionar vedação e caminho do retorno no plenum.',
          'Avaliar carga térmica e vedação da loja; nunca baixar o setpoint como solução definitiva.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Congelamento',
        causas: [
          'Baixa vazão de ar por filtro ou serpentina sujos',
          'Ventilador lento ou com falha de acionamento',
          'Sensor de serpentina descalibrado/deslocado',
          'Carga frigorífica incorreta ou restrição na linha',
        ],
        acoes: [
          'Interromper refrigeração para degelo seguro e restaurar o fluxo de ar.',
          'Verificar rotação/corrente do ventilador centrífugo e leitura dos sensores.',
          'Persistindo após limpeza e fluxo validado, acionar diagnóstico frigorífico qualificado.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Ruído elevado',
        causas: [
          'Pressão estática fora da faixa (principalmente com duto/caixa adaptada)',
          'Grelha ou filtro restritivo',
          'Turbina centrífuga suja ou desbalanceada',
          'Fixação frouxa no teto/parede ou painel solto',
        ],
        acoes: [
          'Medir pressão estática quando houver duto e comparar com a especificação.',
          'Remover restrições (telas improvisadas, filtros incompatíveis) e limpar turbinas.',
          'Reapertar tirantes, suportes e painéis de fechamento.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Gotejamento',
        causas: [
          'Dreno obstruído ou sem inclinação/sifão adequado',
          'Bandeja danificada ou unidade desnivelada no teto',
          'Isolamento deficiente ou condensação externa',
          'Congelamento da serpentina ou falha na bomba (quando existente)',
        ],
        acoes: [
          'Inspecionar nível da unidade, caimento e sifão da linha de dreno.',
          'Limpar bandeja e dreno conforme procedimento aprovado.',
          'Corrigir isolamento térmico e investigar causa de eventual congelamento.',
        ],
        criticidade: 'alta',
      },
    ],
    roteiroEspecificoTitulo: 'Verificação prática do retorno (Piso-Teto)',
    roteiroEspecifico: [
      'Confirme a face de retorno pelo manual; não presuma que a unidade aspira sempre pela frente.',
      'Meça a distância real entre a entrada de ar e obstáculos próximos (estoque, prateleiras, forro).',
      'Compare a área livre da grelha/filtro com o requisito do projeto.',
      'Procure marcas de poeira que indiquem aspiração indesejada pelo plenum ou por frestas.',
      'Verifique se filtros improvisados ou telas adicionais elevaram a resistência ao fluxo.',
      'Observe o comportamento térmico com portas e divisórias na condição normal de operação da loja.',
      'Confirme se a unidade possui pressão estática suficiente para qualquer trecho de duto adicionado em campo.',
    ],
    manutencaoPreventivaFoco: [
      'Limpeza das turbinas centrífugas e verificação de fixação dos suportes/tirantes no teto.',
      'Checagem de desnível de bandeja (crítico em unidades suspensas no teto) e teste de escoamento.',
      'Verificação de obstrução por estoque/expositores em unidades instaladas próximas ao piso.',
      'Inspeção da vedação quando houver caixa de retorno ou adaptação em forro.',
    ],
    storeField: 'acSplit',
    storeFieldLabel: 'Unidades Split',
  },
  {
    id: 'cassete',
    nome: 'Split Cassete',
    subtitulo: 'Expansão direta · embutido no forro',
    ciclo: 'Expansão direta',
    secaoManual: 'Seção 6',
    descricao:
      'Unidade embutida no entre-forro que aspira o ar pelo centro do painel decorativo e o distribui pelas laterais (em até 4 direções), normalmente equipada com bomba de condensado e boia de nível integradas.',
    componentesPrincipais: [
      'Gabinete embutido no entre-forro e painel decorativo com grelha central de retorno',
      'Aletas motorizadas nas quatro laterais de insuflação',
      'Bomba de condensado e chave boia de nível integradas à bandeja',
      'Filtro central, serpentina evaporadora e ventilador radial/centrífugo',
      'Unidade condensadora externa e linha de dreno elevada',
    ],
    premissasRetorno: [
      'Manter o centro do painel totalmente livre; nunca cobrir com placas, luminárias, sinalização ou decoração.',
      'Evitar que a entrada aspire ar quente acumulado no plenum do forro por falhas de vedação.',
      'Não tratar o plenum do forro automaticamente como retorno sem projeto, vedação e higiene compatíveis.',
      'Garantir que o painel esteja perfeitamente assentado e vedado contra o forro (frestas aspiram ar sujo/quente).',
      'Não instalar junto a paredes, vigas ou luminárias que bloqueiem qualquer uma das saídas laterais.',
      'Confirmar alcance do jato em lojas com pé-direito alto para evitar estratificação do ar frio.',
    ],
    falhas: [
      {
        sintoma: 'Gotejamento pelo painel',
        causas: [
          'Dreno obstruído ou sem válvula/trecho conforme manual',
          'Bomba de condensado defeituosa ou boia de nível travada',
          'Unidade instalada desnivelada no entre-forro',
          'Isolamento deficiente acima do forro ou congelamento da serpentina',
        ],
        acoes: [
          'Isolar alimentação elétrica e proteger a área da loja abaixo da unidade.',
          'Inspecionar bandeja, bomba, boia e dreno.',
          'Limpar dreno por método aprovado (sem pressão excessiva que desconecte o tubo no forro).',
          'Verificar nivelamento do gabinete, isolamento da tubulação e investigar congelamento.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Fluxo fraco em uma ou mais direções',
        causas: [
          'Aletas bloqueadas ou motor de passo da aleta defeituoso',
          'Painel ou ventilador montado incorretamente',
          'Serpentina ou filtro central saturados',
          'Obstáculo físico próximo à saída no forro/luminária',
        ],
        acoes: [
          'Limpar filtro e serpentina.',
          'Conferir encaixe correto do painel decorativo e mecanismo das aletas.',
          'Inspecionar obstáculos próximos às 4 saídas e testar acionamento do ventilador.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Goteja apenas após horas de operação',
        causas: [
          'Dreno parcialmente obstruído acumulando água lentamente',
          'Bomba de condensado com falha intermitente',
          'Condensação externa no entre-forro por retorno muito quente/úmido',
          'Bandeja com acúmulo de sujeira ou biofilme',
        ],
        acoes: [
          'Executar teste em ciclo completo de operação e drenagem com água limpa.',
          'Inspecionar acionamento contínuo da bomba e boia.',
          'Verificar vedação do forro, temperatura do plenum e integridade do isolamento térmico.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Não resfria o ambiente, embora o ar de saída esteja frio',
        causas: [
          'Alcance insuficiente para o pé-direito da loja',
          'Curto-circuito entre aletas laterais e retorno central',
          'Aspiração de ar quente do plenum por frestas no painel',
          'Carga térmica de pessoas/equipamentos acima da capacidade',
        ],
        acoes: [
          'Mapear temperaturas na zona ocupada (altura de clientes/equipe).',
          'Corrigir ângulo das aletas e eliminar obstáculos próximos que rebatam o jato.',
          'Verificar vedação completa entre gabinete, painel e forro.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Ruído no forro',
        causas: [
          'Painel decorativo solto ou vibrando contra o forro',
          'Vibração transmitida à estrutura por falta de isoladores nos tirantes',
          'Tubo de dreno ou linha frigorífica encostando em perfis do forro',
          'Velocidade ou pressão inadequada no ventilador',
        ],
        acoes: [
          'Refixar painel e tirantes conforme especificação do fabricante.',
          'Isolar pontos de contato de tubulações e dreno no entre-forro.',
          'Conferir balanceamento do ventilador e suportação.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Alarme de bomba ou nível',
        causas: [
          'Linha de dreno bloqueada ou com retorno de água',
          'Bomba sem alimentação ou queimada',
          'Boia travada por biofilme na bandeja',
          'Altura de recalque ou percurso horizontal acima do limite do manual',
        ],
        acoes: [
          'Registrar código de falha exato antes de resetar.',
          'Inspecionar boia, bomba, alimentação elétrica e trajeto completo do dreno.',
          'Comparar altura de elevação e comprimento com o limite especificado pelo fabricante.',
        ],
        criticidade: 'alta',
      },
    ],
    roteiroEspecificoTitulo: 'Passo a passo para vazamento de condensado (Cassete)',
    roteiroEspecifico: [
      'Desenergize o cassete e proteja mercadorias e piso abaixo da unidade.',
      'Acesse o equipamento com plataforma/escada e proteção apropriadas.',
      'Inspecione painel, bandeja, bomba, boia e dreno.',
      'Verifique se a bandeja está nivelada e se a unidade está alinhada conforme especificação.',
      'Confira se o dreno possui diâmetro, caimento, sifão e altura de bombeamento compatíveis com o manual.',
      'Limpe a linha com método aprovado; evite pressão excessiva que possa desconectar ou romper a tubulação no forro.',
      'Teste a bomba e a boia conforme procedimento do fabricante (incluindo intertravamento de alarme).',
      'Inspecione o isolamento da tubulação frigorífica e superfícies frias no entre-forro.',
      'Investigue fluxo baixo ou serpentina congelada se houver gelo ou gotejamento após desligamento.',
      'Teste com água limpa e em operação estável para confirmar escoamento contínuo.',
    ],
    manutencaoPreventivaFoco: [
      'Limpeza preventiva da bomba de condensado, microswitch da boia e bandeja interna (prevenção de transbordamento sobre o forro).',
      'Verificação da vedação perimetral do painel no forro para evitar sujidade e aspiração do plenum.',
      'Inspeção do isolamento térmico no trecho de recalque do dreno e conexões no entre-forro.',
      'Teste funcional dos 4 motores de aletas e alinhamento sem obstáculos.',
    ],
    storeField: 'acSplit',
    storeFieldLabel: 'Unidades Split',
  },
  {
    id: 'splitao-self',
    nome: 'Splitão e Self-Contained',
    subtitulo: 'Expansão direta · sistemas dutados / alta capacidade',
    ciclo: 'Expansão direta dutada',
    secaoManual: 'Seção 7',
    descricao:
      'Sistemas comerciais de maior vazão e pressão estática. No Splitão, a evaporadora/gabinete interno conecta-se por linha frigorífica à condensadora externa; no Self-Contained, o circuito frigorífico integra-se em gabinete único com condensação direta ou remota.',
    componentesPrincipais: [
      'Gabinete de tratamento de ar com ventilador centrífugo (muitas vezes com polias e correias)',
      'Banco de filtros, serpentina evaporadora, bandeja e dampers de ar externo/retorno',
      'Rede de dutos de insuflação e retorno, plenos, transições, atenuadores e grelhas/difusores',
      'Compressor(es), condensador (integrado no self ou remoto no splitão), válvulas e sensores',
      'Quadro elétrico com contatores, relés térmicos/falta de fase e comandos de automação',
    ],
    premissasRetorno: [
      'Avaliar o desenho real de dutos, grelhas e pontos de retorno, não apenas o gabinete.',
      'A soma das perdas (filtro + serpentina + dutos + cotovelos + dampers + grelhas + atenuadores) não pode exceder a pressão estática externa disponível.',
      'Evitar filtros mais finos ou adicionais sem recálculo, pois reduzem drasticamente a vazão.',
      'Corrigir dutos flexíveis amassados, muito longos ou com curvas fechadas que geram perdas elevadas.',
      'Retorno pelo plenum só é aceitável com projeto específico, vedação e higiene adequadas.',
      'Impedir captação de ar de estoques, sanitários, docas ou áreas com odores/contaminantes.',
      'Manter equilíbrio entre insuflação, retorno, renovação e exaustão para evitar pressurização ou depressurização excessiva da loja.',
    ],
    falhas: [
      {
        sintoma: 'Vazão baixa em toda a loja',
        causas: [
          'Filtro saturado ou serpentina obstruída',
          'Correia frouxa/desgastada, polia incorreta ou falha no ventilador',
          'Rotação inadequada ou pressão estática excessiva na rede',
          'Damper principal fechado ou mal posicionado',
        ],
        acoes: [
          'Inspecionar banco de filtros e serpentina.',
          'Verificar ventilador, sentido de rotação, tensão de correia e polias.',
          'Medir pressão estática e comparar com a curva do ventilador e projeto.',
          'Ajustar damper conforme balanceamento formal.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Vazão baixa só em algumas áreas',
        causas: [
          'Dutos amassados, desconectados no forro ou com vazamento',
          'Registros/dampers de ramal fechados ou obstrução pontual',
          'Balanceamento inadequado entre ramais',
        ],
        acoes: [
          'Inspecionar todo o traçado do duto afetado, inclusive acima do forro.',
          'Conferir posição de registros/dampers e eliminar vazamentos em colarinhos e junções.',
          'Medir e balancear ramais com instrumento apropriado usando dados de projeto.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Ruído alto de ar',
        causas: [
          'Velocidade excessiva do ar em dutos ou grelhas subdimensionadas',
          'Filtro restritivo gerando alta sucção',
          'Turbulência em cotovelos ou duto desconectado próximo ao ponto',
        ],
        acoes: [
          'Medir pressão estática e vazão para comparar com o projeto.',
          'Corrigir seções restritivas, transições e obstáculos em grelhas.',
          'Não reduzir vazão aleatoriamente sem avaliar o impacto na carga térmica e congelamento.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Serpentina congela',
        causas: [
          'Baixo fluxo de ar por filtro/serpentina sujos',
          'Ventilador com baixa rotação ou correia patinando',
          'Damper fechado bloqueando retorno',
          'Anomalia no circuito frigorífico (expansão, carga ou sensor)',
        ],
        acoes: [
          'Corrigir o fluxo de ar e o acionamento do ventilador primeiro.',
          'Verificar sequência de intertravamento (ventilação antes da refrigeração) e proteções.',
          'Persistindo com vazão validada, avaliar circuito frigorífico conforme manual.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Compressor desarma em alta pressão',
        causas: [
          'Condensador sujo ou obstrução externa ao fluxo de ar',
          'Falha no ventilador externo ou recirculação do ar quente de descarga',
          'Sobrecarga de refrigerante, presença de não condensáveis ou outro defeito frigorífico',
        ],
        acoes: [
          'Limpar condensador e liberar entradas/saídas de ar externo.',
          'Verificar rotação do ventilador externo e eliminar recirculação de descarga.',
          'Encaminhar para profissional habilitado avaliar o circuito sem completar ou aliviar carga às cegas.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Capacidade insuficiente em horário de pico',
        causas: [
          'Carga térmica da loja maior que a prevista em projeto',
          'Entrada excessiva de ar externo ou retorno muito quente',
          'Filtro saturado, distribuição deficiente ou estágio de capacidade indisponível',
        ],
        acoes: [
          'Comparar ocupação, iluminação, equipamentos e infiltração de portas com os dados de projeto.',
          'Conferir abertura de tomada de ar externo e vazão real.',
          'Validar acionamento de todos os estágios/compressores e controles.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Contaminação ou odor no retorno',
        causas: [
          'Retorno captando ar de docas, sanitários, estoque ou área inadequada',
          'Duto sujo ou com vazamento aspirando poeira do entre-forro',
          'Filtro incorreto ou bandeja/dreno contaminados por biofilme',
        ],
        acoes: [
          'Identificar a origem física da captação e vedar pontos de infiltração no retorno.',
          'Higienizar dutos, bandeja e dreno conforme plano de manutenção.',
          'Revisar especificação e periodicidade de troca dos filtros.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Motor ou correia falha repetidamente',
        causas: [
          'Tensão elétrica fora da faixa ou desequilíbrio entre fases',
          'Desalinhamento de polias, tensão incorreta de correia ou desgaste de mancais',
          'Ventilador desbalanceado ou pressão estática acima do limite de seleção',
        ],
        acoes: [
          'Medir tensão das três fases sob carga e corrente por fase.',
          'Verificar alinhamento a laser/régua das polias, estado dos rolamentos/mancais e tensão da correia.',
          'Corrigir a causa da sobrecarga mecânica/aerodinâmica — nunca apenas trocar motor ou correia.',
        ],
        criticidade: 'alta',
      },
    ],
    roteiroEspecificoTitulo: 'Sequência de diagnóstico do lado do ar (Splitão / Self)',
    roteiroEspecifico: [
      'Obtenha o desenho "as built" ou confirme o traçado real dos dutos.',
      'Registre o modelo, rotação do ventilador, configuração de polias e tipo de filtro.',
      'Inspecione filtro, serpentina, ventilador, correias, mancais, dampers e dutos.',
      'Verifique sentido de rotação e condição mecânica com procedimento seguro.',
      'Meça pressão estática diferenciando retorno, filtro, serpentina e insuflação quando possível.',
      'Compare as medições com os dados de seleção do equipamento e do projeto.',
      'Procure vazamentos e dutos desconectados, inclusive no entre-forro.',
      'Verifique se mudanças de layout na loja fecharam grelhas ou alteraram o retorno.',
      'Faça balanceamento apenas com dados de vazão de projeto; não "estrangule" ramais para compensar retorno ruim.',
      'Depois de corrigir o lado do ar, reavalie o desempenho frigorífico.',
    ],
    manutencaoPreventivaFoco: [
      'Inspeção e ajuste de tensão/alinhamento de correias, polias e lubrificação/ruído de mancais.',
      'Medição de corrente por fase e desequilíbrio de tensão trifásica (triagem ≤ 1%).',
      'Substituição programada de filtros com especificação correta e limpeza da casa de máquinas.',
      'Verificação de integridade de dutos flexíveis, colarinhos, dampers e isolamento no entre-forro.',
    ],
    storeField: 'acSplitaoSelf',
    storeFieldLabel: 'Splitão / Self',
  },
  {
    id: 'fan-coil',
    nome: 'Fan Coil (Água Gelada)',
    subtitulo: 'Hidráulico · alimentado por Chiller',
    ciclo: 'Água gelada (Chiller)',
    secaoManual: 'Seção 8 & 3.1.5',
    descricao:
      'Unidade de tratamento de ar composta por filtro, ventilador, serpentina de água gelada (sistema 2 ou 4 tubos), bandeja/dreno, válvula de controle (2 ou 3 vias), atuador, filtro tipo Y, válvula de balanceamento e purgadores.',
    componentesPrincipais: [
      'Serpentina de água gelada (rede 2 tubos com alternância ou 4 tubos separados)',
      'Válvula de controle (2 vias, 3 vias ou independente de pressão) e atuador proporcional/on-off',
      'Válvula de isolamento, válvula de balanceamento, filtro hidráulico tipo Y e purgadores de ar',
      'Filtro de ar, grupo ventilador e bandeja/dreno de condensado',
      'Sensores de temperatura (ar/água) e integração com automação predial / central do shopping',
    ],
    premissasRetorno: [
      'Confirmar se o retorno é direto pela unidade, dutado ou por plenum projetado.',
      'Manter entrada de ar, filtros e portas de acesso na casa de máquinas/forro desobstruídos.',
      'Evitar curto-circuito entre insuflação e retorno ou aspiração de plenum quente/contaminado.',
      'Verificar posição do damper de ar externo quando presente.',
      'Garantir escoamento pleno da bandeja mesmo em dias de alta umidade relativa.',
      'Confirmar se a instalação é de 2 tubos ou 4 tubos antes de condenar válvula ou tubulação.',
    ],
    falhas: [
      {
        sintoma: 'Ventila, mas não resfria',
        causas: [
          'Válvula de controle fechada ou atuador sem comando/danificado',
          'Água gelada não chega ao ramal ou chiller da central indisponível',
          'Filtro hidráulico tipo Y obstruído',
          'Bolsão de ar na serpentina ou vazão de água muito baixa',
        ],
        acoes: [
          'Confirmar disponibilidade de água gelada na central/ramal antes de intervir na máquina.',
          'Medir temperatura da água na entrada e saída da serpentina com sondas isoladas.',
          'Conferir sinal de comando, sentido de ação e curso real da válvula/atuador.',
          'Inspecionar e limpar filtro tipo Y, verificar balanceamento e purgar ar pelos pontos previstos.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Resfriamento fraco',
        causas: [
          'Vazão de água gelada abaixo do projeto ou válvula parcialmente fechada',
          'Serpentina de ar ou filtro de ar obstruídos por sujeira',
          'Ar preso na serpentina reduzindo troca térmica',
          'Temperatura de alimentação da água gelada acima do especificado',
        ],
        acoes: [
          'Validar primeiro o lado do ar (filtro, serpentina e vazão).',
          'Medir ΔT da água (T_retorno − T_alimentação) e pressão diferencial.',
          'Confirmar vazão e temperatura de projeto com a central; limpar filtro Y e purgar serpentina.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Condensação externa em tubos ou válvulas',
        causas: [
          'Isolamento térmico ausente, danificado ou mal vedado nas junções',
          'Barreira de vapor rompida permitindo penetração de umidade do ar',
        ],
        acoes: [
          'Não cobrir conexões úmidas sem antes localizar a causa ou secar a superfície.',
          'Reparar o isolamento térmico de forma contínua e com barreira de vapor íntegra.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Ruído de água ou vibração',
        causas: [
          'Ar preso na rede hidráulica (cavitação/borbulhamento)',
          'Válvula de controle inadequada ou pressão diferencial excessiva no ramal',
          'Tubulação hidráulica sem fixação ou suportação adequada',
        ],
        acoes: [
          'Executar purga cuidadosa nos pontos previstos com proteção contra pressão e temperatura.',
          'Conferir pressão diferencial, estado da válvula e suportes/braçadeiras da tubulação.',
          'Ajustar balanceamento hidráulico conforme projeto.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Vazamento na bandeja',
        causas: [
          'Dreno obstruído ou linha sem caimento/sifão',
          'Equipamento desnivelado ou bandeja corroída/danificada',
          'Isolamento deficiente causando condensação externa fora da bandeja',
        ],
        acoes: [
          'Inspecionar bandeja, sifão, dreno e verificar nivelamento do gabinete.',
          'Desobstruir linha de dreno e corrigir isolamento de válvulas e conexões sobre a bandeja.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Temperatura instável',
        causas: [
          'Sensor mal instalado, solto ou em retorno não representativo',
          'Válvula modulando incorretamente ou atuador travado mecanicamente',
          'Sistema de fluxo variável sem balanceamento hidráulico adequado',
        ],
        acoes: [
          'Conferir fixação, posicionamento e leitura do sensor contra termômetro de referência.',
          'Testar abertura e fechamento completo do atuador e da haste da válvula.',
          'Revisar balanceamento hidráulico e validar lógica de controle junto à automação.',
        ],
        criticidade: 'media',
      },
    ],
    roteiroEspecificoTitulo: 'Passos para diagnosticar Fan Coil de água gelada',
    roteiroEspecifico: [
      'Confirme se a central de água gelada está habilitada e se há água disponível no ramal.',
      'Verifique o estado do filtro de ar, serpentina e ventilador.',
      'Confirme comando, setpoint, modo e velocidade no termostato/automação.',
      'Verifique sinal e curso mecânico do atuador (não presuma que válvula aberta equivale à vazão correta).',
      'Meça temperatura da água na entrada e saída com sondas de contato bem fixadas e isoladas.',
      'Verifique válvulas de isolamento, balanceamento, filtro tipo Y e possíveis obstruções.',
      'Procure ar na serpentina; purgue apenas pelos pontos previstos e com proteção.',
      'Confirme vazão de ar e caminho de retorno.',
      'Inspecione bandeja, sifão e dreno.',
      'Se a água estiver nas condições de projeto e o desempenho continuar ruim, alinhe balanceamento e controle com a equipe da central.',
    ],
    manutencaoPreventivaFoco: [
      'Limpeza periódica do filtro hidráulico tipo Y e verificação de vazamentos em gaxetas de válvulas.',
      'Teste de curso e resposta do atuador da válvula de 2/3 vias na automação.',
      'Inspeção contínua do isolamento térmico e barreira de vapor de toda a tubulação fria e válvulas.',
      'Limpeza de bandeja, sifão e verificação de ar preso na serpentina via purgadores.',
    ],
    storeField: 'acFancoil',
    storeFieldLabel: 'Unidades Fan Coil',
  },
  {
    id: 'vrf-vrv',
    nome: 'VRF / VRV',
    subtitulo: 'Expansão direta · fluxo variável multi-zona',
    ciclo: 'Expansão direta inverter multi-zona',
    secaoManual: 'Seção 9',
    descricao:
      'Sistema de fluxo de refrigerante variável com uma ou mais unidades externas (compressores inverter e ventiladores modulantes) conectadas a diversas unidades internas por rede frigorífica, derivações/refnets, branch selectors e barramento de comunicação.',
    componentesPrincipais: [
      'Unidades externas com compressor(es) inverter, ventiladores modulantes e placas eletrônicas',
      'Rede frigorífica com derivações/coletores e caixas branch selector (sistemas com recuperação de calor)',
      'Múltiplas evaporadoras internas (cassete, dutada, hi-wall ou piso-teto) com válvulas de expansão eletrônicas (VEE)',
      'Rede de comunicação dedicada, endereçamento eletrônico e controles centralizados/automação',
      'Bancos de capacitores no barramento CC (atenção crítica ao tempo de descarga antes de tocar)',
    ],
    premissasRetorno: [
      'Avaliar o caminho de retorno individualmente em cada unidade interna, mesmo quando a condensadora parecer normal.',
      'Respeitar as particularidades de cada evaporadora (cassete, dutada, hi-wall ou piso-teto) conectada à rede.',
      'Em unidades dutadas da rede VRF, filtros, dutos, dampers e pressão estática são críticos.',
      'Evitar transferência de ar de outra zona ou leitura de sensor em plenum quente.',
      'Lembrar que falta de ar em apenas uma evaporadora gera gelo e alarme local sem derrubar necessariamente a rede inteira.',
      'Respeitar o fator de simultaneidade de projeto: nem todas as zonas atingem capacidade máxima simultânea.',
    ],
    falhas: [
      {
        sintoma: 'Uma unidade não resfria, outras funcionam',
        causas: [
          'Filtro saturado ou retorno bloqueado na unidade específica',
          'Falha de comunicação local, endereçamento incorreto ou comando conflitante',
          'Sensor local com desvio ou válvula de expansão eletrônica (VEE) travada',
          'Configuração ou limite de capacidade aplicado à zona',
        ],
        acoes: [
          'Confirmar o endereço exato da unidade e registrar o código de falha.',
          'Inspecionar retorno, filtro e drenagem da unidade afetada primeiro.',
          'Conferir comunicação, modo de operação (evitar conflito frio/quente em bomba de calor) e diagnóstico do fabricante.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Muitas unidades apresentam baixo desempenho',
        causas: [
          'Falha parcial ou limitação na unidade condensadora externa',
          'Problema de alimentação elétrica ou erro geral de comunicação',
          'Condição externa extrema ou carga térmica da loja acima da simultaneidade',
          'Problema comum de rede frigorífica ou restrição de capacidade ativa',
        ],
        acoes: [
          'Consultar histórico de alarmes e identificar quais unidades e modos falham.',
          'Verificar alimentação trifásica e condição de operação da unidade externa.',
          'Envolver técnico especialista/autorizado com ferramenta de serviço da marca.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Falha intermitente',
        causas: [
          'Ruído ou mau contato na rede de comunicação ou alimentação instável',
          'Conexão elétrica oxidada ou frouxa em bornes',
          'Sensor intermitente, falha de placa ou alarme de drenagem (boia)',
          'Atuação de proteção por alta temperatura de descarga ou pressão',
        ],
        acoes: [
          'Registrar código, horário, temperatura externa e condição operacional no momento da falha.',
          'Inspecionar conexões de comunicação, aterramento e bornes de força.',
          'Avaliar histórico e tendência na ferramenta de serviço; evitar apenas reiniciar o disjuntor repetidamente.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Uma unidade congela',
        causas: [
          'Retorno insuficiente ou curto-circuito local na evaporadora',
          'Filtro ou serpentina sujos, ventilador interno lento/falho',
          'Sensor de serpentina descalibrado ou válvula de expansão eletrônica com passagem anormal',
        ],
        acoes: [
          'Corrigir fluxo de ar, limpeza e instalação da evaporadora afetada.',
          'Testar ventilador e ler valores dos sensores na interface de serviço.',
          'Persistindo, encaminhar para diagnóstico VRF especializado da VEE e circuito.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Unidades de uma zona não operam',
        causas: [
          'Falha em caixa branch selector ou derivação específica',
          'Endereçamento duplicado/perdido ou configuração de grupo',
          'Falha de comunicação do ramal, comando central ou válvula de zona',
        ],
        acoes: [
          'Conferir mapa de endereços e topologia do projeto.',
          'Ler código de falha e histórico no controle central ou ferramenta oficial.',
          'Seguir procedimento de comissionamento do fabricante.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Ruído de refrigerante',
        causas: [
          'Modulação normal do fluxo variável em certos modos ou partida/degelo',
          'Problema de montagem de derivações (refnets fora de nível), carga, restrição ou VEE',
        ],
        acoes: [
          'Comparar comportamento com padrão normal do fabricante.',
          'Localizar o ponto exato, verificar suportes e condição operacional antes de condenar válvulas ou tubulação.',
        ],
        criticidade: 'media',
      },
      {
        sintoma: 'Dreno transborda em unidade interna',
        causas: [
          'Bomba de condensado inoperante ou boia travada',
          'Dreno obstruído ou sem inclinação adequada',
          'Filtro/serpentina sujos ou formação de gelo derretendo após parada',
        ],
        acoes: [
          'Aplicar roteiro de drenagem específico do tipo de unidade interna (cassete, dutada, hi-wall).',
          'Confirmar código de alarme de nível e testar bomba/boia.',
        ],
        criticidade: 'alta',
      },
      {
        sintoma: 'Falha após intervenção ou expansão',
        causas: [
          'Endereçamento incorreto ou pendente após troca de placa/unidade',
          'Derivações (refnets), comprimentos ou desníveis fora do projeto',
          'Teste de estanqueidade ou vácuo inadequados ou erro no cálculo da carga adicional',
        ],
        acoes: [
          'Conferir documentação "as built" e relatório da obra/expansão.',
          'Verificar topologia e parâmetros com software/ferramenta oficial da marca.',
          'Recomissionar o sistema rigorosamente segundo o manual do fabricante.',
        ],
        criticidade: 'alta',
      },
    ],
    roteiroEspecificoTitulo: 'Boas práticas no diagnóstico VRF / VRV',
    roteiroEspecifico: [
      'Registre códigos de falha de todas as unidades envolvidas antes de desligar ou reiniciar.',
      'Identifique se a falha é local (1 unidade), de grupo, de ramal/branch selector ou da unidade externa.',
      'Confirme endereçamento, grupo, modo (evitar conflito de modo) e integridade da comunicação.',
      'Verifique retorno, filtro, ventilador e dreno da unidade afetada antes de culpar o sistema.',
      'Verifique alimentação, aterramento e conexões de comunicação conforme esquema do fabricante (aguardar descarga do barramento CC!).',
      'Consulte histórico e parâmetros operacionais com ferramenta de serviço autorizada da marca.',
      'Verifique condições de operação da unidade externa e se há limite de capacidade ou proteção ativa.',
      'Não altere endereços, comprimento configurado ou carga de refrigerante sem documentação e procedimento oficial.',
      'Não conclua que o compressor inverter está defeituoso apenas porque uma unidade não resfria.',
      'Após o reparo, valide todas as zonas afetadas em operação, não apenas a unidade reparada.',
    ],
    manutencaoPreventivaFoco: [
      'Preservação rigorosa do histórico de falhas, mapa de endereços e parâmetros da placa antes de qualquer reset.',
      'Segurança em barramento CC de placas inverter (aguardar tempo de descarga do manual e medir tensão antes de tocar).',
      'Manutenção preventiva individual de filtros, turbinas e bombas de dreno em todas as evaporadoras da loja.',
      'Inspeção de blindagem/aterramento do cabo de comunicação e limpeza das serpentinas externas sem entortar aletas.',
    ],
    storeField: 'acVrf',
    storeFieldLabel: 'Unidades VRF',
  },
];

export const MANDATORY_SAFETY_RULES: string[] = [
  'Identifique equipamento, modelo, número de série, tensão, refrigerante e circuito atendido.',
  'Consulte o manual e o esquema elétrico específico do modelo antes de intervir.',
  'Isole e bloqueie todas as fontes de energia — inclusive unidades externas, resistências, bombas e comandos remotos.',
  'Confirme ausência de tensão com instrumento adequado; em inverter/VRF, aguarde descarga do barramento CC.',
  'Use EPIs e siga procedimentos de trabalho em altura, espaços confinados e áreas com clientes.',
  'Não abra circuito frigorífico sem habilitação; recolha o fluido refrigerante e nunca libere na atmosfera.',
  'Nunca use oxigênio ou ar comprimido em teste de pressão (somente gás inerte apropriado com regulador).',
  'Não faça pontes (jumpers) em proteções, sensores ou intertravamentos para manter operando.',
  'Não defina carga apenas por "pressão de sucção"; siga o método oficial do fabricante.',
  'Recoloque tampas, proteções, filtros, sifões e registre medições e condição final.',
];

export const FIELD_INSTRUMENTS: string[] = [
  'Multímetro e alicate amperímetro com categoria e faixa adequadas',
  'Termômetros de contato com sondas isoladas e termohigrômetro',
  'Manômetros digitais ou transdutores compatíveis com o refrigerante',
  'Bomba de vácuo e vacuômetro eletrônico em microns',
  'Detector eletrônico de vazamento e conjunto para teste com gás inerte',
  'Anemômetro, balômetro ou instrumento de vazão compatível',
  'Micromanômetro diferencial para pressão estática',
  'Tacômetro e instrumentos hidráulicos para vazão/pressão diferencial em fan coil',
];

export const DIAGNOSTIC_STAGES: DiagnosticStage[] = [
  {
    etapa: 'Etapa 1',
    titulo: 'Confirmar a reclamação',
    objetivo: 'Delimitar quando, onde e como o sintoma ocorre antes de abrir o equipamento.',
    itens: [
      'Qual ambiente ou setor da loja apresenta o problema.',
      'Quando ocorre: abertura, horário de pico, fechamento, dias quentes ou após limpeza.',
      'Se o defeito é contínuo ou intermitente.',
      'Presença de ruído, vibração, gotejamento, odor, gelo ou disparo de disjuntor.',
      'Quais equipamentos atendem a área e se houve alteração de layout, estoque, forro ou portas.',
    ],
  },
  {
    etapa: 'Etapa 2',
    titulo: 'Confirmar comando e modo',
    objetivo: 'Descartar bloqueios operacionais, conflitos de modo e erro de programação.',
    itens: [
      'Confirmar habilitação no controle local, central ou automação.',
      'Validar modo (refrigeração/ventilação), setpoint, velocidade, programação e alarmes.',
      'Garantir que o comando está atuando na unidade correta.',
      'Em VRF e centrais, checar restrição de capacidade, conflito de modo ou comando de grupo.',
    ],
  },
  {
    etapa: 'Etapa 3',
    titulo: 'Verificar a condição do ar',
    objetivo: 'Validar retorno, filtro, insuflação, vazão e pressão estática (fluxo antes do gás!).',
    itens: [
      'Inspecionar filtro, grelha, caminho de retorno e obstáculos na insuflação.',
      'Observar se há curto-circuito entre ar insuflado e sucção.',
      'Detectar ruído de sucção, filtro deformado, vibração de painel ou fluxo baixo.',
      'Medir temperaturas de retorno e insuflação e, em dutados, pressão estática e vazão.',
    ],
  },
  {
    etapa: 'Etapa 4',
    titulo: 'Verificar drenagem e condensação',
    objetivo: 'Prevenir danos a forro/mercadorias e identificar bloqueios ou falhas de bomba.',
    itens: [
      'Observar bandeja, saída de dreno e sinais de transbordamento.',
      'Conferir inclinação, sifão, ventilação e altura de bombeamento conforme manual.',
      'Testar operação da bomba de condensado e movimento livre da boia de nível.',
      'Buscar vazamentos em conexões, isolamento térmico rompido e nunca pressurizar dreno sem critério.',
    ],
  },
  {
    etapa: 'Etapa 5',
    titulo: 'Verificar elétrica e controles',
    objetivo: 'Avaliar alimentação, conexões e sensores antes de condenar placas ou compressores.',
    itens: [
      'Com equipamento desenergizado, inspecionar bornes, conectores, cabos, aterramento e disjuntores.',
      'Medir tensão sob carga e sequência/desequilíbrio de fases no trifásico.',
      'Procurar sinais de aquecimento, oxidação, umidade ou mau contato.',
      'Testar sensores e atuadores segundo tabela do manual antes de substituir placa.',
    ],
  },
  {
    etapa: 'Etapa 6',
    titulo: 'Investigar circuito frigorífico ou hidráulico',
    objetivo: 'Avaliar ciclo apenas após confirmar fluxo de ar, alimentação, comando e drenagem.',
    itens: [
      'Expansão direta: registrar pressões, temperaturas de tubo, superaquecimento e sub-resfriamento com sistema estabilizado.',
      'Procurar evidência de vazamento (óleo + detector), restrição ou falha de componente.',
      'Água gelada: verificar válvulas, filtro Y, vazão, temperaturas entrada/saída, purga e balanceamento.',
      'Registrar condições reais antes de alterar qualquer ajuste ou carga.',
    ],
  },
  {
    etapa: 'Etapa 7',
    titulo: 'Validar e registrar',
    objetivo: 'Garantir eficácia do reparo em operação representativa e documentar causa-raiz.',
    itens: [
      'Executar teste em condição representativa de operação na loja.',
      'Validar vazão, distribuição, estabilidade térmica, drenagem, ruído e ausência de alarmes.',
      'Confirmar melhoria efetiva na zona ocupada sem atuação de proteções.',
      'Registrar medições antes/depois, causa-raiz, peças e recomendação preventiva.',
    ],
  },
];

export const RETURN_DEEP_DIVES: ReturnProblemDeepDive[] = [
  {
    id: 'retorno-bloqueado',
    titulo: '10.1 Retorno bloqueado',
    resumo: 'Restrição física no caminho de sucção reduz vazão de ar e sobrecarrega o sistema.',
    causasOuSinais: [
      'Filtro saturado ou de eficiência maior que a especificada',
      'Grelha coberta por mercadoria, cartaz, mobiliário ou forro',
      'Tela adicional instalada sem cálculo ou grelha subdimensionada',
      'Damper fechado, duto flexível amassado ou aparelho muito próximo de parede/teto',
    ],
    efeitosOuRiscos: [
      'Queda de vazão e capacidade total com aumento enganoso da diferença de temperatura (ΔT)',
      'Ruído de sucção, congelamento da serpentina e desarme por proteção',
      'Sobrecarga e sobreaquecimento do motor do ventilador ou compressor',
    ],
    correcao: [
      'Identificar o elemento restritivo e limpar/substituir o filtro pelo modelo especificado.',
      'Remover obstruções externas e corrigir dutos flexíveis amassados ou grelhas.',
      'Medir pressão estática e vazão e investigar causa se o filtro saturar rápido (obra/poeira).',
    ],
  },
  {
    id: 'retorno-curto',
    titulo: '10.2 Retorno curto-circuitado',
    resumo: 'O ar frio insuflado volta diretamente para a sucção sem resfriar a zona ocupada.',
    causasOuSinais: [
      'Sensor indica temperatura atingida, mas clientes e equipe sentem calor',
      'Unidade modula para baixo ou desliga cedo (ciclagem curta)',
      'Região próxima à unidade fica fria enquanto o restante do salão permanece quente',
      'Cassete/teto soprando junto ao forro ou hi-wall em nicho/próximo a obstáculo',
    ],
    efeitosOuRiscos: [
      'Desconforto térmico persistente e alto consumo sem entrega útil de frio',
      'Desgaste prematuro por ciclagem excessiva',
    ],
    correcao: [
      'Observar a trajetória real do ar insuflado (não apenas a posição visual da aleta).',
      'Remover obstáculos, corrigir ângulo de insuflação ou vedar passagem para sucção.',
      'Nunca reduzir setpoint como tentativa de compensar curto-circuito de ar.',
    ],
  },
  {
    id: 'retorno-plenum',
    titulo: '10.3 Retorno pelo plenum do forro',
    resumo: 'Aspirar ar acima do forro sem projeto e vedação contamina e sobrecarrega a unidade.',
    causasOuSinais: [
      'Marcas de poeira ou frestas ao redor de painel de cassete, caixas de retorno ou dutos',
      'Odor de forro, aumento de poeira no ambiente e filtros saturando rapidamente',
    ],
    efeitosOuRiscos: [
      'Reintrodução de fibras, poeira e odores; aumento significativo de carga térmica',
      'Desbalanceamento do sistema e risco de condensação em superfícies frias no forro',
    ],
    correcao: [
      'Não presumir que qualquer entre-forro pode operar como plenum de retorno.',
      'Confirmar previsão em projeto, vedar painéis/dutos e isolar adequadamente o circuito de retorno.',
    ],
  },
  {
    id: 'pressao-loja',
    titulo: '10.4 Pressão negativa/positiva e ar de outra zona',
    resumo: 'Desequilíbrio entre insuflação, retorno, ar externo, exaustão e zonas vizinhas.',
    causasOuSinais: [
      'Pressão negativa excessiva: puxa ar quente/úmido da rua, odores de docas/sanitários e dificulta abrir portas',
      'Pressão positiva excessiva: expulsa ar frio por frestas e gera perda energética',
      'Exaustores de sanitários/copa retirando mais ar do que o sistema de renovação repõe',
      'Retorno captando ar quente de outra zona por portas abertas ou duto vazando',
    ],
    efeitosOuRiscos: [
      'Condensação interna, entrada de poeira e incapacidade de estabilizar a temperatura',
      'Leitura falsa de sensores posicionados em fluxo cruzado',
    ],
    correcao: [
      'Avaliar balanço global entre ar externo, exaustão e retorno segundo projeto de ventilação.',
      'Nunca simplesmente fechar a tomada de ar externo ou desligar exaustão para "melhorar o frio".',
      'Garantir que o retorno e o sensor representem exatamente a zona atendida.',
    ],
  },
];

export const QUICK_SYMPTOM_MATRIX: QuickSymptomMatrixRow[] = [
  {
    sintoma: '"Não gela"',
    primeiroVerificar: 'Modo, comando, retorno, filtro, fluxo de ar, unidade externa e alarmes',
    naoFazerPrimeiro: 'Completar refrigerante sem diagnóstico',
  },
  {
    sintoma: 'Gelo na serpentina',
    primeiroVerificar: 'Filtro, ventilador, caminho de retorno, serpentinas e sensores',
    naoFazerPrimeiro: 'Quebrar gelo com ferramenta ou manter compressor operando',
  },
  {
    sintoma: 'Gotejamento',
    primeiroVerificar: 'Bandeja, bomba, boia, sifão, dreno, isolamento e congelamento',
    naoFazerPrimeiro: 'Despejar produtos químicos ou pressurizar o dreno sem conhecer o sistema',
  },
  {
    sintoma: 'Alto consumo',
    primeiroVerificar: 'Setpoint, horários, filtros, retorno, infiltração, portas abertas, carga e controle',
    naoFazerPrimeiro: 'Reduzir manutenção ou alterar proteções elétricas',
  },
  {
    sintoma: 'Disjuntor desarma',
    primeiroVerificar: 'Curto-circuito, sobrecorrente, conexões, motor, compressor, alimentação e proteção',
    naoFazerPrimeiro: 'Rearmar o disjuntor repetidamente',
  },
  {
    sintoma: 'Ruído',
    primeiroVerificar: 'Localização exata, fixação, ventilador, fluxo de ar, duto e tubulação',
    naoFazerPrimeiro: 'Substituir compressor sem localizar a origem',
  },
  {
    sintoma: 'Mau odor',
    primeiroVerificar: 'Filtro, bandeja, dreno, serpentina, retorno e origem do ar captado',
    naoFazerPrimeiro: 'Usar fragrância para mascarar o odor',
  },
  {
    sintoma: 'Ambiente desigual',
    primeiroVerificar: 'Distribuição, retorno, grelhas, obstáculos, carga por zona e controle',
    naoFazerPrimeiro: 'Alterar o setpoint de todas as unidades',
  },
  {
    sintoma: 'Alarme recorrente',
    primeiroVerificar: 'Código e histórico, condição de operação, fluxo, alimentação e comunicação',
    naoFazerPrimeiro: 'Apagar alarmes sem registrar nem corrigir a causa',
  },
];

export const MEASUREMENT_MATRIX: MeasurementMatrixRow[] = [
  {
    ensaio: 'Tensão de alimentação',
    ondeComo: 'Terminais do equipamento, durante a operação sob carga',
    criterioAceitacao: 'Dentro da faixa de placa/manual e requisitos elétricos aplicáveis',
  },
  {
    ensaio: 'Desequilíbrio de tensão trifásica',
    ondeComo: 'Três tensões fase-fase medidas no mesmo ponto sob carga',
    criterioAceitacao: 'Triagem preferencial até 1% (investigar alimentação se maior; aplicar limite do fabricante)',
  },
  {
    ensaio: 'Corrente do compressor e motores',
    ondeComo: 'Condutores individuais com alicate amperímetro adequado',
    criterioAceitacao: 'Coerente com placa e condição operacional; inverter avaliado pelo ponto de modulação',
  },
  {
    ensaio: 'Rotação e vazão do ventilador',
    ondeComo: 'Ventilador externo e interno (comando/tacômetro)',
    criterioAceitacao: 'Valores/comando dentro do manual e vazão de projeto',
  },
  {
    ensaio: 'Pressão estática',
    ondeComo: 'Micromanômetro nas tomadas do retorno, filtro, serpentina e insuflação',
    criterioAceitacao: 'Dentro da curva do ventilador e seleção de projeto (não retirar filtro para medir)',
  },
  {
    ensaio: 'Vazão de ar',
    ondeComo: 'Balômetro, travessia de duto ou malha de pontos na grelha',
    criterioAceitacao: 'Dentro da vazão de projeto e tolerância formalmente especificada',
  },
  {
    ensaio: 'Temperaturas retorno / insuflação (ΔT ar)',
    ondeComo: 'Pontos representativos após estabilização (sem encostar sonda em metal/umidade)',
    criterioAceitacao: 'Coerente com condição psicrométrica e vazão (ΔT isolado não comprova carga nem defeito)',
  },
  {
    ensaio: 'Pressão frigorífica',
    ondeComo: 'Portas de serviço com equipamento estabilizado no modo correto',
    criterioAceitacao: 'Faixa compatível com refrigerante, ambiente, carga e modulação (sem "pressão única" genérica)',
  },
  {
    ensaio: 'Superaquecimento / Sub-resfriamento',
    ondeComo: 'Sonda isolada em tubo limpo + saturação correta (orvalho/bolha quando houver glide)',
    criterioAceitacao: 'Alvo do fabricante para a condição ensaiada',
  },
  {
    ensaio: 'Entrada e descarga da condensadora',
    ondeComo: 'Vários pontos de entrada (sem sol/descarga) e saída da serpentina',
    criterioAceitacao: 'Sem obstrução ou recirculação de ar quente que eleve a entrada',
  },
  {
    ensaio: 'Água gelada no Fan Coil (ΔT água / vazão)',
    ondeComo: 'Sondas isoladas entrada/saída, medidor/balanceamento e ΔP',
    criterioAceitacao: 'Vazão, diferencial e temperaturas do projeto e seleção da serpentina',
  },
  {
    ensaio: 'Drenagem, estanqueidade e vácuo',
    ondeComo: 'Ensaio com água limpa; detector + gás inerte; vacuômetro afastado da bomba (~500 microns ref.)',
    criterioAceitacao: 'Escoamento contínuo; zero vazamento; estabilidade de vácuo conforme manual',
  },
];

export const PREVENTIVE_VISIT_CHECKS: string[] = [
  'Verificar alarmes ativos, histórico e reclamações da equipe da loja.',
  'Inspecionar filtro de ar e caminho completo da entrada de retorno.',
  'Confirmar ausência de obstrução por mercadorias, cartazes ou móveis em insuflação e retorno.',
  'Observar ruído anormal, vibração, sinais de vazamento de óleo/água e formação de gelo.',
  'Verificar drenagem, bandeja, caimento, bomba e boia de nível.',
  'Registrar temperaturas de operação e conferir se houve alteração de layout na loja.',
];

export const ESCALATION_CRITERIA: string[] = [
  'Suspeita de vazamento de fluido refrigerante.',
  'Necessidade de abrir o circuito frigorífico (recolhimento, brasagem, vácuo e carga).',
  'Alarmes recorrentes em compressor, alta/baixa pressão ou temperatura.',
  'Falha de placa inverter, barramento CC, comunicação VRF ou caixa branch selector.',
  'Medições elétricas, de pressão ou vazão fora dos limites do manual.',
  'Disparo repetido de disjuntor ou evidência de aquecimento elétrico em bornes/cabos.',
  'Congelamento recorrente mesmo após corrigir fluxo de ar e limpeza.',
  'Necessidade de alterar dutos, vazões, ar externo, balanceamento ou capacidade térmica.',
  'Condensação dentro do entre-forro ou risco de dano a instalações elétricas.',
  'Falha simultânea que afeta várias unidades ou zonas, ou divergência entre instalação e projeto.',
];

export const FIELD_CHECKLIST_ITEMS: {
  id: string;
  etapa: string;
  label: string;
  appliesTo?: AcSystemId[];
}[] = [
  { id: 'seg', etapa: 'Segurança', label: 'Equipamento identificado (modelo/refrigerante/tensão) e fontes isoladas/bloqueadas antes de abrir' },
  { id: 'cmd', etapa: 'Comando', label: 'Modo, setpoint, programação, habilitação central/local e códigos de alarme registrados' },
  { id: 'ret', etapa: 'Retorno / Ar', label: 'Grelha/entrada de retorno desobstruída, sem curto-circuito de insuflação nem aspiração indevida de plenum' },
  { id: 'fil', etapa: 'Filtro / Serp.', label: 'Filtro correto/limpo e serpentina evaporadora sem poeira, gordura, corrosão ou congelamento' },
  { id: 'ven', etapa: 'Ventilador', label: 'Turbina/hélice limpa, sentido de rotação correto, sem vibração anormal; correia/polias íntegras' },
  { id: 'dreno', etapa: 'Drenagem', label: 'Bandeja limpa e nivelada, sifão/caimento corretos, bomba e boia testadas e isolamento íntegro' },
  { id: 'ele', etapa: 'Elétrica', label: 'Bornes, aterramento, tensão sob carga, desequilíbrio trifásico (≤ 1%) e corrente coerentes com manual' },
  { id: 'cond', etapa: 'Condensadora', label: 'Entrada/descarga da condensadora livres, sem recirculação de ar quente e serpentina limpa', appliesTo: ['hi-wall', 'piso-teto', 'cassete', 'splitao-self', 'vrf-vrv'] },
  { id: 'hidro', etapa: 'Água Gelada', label: 'Central habilitada, válvula/atuador atuando, filtro tipo Y limpo, serpentina purgada e ΔT água conferido', appliesTo: ['fan-coil'] },
  { id: 'vrf', etapa: 'Rede VRF', label: 'Endereçamento, conflito de modo, comunicação e tool de serviço verificados (barramento CC descarregado)', appliesTo: ['vrf-vrv'] },
  { id: 'val', etapa: 'Validação', label: 'Estabilidade térmica na zona ocupada validada em operação normal e medições registradas' },
];
