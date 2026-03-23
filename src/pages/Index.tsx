import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadCard } from '@/components/UploadCard'
import { ComparisonTab } from '@/components/ComparisonTab'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [procedimentos, setProcedimentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('procedimentos_realizados')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) setProcedimentos(data)
        setLoading(false)
      })
  }, [])

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase()
    if (!term) return procedimentos

    return procedimentos.filter(
      (record) =>
        record.nome_paciente?.toLowerCase().includes(term) ||
        record.nome_procedimento?.toLowerCase().includes(term) ||
        record.plano?.toLowerCase().includes(term),
    )
  }, [searchTerm, procedimentos])

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Conciliação de Faturamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Importe as planilhas para comparar os dados de produção com os pagamentos dos convênios.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100/80 p-1">
          <TabsTrigger value="overview" className="rounded-sm">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="comparison" className="rounded-sm">
            Comparação de Fechamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-fade-in">
          {/* Uploads Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <UploadCard title="Pesquisa de Pacientes" description="Planilha do sistema (.xlsx)" />
            <UploadCard
              title="Produção por Procedimento"
              description="Relatório de execução (.xlsx)"
            />
            <UploadCard title="Faturamento do Convênio" description="Extrato do portal (.xlsx)" />
          </div>

          {/* Data Table Section */}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Registros Processados
                </h2>
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? 'Carregando registros...'
                    : `${filteredData.length} procedimento(s) encontrado(s).`}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar paciente ou procedimento..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px] font-semibold text-slate-700">Plano</TableHead>
                    <TableHead className="min-w-[200px] font-semibold text-slate-700">
                      Nome do Paciente
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Procedimento</TableHead>
                    <TableHead className="font-semibold text-slate-700">Região</TableHead>
                    <TableHead className="font-semibold text-slate-700">Face</TableHead>
                    <TableHead className="font-semibold text-slate-700">Data Finalização</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Valor Convênio
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((record) => (
                      <TableRow key={record.id} className="group cursor-default transition-colors">
                        <TableCell>
                          <Badge variant="outline" className="font-medium bg-white">
                            {record.plano || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {record.nome_paciente || '-'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {record.nome_procedimento || record.procedimento_codigo}
                        </TableCell>
                        <TableCell className="text-slate-600">{record.regiao || '-'}</TableCell>
                        <TableCell className="text-slate-600">{record.face || '-'}</TableCell>
                        <TableCell className="text-slate-600">
                          {formatDate(record.data_finalizacao)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900">
                          {formatCurrency(record.valor_convenio)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="animate-fade-in">
          <ComparisonTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Index
