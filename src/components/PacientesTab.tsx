import { useState, useEffect } from 'react'
import { Search, UserCircle, Phone, Calendar, Stethoscope } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/formatters'

export function PacientesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPacientes = async () => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        setPacientes([])
        return
      }

      setLoading(true)
      const term = searchTerm.trim()

      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .or(`codigo.ilike.%${term}%,nome.ilike.%${term}%`)
        .order('nome', { ascending: true })
        .limit(20)

      if (data && !error) {
        setPacientes(data)
      }
      setLoading(false)
    }

    const timer = setTimeout(() => {
      fetchPacientes()
    }, 400)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Busca de Pacientes</h2>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por código ou nome do paciente..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Buscando pacientes...
          </div>
        ) : searchTerm.trim().length > 0 && searchTerm.trim().length < 2 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Digite pelo menos 2 caracteres para buscar.
          </div>
        ) : pacientes.length === 0 && searchTerm.trim().length >= 2 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhum paciente encontrado para "{searchTerm}".
          </div>
        ) : (
          pacientes.map((paciente) => (
            <Card key={paciente.id} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardHeader className="border-b bg-slate-50/50 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <UserCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{paciente.nome}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {paciente.codigo || 'Sem código'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <UserCircle className="h-3.5 w-3.5" /> Idade / Sexo
                    </span>
                    <span className="font-medium text-slate-900">
                      {paciente.idade ? `${paciente.idade} anos` : '-'}
                      {paciente.idade && paciente.sexo ? ' • ' : ''}
                      {paciente.sexo || ''}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> Telefone
                    </span>
                    <span className="font-medium text-slate-900">{paciente.telefone || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" /> Prestador
                    </span>
                    <span className="font-medium text-slate-900">{paciente.prestador || '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> Cadastro
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatDate(paciente.data_cadastro)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
