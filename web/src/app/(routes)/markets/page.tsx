"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import Layout from "@/components/layouts/MainLayout";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { useMarkets } from "@/hooks/useMarkets";
import { CustomConnectButton } from "@/components/ui/CustomConnectButton";
import { useEffect } from "react";
import { useAccount } from "wagmi";

const PlatformIcon = ({ platform }: { platform?: string }) => {
  const icons: { [key: string]: string } = {
    youtube: "📺",
    twitter: "🐦",
    tiktok: "📱",
    instagram: "📸",
    onchain: "⛓️",
  };
  return <span className="mr-2">{icons[platform || "onchain"]}</span>;
};

export default function MarketsPage() {
  const {
    markets,
    isLoading,
    error,
  }: { markets: any[]; isLoading: boolean; error: any } = useMarkets();

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center">Loading markets...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500">Error: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 mb-8 border-b border-gray-200 pb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center md:text-left">
          Rad or Not?
        </h1>
        <div className="space-y-4 text-center md:text-right">
          <h3 className="text-xl md:text-3xl font-semibold">
            Bet on your favorite creators and earn 💸
          </h3>
          <div className="flex justify-center md:justify-end">
            <CustomConnectButton dark />
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
        {markets.map((market) => (
          <Link
            key={market.id}
            href={`/markets/${market.id}`}
            className="h-full"
          >
            <motion.div
              whileHover={{
                y: 10,
                x: 10,
                filter: "invert(1) hue-rotate(20deg)",
              }}
              className="p-shadow p-6 w-full  mb-6 flex flex-col items-center rounded bg-black text-white"
            >
              <div className="flex items-center mb-2">
                <PlatformIcon platform={market.platform} />
                <h2 className="text-xl font-semibold">{market.title}</h2>
              </div>
              {market.description && (
                <p className="mb-4 font-light text-zinc-400">
                  {market.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4 w-full">
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
                {market.creatorHandle && (
                  <div>
                    <span className="font-medium">Creator:</span>{" "}
                    {market.creatorHandle}
                  </div>
                )}
                {market.currentMetric && (
                  <div>
                    <span className="font-medium">
                      Current {market.metric}:
                    </span>{" "}
                    {(market.currentMetric / 1000000).toFixed(1)}M
                  </div>
                )}
                {market.target && (
                  <div>
                    <span className="font-medium">Target:</span>{" "}
                    {(market.target / 1000000).toFixed(1)}M
                  </div>
                )}
                <div>
                  <span className="font-medium">End Date:</span>{" "}
                  {market.endDate}
                </div>
              </div>

              <div className="flex w-full justify-between text-sm border-t pt-4 border-zinc-700">
                <div>
                  <span className="font-medium">24h Volume:</span> $
                  {market.volume24h.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Liquidity:</span> $
                  {market.liquidity.toLocaleString()}
                </div>
              </div>

              {market.isOnChain && (
                <div className="mt-4 text-sm text-green-400">
                  On-chain Market ⛓️
                </div>
              )}
            </motion.div>
          </Link>
        ))}
      </Masonry>
    </Layout>
  );
}
