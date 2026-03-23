import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Settings, CircleUser, Activity } from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Relatórios', href: '#', icon: FileText },
  { name: 'Configurações', href: '#', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r-0 bg-slate-900 text-slate-50">
        <SidebarHeader className="flex h-16 items-center border-b border-slate-800 px-4 pt-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg tracking-tight">HealthSync</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 pt-4">
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={
                      isActive
                        ? 'bg-slate-800 text-white hover:bg-slate-800 hover:text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-slate-50">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-white/80 px-4 py-2 backdrop-blur-lg transition-all md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2 md:hidden" />
            <div className="hidden flex-col md:flex">
              <h1 className="text-sm font-semibold leading-none tracking-tight text-slate-900">
                Fechamento de Convênio
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Portal Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5 text-slate-600" />
              <span className="sr-only">Perfil do Usuário</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
