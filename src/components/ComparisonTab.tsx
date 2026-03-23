import { useMemo } from 'react'
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
import { mockInternalData, mockExternalData } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/formatters'

export function ComparisonTab() {
  const discrepancies = useMemo(() => {
    return mockInternalData
      .map((internal) => {
        const external = mockExternalData.find(
          (e) => e.paciente === internal.paciente && e.procedimento === internal.procedimento,
        )
        const repasse = external?.repasse ?? 0
        return {
          id: internal.id,
          paciente: internal.paciente,
          procedimento: internal.procedimento,
          valor: internal.valor,
          repasse,
          diferenca: internal.valor - repasse,
          hasDiscrepancy: !external || internal.valor !== repasse,
        }
      })
      .filter((item) => item.hasDiscrepancy)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Table: Nosso Fechamento */}
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
                  {mockInternalData.map((row) => (
                    <TableRow key={row.id} className="transition-colors">
                      <TableCell className="font-medium text-slate-900">{row.paciente}</TableCell>
                      <TableCell className="text-slate-600">{row.procedimento}</TableCell>
                      <TableCell className="text-right text-slate-900">
                        {formatCurrency(row.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Table: Faturamento do Plano */}
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
                  {mockExternalData.map((row) => (
                    <TableRow key={row.id} className="transition-colors">
                      <TableCell className="font-medium text-slate-900">{row.paciente}</TableCell>
                      <TableCell className="text-slate-600">{row.procedimento}</TableCell>
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

      {/* Divergências Table */}
      <Card className="border-red-100 shadow-sm">
        <CardHeader className="border-b border-red-100 bg-red-50/50 pb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg tracking-tight text-red-900">Divergências</CardTitle>
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
                      Nenhuma divergência encontrada.
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
