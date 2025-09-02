// client/src/app/login/page.tsx
'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthUserContext'
import AuthForm from "@/components/AuthForm"
import type { AuthUser } from "@/types"

export default function LoginPage() {
  const router = useRouter()
  const { authUser, isAuthenticated, isAdmin, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login")

  // Redirect authenticated users
  useEffect(() => {
    if (loading) return

    if (isAuthenticated && authUser) {
      const targetPath = isAdmin ? '/admin/dashboard' : '/dashboard'
      router.push(targetPath)
    }
  }, [isAuthenticated, isAdmin, authUser, loading, router])

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Prevent rendering if already authenticated
  if (isAuthenticated) {
    return null
  }

  const handleSuccess = (user?: AuthUser) => {
    if (user) {
      console.log("Login successful:", user.email)
      // Redirect handled by useEffect
    }
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page as "login" | "register")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm
        mode={currentPage}
        onSuccessAction={handleSuccess}
        // setCurrentPageAction={handlePageChange}
      />
    </div>
  )
}
