const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const priceTokenAddress = "0x3d8354A338775B181EB989f53646D5BFc9DD90dA";
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");

  // Deploy the contract
  const predictionMarket = await PredictionMarket.deploy(priceTokenAddress);

  // Wait for the deployment to be mined
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("MyContract deployed to:", predictionMarketAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
