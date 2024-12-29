"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import Layout from "@/components/layouts/MainLayout"
import { motion } from "framer-motion"

// Dynamically import TradingView chart to avoid SSR issues
const TradingViewWidget = dynamic(
    () => import("@/components/TradingViewWidget"),
    { ssr: false }
)

interface Trade {
    type: "buy" | "sell"
    outcome: "yes" | "no"
    amount: number
    price: number
    timestamp: string
    trader: string
}

// Mock data - replace with actual data fetching
const mockMarket = {
    id: "1",
    title: "Will MrBeast reach 200M YouTube subscribers by March 2024?",
    description: "Prediction market for MrBeast's YouTube channel reaching 200M subscribers",
    endDate: "2024-03-31",
    creatorHandle: "@mrbeast",
    platform: "youtube",
    metric: "subscribers",
    target: 200000000,
    currentMetric: 187000000,
    yesPrice: 0.65,
    noPrice: 0.35,
    liquidity: 250000,
    volume24h: 45000,
    recentTrades: [
        { type: "buy", outcome: "yes", amount: 1000, price: 0.65, timestamp: "2023-12-24 10:30", trader: "0x1234...5678" },
        { type: "sell", outcome: "no", amount: 500, price: 0.35, timestamp: "2023-12-24 09:15", trader: "0x8765...4321" },
        { type: "buy", outcome: "yes", amount: 2000, price: 0.64, timestamp: "2023-12-23 22:45", trader: "0x9876...1234" },
    ] as Trade[],
}

export default function MarketPage() {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState("yes")
    const [amount, setAmount] = useState("")
    const [estimatedCost, setEstimatedCost] = useState(0)

    const handleAmountChange = (value: string) => {
        setAmount(value)
        // Calculate estimated cost using LMSR
        const numericAmount = parseFloat(value) || 0
        const price = activeTab === "yes" ? mockMarket.yesPrice : mockMarket.noPrice
        setEstimatedCost(numericAmount * price)
    }

    const handleTrade = () => {
        // Implement trade execution logic here
        console.log("Executing trade:", {
            type: "buy",
            outcome: activeTab,
            amount: parseFloat(amount),
            estimatedCost
        })
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8 border-b border-zinc-700 pb-8">
                <h1 className="text-6xl font-semibold text-black">{mockMarket.title}</h1>
                <div className="text-right">
                    <div className="text-3xl font-semibold text-white">
                        {mockMarket.creatorHandle}
                    </div>
                    <div className="text-xl text-zinc-400">
                        Target: {(mockMarket.target / 1000000).toFixed(1)}M
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Left Column: Chart */}
                <div className="col-span-2 p-shadow p-6 rounded bg-black text-white">
                    <div className="h-full">
                        <TradingViewWidget marketId={`MRBEAST:SUBS_${mockMarket.id}`} />
                    </div>
                </div>

                {/* Right Column: Trading Interface */}
                <div className="p-shadow p-6 rounded bg-black text-white">
                    <div className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
                                <TabsTrigger
                                    value="yes"
                                    className="text-zinc-300 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                                >
                                    YES (${mockMarket.yesPrice.toFixed(3)})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="no"
                                    className="text-zinc-300 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
                                >
                                    NO (${mockMarket.noPrice.toFixed(3)})
                                </TabsTrigger>
                            </TabsList>

                            <div className="space-y-4 mt-6">
                                <div>
                                    <label className="text-sm font-medium text-zinc-300">Amount (USDC)</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => handleAmountChange(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between text-zinc-300">
                                        <span>Estimated Cost:</span>
                                        <span className="text-white">${estimatedCost.toFixed(2)} USDC</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-300">
                                        <span>Max Payout:</span>
                                        <span className="text-white">${(parseFloat(amount) || 0).toFixed(2)} USDC</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleTrade}
                                    className="w-full text-white"
                                    variant={activeTab === "yes" ? "success" : "destructive"}
                                >
                                    Buy {activeTab.toUpperCase()} Shares
                                </Button>
                            </div>
                        </Tabs>

                        <div className="space-y-3 border-t border-zinc-700 pt-4">
                            <h3 className="font-semibold text-lg text-white">Market Stats</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-zinc-400">24h Volume:</div>
                                <div className="text-right text-white">${mockMarket.volume24h.toLocaleString()}</div>
                                <div className="text-zinc-400">Liquidity:</div>
                                <div className="text-right text-white">${mockMarket.liquidity.toLocaleString()}</div>
                                <div className="text-zinc-400">End Date:</div>
                                <div className="text-right text-white">{mockMarket.endDate}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Trades */}
            <div className="mt-8 p-shadow p-6 rounded bg-black text-white">
                <h3 className="font-semibold text-lg mb-4">Recent Trades</h3>
                <div className="space-y-2">
                    {mockMarket.recentTrades.map((trade, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center text-sm p-3 rounded bg-zinc-900"
                        >
                            <div>
                                <span className={trade.type === "buy" ? "text-green-400" : "text-red-400"}>
                                    {trade.type.toUpperCase()} {trade.outcome.toUpperCase()}
                                </span>
                                <span className="text-zinc-400 ml-2">by {trade.trader}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-white">${trade.amount.toLocaleString()} USDC</span>
                                <span className="text-zinc-400">{trade.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
} 