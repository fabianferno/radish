const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const priceTokenAddress = "0x3d8354A338775B181EB989f53646D5BFc9DD90dA";

  const yesTokenAddress = "0x7482101aE633eC79aB78610df449EB9D35Ae1480";
  const noTokenAddress = "0x4E893bC398F44B7d14545650339caC397d7A8991";
  const MarketContract = await ethers.getContractFactory("MarketFactory");

  // Deploy the contract
  const predictionMarket = await MarketContract.deploy(
    priceTokenAddress,
    yesTokenAddress,
    noTokenAddress
  );

  // Wait for the deployment to be mined
  await predictionMarket.waitForDeployment();
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("MyContract deployed to:", predictionMarketAddress);

  // Verify the contract after deployment
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: predictionMarketAddress,
    constructorArguments: [priceTokenAddress, yesTokenAddress, noTokenAddress],
  });
  console.log("Contract verified");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});