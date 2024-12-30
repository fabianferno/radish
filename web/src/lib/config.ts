import { http, createConfig } from "@wagmi/core";
import {
  mainnet,
  optimismSepolia,
  neoxMainnet,
  neoxT4,
} from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, optimismSepolia, neoxMainnet],
  transports: {
    [mainnet.id]: http(),
    [optimismSepolia.id]: http(),
    [neoxMainnet.id]: http(),
    [neoxT4.id]: http(),
  },
});
