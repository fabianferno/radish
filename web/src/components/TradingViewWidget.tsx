"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TradingViewWidgetProps {
  marketId: string;
  trades: any;
}

// Mock price data - replace with actual historical data
const generateMockData = () => {
  const data = [];
  const startDate = new Date("2023-01-01");
  let price = 0.5; // Start at 50%

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Add some random price movement
    price = Math.max(
      0.01,
      Math.min(0.99, price + (Math.random() - 0.5) * 0.05)
    );

    data.push({
      date: date.toISOString().split("T")[0],
      price: parseFloat((price * 100).toFixed(2)),
    });
  }
  return data;
};

const generateData = (trades: any) => {
  const data: any = [];
  trades.map((trade: any) => {
    data.push({
      date: trade.timestamp,
      price: (trade.price / trade.amount) * 100,
    });
  });
  console.log(JSON.stringify(data));
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 p-3 border border-zinc-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-zinc-300">{label}</p>
        <p className="text-sm text-green-400">
          Price: {payload[0].value.toFixed(2)} USDC
        </p>
      </div>
    );
  }
  return null;
};

export default function TradingViewWidget({
  marketId,
  trades,
}: TradingViewWidgetProps) {
  const data = generateData(trades);

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
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            tick={{ fill: "#a1a1aa" }}
            tickLine={{ stroke: "#71717a" }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: "#a1a1aa" }}
            tickLine={{ stroke: "#71717a" }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            fill="rgba(34, 197, 94, 0.2)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
