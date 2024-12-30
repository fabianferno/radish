'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { optimismSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const neoXTestnet = {
    id: 12227332,
    name: "NeoX T4",
    network: "neoxt4",
    nativeCurrency: {
        decimals: 18,
        name: "GAS",
        symbol: "GAS",
    },
    rpcUrls: {
        default: {
            http: ["https://neoxt4seed1.ngd.network/"],
            webSocket: ["wss://neoxt4wss1.ngd.network"],
        },
        public: {
            http: ["https://neoxt4seed1.ngd.network/"],
            webSocket: ["wss://neoxt4wss1.ngd.network"],
        },
    },
    blockExplorers: {
        default: { name: "NeoX T4 Explorer", url: "https://xt4scan.ngd.network/" },
    },
} as const;

const neoXMainnet = {
    id: 47763,
    name: "NeoX Mainnet",
    network: "neox",
    nativeCurrency: {
        decimals: 18,
        name: "GAS",
        symbol: "GAS",
    },
    rpcUrls: {
        default: {
            http: ["https://mainnet-1.rpc.banelabs.org"],
            webSocket: ["wss://mainnet.wss1.banelabs.org/"],
        },
        public: {
            http: ["https://mainnet-1.rpc.banelabs.org"],
            webSocket: ["wss://mainnet.wss1.banelabs.org/"],
        },
    },
    blockExplorers: {
        default: { name: "NeoX Explorer", url: "https://xexplorer.neo.org" },
    },
} as const;

const config = getDefaultConfig({
    appName: 'Radish',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '', // Get one at https://cloud.walletconnect.com
    chains: [optimismSepolia, neoXTestnet, neoXMainnet],
    transports: {
        [optimismSepolia.id]: http(),
        [neoXTestnet.id]: http(),
        [neoXMainnet.id]: http(),
    }
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme({
                    accentColor: "#111111",
                    accentColorForeground: "white",
                    borderRadius: "medium",
                    fontStack: "system",
                    overlayBlur: "small",
                })} initialChain={neoXTestnet}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
} 