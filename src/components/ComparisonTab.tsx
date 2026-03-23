import { useMemo, useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { supabase } from '@/lib/supabase/client'

export function ComparisonTab({ refreshKey }: { refreshKey?: number }) {
  const [procedimentos, setProcedimentos] = useState<any[]>([])
  const [faturamentos, setFaturamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      supabase.from('procedimentos_realizados').select('*'),
      supabase.from('faturamento_plano').select('*'),
    ]).then(([procRes, fatRes]) => {
      if (procRes.data) setProcedimentos(procRes.data)
      if (fatRes.data) setFaturamentos(fatRes.data)
      setLoading(false)
    })
  }, [refreshKey])

  const discrepancies = useMemo(() => {
    return procedimentos
      .map((internal) => {
        const external = faturamentos.find(
          (e) =>
            e.nome_paciente === internal.nome_paciente &&
            (e.procedimento_codigo === internal.procedimento_codigo ||
              e.procedimento_codigo === internal.nome_procedimento),
        )
        const repasse = external?.repasse ?? 0
        const valor = Number(internal.valor_convenio ?? 0)
        const dif = valor - Number(repasse)

        return {
          id: internal.id,
          paciente: internal.nome_paciente,
          procedimento: internal.nome_procedimento || internal.procedimento_codigo,
          valor: valor,
          repasse: Number(repasse),
          diferenca: dif,
          hasDiscrepancy: !external || valor !== Number(repasse),
        }
      })
      .filter((item) => item.hasDiscrepancy)
  }, [procedimentos, faturamentos])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200">
        <p className="text-sm text-slate-500 animate-pulse">Carregando dados para comparação...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
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
                  {procedimentos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        Nenhum dado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {procedimentos.map((row) => (
                    <TableRow key={row.id} className="transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {row.nome_paciente}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {row.nome_procedimento || row.procedimento_codigo}
                      </TableCell>
                      <TableCell className="text-right text-slate-900">
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
                      <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                        Nenhum dado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {faturamentos.map((row) => (
                    <TableRow key={row.id} className="transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {row.nome_paciente}
                      </TableCell>
                      <TableCell className="text-slate-600">{row.procedimento_codigo}</TableCell>
                      <TableCell className="text-right text-slate-900">
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

      <Card className="border-red-100 shadow-sm">
        <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg tracking-tight text-red-900">
              Divergências Encontradas
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-red-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-red-50/30">
                <TableRow className="hover:bg-transparent border-red-100">
                  <TableHead className="font-semibold text-red-800">Paciente</TableHead>
                  <TableHead className="font-semibold text-red-800">Procedimento</TableHead>
                  <TableHead className="text-right font-semibold text-red-800">
                    Nosso Valor
                  </TableHead>
                  <TableHead className="text-right font-semibold text-red-800">
                    Repasse Plano
                  </TableHead>
                  <TableHead className="text-right font-semibold text-red-800">Diferença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discrepancies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhuma divergência encontrada. Valores compatíveis.
                    </TableCell>
                  </TableRow>
                ) : (
                  discrepancies.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-red-100/50 bg-red-50/40 transition-colors hover:bg-red-100/50"
                    >
                      <TableCell className="font-medium text-red-900">{row.paciente}</TableCell>
                      <TableCell className="text-red-800">{row.procedimento}</TableCell>
                      <TableCell className="text-right text-red-900">
                        {formatCurrency(row.valor)}
                      </TableCell>
                      <TableCell className="text-right text-red-900">
                        {formatCurrency(row.repasse)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-700">
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
