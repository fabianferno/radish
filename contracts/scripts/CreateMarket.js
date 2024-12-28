const { ethers } = require("hardhat");

async function main() {
  // Deploy MockERC20
  const MockERC20 = await ethers.getContractFactory("PriceToken");
  const mockERC20 = await MockERC20.deploy("Mock Token", "MTK", 1000000000);
  await mockERC20.waitForDeployment();
  const priceTokenAddress = await mockERC20.getAddress();
  console.log("MockERC20 deployed to:", priceTokenAddress);

  // Deploy RadishCore
  const RadishCore = await ethers.getContractFactory("RadishCore");
  const radishCore = await RadishCore.deploy(priceTokenAddress);
  await radishCore.waitForDeployment();
  const radishCoreAddress = await radishCore.getAddress();
  console.log("RadishCore deployed to:", radishCoreAddress);

  //   // Deploy YesToken
  const YesToken = await ethers.getContractFactory("YesToken");
  const yesToken = await YesToken.deploy(radishCoreAddress);
  await yesToken.waitForDeployment();
  const yesTokenAddress = await yesToken.getAddress();
  console.log("YesToken deployed to:", yesTokenAddress);

  //   // Deploy NoToken
  const NoToken = await ethers.getContractFactory("NoToken");
  const noToken = await NoToken.deploy(radishCoreAddress);
  await noToken.waitForDeployment();
  const noTokenAddress = await noToken.getAddress();
  console.log("NoToken deployed to:", noTokenAddress);

  //   // Set YesToken and NoToken in RadishCore
  await radishCore.setYesToken(yesTokenAddress);
  console.log("YesToken set in RadishCore");

  await radishCore.setNoToken(noTokenAddress);
  console.log("NoToken set in RadishCore");

  //   // Create a market
  const question = "Will it rain tomorrow?";
  const endTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  console.log("Market created with question:", question);
  const marketId = 0; // Assuming marketId is 0 for the first market
  await radishCore.createMarket(question, endTime);
  console.log("Market created with question:", question);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
