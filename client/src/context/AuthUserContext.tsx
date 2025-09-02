'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toAuthUser, type AuthUser, type UserRole } from '@/types'
import type { User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";
interface AuthContextType {
  user: AuthUser | null
  authUser: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, metadata?: any) => Promise<User>
  signInWithGoogle: (redirectTo?: string) => Promise<void>
}

export const AuthUserContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
  login: async () => { throw new Error('AuthContext not initialized') },
  register: async () => { throw new Error('AuthContext not initialized') },
  signInWithGoogle: async () => {},
})

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter();
  
  const updateAuthState = useCallback((session: any) => {
    console.log('🔐 Updating auth state with session:', !!session)
    
    const user = session?.user ? toAuthUser(session.user) : null
    const token = session?.access_token ?? null
    
    console.log('🔐 Converted user:', user ? { id: user.id, email: user.email, role: user.role } : null)
    
    setAuthUser(user)
    setAccessToken(token)
    setLoading(false)
    
    return { user, token }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      console.log('🔐 Refreshing session...')
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (!error && session) {
        updateAuthState(session)
      } else if (error) {
        console.error('Session refresh error:', error)
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
    }
  }, [updateAuthState])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    console.log('🔐 Starting login for:', email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('🔐 Login error:', error.message)
        throw error
      }

      if (!data.user) {
        throw new Error('Login successful but no user data received')
      }

      console.log('🔐 Login successful:', data.user.id)
      
      // Update auth state immediately
      if (data.session) {
        updateAuthState(data.session)
      }

      return data.user
    } catch (error) {
      console.error('🔐 Login failed:', error)
      throw error
    }
  }, [updateAuthState])

  const register = useCallback(async (
    email: string, 
    password: string, 
    metadata?: any
  ): Promise<User> => {
    console.log('🔐 Starting registration for:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('🔐 Registration error:', error.message)
        throw error
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned')
      }

      console.log('🔐 Registration successful:', data.user.id)
      
      // Update auth state if session is available (auto-confirmed users)
      if (data.session) {
        updateAuthState(data.session)
      }

      return data.user
    } catch (error) {
      console.error('🔐 Registration failed:', error)
      throw error
    }
  }, [updateAuthState])

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    try {
      console.log('🔐 Starting Google sign in...')
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('🔐 Google sign in error:', error)
        throw error
      }
    } catch (error) {
      console.error('🔐 Google sign in failed:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('🔐 Starting logout...')
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🔐 Logout error:', error)
        throw error
      }

      // Clear local storage
      localStorage.removeItem('sb-access-token')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('user_') || key.startsWith('jobs_')) {
          localStorage.removeItem(key)
        }
      })

      console.log('🔐 Logout successful')
    } catch (error) {
      console.error('🔐 Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Alias for logout to maintain compatibility
  const signOut = logout

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            console.error('🔐 Session error:', error)
            setAuthUser(null)
            setAccessToken(null)
          } else {
            console.log('🔐 Initial session found:', !!session)
            updateAuthState(session)
          }
          setInitialized(true)
          setLoading(false)
        }
      } catch (error) {
        console.error('🔐 Auth initialization error:', error)
        if (mounted) {
          setAuthUser(null)
          setAccessToken(null)
          setInitialized(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()

   const subscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔐 Auth state changed:', event)
        
        switch (event) {
          case 'SIGNED_IN':
            console.log('🔐 User signed in')
            updateAuthState(session)
            break
          case 'SIGNED_OUT':
            console.log('🔐 User signed out')
            setAuthUser(null)
            setAccessToken(null)
            setLoading(false)
            break
          case 'TOKEN_REFRESHED':
            console.log('🔐 Token refreshed')
            updateAuthState(session)
            break
          default:
            updateAuthState(session)
        }
      }
    )

    return () => {
      mounted = false
      subscription.data.subscription.unsubscribe()
    }
  }, [updateAuthState])

  const isAuthenticated = !!authUser && !!accessToken
  const isAdmin = authUser?.role === 'admin'

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthUserContext.Provider
      value={{
        user: authUser, // Main user property
        authUser, // Legacy compatibility
        accessToken,
        isAuthenticated,
        isAdmin,
        loading,
        signOut,
        logout,
        refreshSession,
        login,
        register,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthUserContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthUserContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthUserProvider')
  }
  return context
}
