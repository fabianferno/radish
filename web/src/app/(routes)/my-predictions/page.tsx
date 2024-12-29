"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import Layout from "@/components/layouts/MainLayout"
import Masonry from 'react-masonry-css'
import { motion } from "framer-motion"

interface Prediction {
    marketId: string
    marketTitle: string
    prediction: number
    timestamp: string
    endDate: string
    currentProbability: number
}

// Mock data - replace with actual data fetching
const mockPredictions: Prediction[] = [
    {
        marketId: "mock-1",
        marketTitle: "Will MrBeast reach 200M YouTube subscribers by March 2024?",
        prediction: 0.75,
        timestamp: "2023-12-24 10:30",
        endDate: "2024-03-31",
        currentProbability: 0.65,
    },
    {
        marketId: "mock-2",
        marketTitle: "Will Elon Musk reach 170M Twitter followers by Q2 2024?",
        prediction: 0.32,
        timestamp: "2023-12-23 15:45",
        endDate: "2024-06-30",
        currentProbability: 0.45,
    },
]

export default function MyPredictionsPage() {
    return (
        <Layout>
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-8">
                <h1 className="text-6xl font-semibold">Your positions</h1>
                <div className="flex flex-col items-end gap-4">
                    <h3 className="text-3xl font-semibold">
                        Track your bets and earnings 💰
                    </h3>
                    <div className="flex items-center gap-4">
                        <div>Your total earnings: $1,234</div>
                        <button
                            className="bg-neo-green hover:bg-neo-green/80 text-black font-bold py-2 px-6 rounded-lg transition-colors"
                            onClick={() => {
                                // TODO: Implement claim winnings functionality
                                console.log("Claiming winnings...");
                            }}
                        >
                            Claim Winnings 🎉
                        </button>
                    </div>
                </div>
            </div>

            <Masonry
                breakpointCols={{
                    default: 3,
                    1100: 3,
                    700: 1,
                    500: 1,
                }}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column p-wall-tilt"
            >
                {mockPredictions.map((pred) => (
                    <Link key={pred.marketId} href={`/markets/${pred.marketId}`} className="h-full">
                        <motion.div
                            whileHover={{
                                y: 10,
                                x: 10,
                                filter: 'invert(1) hue-rotate(20deg)',
                            }}
                            className="p-shadow p-6 w-full h-full flex flex-col items-center rounded bg-black text-white"
                        >
                            <h2 className="text-xl font-semibold mb-4">{pred.marketTitle}</h2>

                            <div className="grid grid-cols-2 gap-4 mb-4 mt-auto w-full">
                                <div className="bg-green-500/20 p-3">
                                    <div className="text-sm font-medium">Your Prediction</div>
                                    <div className="text-lg font-bold text-green-700">
                                        {(pred.prediction * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="bg-blue-500/20 p-3">
                                    <div className="text-sm font-medium">Current Market</div>
                                    <div className="text-lg font-bold text-blue-700">
                                        {(pred.currentProbability * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4 w-full">
                                <div>
                                    <span className="font-medium">Predicted On:</span>{" "}
                                    {pred.timestamp}
                                </div>
                                <div>
                                    <span className="font-medium">Resolves On:</span>{" "}
                                    {pred.endDate}
                                </div>
                            </div>

                            <div className="flex w-full justify-between text-sm border-t pt-4 border-zinc-700">
                                <div>
                                    <span className="font-medium">P/L:</span>{" "}
                                    +$1,234
                                </div>
                                <div>
                                    <span className="font-medium">Position:</span>{" "}
                                    $5,000
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </Masonry>

            {mockPredictions.length === 0 && (
                <div className="text-center text-muted-foreground mt-8">
                    <p>You haven&apos;t made any predictions yet.</p>
                    <Link href="/markets" className="text-primary hover:underline">
                        Browse available markets
                    </Link>
                </div>
            )}
        </Layout>
    )
} 