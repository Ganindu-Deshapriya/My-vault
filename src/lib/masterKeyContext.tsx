'use client'

import React, { createContext, useContext, useCallback, useRef, useState } from 'react'

interface MasterKeyContextValue {
  masterPassword: string | null
  isUnlocked: boolean
  unlock: (password: string) => void
  lock: () => void
}

const MasterKeyContext = createContext<MasterKeyContextValue>({
  masterPassword: null,
  isUnlocked: false,
  unlock: () => {},
  lock: () => {},
})

export function MasterKeyProvider({ children }: { children: React.ReactNode }) {
  // Store in a ref so it's not exposed via React DevTools as easily
  const passwordRef = useRef<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)

  const unlock = useCallback((password: string) => {
    passwordRef.current = password
    setIsUnlocked(true)
  }, [])

  const lock = useCallback(() => {
    passwordRef.current = null
    setIsUnlocked(false)
  }, [])

  const value: MasterKeyContextValue = {
    get masterPassword() {
      return passwordRef.current
    },
    isUnlocked,
    unlock,
    lock,
  }

  return <MasterKeyContext.Provider value={value}>{children}</MasterKeyContext.Provider>
}

export function useMasterKey() {
  return useContext(MasterKeyContext)
}
