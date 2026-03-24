import { useRef, useState } from 'react'
import { FileSpreadsheet, CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase/client'

export type UploadType = 'pacientes' | 'procedimentos' | 'pesquisa_procedimentos' | 'faturamento'

interface UploadCardProps {
  title: string
  description?: string
  accept?: string
  uploadType: UploadType
  onSuccess?: () => void
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Keywords that identify a real header row vs a title/metadata row */
const HEADER_KEYWORDS = [
  'Finalização',
  'Finalizacao',
  'Nome do paciente',
  'Código',
  'Codigo',
  'Procedimento',
  'Região',
  'Regiao',
  'Nome do procedimento',
  'Nº matrícula',
  'Marcação',
  'Paciente',
  'Val Cnv',
  'Repasse',
  'Nome',
  'Sexo',
  'Prestador',
  'Telefone',
  'Cadastro',
  'Idade',
  'Face(s)',
  'Face',
]

/**
 * Reads an Excel worksheet robustly, handling sheets that have a title/metadata
 * row at the top before the actual column headers (e.g. "Prestador: Dara...").
 */
function parseSheet(worksheet: XLSX.WorkSheet): any[] {
  const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, {
    header: 1,
    defval: '',
  }) as any[][]

  if (rawRows.length === 0) return []

  // Find the row that contains the most recognized header keywords
  let headerRowIdx = 0
  let maxMatches = 0

  for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
    const matches = (rawRows[i] as any[]).filter(
      (cell: any) =>
        typeof cell === 'string' &&
        HEADER_KEYWORDS.some(
          (kw) => cell.trim() === kw || cell.trim().toLowerCase() === kw.toLowerCase(),
        ),
    ).length
    if (matches > maxMatches) {
      maxMatches = matches
      headerRowIdx = i
    }
  }

  // Build column map: index → column name
  const headerRow = rawRows[headerRowIdx] as any[]
  const colMap: Record<number, string> = {}
  headerRow.forEach((cell: any, idx: number) => {
    const val = String(cell ?? '').trim()
    if (val) colMap[idx] = val
  })

  // Convert data rows to objects, skipping completely empty rows
  return rawRows
    .slice(headerRowIdx + 1)
    .map((row: any[]) => {
      const obj: Record<string, any> = {}
      row.forEach((cell: any, idx: number) => {
        if (colMap[idx]) obj[colMap[idx]] = cell
      })
      return obj
    })
    .filter((obj) => Object.values(obj).some((v) => v !== '' && v !== null && v !== undefined))
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
    const parsed = parseFloat(clean)
    return isNaN(parsed) ? 0 : parsed
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

/**
 * Normalizes a treatment ID for matching between sheets.
 * "003280" and "0003280" both become "3280".
 */
function normTratamento(id: any): string {
  if (!id) return ''
  const s = String(id).trim()
  const n = parseInt(s.replace(/\D/g, ''), 10)
  return isNaN(n) ? s : String(n)
}

// ─── MAPPERS ──────────────────────────────────────────────────────────────────

/**
 * "Produção por procedimento"
 * Has: procedure NAME, patient CODE, treatment ID, and VALUES.
 * No procedure code, no patient name.
 */
const mapProcedimentos = (data: any[]) => {
  return data.map((row) => ({
    tratamento_id: normTratamento(getVal(row, ['Tratamento', 'Tratamento ID'])),
    paciente_codigo: getVal(row, ['Paciente', 'Matricula'])?.toString(),
    data_finalizacao: parseExcelDate(getVal(row, ['Finalização', 'Finalizacao'])),
    // "Procedimento" here is the procedure NAME, not code
    nome_procedimento: getVal(row, [
      'Procedimento',
      'Nome do procedimento',
      'Descrição',
    ])?.toString(),
    regiao: getVal(row, ['Região', 'Regiao'])?.toString(),
    face: getVal(row, ['Face(s)', 'Face', 'Faces'])?.toString(),
    nome_paciente: getVal(row, ['Nome do paciente', 'Nome'])?.toString() || 'Desconhecido',
    valor_convenio: parseNumber(getVal(row, ['Val Cnv', 'Valor Convenio', 'Valor'])),
  }))
}

/**
 * "Pesquisar procedimentos"
 * Has: procedure CODE + NAME, patient NAME, treatment ID.
 * No financial values.
 */
const mapPesquisaProcedimentos = (data: any[]) => {
  return data.map((row) => ({
    tratamento_id: normTratamento(getVal(row, ['Tratamento', 'Tratamento ID'])),
    procedimento_codigo: getVal(row, ['Código', 'Codigo', 'Cod'])?.toString(),
    nome_procedimento: getVal(row, [
      'Nome do procedimento',
      'Nome Procedimento',
      'Descrição',
    ])?.toString(),
    regiao: getVal(row, ['Região', 'Regiao'])?.toString(),
    face: getVal(row, ['Face(s)', 'Face', 'Faces'])?.toString(),
    data_finalizacao: parseExcelDate(getVal(row, ['Finalização', 'Finalizacao'])),
    nome_paciente: getVal(row, ['Nome do paciente', 'Nome'])?.toString() || 'Desconhecido',
    valor_convenio: 0,
  }))
}

/**
 * "Faturamento de convênio" — what the insurance plan actually paid.
 */
const mapFaturamento = (data: any[]) => {
  return data.map((row) => ({
    matricula: getVal(row, ['Nº matrícula', 'Matrícula', 'Matricula', 'N matricula'])?.toString(),
    nome_paciente: getVal(row, ['Nome do paciente', 'Paciente'])?.toString() || 'Desconhecido',
    procedimento_codigo: getVal(row, ['Procedimento'])?.toString(),
    regiao: getVal(row, ['Região', 'Regiao'])?.toString(),
    face: getVal(row, ['Face(s)', 'Face', 'Faces'])?.toString(),
    data_finalizacao: parseExcelDate(getVal(row, ['Finalização', 'Finalizacao'])),
    repasse: parseNumber(getVal(row, ['Repasse'])),
    co_participacao: parseNumber(getVal(row, ['Co-par', 'Co-participação', 'Coparticipacao'])),
  }))
}

/**
 * "Pesquisa geral de pacientes" — full patient reference list.
 */
const mapPacientes = (data: any[]) => {
  return data.map((row) => {
    const idadeRaw = getVal(row, ['Idade', 'idade', 'Idade paciente', 'Idade Paciente'])
    return {
      codigo: getVal(row, ['Código', 'Codigo', 'Cod'])?.toString(),
      nome: getVal(row, ['Nome', 'Paciente', 'Nome do paciente'])?.toString() || 'Desconhecido',
      prestador: getVal(row, ['Prestador'])?.toString(),
      telefone: getVal(row, ['Telefone', 'Celular'])?.toString(),
      sexo: getVal(row, ['Sexo', 'sexo', 'Genero', 'Gênero'])?.toString(),
      idade:
        idadeRaw !== undefined && idadeRaw !== null && idadeRaw !== ''
          ? parseNumber(idadeRaw)
          : null,
      // Column is called "Cadastro" in the patient spreadsheet
      data_cadastro: parseExcelDate(
        getVal(row, ['Cadastro', 'Data Cadastro', 'Data de Cadastro', 'Data cadastro']),
      ),
    }
  })
}

// ─── MERGE LOGIC ──────────────────────────────────────────────────────────────

/**
 * Saves procedure data with merge: when the companion sheet has already been
 * imported, enrich existing records instead of duplicating.
 *
 * "Pesquisar procedimentos" brings: procedure code, procedure name, patient name
 * "Produção por procedimento" brings: patient code, values
 * Both are linked by the "Tratamento" ID (normalized to remove leading zeros).
 */
async function saveProcedimentosComMerge(
  mappedData: any[],
  source: 'pesquisa' | 'producao',
): Promise<{ inserted: number; updated: number }> {
  // Fetch all existing procedure records
  const { data: existentes, error: fetchError } = await supabase
    .from('procedimentos_realizados')
    .select('id, tratamento_id')

  if (fetchError) throw fetchError

  // Build lookup: normalized tratamento_id → DB record id
  const existentesMap = new Map<string, string>()
  existentes?.forEach((r) => {
    const norm = normTratamento(r.tratamento_id)
    if (norm) existentesMap.set(norm, r.id)
  })

  const toInsert: any[] = []
  const toUpdate: Array<{ id: string; fields: Record<string, any> }> = []

  for (const row of mappedData) {
    const norm = normTratamento(row.tratamento_id)
    const existingId = norm ? existentesMap.get(norm) : undefined

    if (existingId) {
      // Record already exists from the companion sheet — enrich it
      if (source === 'pesquisa') {
        // Add procedure code + patient name to what Produção inserted
        toUpdate.push({
          id: existingId,
          fields: {
            procedimento_codigo: row.procedimento_codigo,
            nome_procedimento: row.nome_procedimento,
            nome_paciente: row.nome_paciente,
            regiao: row.regiao,
            face: row.face,
            data_finalizacao: row.data_finalizacao,
          },
        })
      } else {
        // source === 'producao': add value + patient code to what Pesquisar inserted
        toUpdate.push({
          id: existingId,
          fields: {
            valor_convenio: row.valor_convenio,
            paciente_codigo: row.paciente_codigo,
          },
        })
      }
    } else {
      toInsert.push(row)
    }
  }

  // Batch updates (parallel)
  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map(({ id, fields }) =>
        supabase.from('procedimentos_realizados').update(fields).eq('id', id),
      ),
    )
  }

  // Batch insert
  if (toInsert.length > 0) {
    const { error } = await supabase.from('procedimentos_realizados').insert(toInsert)
    if (error) throw error
  }

  return { inserted: toInsert.length, updated: toUpdate.length }
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────────

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

      // Robust parser — handles title rows automatically
      const json = parseSheet(worksheet)

      let totalRecords = json.length
      let toastMsg = `"${file.name}" — ${totalRecords} registro(s) importado(s).`

      if (uploadType === 'procedimentos') {
        const mappedData = mapProcedimentos(json)
        const { inserted, updated } = await saveProcedimentosComMerge(mappedData, 'producao')
        toastMsg = `"${file.name}" — ${inserted} novo(s), ${updated} enriquecido(s).`
      } else if (uploadType === 'pesquisa_procedimentos') {
        const mappedData = mapPesquisaProcedimentos(json)
        const { inserted, updated } = await saveProcedimentosComMerge(mappedData, 'pesquisa')
        toastMsg = `"${file.name}" — ${inserted} novo(s), ${updated} enriquecido(s).`
      } else if (uploadType === 'faturamento') {
        const mappedData = mapFaturamento(json)
        if (mappedData.length > 0) {
          const { error } = await supabase.from('faturamento_plano').insert(mappedData)
          if (error) throw error
        }
      } else if (uploadType === 'pacientes') {
        const mappedData = mapPacientes(json)
        if (mappedData.length > 0) {
          // Upsert: atualiza pacientes existentes (por codigo) e insere novos.
          // Registros sem codigo são sempre inseridos (não têm chave de conflito).
          const comCodigo = mappedData.filter((p) => p.codigo)
          const semCodigo = mappedData.filter((p) => !p.codigo)

          if (comCodigo.length > 0) {
            const { error } = await supabase
              .from('pacientes')
              .upsert(comCodigo, { onConflict: 'codigo', ignoreDuplicates: false })
            if (error) throw error
          }
          if (semCodigo.length > 0) {
            const { error } = await supabase.from('pacientes').insert(semCodigo)
            if (error) throw error
          }
          toastMsg = `"${file.name}" — ${mappedData.length} paciente(s) sincronizado(s).`
        }
      }

      setStatus('success')
      toast({
        title: 'Arquivo carregado com sucesso!',
        description: toastMsg,
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
