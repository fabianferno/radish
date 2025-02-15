"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import Layout from "@/components/layouts/MainLayout";
import { useMarket, useMarketActions } from "@/hooks/useMarkets";
import { useAccount, useWriteContract } from "wagmi";
import { CustomConnectButton } from "@/components/ui/CustomConnectButton";
import { request, gql } from "graphql-request";
import {
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  SUBGRAPH_URL,
} from "@/config/contracts";
import { useChainId } from "wagmi";
import { parseEther } from "viem";

// Dynamically import TradingView chart to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import("@/components/TradingViewWidget"),
  { ssr: false }
);

interface Trade {
  type: "buy" | "sell";
  outcome: "yes" | "no";
  amount: number;
  price: number;
  timestamp: string;
  trader: string;
}

// Mock trades data for demo purposes
const mockTrades: Trade[] = [
  {
    type: "buy",
    outcome: "yes",
    amount: 1000,
    price: 0.65,
    timestamp: "2023-12-24 10:30",
    trader: "0x1234...5678",
  },
  {
    type: "sell",
    outcome: "no",
    amount: 500,
    price: 0.35,
    timestamp: "2023-12-24 09:15",
    trader: "0x8765...4321",
  },
  {
    type: "buy",
    outcome: "yes",
    amount: 2000,
    price: 0.64,
    timestamp: "2023-12-23 22:45",
    trader: "0x9876...1234",
  },
];

