export const OPTIMISM_SEPOLIA_CHAIN_ID = 11155420;

export const CONTRACT_ADDRESSES: {
  [key: number]: { [key: string]: `0x${string}` };
} = {
  [OPTIMISM_SEPOLIA_CHAIN_ID]: {
    radishCore: "0x19007A71a4c073a73711Ed8EE19c163b777F3eCf",
    mockERC20: "0x78E3299b89caa35F6C3e4986C219b6a241D520DC",
    yesToken: "0x9F28d3b77dc58B20e54Df4ff0c45b139Fc65fBad",
    noToken: "0x518c3e4e5CEf69e5C51ABb5CB443E99C1579dF65",
  },
};

// Simplified ABI with just the functions we need
export const RADISH_CORE_ABI = [
  "function createMarket(string memory _question, uint256 _endtime) public",
  "function marketCount() public view returns (uint256)",
] as const;

export const PREDICTION_MARKET_ABI = [
  "function market() public view returns (tuple(uint256 id, string question, uint256 endTime, uint256 totalStaked, uint256 totalYes, uint256 totalNo, bool resolved, bool won, uint256 totalPriceToken))",
  "function buy(bool isYesToken, uint256 amount) public",
  "function sell(bool isYesToken, uint256 amount) public",
  "function getTokenPrice(bool isYesToken) public view returns (uint256)",
  "function getBalances(address account) public view returns (uint256 priceTokenBalance, uint256 yesTokenBalance, uint256 noTokenBalance)",
  "function resolve() public",
] as const;

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function allowance(address owner, address spender) public view returns (uint256)",
] as const;
