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
