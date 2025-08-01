"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/admin/admin-dashboard"
import { getSupabaseClient } from "@/lib/supabase"

export default function AdminPage() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchUserData() {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }
      const { data: user, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()
      if (error || !user || !user.is_admin) {
        router.push("/login")
        return
      }
      
      // Устанавливаем cookie для админской сессии
      document.cookie = `admin_session_token=${user.id}; path=/; max-age=86400; secure; samesite=strict`
      
      setUserData({
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin,
        balance: user.balance,
        avatar: user.avatar,
        gamesPlayed: user.games_played,
        gamesWon: user.games_won,
        walletAddress: user.wallet_address,
        status: user.status,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      })
      setIsLoading(false)
    }
    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    
    // Удаляем админскую сессию
    document.cookie = "admin_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Загрузка админ-панели...</h2>
          <p className="text-gray-500">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  return userData ? <AdminDashboard userData={userData} onLogout={handleLogout} /> : null
}
