"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import Layout from "@/components/layouts/MainLayout"
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
        marketId: "1",
        marketTitle: "Will Bitcoin reach $100k by end of 2024?",
        prediction: 0.75,
        timestamp: "2023-12-24 10:30",
        endDate: "2024-12-31",
        currentProbability: 0.65,
    },
    {
        marketId: "2",
        marketTitle: "Will AI surpass human-level reasoning by 2025?",
        prediction: 0.32,
        timestamp: "2023-12-23 15:45",
        endDate: "2025-12-31",
        currentProbability: 0.45,
    },
]

export default function MyPredictionsPage() {
    return (
        <Layout>
            <div className="">
                <h1 className="notebook-header mb-8">📈 My Predictions</h1>

                <div className="grid gap-6">
                    {mockPredictions.map((pred) => (
                        <Link key={pred.marketId} href={`/markets/${pred.marketId}`}>
                            <Card className="prediction-card">
                                <h2 className="text-xl font-semibold mb-2">{pred.marketTitle}</h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Your Prediction:</span>{" "}
                                        {(pred.prediction * 100).toFixed(1)}%
                                    </div>
                                    <div>
                                        <span className="font-medium">Current Market:</span>{" "}
                                        {(pred.currentProbability * 100).toFixed(1)}%
                                    </div>
                                    <div>
                                        <span className="font-medium">Predicted On:</span>{" "}
                                        {pred.timestamp}
                                    </div>
                                    <div>
                                        <span className="font-medium">Resolves On:</span> {pred.endDate}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {mockPredictions.length === 0 && (
                    <div className="text-center text-muted-foreground mt-8">
                        <p>You haven&apos;t made any predictions yet.</p>
                        <Link href="/markets">
                            <span className="text-primary hover:underline">
                                Browse available markets
                            </span>
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    )
} 