const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory
  const priceTokenAddress = "0x3d8354A338775B181EB989f53646D5BFc9DD90dA";

  const yesTokenAddress = "0x0E4B465e8686D73b6F80dfFf6f4F57C0C0986635";
  const noTokenAddress = "0x10560EFd1246b7C70De59acf779981E7Ed3d65C5";
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
