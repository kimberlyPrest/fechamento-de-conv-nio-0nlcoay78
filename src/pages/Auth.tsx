import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Activity, Loader2 } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const action = isLogin ? signIn : signUp
    const { error } = await action(email, password)

    if (error) {
      if (
        !isLogin &&
        (error.message.includes('signups are disabled') || error.message.includes('disabled'))
      ) {
        toast({
          title: 'Cadastro indisponível',
          description:
            'A criação de novas contas está desativada no momento. Seu usuário já foi provisionado pela equipe, por favor, faça o Login.',
          variant: 'destructive',
        })
        setIsLogin(true)
      } else if (
        isLogin &&
        (error.message.includes('logins are disabled') || error.message.includes('disabled'))
      ) {
        toast({
          title: 'Login indisponível',
          description:
            'O login por e-mail e senha está temporariamente desativado no servidor. Por favor, aguarde a equipe técnica habilitá-lo.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro de Autenticação',
          description: error.message,
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!',
        description: isLogin ? 'Bem-vindo de volta.' : 'Você já pode acessar o sistema.',
        className: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <Activity className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {isLogin
              ? 'Insira suas credenciais para acessar o sistema'
              : 'Preencha os dados abaixo para se cadastrar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50/50"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Fazer login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
