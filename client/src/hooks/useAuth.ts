'use client'
import { useContext } from 'react'
import { AuthUserContext } from '@/context/AuthUserContext'

export const useAuth = () => {
  const context = useContext(AuthUserContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthUserProvider')
  }
  
  return context
}