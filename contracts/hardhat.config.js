require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Local network configuration
    },
    optimism_sepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    neox_testnet: {
      url: "https://neoxt4seed1.ngd.network/",
      chainId: 12227332,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      maxFeePerGas: 60000000000,
      maxPriorityFeePerGas: 20000000000,
      gas: 3000000,
      verify: {
        explorer: "https://xt4scan.ngd.network/",
      },
    },
    neox_mainnet: {
      url: "https://mainnet-1.rpc.banelabs.org",
      chainId: 47763,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      verify: {
        explorer: "https://xexplorer.neo.org",
      },
    },
  },
  etherscan: {
    apiKey: {
      optimism_sepolia: process.env.ETHERSCAN_API_KEY || "",
      neox_testnet: process.env.ETHERSCAN_API_KEY || "",
      neox_mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "optimism_sepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://optimism-sepolia.blockscout.com/api",
          browserURL: "https://optimism-sepolia.blockscout.com/",
        },
      },
      {
        network: "neox_testnet",
        chainId: 12227332,
        urls: {
          apiURL: "https://xt4scan.ngd.network/api",
          browserURL: "https://xt4scan.ngd.network/",
        },
      },
      {
        network: "neox_mainnet",
        chainId: 47763,
        urls: {
          apiURL: "https://xexplorer.neo.org/api",
          browserURL: "https://xexplorer.neo.org/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};
