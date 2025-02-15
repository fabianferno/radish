"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Layout from "@/components/layouts/MainLayout"
import { useCreateMarket } from "@/hooks/useMarkets"
import { useAccount } from "wagmi"
import { CustomConnectButton } from "@/components/ui/CustomConnectButton"

export default function CreateMarketPage() {
    const router = useRouter()
    const { address } = useAccount()
    const { createMarket, isLoading, error } = useCreateMarket()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        endDate: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createMarket(formData.title, formData.endDate)
            router.push("/markets")
        } catch (err) {
            console.error("Failed to create market:", err)
        }
    }

    if (!address) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-8">Connect Wallet</h1>
                    <p className="mb-8 text-zinc-600">
                        Please connect your wallet to create a prediction market
                    </p>
                    <CustomConnectButton dark />
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Card className="border-none bg-black text-white mx-auto mt-5">
                <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <div>
                        <h1 className="text-white text-3xl font-bold">📝 Create New Prediction Market</h1>
                        <p className="text-zinc-400">
                            Create a new market for the community to predict on
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Market Question</Label>
                            <Input
                                id="title"
                                className="text-white bg-black border-neo-green"
                                placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                className="text-white bg-black border-neo-green"
                                placeholder="Provide additional context and details about the prediction market..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                className="text-white bg-black border-neo-green"
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Market"}
                    </Button>

                    {error && (
                        <p className="text-red-500 text-sm mt-2">
                            Error: {error.message}
                        </p>
                    )}
                </form>
            </Card>
        </Layout>
    )
} 