const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const priceTokenAddress = "0x14b6a44dcBE7ad803cE300F2f2008b47F85Da0A3";

  const yesTokenAddress = "0x84daB152F26d1e58147E7962308693Ab89274e34";
  const noTokenAddress = "0x2Dd0eb3114CAB76C1C29f48287f7fA9B0f373351";
  const marketId = 0;
  const question = "Will it rain tomorrow?";
  const endTime = 1735397954;

  // Verify the contract after deployment
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: "0x72C8b554db8615dBF80D77A3268Fa15CcB1d2a95",
    constructorArguments: [
      priceTokenAddress,
      yesTokenAddress,
      noTokenAddress,
      marketId,
      question,
      endTime,
    ],
  });
  console.log("Contract verified");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
