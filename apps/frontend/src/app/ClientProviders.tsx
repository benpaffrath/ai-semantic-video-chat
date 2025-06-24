'use client'

import { ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai'

interface ClientProvidersProps {
    children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
    return <JotaiProvider>{children}</JotaiProvider>
}
