"use client"

import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { useStore } from "@/lib/store"

export default function AdminPage() {
  const { isAuthenticated } = useStore()
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />
}
