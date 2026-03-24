import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Play, Download, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function ComparisonTab({ refreshKey }: { refreshKey?: number }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  // Dados brutos
  const [rawProcedimentos, setRawProcedimentos] = useState<any[]>([])
  const [rawPacientes, setRawPacientes] = useState<any[]>([])
  const [rawFaturamentos, setRawFaturamentos] = useState<any[]>([])

  // Estado dos filtros e tabelas
  const [prestadores, setPrestadores] = useState<string[]>([])
  const [selectedPrestador, setSelectedPrestador] = useState<string>('all')
  const [fechamento, setFechamento] = useState<any[]>([])
  const [faturamentos, setFaturamentos] = useState<any[]>([])
  const [divergencias, setDivergencias] = useState<any[]>([])

  // Busca inicial dos dados brutos
  useEffect(() => {
    const fetchRawData = async () => {
      setIsGenerating(true)
      try {
        const [procRes, pacRes, fatRes] = await Promise.all([
          supabase.from('procedimentos_realizados').select('*'),
          supabase.from('pacientes').select('*'),
          supabase.from('faturamento_plano').select('*'),
        ])

        const pacs = pacRes.data || []
        setRawProcedimentos(procRes.data || [])
        setRawPacientes(pacs)
        setRawFaturamentos(fatRes.data || [])

        // Extrair prestadores únicos
        const uniquePrestadores = Array.from(
          new Set(pacs.map((p) => p.prestador).filter(Boolean)),
        ).sort()
        setPrestadores(uniquePrestadores as string[])
      } catch (error) {
        console.error('Erro ao buscar dados brutos:', error)
      } finally {
        setIsGenerating(false)
      }
    }

    fetchRawData()

    if (refreshKey && refreshKey > 0) {
      setHasGenerated(false)
      setFechamento([])
      setFaturamentos([])
      setDivergencias([])
      setSelectedPrestador('all')
    }
  }, [refreshKey])

  const processData = (prestadorFilter: string) => {
    // 1. JOIN procedimentos com pacientes para trazer nome correto, prestador e telefone
    const nossoFechamentoBase = rawProcedimentos.map((proc) => {
      const paciente = rawPacientes.find((p) => p.codigo === proc.paciente_codigo)
      return {
        ...proc,
        nome_paciente_exibicao: paciente ? paciente.nome : proc.nome_paciente,
        prestador: paciente?.prestador || 'Não Informado',
        telefone: paciente?.telefone || null,
      }
    })

    // 2. Enriquecer faturamentos deduzindo o prestador com base no matching
    const faturamentosEnriquecidos = rawFaturamentos.map((fat) => {
      const matchProc = nossoFechamentoBase.find(
        (n) =>
          n.nome_paciente === fat.nome_paciente &&
          n.procedimento_codigo === fat.procedimento_codigo &&
          n.data_finalizacao === fat.data_finalizacao,
      )
      return {
        ...fat,
        prestador: matchProc?.prestador || 'Não Informado',
      }
    })

    // 3. Filtrar pelo prestador selecionado
    let nossoFinal = nossoFechamentoBase
    let fatFinal = faturamentosEnriquecidos

    if (prestadorFilter !== 'all') {
      nossoFinal = nossoFechamentoBase.filter((n) => n.prestador === prestadorFilter)
      fatFinal = faturamentosEnriquecidos.filter((f) => f.prestador === prestadorFilter)
    }

    const divs: any[] = []

    // 4. Cruzamento para achar divergências (usando arrays filtrados)
    nossoFinal.forEach((n) => {
      const match = fatFinal.find(
        (f) =>
          f.nome_paciente === n.nome_paciente &&
          f.procedimento_codigo === n.procedimento_codigo &&
          f.data_finalizacao === n.data_finalizacao,
      )

      const valorConvenio = Number(n.valor_convenio || 0)
      const repasse = match ? Number(match.repasse || 0) : 0
      const diferenca = Math.abs(valorConvenio - repasse)

      if (!match || diferenca > 0.01) {
        divs.push({
          id: n.id,
          paciente: n.nome_paciente_exibicao,
          prestador: n.prestador,
          procedimento: n.nome_procedimento || n.procedimento_codigo,
          valor: valorConvenio,
          repasse: repasse,
          diferenca: valorConvenio - repasse,
          highlight: diferenca > 0.01,
        })
      }
    })

    setFechamento(nossoFinal)
    setFaturamentos(fatFinal)
    setDivergencias(divs)
  }

  const handleGerarFechamento = () => {
    processData(selectedPrestador)
    setHasGenerated(true)
  }

  const handlePrestadorChange = (val: string) => {
    setSelectedPrestador(val)
    if (hasGenerated) {
      processData(val)
    }
  }

  const handleExportExcel = () => {
    const nossoData = fechamento.map((r) => ({
      Paciente: r.nome_paciente_exibicao,
      Prestador: r.prestador,
      Procedimento: r.nome_procedimento || r.procedimento_codigo,
      'Valor (R$)': r.valor_convenio,
    }))
    const wsNosso = XLSX.utils.json_to_sheet(nossoData)

    const fatData = faturamentos.map((r) => ({
      Paciente: r.nome_paciente,
      Procedimento: r.procedimento_codigo,
      'Repasse (R$)': r.repasse,
    }))
    const wsFat = XLSX.utils.json_to_sheet(fatData)

    const divData = divergencias.map((r) => ({
      Paciente: r.paciente,
      Prestador: r.prestador,
      Procedimento: r.procedimento,
      'Nosso Valor (R$)': r.valor,
      'Repasse Plano (R$)': r.repasse,
      'Diferença (R$)': r.diferenca,
    }))
    const wsDiv = XLSX.utils.json_to_sheet(divData)

    // Formatação condicional para a coluna de Diferença (Index 5)
    const range = XLSX.utils.decode_range(wsDiv['!ref'] || 'A1:F1')
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = { c: 5, r: R }
      const cellRef = XLSX.utils.encode_cell(cellAddress)
      const cell = wsDiv[cellRef]

      if (cell && typeof cell.v === 'number' && cell.v !== 0) {
        cell.s = {
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'FFFF0000' },
          },
          font: {
            color: { rgb: 'FFFFFFFF' },
            bold: true,
          },
        }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsNosso, 'Nosso Fechamento')
    XLSX.utils.book_append_sheet(wb, wsFat, 'Faturamento do Plano')
    XLSX.utils.book_append_sheet(wb, wsDiv, 'Divergências')

    let filename = 'Fechamento_Conciliacao'
    if (selectedPrestador !== 'all') {
      filename += `_${selectedPrestador.replace(/[^a-zA-Z0-9]/g, '_')}`
    }
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  if (!hasGenerated) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-16 text-center animate-fade-in">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <Play className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">
          Pronto para gerar o fechamento?
        </h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Selecione um prestador abaixo (opcional) e clique no botão para cruzar os procedimentos
          com os repasses automaticamente.
        </p>

        <div className="mb-8 w-full max-w-xs text-left">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Filtrar por Prestador
          </label>
          <Select value={selectedPrestador} onValueChange={setSelectedPrestador}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Todos os Prestadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Prestadores</SelectItem>
              {prestadores.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGerarFechamento} disabled={isGenerating} size="lg" className="w-64">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Carregando dados...
            </>
          ) : (
            <>Gerar Fechamento</>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Resultados da Conciliação
          </h2>
          <div className="flex items-center gap-2 border-slate-200 sm:ml-2 sm:border-l sm:pl-4">
            <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />
            <Select value={selectedPrestador} onValueChange={handlePrestadorChange}>
              <SelectTrigger className="h-9 w-[220px] bg-white">
                <SelectValue placeholder="Todos os Prestadores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Prestadores</SelectItem>
                {prestadores.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            size="sm"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Fechamento (.xlsx)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg tracking-tight text-slate-900">
              Nosso Fechamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                    <TableHead className="font-semibold text-slate-700">Prestador</TableHead>
                    <TableHead className="font-semibold text-slate-700">Procedimento</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fechamento.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum dado encontrado para o filtro atual.
                      </TableCell>
                    </TableRow>
                  )}
                  {fechamento.map((row) => (
                    <TableRow key={row.id} className="transition-colors hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {row.nome_paciente_exibicao}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">{row.prestador}</TableCell>
                      <TableCell className="text-slate-600">
                        {row.nome_procedimento || row.procedimento_codigo}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {formatCurrency(row.valor_convenio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg tracking-tight text-slate-900">
              Faturamento do Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                    <TableHead className="font-semibold text-slate-700">Procedimento</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Repasse
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturamentos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Nenhum dado encontrado para o filtro atual.
                      </TableCell>
                    </TableRow>
                  )}
                  {faturamentos.map((row) => (
                    <TableRow key={row.id} className="transition-colors hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {row.nome_paciente}
                      </TableCell>
                      <TableCell className="text-slate-600">{row.procedimento_codigo}</TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {formatCurrency(row.repasse)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn('shadow-sm', divergencias.length > 0 ? 'border-red-200' : '')}>
        <CardHeader
          className={cn(
            'border-b pb-4',
            divergencias.length > 0 ? 'border-red-100 bg-red-50/50' : '',
          )}
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              className={cn('h-5 w-5', divergencias.length > 0 ? 'text-red-600' : 'text-slate-500')}
            />
            <CardTitle
              className={cn(
                'text-lg tracking-tight',
                divergencias.length > 0 ? 'text-red-900' : 'text-slate-900',
              )}
            >
              Divergências Encontradas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div
            className={cn(
              'overflow-hidden rounded-md border',
              divergencias.length > 0 ? 'border-red-100' : '',
            )}
          >
            <Table>
              <TableHeader className={cn(divergencias.length > 0 ? 'bg-red-50/30' : 'bg-slate-50')}>
                <TableRow
                  className={cn(
                    'hover:bg-transparent',
                    divergencias.length > 0 ? 'border-red-100' : '',
                  )}
                >
                  <TableHead
                    className={cn(
                      'font-semibold',
                      divergencias.length > 0 ? 'text-red-800' : 'text-slate-700',
                    )}
                  >
                    Paciente
                  </TableHead>
                  <TableHead
                    className={cn(
                      'font-semibold',
                      divergencias.length > 0 ? 'text-red-800' : 'text-slate-700',
                    )}
                  >
                    Prestador
                  </TableHead>
                  <TableHead
                    className={cn(
                      'font-semibold',
                      divergencias.length > 0 ? 'text-red-800' : 'text-slate-700',
                    )}
                  >
                    Procedimento
                  </TableHead>
                  <TableHead
                    className={cn(
                      'text-right font-semibold',
                      divergencias.length > 0 ? 'text-red-800' : 'text-slate-700',
                    )}
                  >
                    Nosso Valor
                  </TableHead>
                  <TableHead
                    className={cn(
                      'text-right font-semibold',
                      divergencias.length > 0 ? 'text-red-800' : 'text-slate-700',
                    )}
                  >
                    Repasse Plano
                  </TableHead>
                  <TableHead
                    className={cn(
                      'text-right font-semibold',
                      divergencias.length > 0 ? 'text-red-800' : 'text-slate-700',
                    )}
                  >
                    Diferença
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divergencias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhuma divergência encontrada. Valores compatíveis.
                    </TableCell>
                  </TableRow>
                ) : (
                  divergencias.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        'transition-colors',
                        row.highlight
                          ? 'border-red-100 bg-red-50/60 hover:bg-red-100/60'
                          : 'hover:bg-slate-50/50',
                      )}
                    >
                      <TableCell
                        className={cn(
                          'font-medium',
                          row.highlight ? 'text-red-900' : 'text-slate-900',
                        )}
                      >
                        {row.paciente}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-xs',
                          row.highlight ? 'text-red-800/80' : 'text-slate-500',
                        )}
                      >
                        {row.prestador}
                      </TableCell>
                      <TableCell className={cn(row.highlight ? 'text-red-800' : 'text-slate-600')}>
                        {row.procedimento}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          row.highlight ? 'text-red-900' : 'text-slate-900',
                        )}
                      >
                        {formatCurrency(row.valor)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right',
                          row.highlight ? 'text-red-900' : 'text-slate-900',
                        )}
                      >
                        {formatCurrency(row.repasse)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-semibold',
                          row.highlight ? 'text-red-700' : 'text-slate-900',
                        )}
                      >
                        {formatCurrency(row.diferenca)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
