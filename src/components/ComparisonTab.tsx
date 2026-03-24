import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Play } from 'lucide-react'
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
import { formatCurrency } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function ComparisonTab({ refreshKey }: { refreshKey?: number }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [fechamento, setFechamento] = useState<any[]>([])
  const [faturamentos, setFaturamentos] = useState<any[]>([])
  const [divergencias, setDivergencias] = useState<any[]>([])

  // Reseta o estado se um novo arquivo for enviado
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      setHasGenerated(false)
      setFechamento([])
      setFaturamentos([])
      setDivergencias([])
    }
  }, [refreshKey])

  const handleGerarFechamento = async () => {
    setIsGenerating(true)
    try {
      const [procRes, pacRes, fatRes] = await Promise.all([
        supabase.from('procedimentos_realizados').select('*'),
        supabase.from('pacientes').select('*'),
        supabase.from('faturamento_plano').select('*'),
      ])

      const procedimentosData = procRes.data || []
      const pacientesData = pacRes.data || []
      const faturamentosData = fatRes.data || []

      // JOIN procedimentos_realizados e pacientes pelo código do paciente
      const nossoFechamento = procedimentosData.map((proc) => {
        const paciente = pacientesData.find((p) => p.codigo === proc.paciente_codigo)
        return {
          ...proc,
          // Mantém o nome original se não encontrar correspondência no JOIN
          nome_paciente_exibicao: paciente ? paciente.nome : proc.nome_paciente,
        }
      })

      const divs: any[] = []

      // Cruza com faturamento_plano
      nossoFechamento.forEach((n) => {
        // Regra: nome do paciente + procedimento_codigo + data
        const match = faturamentosData.find(
          (f) =>
            f.nome_paciente === n.nome_paciente &&
            f.procedimento_codigo === n.procedimento_codigo &&
            f.data_finalizacao === n.data_finalizacao,
        )

        const valorConvenio = Number(n.valor_convenio || 0)
        const repasse = match ? Number(match.repasse || 0) : 0
        const diferenca = Math.abs(valorConvenio - repasse)

        // Verifica discrepância > R$ 0,01
        if (!match || diferenca > 0.01) {
          divs.push({
            id: n.id,
            paciente: n.nome_paciente_exibicao,
            procedimento: n.nome_procedimento || n.procedimento_codigo,
            valor: valorConvenio,
            repasse: repasse,
            diferenca: valorConvenio - repasse,
            highlight: diferenca > 0.01,
          })
        }
      })

      setFechamento(nossoFechamento)
      setFaturamentos(faturamentosData)
      setDivergencias(divs)
      setHasGenerated(true)
    } catch (error) {
      console.error('Erro ao gerar fechamento:', error)
    } finally {
      setIsGenerating(false)
    }
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
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          Clique no botão abaixo para processar os dados enviados. O sistema fará o cruzamento dos
          procedimentos realizados com os repasses do convênio automaticamente.
        </p>
        <Button onClick={handleGerarFechamento} disabled={isGenerating} size="lg" className="w-64">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processando dados...
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Resultados da Conciliação
        </h2>
        <Button onClick={handleGerarFechamento} disabled={isGenerating} variant="outline" size="sm">
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Regerar Fechamento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg tracking-tight text-slate-900">
              Nosso Fechamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-700">Paciente</TableHead>
                    <TableHead className="font-semibold text-slate-700">Procedimento</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fechamento.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Nenhum dado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {fechamento.map((row) => (
                    <TableRow key={row.id} className="transition-colors hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {row.nome_paciente_exibicao}
                      </TableCell>
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
            <div className="rounded-md border overflow-hidden">
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
                        Nenhum dado encontrado.
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
              'rounded-md border overflow-hidden',
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
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
