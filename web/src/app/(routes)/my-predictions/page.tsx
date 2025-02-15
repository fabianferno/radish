// "use client";

// import Link from "next/link";
// import { Card } from "@/components/ui/card";
// import Layout from "@/components/layouts/MainLayout";
// import Masonry from "react-masonry-css";
// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import { getUserMarkets } from "@/hooks/getUserMarket";
// import { useAccount } from "wagmi";

// interface Prediction {
//   marketId: string;
//   marketTitle: string;
//   prediction: number;
//   timestamp: string;
//   endDate: string;
//   currentProbability: number;
// }

// // Mock data - replace with actual data fetching
// const mockPredictions: Prediction[] = [
//   {
//     marketId: "mock-1",
//     marketTitle: "Will MrBeast reach 200M YouTube subscribers by March 2024?",
//     prediction: 0.75,
//     timestamp: "2023-12-24 10:30",
//     endDate: "2024-03-31",
//     currentProbability: 0.65,
//   },
//   {
//     marketId: "mock-2",
//     marketTitle: "Will Elon Musk reach 170M Twitter followers by Q2 2024?",
//     prediction: 0.32,
//     timestamp: "2023-12-23 15:45",
//     endDate: "2024-06-30",
//     currentProbability: 0.45,
//   },
// ];

// export default function MyPredictionsPage() {
//   const { address } = useAccount();
//   const [userPredictions, setUserPredictions] = useState<any[]>([]);
//   const fetchPredictions = async () => {
//     try {
//       const data = await getUserMarkets(address!);
//       setUserPredictions(data);
//     } catch (error) {}
//   };
//   useEffect(() => {
//     fetchPredictions();
//   }, [address]);
//   return (
//     <Layout>
//       <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 mb-8 border-b border-gray-200 pb-8">
//         <h1 className="text-4xl md:text-6xl font-semibold text-center md:text-left">
//           Your positions
//         </h1>
//         <div className="flex flex-col items-center md:items-end gap-4">
//           <h3 className="text-xl md:text-3xl font-semibold text-center md:text-right">
//             Track your bets and earnings 💰
//           </h3>
//           <div className="flex flex-col md:flex-row items-center gap-4">
//             <div className="text-center md:text-right">
//               Your total earnings: $1,234
//             </div>
//             <button
//               className="bg-neo-green hover:bg-neo-green/80 text-black font-bold py-2 px-6 rounded-lg transition-colors w-full md:w-auto"
//               onClick={() => {
//                 // TODO: Implement claim winnings functionality
//                 console.log("Claiming winnings...");
//               }}
//             >
//               Claim Winnings 🎉
//             </button>
//           </div>
//         </div>
//       </div>

//       <Masonry
//         breakpointCols={{
//           default: 3,
//           1100: 3,
//           700: 1,
//           500: 1,
//         }}
//         className="my-masonry-grid"
//         columnClassName="my-masonry-grid_column p-wall-tilt"
//       >
//         {mockPredictions.map((pred) => (
//           <Link
//             key={pred.marketId}
//             href={`/markets/${pred.marketId}`}
//             className="h-full"
//           >
//             <motion.div
//               whileHover={{
//                 y: 10,
//                 x: 10,
//                 filter: "invert(1) hue-rotate(20deg)",
//               }}
//               className="p-shadow p-6 w-full md:h-full mb-6 flex flex-col items-center rounded bg-black text-white"
//             >
//               <h2 className="text-xl font-semibold mb-4">{pred.marketTitle}</h2>

//               <div className="grid grid-cols-2 gap-4 mb-4 mt-auto w-full">
//                 <div className="bg-green-500/20 p-3">
//                   <div className="text-sm font-medium">Your Prediction</div>
//                   <div className="text-lg font-bold text-green-700">
//                     {(pred.prediction * 100).toFixed(1)}%
//                   </div>
//                 </div>
//                 <div className="bg-blue-500/20 p-3">
//                   <div className="text-sm font-medium">Current Market</div>
//                   <div className="text-lg font-bold text-blue-700">
//                     {(pred.currentProbability * 100).toFixed(1)}%
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4 text-sm mb-4 w-full">
//                 <div>
//                   <span className="font-medium">Predicted On:</span>{" "}
//                   {pred.timestamp}
//                 </div>
//                 <div>
//                   <span className="font-medium">Resolves On:</span>{" "}
//                   {pred.endDate}
//                 </div>
//               </div>

