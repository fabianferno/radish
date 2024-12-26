// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { UD60x18, ud } from "@prb/math/src/UD60x18.sol";
import "./NoToken.sol";
import "./YesToken.sol";


contract PredictionMarket is  Ownable {

    IERC20 public priceToken;
    YesToken public yesToken;
    NoToken public noToken;
    address resolver = 0xe5CaA785FEe2154E5cddc15aC37eEDf0274ad5A2;


    struct Market {
        uint256 id;  // unique identifier for the market
        string question; // the question being asked
        uint256 endTime; // timestamp when the market ends
        uint256 totalStaked; // total amount of tokens staked
        uint256 totalYes; // total amount of tokens staked on YES
        uint256 totalNo; // total amount of tokens staked on NO
        bool resolved; // true if the market has been resolved
        bool won;  // true if YES won, false if NO won
        uint256 totalPriceToken; // total amount of price token in the market (value of the entire market)
    }

    Market public market;

    // Constants for liquidity calculations
    UD60x18 public  DECIMALS = ud(1000000000000000000);
    UD60x18 public  LIQUIDITY_PARAMETER = ud(10000000000000000000);


    // Market state variables
    UD60x18 public qYes = ud(0); // YES token quantity
    UD60x18 public qNo = ud(0);  // NO token quantity

    event LiquidityAdded(address indexed provider, uint256 amount);
    event TokensPurchased(address indexed buyer, uint256 tokentype, uint256 amount);
    event TokensSold(address indexed seller, uint256 tokentype, uint256 amount);
    event yesTokenbalance(uint256 balance);

    constructor(address _priceToken , address _yesToken , address _noToken , uint256 _marketId , string memory _question , uint256 _endtime) Ownable(0xe5CaA785FEe2154E5cddc15aC37eEDf0274ad5A2) {
        priceToken = IERC20(_priceToken);
        yesToken = YesToken(_yesToken);
        noToken = NoToken(_noToken);
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
    
    /**
     * @notice Votes on a given market by staking tokens on YES or NO.
     * @param isYesToken Indicates if the token being staked is YES (true) or NO (false).
     * @param amount the amount of tokens to stake.
     */

    function vote(bool isYesToken, UD60x18 amount) public {
        // require(block.timestamp < market.endTime, "Voting has ended");
        require(amount.unwrap() > 0, "Amount must be greater than zero");

        if (isYesToken) {
            emit yesTokenbalance (yesToken.balanceOf(msg.sender, market.id));
            require(yesToken.balanceOf(msg.sender, market.id) >= amount.unwrap(), "Insufficient balance");
            yesToken.burn(msg.sender, market.id, amount.unwrap());
            qYes = qYes.add(amount);
            market.totalYes = market.totalYes + amount.unwrap();
        } else {
            require(noToken.balanceOf(msg.sender, market.id) >= amount.unwrap(), "Insufficient balance");
            noToken.burn(msg.sender, market.id, amount.unwrap());
            qNo = qNo.add(amount);
            market.totalNo = market.totalNo + amount.unwrap();
        }
        market.totalStaked = market.totalStaked + amount.unwrap();
    }

    function resolve() public onlyResolver{
        // require(block.timestamp >= market.endTime, "Voting has not ended");
        require(!market.resolved, "Market already resolved");
        market.resolved = true;
        market.won = market.totalYes > market.totalNo;
        market.totalPriceToken = priceToken.balanceOf(address(this));
    }

    /**
     * @notice Calculates the cost of purchasing a given amount of YES or NO tokens.
     * @param isYesToken Indicates if the token being purchased is YES (true) or NO (false).
     * @param amount The amount of tokens to purchase.
     * @return price The cost of the specified amount of tokens.
     */
    function getCost(bool isYesToken, UD60x18 amount) public view returns (UD60x18 price) {
        require(amount.unwrap() > 0, "Amount must be greater than zero");

        // Current total cost
        UD60x18 totalCost = LIQUIDITY_PARAMETER.mul(
            qYes.div(LIQUIDITY_PARAMETER).exp().add(qNo.div(LIQUIDITY_PARAMETER).exp()).ln()
        );

        // New cost after adding the tokens
        UD60x18 newCost;
        if (isYesToken) {
            newCost = LIQUIDITY_PARAMETER.mul(
                qYes.add(amount).div(LIQUIDITY_PARAMETER).exp().add(qNo.div(LIQUIDITY_PARAMETER).exp()).ln()
            );
        } else {
            newCost = LIQUIDITY_PARAMETER.mul(
                qYes.div(LIQUIDITY_PARAMETER).exp().add(qNo.add(amount).div(LIQUIDITY_PARAMETER).exp()).ln()
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
    function buy(bool isYesToken, UD60x18 amount) public {

        require(amount.unwrap() > 0, "Amount must be greater than zero");
        require(!market.resolved, "Market already resolved");
        require(amount.unwrap() <= 1000000000000000000 , "Minimum you should buy atleast 1 tokens");
        require(amount.unwrap() <= 10000000000000000000 , "Maximum you can buy only 10 tokens at a time");

        UD60x18 cost = getCost(isYesToken, amount);

        require(priceToken.balanceOf(msg.sender) >= cost.unwrap(), "Insufficient balance");
        require (priceToken.allowance(msg.sender, address(this)) >= cost.unwrap(), "Insufficient allowance");
        require(priceToken.transferFrom(msg.sender, address(this), cost.unwrap()), "Payment failed");



        if (isYesToken) {
            yesToken.mint(msg.sender, market.id, amount.unwrap(), "");
            // _mint(msg.sender, YES_TOKEN, amount.unwrap(), "");
            qYes = qYes.add(amount);
            market.totalYes = market.totalYes + amount.unwrap();
        } else {
            noToken.mint(msg.sender, market.id, amount.unwrap(), "");
            // _mint(msg.sender, NO_TOKEN, amount.unwrap(), "");
            qNo = qNo.add(amount);
            market.totalNo = market.totalNo + amount.unwrap();
        }

        market.totalStaked = market.totalStaked + amount.unwrap();
        emit TokensPurchased(msg.sender, isYesToken ?  1: 2, amount.unwrap());
    }


    function sell(bool isYesToken , UD60x18 amount) public {
        require(amount.unwrap() > 0, "Amount must be greater than zero");
        require(!market.resolved, "Market already resolved");

        if (isYesToken) {
            require(yesToken.balanceOf(msg.sender, market.id) >= amount.unwrap(), "Insufficient balance");
            yesToken.transfer(address(this), market.id, amount.unwrap());
            qYes = qYes.sub(amount);
            market.totalYes = market.totalYes - amount.unwrap();
        } else {
            require(noToken.balanceOf(msg.sender, market.id) >= amount.unwrap(), "Insufficient balance");
            noToken.transfer(address(this), market.id, amount.unwrap());
            qNo = qNo.sub(amount);
            market.totalNo = market.totalNo - amount.unwrap();
        }
        market.totalStaked = market.totalStaked - amount.unwrap();
        emit TokensSold(msg.sender, isYesToken ?  1: 2, amount.unwrap());
    }

    function claimReward() public {
        require(market.resolved, "Market not resolved");
        

        if (market.won) {
            require(yesToken.balanceOf(msg.sender, market.id) > 0, "No YES tokens staked");
            uint256 reward = yesToken.balanceOf(msg.sender, market.id) * market.totalPriceToken / market.totalYes;
            require(priceToken.transfer(msg.sender , reward), "Payment failed");
            yesToken.burn(msg.sender, market.id, yesToken.balanceOf(msg.sender, market.id));

        } else {
            require(noToken.balanceOf(msg.sender, market.id) > 0, "No NO tokens staked");
            uint256 reward = noToken.balanceOf(msg.sender, market.id) * market.totalPriceToken / market.totalNo;
            require(priceToken.transfer(msg.sender , reward), "Payment failed");
            noToken.burn(msg.sender, market.id, noToken.balanceOf(msg.sender, market.id));
        }

    }

    

    /**
     * @notice Gets the price of a given token (YES or NO) based on the market state.
     * @param isYesToken The type of token (true for YES, false for NO).
     * @return price The price of the token in fixed-point format.
     */
    function getTokenPrice(bool isYesToken) public view returns (UD60x18 price) {

        UD60x18 numerator;
        UD60x18 denominator = qYes.div(LIQUIDITY_PARAMETER).exp().add(qNo.div(LIQUIDITY_PARAMETER).exp());

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
    function getTokenQuantities() public view returns (UD60x18 yesQuantity, UD60x18 noQuantity) {
        return (qYes, qNo);
    }

    /**
     * @notice Returns the current balances of the price token, YES token, and NO token for a given address.
     * @param account The address to query the balances for.
     * @return priceTokenBalance The balance of the price token.
     * @return yesTokenBalance The balance of the YES token.
     * @return noTokenBalance The balance of the NO token.
     */
    function getBalances(address account) public view returns (uint256 priceTokenBalance, uint256 yesTokenBalance, uint256 noTokenBalance) {
        priceTokenBalance = priceToken.balanceOf(account);
        yesTokenBalance = yesToken.balanceOf(account, market.id);
        noTokenBalance = noToken.balanceOf(account, market.id);
    }
}
