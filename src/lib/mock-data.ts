export interface ReconciliationRecord {
  id: string
  plano: string
  paciente: string
  procedimento: string
  regiao: string
  face: string
  dataFinalizacao: string
  valorConvenio: number
}

export const mockReconciliationData: ReconciliationRecord[] = [
  {
    id: 'REC-001',
    plano: 'Bradesco Saúde',
    paciente: 'Ana Clara Albuquerque',
    procedimento: 'Restauração Resina',
    regiao: 'Dente 14',
    face: 'Oclusal',
    dataFinalizacao: '2023-10-15',
    valorConvenio: 155.0,
  },
  {
    id: 'REC-002',
    plano: 'SulAmérica',
    paciente: 'Carlos Eduardo Mendes',
    procedimento: 'Limpeza Profilática',
    regiao: 'Geral',
    face: 'N/A',
    dataFinalizacao: '2023-10-15',
    valorConvenio: 80.0,
  },
  {
    id: 'REC-003',
    plano: 'Unimed',
    paciente: 'Beatriz Souza Campos',
    procedimento: 'Extração Simples',
    regiao: 'Dente 28',
    face: 'N/A',
    dataFinalizacao: '2023-10-16',
    valorConvenio: 210.5,
  },
  {
    id: 'REC-004',
    plano: 'Amil Dental',
    paciente: 'Fernando Henrique Silva',
    procedimento: 'Tratamento de Canal',
    regiao: 'Dente 36',
    face: 'N/A',
    dataFinalizacao: '2023-10-16',
    valorConvenio: 450.0,
  },
  {
    id: 'REC-005',
    plano: 'Bradesco Saúde',
    paciente: 'Marina Luzia Costa',
    procedimento: 'Restauração Resina',
    regiao: 'Dente 21',
    face: 'Vestibular',
    dataFinalizacao: '2023-10-17',
    valorConvenio: 155.0,
  },
  {
    id: 'REC-006',
    plano: 'OdontoPrev',
    paciente: 'Roberto Ferreira',
    procedimento: 'Clareamento Caseiro',
    regiao: 'Arcos',
    face: 'N/A',
    dataFinalizacao: '2023-10-18',
    valorConvenio: 320.0,
  },
  {
    id: 'REC-007',
    plano: 'Unimed',
    paciente: 'Juliana Paes Andrade',
    procedimento: 'Avaliação Inicial',
    regiao: 'Geral',
    face: 'N/A',
    dataFinalizacao: '2023-10-18',
    valorConvenio: 50.0,
  },
  {
    id: 'REC-008',
    plano: 'SulAmérica',
    paciente: 'Vitor Hugo Moreira',
    procedimento: 'Coroa de Porcelana',
    regiao: 'Dente 11',
    face: 'Coroa',
    dataFinalizacao: '2023-10-19',
    valorConvenio: 890.0,
  },
  {
    id: 'REC-009',
    plano: 'Amil Dental',
    paciente: 'Camila Ribeiro',
    procedimento: 'Raspagem Supra',
    regiao: 'Sextante 5',
    face: 'N/A',
    dataFinalizacao: '2023-10-20',
    valorConvenio: 120.0,
  },
  {
    id: 'REC-010',
    plano: 'Bradesco Saúde',
    paciente: 'Thiago Lacerda Pinto',
    procedimento: 'Manutenção Ortodôntica',
    regiao: 'Arcos',
    face: 'N/A',
    dataFinalizacao: '2023-10-20',
    valorConvenio: 180.0,
  },
]

export interface ComparisonRecord {
  id: string
  paciente: string
  procedimento: string
  valor: number
}

export interface ExternalRecord {
  id: string
  paciente: string
  procedimento: string
  repasse: number
}

export const mockInternalData: ComparisonRecord[] = [
  {
    id: 'INT-001',
    paciente: 'Ana Clara Albuquerque',
    procedimento: 'Restauração Resina',
    valor: 155.0,
  },
  {
    id: 'INT-002',
    paciente: 'Carlos Eduardo Mendes',
    procedimento: 'Limpeza Profilática',
    valor: 80.0,
  },
  {
    id: 'INT-003',
    paciente: 'Beatriz Souza Campos',
    procedimento: 'Extração Simples',
    valor: 210.5,
  },
  {
    id: 'INT-004',
    paciente: 'Fernando Henrique Silva',
    procedimento: 'Tratamento de Canal',
    valor: 450.0,
  },
  { id: 'INT-005', paciente: 'Marina Luzia Costa', procedimento: 'Avaliação Inicial', valor: 50.0 },
  {
    id: 'INT-006',
    paciente: 'Roberto Ferreira',
    procedimento: 'Clareamento Caseiro',
    valor: 320.0,
  },
  {
    id: 'INT-007',
    paciente: 'Juliana Paes Andrade',
    procedimento: 'Avaliação Inicial',
    valor: 50.0,
  },
  {
    id: 'INT-008',
    paciente: 'Vitor Hugo Moreira',
    procedimento: 'Coroa de Porcelana',
    valor: 890.0,
  },
]

export const mockExternalData: ExternalRecord[] = [
  {
    id: 'EXT-001',
    paciente: 'Ana Clara Albuquerque',
    procedimento: 'Restauração Resina',
    repasse: 155.0,
  },
  {
    id: 'EXT-002',
    paciente: 'Carlos Eduardo Mendes',
    procedimento: 'Limpeza Profilática',
    repasse: 40.0,
  },
  {
    id: 'EXT-003',
    paciente: 'Beatriz Souza Campos',
    procedimento: 'Extração Simples',
    repasse: 210.5,
  },
  {
    id: 'EXT-004',
    paciente: 'Fernando Henrique Silva',
    procedimento: 'Tratamento de Canal',
    repasse: 350.0,
  },
  {
    id: 'EXT-005',
    paciente: 'Marina Luzia Costa',
    procedimento: 'Avaliação Inicial',
    repasse: 50.0,
  },
  {
    id: 'EXT-006',
    paciente: 'Roberto Ferreira',
    procedimento: 'Clareamento Caseiro',
    repasse: 320.0,
  },
  {
    id: 'EXT-007',
    paciente: 'Juliana Paes Andrade',
    procedimento: 'Avaliação Inicial',
    repasse: 25.0,
  },
  {
    id: 'EXT-008',
    paciente: 'Vitor Hugo Moreira',
    procedimento: 'Coroa de Porcelana',
    repasse: 890.0,
  },
]
