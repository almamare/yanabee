// components/ApolloProvider.tsx
'use client';

import React, { ReactNode } from 'react';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/client';
import createApolloClient from '@/lib/apollo-client'; // Adjust the import path based on your project structure

interface ApolloProviderProps {
    children: ReactNode;
}


export default function ApolloProvider({ children }: ApolloProviderProps) {
    const client = createApolloClient(); 

    return <ApolloHooksProvider client={client}>{children}</ApolloHooksProvider>;
}
