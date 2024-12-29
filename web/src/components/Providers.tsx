"use client";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {
  optimismSepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient();

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
  appName: "radish-xyz",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
  chains: [
    optimismSepolia,
    neoXTestnet,
    neoXMainnet,
  ],
  ssr: true,
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={neoXTestnet}
          theme={darkTheme({
            accentColor: "#111111",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
