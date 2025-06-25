'use client'

import { ReactNode } from 'react'
import { Provider as JotaiProvider } from 'jotai'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/graphql/client'

interface ClientProvidersProps {
    children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
    return (
        <ApolloProvider client={client}>
            <JotaiProvider>{children}</JotaiProvider>
        </ApolloProvider>
    )
}
