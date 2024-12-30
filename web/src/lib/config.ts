import { http, createConfig } from "@wagmi/core";
import { mainnet, optimismSepolia } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, optimismSepolia],
  transports: {
    [mainnet.id]: http(),
    [optimismSepolia.id]: http(),
  },
});
