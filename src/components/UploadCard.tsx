import { useRef, useState } from 'react'
import { FileSpreadsheet, CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase/client'

export type UploadType = 'pacientes' | 'procedimentos' | 'faturamento'

interface UploadCardProps {
  title: string
  description?: string
  accept?: string
  uploadType: UploadType
  onSuccess?: () => void
}

function parseExcelDate(excelDate: any) {
  if (!excelDate) return null
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000))
    return date.toISOString().split('T')[0]
  }
  if (typeof excelDate === 'string') {
    if (excelDate.includes('/')) {
      const parts = excelDate.split('/')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }
    if (excelDate.includes('-')) {
      return excelDate.split('T')[0]
    }
  }
  return null
}

function parseNumber(val: any) {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    let clean = val.replace(/[R$\s]/g, '')
    if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.')
    }
    return parseFloat(clean) || 0
  }
  return 0
}

const getVal = (row: any, keys: string[]) => {
  const rowKeys = Object.keys(row)
  for (const k of rowKeys) {
    if (keys.includes(k.trim())) {
      return row[k]
    }
  }
  return undefined
}

const mapProcedimentos = (data: any[]) => {
  return data.map((row) => ({
    paciente_codigo: getVal(row, [
      'Código',
      'Cod',
      'Matricula',
      'Paciente Codigo',
      'Codigo Paciente',
    ])?.toString(),
    data_finalizacao: parseExcelDate(getVal(row, ['Finalização', 'Finalizacao'])),
    procedimento_codigo: getVal(row, ['Procedimento', 'Codigo Procedimento'])?.toString(),
    nome_procedimento: getVal(row, ['Nome Procedimento', 'Descrição'])?.toString(),
    regiao: getVal(row, ['Região', 'Regiao'])?.toString(),
    face: getVal(row, ['Face'])?.toString(),
    nome_paciente: getVal(row, ['Paciente', 'Nome do paciente'])?.toString() || 'Desconhecido',
    valor_convenio: parseNumber(getVal(row, ['Val Cnv', 'Valor Convenio', 'Valor'])),
  }))
}

const mapFaturamento = (data: any[]) => {
  return data.map((row) => ({
    matricula: getVal(row, ['Nº matrícula', 'Matrícula', 'Matricula', 'N matricula'])?.toString(),
    nome_paciente: getVal(row, ['Nome do paciente', 'Paciente'])?.toString() || 'Desconhecido',
    procedimento_codigo: getVal(row, ['Procedimento'])?.toString(),
    regiao: getVal(row, ['Região', 'Regiao'])?.toString(),
    face: getVal(row, ['Face'])?.toString(),
    data_finalizacao: parseExcelDate(getVal(row, ['Finalização', 'Finalizacao'])),
    repasse: parseNumber(getVal(row, ['Repasse'])),
    co_participacao: parseNumber(getVal(row, ['Co-par', 'Co-participação', 'Coparticipacao'])),
  }))
}

const mapPacientes = (data: any[]) => {
  return data.map((row) => ({
    codigo: getVal(row, ['Código', 'Codigo', 'Cod'])?.toString(),
    nome: getVal(row, ['Nome', 'Paciente', 'Nome do paciente'])?.toString() || 'Desconhecido',
    prestador: getVal(row, ['Prestador'])?.toString(),
    telefone: getVal(row, ['Telefone', 'Celular'])?.toString(),
  }))
}

export function UploadCard({
  title,
  description = 'Arraste ou clique para enviar',
  accept = '.xlsx, .xls',
  uploadType,
  onSuccess,
}: UploadCardProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleCardClick = () => {
    if (status !== 'uploading') {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('uploading')

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const json = XLSX.utils.sheet_to_json(worksheet)

      let mappedData: any[] = []
      let tableName = ''

      if (uploadType === 'procedimentos') {
        mappedData = mapProcedimentos(json)
        tableName = 'procedimentos_realizados'
      } else if (uploadType === 'faturamento') {
        mappedData = mapFaturamento(json)
        tableName = 'faturamento_plano'
      } else if (uploadType === 'pacientes') {
        mappedData = mapPacientes(json)
        tableName = 'pacientes'
      }

      if (mappedData.length > 0) {
        const { error } = await supabase.from(tableName).insert(mappedData)
        if (error) throw error
      }

      setStatus('success')
      toast({
        title: 'Arquivo carregado com sucesso!',
        description: `O arquivo "${file.name}" foi processado.`,
        className: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      })
      onSuccess?.()
    } catch (error: any) {
      console.error(error)
      setStatus('idle')
      toast({
        title: 'Erro ao processar',
        description: error.message || 'Verifique se o arquivo está no formato correto.',
        variant: 'destructive',
      })
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 hover:bg-muted/50',
        {
          'border-border hover:border-primary/50': status === 'idle',
          'border-primary bg-primary/5': status === 'uploading',
          'border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50/80': status === 'success',
        },
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm group-hover:scale-105 transition-transform">
        {status === 'idle' && <FileSpreadsheet className="h-6 w-6 text-primary" />}
        {status === 'uploading' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        {status === 'success' && <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
      </div>

      <h3
        className={cn('text-sm font-semibold tracking-tight', {
          'text-emerald-700': status === 'success',
          'text-foreground': status !== 'success',
        })}
      >
        {title}
      </h3>

      <p className="mt-1 text-xs text-muted-foreground">
        {status === 'success' && fileName ? fileName : description}
      </p>

      {status === 'idle' && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <UploadCloud className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </Card>
  )
}
