"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Layout from "@/components/layouts/MainLayout"

export default function CreateMarketPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        endDate: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Implement market creation logic here
        console.log("Creating market:", formData)
        router.push("/markets")
    }

    return (
        <Layout>
            <Card className="max-w-2xl mx-auto shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <div>
                        <h1 className="notebook-header">📝 Create New Prediction Market</h1>
                        <p className="text-muted-foreground">
                            Create a new market for the community to predict on
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Market Question</Label>
                            <Input
                                id="title"
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
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Create Market
                    </Button>
                </form>
            </Card>
        </Layout >
    )
} 