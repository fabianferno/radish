"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import Layout from "@/components/layouts/MainLayout"
import Masonry from 'react-masonry-css'
import { motion } from "framer-motion"

interface Market {
    id: string
    title: string
    description: string
    endDate: string
    creatorHandle: string
    platform: "youtube" | "twitter" | "tiktok" | "instagram"
    metric: "followers" | "subscribers" | "views" | "likes"
    target: number
    currentMetric: number
    yesPrice: number
    noPrice: number
    liquidity: number
    volume24h: number
}

// Mock data - replace with actual data fetching
const mockMarkets: Market[] = [
    {
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
    },
    {
        id: "2",
        title: "Will Elon Musk reach 170M Twitter followers by Q2 2024?",
        description: "Market predicting Elon Musk's Twitter follower growth",
        endDate: "2024-06-30",
        creatorHandle: "@elonmusk",
        platform: "twitter",
        metric: "followers",
        target: 170000000,
        currentMetric: 165000000,
        yesPrice: 0.72,
        noPrice: 0.28,
        liquidity: 180000,
        volume24h: 32000,
    },
]

const PlatformIcon = ({ platform }: { platform: Market["platform"] }) => {
    const icons = {
        youtube: "📺",
        twitter: "🐦",
        tiktok: "📱",
        instagram: "📸",
    }
    return <span className="mr-2">{icons[platform]}</span>
}

export default function MarketsPage() {
    return (
        <Layout>
            <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-8">
                <h1 className="text-6xl font-semibold">Rad or Not?</h1>
                <h3 className="text-3xl font-semibold">
                    Bet on your favorite creators and earn 💸
                </h3>
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
                {mockMarkets.map((market) => (
                    <Link key={market.id} href={`/markets/${market.id}`} className="h-full">
                        <motion.div
                            whileHover={{
                                y: 10,
                                x: 10,
                                filter: 'invert(1) hue-rotate(20deg)',
                            }}
                            className="p-shadow p-6 w-full h-full flex flex-col items-center rounded bg-black text-white"
                        >
                            <div className="flex items-center mb-2">
                                <PlatformIcon platform={market.platform} />
                                <h2 className="text-xl font-semibold">{market.title}</h2>
                            </div>
                            <p className="mb-4 font-light text-zinc-400">{market.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4 mt-auto w-full">
                                <div className="bg-green-500/20 p-3">
                                    <div className="text-sm font-medium">YES Price</div>
                                    <div className="text-lg font-bold text-green-700">
                                        ${market.yesPrice.toFixed(3)}
                                    </div>
                                </div>
                                <div className="bg-red-500/20 p-3">
                                    <div className="text-sm font-medium">NO Price</div>
                                    <div className="text-lg font-bold text-red-700">
                                        ${market.noPrice.toFixed(3)}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <span className="font-medium">Creator:</span>{" "}
                                    {market.creatorHandle}
                                </div>
                                <div>
                                    <span className="font-medium">Current {market.metric}:</span>{" "}
                                    {(market.currentMetric / 1000000).toFixed(1)}M
                                </div>
                                <div>
                                    <span className="font-medium">Target:</span>{" "}
                                    {(market.target / 1000000).toFixed(1)}M
                                </div>
                                <div>
                                    <span className="font-medium">End Date:</span>{" "}
                                    {market.endDate}
                                </div>
                            </div>

                            <div className="flex w-full justify-between text-sm border-t pt-4 border-zinc-700">
                                <div>
                                    <span className="font-medium">24h Volume:</span>{" "}
                                    ${market.volume24h.toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-medium">Liquidity:</span>{" "}
                                    ${market.liquidity.toLocaleString()}
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </Masonry>
        </Layout>
    )
} 