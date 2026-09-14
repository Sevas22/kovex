"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useStore } from "@/lib/store"

export function AdminLogin() {
  const { login } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const ok = login(email, password)
    if (!ok) {
      toast.error("Credenciales incorrectas", {
        description: "Verifica tu correo y contraseña.",
      })
      setLoading(false)
    } else {
      toast.success("Bienvenido de nuevo")
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="light" className="h-9" />
        </div>
        <div className="rounded-xl border border-sidebar-border bg-brand-navy-800 p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-white">Panel administrativo</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ingresa para gestionar el catálogo de productos.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <Label htmlFor="email" className="text-slate-300">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kovex.com"
                className="mt-1 border-sidebar-border bg-brand-navy text-white placeholder:text-slate-500"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 border-sidebar-border bg-brand-navy text-white placeholder:text-slate-500"
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-brand-blue text-white hover:bg-brand-blue-600"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <div className="mt-5 rounded-lg border border-sidebar-border bg-brand-navy/50 p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Demo</p>
            <p>Correo: admin@kovex.com</p>
            <p>Contraseña: kovex2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
