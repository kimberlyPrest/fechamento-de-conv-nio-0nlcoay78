import { useRef, useState } from 'react'
import { FileSpreadsheet, CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface UploadCardProps {
  title: string
  description?: string
  accept?: string
}

export function UploadCard({
  title,
  description = 'Arraste ou clique para enviar',
  accept = '.xlsx, .xls',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStatus('uploading')

    // Simulate upload delay
    setTimeout(() => {
      setStatus('success')
      toast({
        title: 'Arquivo carregado com sucesso!',
        description: `O arquivo "${file.name}" foi processado.`,
        className: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      })
    }, 1500)
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
