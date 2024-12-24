"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

interface TradingViewWidgetProps {
    marketId: string
}

// Mock price data - replace with actual historical data
const generateMockData = () => {
    const data = []
    const startDate = new Date('2023-01-01')
    let price = 0.5 // Start at 50%

    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        // Add some random price movement
        price = Math.max(0.01, Math.min(0.99, price + (Math.random() - 0.5) * 0.05))

        data.push({
            date: date.toISOString().split('T')[0],
            price: parseFloat((price * 100).toFixed(2))
        })
    }
    return data
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border rounded-lg shadow-sm">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-blue-600">
                    Price: {payload[0].value.toFixed(2)}%
                </p>
            </div>
        )
    }
    return null
}

export default function TradingViewWidget({ marketId }: TradingViewWidgetProps) {
    const data = generateMockData()

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        stroke="#191919"
                        tick={{ fill: "#191919" }}
                        tickLine={{ stroke: "#191919" }}
                    />
                    <YAxis
                        stroke="#191919"
                        tick={{ fill: "#191919" }}
                        tickLine={{ stroke: "#191919" }}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#2962FF"
                        fill="rgba(41, 98, 255, 0.28)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
} 