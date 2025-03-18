"use client"

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/db'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Set up auth subscription
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

// Helper function to use in server components
export async function getServerUser() {
  const { data: { session } } = await supabaseClient.auth.getSession()
  return session?.user || null
} 