//               <div className="flex w-full justify-between text-sm border-t pt-4 border-zinc-700">
//                 <div>
//                   <span className="font-medium">P/L:</span> +$1,234
//                 </div>
//                 <div>
//                   <span className="font-medium">Position:</span> $5,000
//                 </div>
//               </div>
//             </motion.div>
//           </Link>
//         ))}
//       </Masonry>

//       {mockPredictions.length === 0 && (
//         <div className="text-center text-muted-foreground mt-8">
//           <p>You haven&apos;t made any predictions yet.</p>
//           <Link href="/markets" className="text-primary hover:underline">
//             Browse available markets
//           </Link>
//         </div>
//       )}
//     </Layout>
//   );
// }

"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import Layout from "@/components/layouts/MainLayout";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getUserMarkets } from "@/hooks/getUserMarket";
import { useAccount } from "wagmi";
import { useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { useMarketActions } from "@/hooks/useMarkets";

interface Prediction {
  marketId: string;
  marketTitle: string;
  prediction: number;
  timestamp: string;
  endDate: string;
  currentProbability: number;
  resolved: boolean;
  contractAddress?: string;
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
    resolved: false,
  },
  {
    marketId: "mock-2",
    marketTitle: "Will Elon Musk reach 170M Twitter followers by Q2 2024?",
    prediction: 0.32,
    timestamp: "2023-12-23 15:45",
    endDate: "2024-06-30",
    currentProbability: 0.45,
    resolved: false,
  },
];

export default function MyPredictionsPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPredictions = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const data = await getUserMarkets(address, chainId);
      const parsedUserPredictions: Prediction[] = data.marketsParticipated.map(
        (market: any) => ({
          marketId: market.market.id,
          marketTitle: market.market.question,
          prediction:
            parseFloat(market.yesInMarket) /
            (parseFloat(market.market.totalYes) +
              parseFloat(market.market.totalNo)),
          timestamp: new Date().toISOString(), // Replace with actual timestamp if available
          endDate: market.market.endDate,
          currentProbability:
            parseFloat(market.market.totalYes) /
            (parseFloat(market.market.totalYes) +
              parseFloat(market.market.totalNo)),

          resolved: market.market.resolved,
          contractAddress: market.market.marketContract,
        })
      );
      setUserPredictions(parsedUserPredictions);
    } catch (error) {
      console.error("Failed to fetch user predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [address]);

  const combinedPredictions = [...mockPredictions, ...userPredictions];

  const handleClaim = async (pred: Prediction) => {
    console.log("Claiming winnings...", pred);
    const { claim } = useMarketActions(pred.marketId); // eslint-disable-line
    await claim(pred.contractAddress as `0x${string}`);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 mb-8 border-b border-gray-200 pb-8">
        <h1 className="text-4xl md:text-6xl font-semibold text-center md:text-left">
          Your positions
        </h1>
        <div className="flex flex-col items-center md:items-end gap-4">
          <h3 className="text-xl md:text-3xl font-semibold text-center md:text-right">
            Track your bets and earnings 💰
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="text-center md:text-right">
              Your total earnings: $1,234
            </div>
            <button
              className="bg-neo-green hover:bg-neo-green/80 text-black font-bold py-2 px-6 rounded-lg transition-colors w-full md:w-auto"
              onClick={() => {
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
        {combinedPredictions.map((pred) => (
          <div
            key={pred.marketId}
          >
            <motion.div
              whileHover={{
                y: 10,
                x: 10,
                filter: "invert(1) hue-rotate(20deg)",
              }}
              className="p-shadow p-6 w-full  mb-6 flex flex-col items-center rounded bg-black text-white"
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
                  <span className="font-medium">P/L:</span> +$1,234
                </div>
                <div>
                  <span className="font-medium">Position:</span> $5,000
                </div>
              </div>
              <div className="flex w-full justify-between text-sm border-t pt-4 border-zinc-700">
                {!pred.resolved && (
                  <Button className="text-black" onClick={() => handleClaim(pred)}>
                    Claim Winnings
                  </Button>
                )}
                <Link href={`/markets/${pred.marketId}`}>
                  <Button className="text-black">View Market</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        ))}
      </Masonry>

      {!isLoading && combinedPredictions.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          <p>You haven&apos;t made any predictions yet.</p>
          <Link href="/markets" className="text-primary hover:underline">
            Browse available markets
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-muted-foreground mt-8">
          <p>Loading your predictions...</p>
        </div>
      )}
    </Layout>
  );
}
