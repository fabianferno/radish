// scripts/deploy.js

const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Step 1: Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Step 2: Deploy the MockERC20 (USDC)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy("USD Coin", "USDC");
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("MockERC20 (USDC) deployed to:", mockUSDCAddress);

  // Step 3: Deploy YesToken and NoToken
  const YesToken = await ethers.getContractFactory("YesToken");
  const NoToken = await ethers.getContractFactory("NoToken");

  const yesToken = await YesToken.deploy(deployer.address);
  await yesToken.waitForDeployment();
  const yesTokenAddress = await yesToken.getAddress();

  const noToken = await NoToken.deploy(deployer.address);
  await noToken.waitForDeployment();
  const noTokenAddress = await noToken.getAddress();

  console.log("YesToken deployed to:", yesTokenAddress);
  console.log("NoToken deployed to:", noTokenAddress);

  // Step 4: Deploy the RadishCore contract
  const RadishCore = await ethers.getContractFactory("RadishCore");
  const radishCore = await RadishCore.deploy(
    mockUSDCAddress,
    yesTokenAddress,
    noTokenAddress
  );
  console.log("RadishCore deployed to:", radishCore.address);

  await radishCore.waitForDeployment();
  const radishCoreAddress = await radishCore.getAddress();
  console.log("RadishCore deployed to:", radishCoreAddress);

  // Step 5: Transfer ownership of YesToken and NoToken to RadishCore
  await yesToken.transferOwnership(radishCoreAddress);
  await noToken.transferOwnership(radishCoreAddress);
  console.log("Ownership of YesToken and NoToken transferred to RadishCore");

  // Step 6: Create a market in RadishCore
  const question = "Will BTC reach $150k in 2024?";
  const endTime = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now

  const createMarketTx = await radishCore.createMarket(question, endTime);
  console.log("Market creation transaction:", createMarketTx.hash);

  // Wait for the transaction to be mined
  await createMarketTx.wait();
  console.log("Market creation confirmed");

  // Step 7: Verify the deployed contract on Etherscan (if on a live network)
  // if (hre.network.name !== "hardhat") {
  //   console.log("Verifying contract on Etherscan...");

  // await hre.run("verify:verify", {
  //   address: "0x162138B58C6f96C7fdA8898fF53D6Cb3449cA733",
  //   constructorArguments: [
  //     "0xC6897b67b320bfBA53Ef3ADe6E69A7DA5C49789E",
  //     "0xcf1fFf035Ca960119D915c97524b828832D8d3a8",
  //     "0x59b8d2771ddA615F117FB24Ff942b0A978dd14de",
  //     0,
  //     "Will BTC reach $150k in 2024?",
  //     1738161110,
  //     "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
  //   ],
  // });

  // const yesTokenAddress = await yesToken.getAddress();
  // const noTokenAddress = await noToken.getAddress();

  // await hre.run("verify:verify", {
  //   address: yesTokenAddress,
  //   constructorArguments: [deployer.address],
  // });

  // await hre.run("verify:verify", {
  //   address: noTokenAddress,
  //   constructorArguments: [deployer.address],
  // });

  // await hre.run("verify:verify", {
  //   address: mockUSDCAddress,
  //   constructorArguments: ["USD Coin", "USDC"],
  // });

  // console.log("Contract successfully verified on Etherscan");
  // } else {
  //   console.log("Skipping verification as this is a local deployment.");
  // }
}

// Run the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//   await mockUSDC.mint(deployer.address, ethers.utils.parseEther("1000"));
//   await mockUSDC.approve(radishCore.address, ethers.utils.parseEther("1000"));