export default function MarketPage() {
  const { id } = useParams();
  const chainId = useChainId();
  const { address } = useAccount();
  const {
    market,
    isLoading: marketLoading,
    error: marketError,
  }: { market: any; isLoading: boolean; error: any } = useMarket(id as string);
  const {
    buy,
    sell,
    approve,
    resolve,
    isLoading: actionLoading,
    error: actionError,
  }: {
    buy: any;
    sell: any;
    approve: any;
    resolve: any;
    isLoading: boolean;
    error: any;
  } = useMarketActions(id as string);
  const [activeTab, setActiveTab] = useState("yes");
  const [amount, setAmount] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [trades, setTrades] = useState<Trade[]>([]);

  const getMarketPrice = (type: string) => {
    if (type === "yes") {
      return market.yesPrice;
    } else {
      return market.noPrice;
    }
  };

  const fetchData = async () => {
    try {
      const data: any = await request(
        SUBGRAPH_URL[chainId],
        `
                query MyQuery {
                                orders(where: { market: "${id}" }) {
                                    id
                                    amount
                                    price
                                    timestamp
                                    tokenType
                                    type
                                    user {
      id
    }
                                }
                                }
                `
      );
      console.log(data.orders);
      data.orders.map((order: any) => {
        const trade: Trade = {
          type: order.type.toLowerCase(),
          outcome: order.tokenType.toLowerCase(),
          amount: order.amount / 10 ** 18,
          price: order.price / 10 ** 18,
          timestamp: new Date(order.timestamp * 1000).toDateString(),
          trader: order.user.id,
        };
        setTrades((prevTrades) => [...prevTrades, trade]);
      });
    } catch (err) {
      console.error("Fetch data failed:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (!market) return;
    // Calculate estimated cost using market prices
    const numericAmount = parseFloat(value) || 0;
    const price = activeTab === "yes" ? market.yesPrice : market.noPrice;
    setEstimatedCost(numericAmount * price);
  };

  const handleTrade = async (tradeType: 'buy' | 'sell') => {
    if (!market || !amount) return;
    try {
      if (tradeType === 'buy') {
        if (activeTab === "yes") {
          await buy(true, parseFloat(amount), market.contractAddress);
        } else {
          await buy(false, parseFloat(amount), market.contractAddress);
        }
      } else {
        if (activeTab === "yes") {
          await sell(true, parseFloat(amount), market.contractAddress);
        } else {
          await sell(false, parseFloat(amount), market.contractAddress);
        }
      }
    } catch (err) {
      console.error("Trade failed:", err);
    }
  };

  const handleApprove = async () => {
    if (!market) return;
    try {
      await approve(market.contractAddress);
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleResolution = async () => {
    if (!market) return;
    try {
      await resolve(market.contractAddress);
    } catch (err) {
      console.error("Resolution failed:", err);
    }
  };
  const {
    writeContractAsync: mint,
    isPending: mintIsPending,
    error: mintError,
  } = useWriteContract();
  const handleMint = async () => {
    try {
      await mint({
        address: CONTRACT_ADDRESSES[chainId].mockERC20,
        abi: ERC20_ABI,
        functionName: "mint",
        chainId: chainId as any,
        args: [address as `0x${string}`, parseEther("1000")],
      });
    } catch (error) { }
  };

  if (marketLoading) {
    return (
      <Layout>
        <div className="text-center">Loading market...</div>
      </Layout>
    );
  }

  if (marketError) {
    return (
      <Layout>
        <div className="text-center text-red-500">
          Error: {marketError.message}
        </div>
      </Layout>
    );
  }

  if (!market) {
    return (
      <Layout>
        <div className="text-center">Market not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center border-b border-zinc-700 pb-5">
        <h1 className="text-5xl font-semibold text-black w-2/3">
          {market.title}
        </h1>
        <div className="text-right space-y-4">
          {market.creatorHandle && (
            <div className="text-3xl font-semibold text-black">
              Created by:{" "}
              {market.creatorHandle.slice(0, 4) +
                "..." +
                market.creatorHandle.slice(-4)}
            </div>
          )}
          {market.target && (
            <div className="text-xl text-zinc-400">
              Target: {(market.target / 1000000).toFixed(1)}M
            </div>
          )}
          <div className="flex justify-end gap-2 items-center">
            <Button
              variant={"outline"}
              disabled={!address || mintIsPending}
              onClick={handleMint}
            >
              Faucet xUSDC
            </Button>
            {!address && <div className="justify-end">
              <CustomConnectButton dark />
            </div>}
          </div>
        </div>
      </div>
      <section className="mt-5">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Chart */}
          <div className="col-span-2 p-shadow p-6 rounded bg-black text-white">
            <div className="h-full">
              <TradingViewWidget
                marketId={market.id}
                trades={trades.filter((t) => t.outcome === activeTab)}
              />
            </div>
          </div>

          {/* Right Column: Trading Interface */}
          <div className="p-shadow p-6 rounded bg-black text-white">
            {!address ? (
              <div className="text-center space-y-4">
                <p className="text-zinc-400">Connect your wallet to trade</p>
                <CustomConnectButton dark />
              </div>
            ) : (
              <div className="space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
                    <TabsTrigger
                      value="yes"
                      className="text-zinc-300 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
                    >
                      YES (${market.yesPrice.toFixed(3)})
                    </TabsTrigger>
                    <TabsTrigger
                      value="no"
                      className="text-zinc-300 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
                    >
                      NO (${market.noPrice.toFixed(3)})
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium text-zinc-300">
                        Amount (USDC)
                      </label>
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
                        <span className="text-white">
                          ${estimatedCost.toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-300">
                        <span>Max Payout:</span>
                        <span className="text-white">
                          ${(parseFloat(amount) || 0).toFixed(2)} USDC
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleApprove}
                      className="w-full text-white"
                      variant={activeTab === "yes" ? "success" : "destructive"}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? "Processing..."
                        : `Approve Contract to Trade ${activeTab.toUpperCase()} Shares`}
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={(e) => handleTrade('buy')}
                        className="w-full text-white"
                        variant={activeTab === "yes" ? "success" : "destructive"}
                        disabled={actionLoading || !amount}
                      >
                        {actionLoading
                          ? "Processing..."
                          : `Buy ${activeTab.toUpperCase()}`}
                      </Button>
                      <Button
                        onClick={(e) => handleTrade('sell')}
                        className="w-full text-white"
                        variant={activeTab === "yes" ? "success" : "destructive"}
                        disabled={actionLoading || !amount}
                      >
                        {actionLoading
                          ? "Processing..."
                          : `Sell ${activeTab.toUpperCase()}`}
                      </Button>
                    </div>

                    {actionError && (
                      <p className="text-red-500 text-sm">
                        Error: {actionError.message}
                      </p>
                    )}
                  </div>
                </Tabs>

                <div className="space-y-3 border-t border-zinc-700 pt-4">
                  <h3 className="font-semibold text-lg text-white">
                    Market Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-zinc-400">24h Volume:</div>
                    <div className="text-right text-white">
                      ${market.volume24h.toLocaleString()}
                    </div>
                    <div className="text-zinc-400">Liquidity:</div>
                    <div className="text-right text-white">
                      ${market.liquidity.toLocaleString()}
                    </div>
                    <div className="text-zinc-400">End Date:</div>
                    <div className="text-right text-white">
                      {market.endDate}
                    </div>
                  </div>
                  {address.toLowerCase() ==
                    market.creatorHandle.toLowerCase() && (
                      <Button
                        onClick={handleResolution}
                        className="w-full text-white"
                        variant="destructive"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Resolving..." : `Resolve Market`}
                      </Button>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="mt-8 p-shadow p-6 rounded bg-black text-white">
          <h3 className="font-semibold text-lg mb-4">Recent Trades</h3>
          <div className="space-y-2">
            {trades.map((trade, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm p-3 rounded bg-zinc-900"
              >
                <div>
                  <span
                    className={
                      trade.type === "buy" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {trade.type.toUpperCase()} {trade.outcome.toUpperCase()}
                  </span>
                  <span className="text-zinc-400 ml-2">by {trade.trader}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white">
                    ${trade.amount.toLocaleString()} USDC
                  </span>
                  <span className="text-zinc-400">{trade.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
