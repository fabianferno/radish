// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {UD60x18, ud} from "@prb/math/src/UD60x18.sol";
import "./NoToken.sol";
import "./YesToken.sol";

contract PredictionMarket is Ownable, IERC1155Receiver {
    IERC20 public priceToken;
    YesToken public yesToken;
    NoToken public noToken;
    address public resolver;

    struct Market {
        uint256 id; // unique identifier for the market
        string question; // the question being asked
        uint256 endTime; // timestamp when the market ends
        uint256 totalStaked; // total amount of tokens staked
        uint256 totalYes; // total amount of tokens staked on YES
        uint256 totalNo; // total amount of tokens staked on NO
        bool resolved; // true if the market has been resolved
        bool won; // true if YES won, false if NO won
        uint256 totalPriceToken; // total amount of price token in the market (value of the entire market)
    }

    Market public market;

    // Constants for liquidity calculations
    uint256 private constant INITIAL_LIQUIDITY = 1000e18; // 1000 tokens of each type
    UD60x18 private immutable DECIMALS;
    UD60x18 private immutable LIQUIDITY_PARAMETER;

    // Market state variables
    UD60x18 public qYes = ud(0); // YES token quantity
    UD60x18 public qNo = ud(0); // NO token quantity


    event LiquidityAdded(
    address indexed provider,
    uint256 indexed marketId,
    uint256 amount
);

   event MarketResolved(
    uint256 indexed marketId,
    bool result, // true for YES, false for NO
    uint256 totalPriceToken
);
event RewardClaimed(
    address indexed user,
    uint256 indexed marketId,
    uint256 rewardAmount
);


    event TokenOperation(
        address indexed user,
        uint256 indexed marketId,
        uint8 opType, // 1: buy, 2: sell
        uint8 tokenType, // 1: yes, 2: no
        uint256 amount,
        uint256 cost
    );


    event EmergencyLiquidityAdded(
    address indexed owner,
    uint256 indexed marketId,
    uint256 amount
);


    constructor(
        address _priceToken,
        address _yesToken,
        address _noToken,
        uint256 _marketId,
        string memory _question,
        uint256 _endtime,
        address _creator
    ) Ownable(_creator) {
        DECIMALS = ud(1e18);
        LIQUIDITY_PARAMETER = ud(10e18);
        priceToken = IERC20(_priceToken);
        yesToken = YesToken(_yesToken);
        noToken = NoToken(_noToken);
        resolver = _creator;
        market = Market({
            id: _marketId,
            question: _question,
            endTime: _endtime,
            totalStaked: 0,
            totalYes: 0,
            totalNo: 0,
            resolved: false,
            won: false,
            totalPriceToken: 0
        });
    }

    modifier onlyResolver() {
        require(msg.sender == resolver, "Only resolver can call this function");
        _;
    }

    modifier marketActive() {
        require(!market.resolved, "Market is resolved");
        require(block.timestamp < market.endTime, "Market has ended");
        _;
    }

    function initializeLiquidity() public marketActive {
        require(
            qYes.unwrap() == 0 && qNo.unwrap() == 0,
            "Liquidity already initialized"
        );
        yesToken.mint(address(this), market.id, INITIAL_LIQUIDITY, "");
        noToken.mint(address(this), market.id, INITIAL_LIQUIDITY, "");
        qYes = ud(INITIAL_LIQUIDITY);
        qNo = ud(INITIAL_LIQUIDITY);
    }

    // IERC1155Receiver implementation
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }

    function resolve() public onlyResolver {
        require(block.timestamp >= market.endTime, "Market has not ended");
        require(!market.resolved, "Market already resolved");

        market.resolved = true;
        market.won = market.totalYes > market.totalNo;
        market.totalPriceToken = priceToken.balanceOf(address(this));

        emit MarketResolved(market.id, market.won , market.totalPriceToken);
    }

    /**
     * @notice Calculates the cost of purchasing a given amount of YES or NO tokens.
     * @param isYesToken Indicates if the token being purchased is YES (true) or NO (false).
     * @param amount The amount of tokens to purchase.
     * @return price The cost of the specified amount of tokens.
     */
    function getCost(
        bool isYesToken,
        UD60x18 amount
    ) public view returns (UD60x18 price) {
        require(amount.unwrap() > 0, "Amount must be greater than zero");

        // Current total cost
        UD60x18 totalCost = LIQUIDITY_PARAMETER.mul(
            qYes
                .div(LIQUIDITY_PARAMETER)
                .exp()
                .add(qNo.div(LIQUIDITY_PARAMETER).exp())
                .ln()
        );

        // New cost after adding the tokens
        UD60x18 newCost;
        if (isYesToken) {
            newCost = LIQUIDITY_PARAMETER.mul(
                qYes
                    .add(amount)
                    .div(LIQUIDITY_PARAMETER)
                    .exp()
                    .add(qNo.div(LIQUIDITY_PARAMETER).exp())
                    .ln()
            );
        } else {
            newCost = LIQUIDITY_PARAMETER.mul(
                qYes
                    .div(LIQUIDITY_PARAMETER)
                    .exp()
                    .add(qNo.add(amount).div(LIQUIDITY_PARAMETER).exp())
                    .ln()
            );
        }

        // Price is the difference between new and current costs
        price = newCost.sub(totalCost);
    }

    /**
     * @notice Buys YES or NO tokens by paying the required price in the price token.
     * @param isYesToken Indicates if the token being purchased is YES (true) or NO (false).
     * @param amount The amount of tokens to purchase.
     */
    function buy(bool isYesToken, UD60x18 amount) public marketActive {
        require(amount.unwrap() > 0, "Amount must be greater than zero");

        // Calculate cost using LMSR
        UD60x18 cost = getCost(isYesToken, amount);

        // Check liquidity first
        if (isYesToken) {
            require(
                yesToken.balanceOf(address(this), market.id) >= amount.unwrap(),
                "Insufficient liquidity"
            );
        } else {
            require(
                noToken.balanceOf(address(this), market.id) >= amount.unwrap(),
                "Insufficient liquidity"
            );
        }

        // Transfer price token from user (removed duplicate transfer)
        require(
            priceToken.transferFrom(msg.sender, address(this), cost.unwrap()),
            "Payment failed"
        );

        // Update state before transfer to prevent reentrancy
        if (isYesToken) {
            qYes = qYes.add(amount);
            market.totalYes = market.totalYes + amount.unwrap();
        } else {
            qNo = qNo.add(amount);
            market.totalNo = market.totalNo + amount.unwrap();
        }
        market.totalStaked = market.totalStaked + amount.unwrap();

        // Transfer prediction tokens to user
        if (isYesToken) {
            yesToken.safeTransferFrom(
                address(this),
                msg.sender,
                market.id,
                amount.unwrap(),
                ""
            );
        } else {
            noToken.safeTransferFrom(
                address(this),
                msg.sender,
                market.id,
                amount.unwrap(),
                ""
            );
        }

        emit TokenOperation(msg.sender, market.id, 1, isYesToken ? 1 : 2, amount.unwrap(),cost.unwrap());
    }

    function sell(bool isYesToken, UD60x18 amount) public marketActive {
        require(amount.unwrap() > 0, "Amount must be greater than zero");

        // Calculate return amount
        UD60x18 returnAmount = getCost(isYesToken, amount);

        // Check user balance first
        if (isYesToken) {
            require(
                yesToken.balanceOf(msg.sender, market.id) >= amount.unwrap(),
                "Insufficient balance"
            );
        } else {
            require(
                noToken.balanceOf(msg.sender, market.id) >= amount.unwrap(),
                "Insufficient balance"
            );
        }

        // Update state before transfers
        if (isYesToken) {
            qYes = qYes.sub(amount);
            market.totalYes = market.totalYes - amount.unwrap();
        } else {
            qNo = qNo.sub(amount);
            market.totalNo = market.totalNo - amount.unwrap();
        }
        market.totalStaked = market.totalStaked - amount.unwrap();

        // Transfer tokens from user to contract
        if (isYesToken) {
            yesToken.safeTransferFrom(
                msg.sender,
                address(this),
                market.id,
                amount.unwrap(),
                ""
            );
        } else {
            noToken.safeTransferFrom(
                msg.sender,
                address(this),
                market.id,
                amount.unwrap(),
                ""
            );
        }

        // Transfer price tokens back to user
        require(
            priceToken.transfer(msg.sender, returnAmount.unwrap()),
            "Return payment failed"
        );

        emit TokenOperation(msg.sender,market.id, 2, isYesToken ? 1 : 2, amount.unwrap(),returnAmount.unwrap());
    }

    function claimReward() public {
        require(market.resolved, "Market not resolved");

        uint256 reward = 0;
        if (market.won) {
            uint256 balance = yesToken.balanceOf(msg.sender, market.id);
            require(balance > 0, "No YES tokens held");
            reward = (balance * market.totalPriceToken) / market.totalYes;
            yesToken.burn(msg.sender, market.id, balance);
        } else {
            uint256 balance = noToken.balanceOf(msg.sender, market.id);
            require(balance > 0, "No NO tokens held");
            reward = (balance * market.totalPriceToken) / market.totalNo;
            noToken.burn(msg.sender, market.id, balance);
        }

        require(priceToken.transfer(msg.sender, reward), "Payment failed");

        emit RewardClaimed(msg.sender, market.id,reward);
    }

    // Emergency function to add liquidity if needed
    function addLiquidity(uint256 amount) external onlyOwner marketActive {
        yesToken.mint(address(this), market.id, amount, "");
        noToken.mint(address(this), market.id, amount, "");
        // Note: This should rarely/never be needed due to LMSR mechanics

        emit EmergencyLiquidityAdded(msg.sender, market.id, amount);
    }

    /**
     * @notice Gets the price of a given token (YES or NO) based on the market state.
     * @param isYesToken The type of token (true for YES, false for NO).
     * @return price The price of the token in fixed-point format.
     */
    function getTokenPrice(
        bool isYesToken
    ) public view returns (UD60x18 price) {
        UD60x18 numerator;
        UD60x18 denominator = qYes.div(LIQUIDITY_PARAMETER).exp().add(
            qNo.div(LIQUIDITY_PARAMETER).exp()
        );

        if (isYesToken) {
            numerator = qYes.div(LIQUIDITY_PARAMETER).exp();
        } else {
            numerator = qNo.div(LIQUIDITY_PARAMETER).exp();
        }

        price = numerator.div(denominator);
    }

    /**
     * @notice Returns the current state of the market.
     * @return marketState The current state of the market.
     */
    function getMarketState() public view returns (Market memory marketState) {
        return market;
    }

    /**
     * @notice Returns the current quantities of YES and NO tokens.
     * @return yesQuantity The current quantity of YES tokens.
     * @return noQuantity The current quantity of NO tokens.
     */
    function getTokenQuantities()
        public
        view
        returns (UD60x18 yesQuantity, UD60x18 noQuantity)
    {
        return (qYes, qNo);
    }

    /**
     * @notice Returns the current balances of the price token, YES token, and NO token for a given address.
     * @param account The address to query the balances for.
     * @return priceTokenBalance The balance of the price token.
     * @return yesTokenBalance The balance of the YES token.
     * @return noTokenBalance The balance of the NO token.
     */
    function getBalances(
        address account
    )
        public
        view
        returns (
            uint256 priceTokenBalance,
            uint256 yesTokenBalance,
            uint256 noTokenBalance
        )
    {
        priceTokenBalance = priceToken.balanceOf(account);
        yesTokenBalance = yesToken.balanceOf(account, market.id);
        noTokenBalance = noToken.balanceOf(account, market.id);
    }

    function setResolver(address newResolver) public onlyOwner {
        require(newResolver != address(0), "Invalid resolver address");
        resolver = newResolver;
    }
}
