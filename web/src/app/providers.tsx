'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { optimismSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const config = getDefaultConfig({
    appName: 'Radish',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get one at https://cloud.walletconnect.com
    chains: [optimismSepolia],
    transports: {
        [optimismSepolia.id]: http()
    }
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
} 