'use client'
import { useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { makeStore, type AppStore } from '../lib/store'

export default function StoreProvider({
  children
}: {
  children: ReactNode
}) {
  // Create the store instance the first time this renders
  const [store] = useState<AppStore>(makeStore)

  return <Provider store={store}>{children}</Provider>
}