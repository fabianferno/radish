"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import dynamic from "next/dynamic"
import Layout from "@/components/layouts/MainLayout"

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
            <Card className="notebook-card mb-8">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="notebook-header">{mockMarket.title}</CardTitle>
                            <p className="text-muted-foreground">{mockMarket.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm mb-1">
                                <span className="font-medium">Creator:</span> {mockMarket.creatorHandle}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Current {mockMarket.metric}:</span>{" "}
                                {(mockMarket.currentMetric / 1000000).toFixed(1)}M
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-8">
                        {/* Trading Chart */}
                        <div className="col-span-2 bg-card rounded-lg p-4 h-[400px]">
                            <TradingViewWidget
                                marketId={`MRBEAST:SUBS_${mockMarket.id}`}
                                theme="light"
                            />
                        </div>

                        {/* Trading Interface */}
                        <div className="space-y-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger
                                        value="yes"
                                        className="data-[state=active]:bg-green-100"
                                    >
                                        YES (${mockMarket.yesPrice.toFixed(3)})
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="no"
                                        className="data-[state=active]:bg-red-100"
                                    >
                                        NO (${mockMarket.noPrice.toFixed(3)})
                                    </TabsTrigger>
                                </TabsList>

                                <div className="space-y-4 mt-4">
                                    <div>
                                        <label className="text-sm font-medium">Amount (USDC)</label>
                                        <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => handleAmountChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="text-sm">
                                        <div className="flex justify-between mb-2">
                                            <span>Estimated Cost:</span>
                                            <span>${estimatedCost.toFixed(2)} USDC</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Max Payout:</span>
                                            <span>${(parseFloat(amount) || 0).toFixed(2)} USDC</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleTrade}
                                        className="w-full"
                                        variant={activeTab === "yes" ? "success" : "destructive"}
                                    >
                                        Buy {activeTab.toUpperCase()} Shares
                                    </Button>
                                </div>
                            </Tabs>

                            <div className="space-y-2">
                                <h3 className="font-semibold">Market Stats</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>24h Volume:</div>
                                    <div className="text-right">${mockMarket.volume24h.toLocaleString()}</div>
                                    <div>Liquidity:</div>
                                    <div className="text-right">${mockMarket.liquidity.toLocaleString()}</div>
                                    <div>End Date:</div>
                                    <div className="text-right">{mockMarket.endDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="mt-8">
                        <h3 className="font-semibold mb-4">Recent Trades</h3>
                        <div className="space-y-2">
                            {mockMarket.recentTrades.map((trade, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center text-sm p-2 rounded-lg bg-card"
                                >
                                    <div>
                                        <span className={trade.type === "buy" ? "text-green-600" : "text-red-600"}>
                                            {trade.type.toUpperCase()} {trade.outcome.toUpperCase()}
                                        </span>
                                        <span className="text-muted-foreground ml-2">by {trade.trader}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span>${trade.amount.toLocaleString()} USDC</span>
                                        <span className="text-muted-foreground">{trade.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Layout>
    )
} 