"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWebApp } from "@/hooks/use-web-app"
import UserInterface from "@/components/user-interface"
import LoginScreen from "@/components/login-screen"
import type { UserData } from "@/lib/types"
import PWAInstallPrompt from "@/components/pwa-install-prompt"

export default function TicTacToeBet() {
  const { isTelegramAvailable } = useWebApp()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Проверяем активную сессию при загрузке
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "GET",
          credentials: "include"
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUserData(userData)
        }
      } catch (error) {
        console.error("Failed to check session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleUserLogin = (newUserData: UserData) => {
    setUserData(newUserData)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "DELETE",
        credentials: "include"
      })
    } catch (error) {
      console.error("Failed to logout:", error)
    }
    
    setUserData(null)
    router.push("/") // Redirect to home on logout
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-800">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {!userData ? (
        <LoginScreen onLogin={handleUserLogin} telegramAuthAvailable={isTelegramAvailable} />
      ) : (
        <UserInterface
          userData={userData}
          setUserData={setUserData}
          onLogout={handleLogout}
          onAdminRequest={() => {}}
        />
      )}
      <PWAInstallPrompt />
    </>
  )
}
