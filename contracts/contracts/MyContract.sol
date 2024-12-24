// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { UD60x18, ud } from "@prb/math/src/UD60x18.sol";


contract PredictionMarket is ERC1155, Ownable {
    // using { mul, div, ln, exp } for UD60x18;

    IERC20 public priceToken;

    // Constants for liquidity calculations
    UD60x18 public  DECIMALS = ud(1000000000000000000);
    UD60x18 public  LIQUIDITY_PARAMETER = ud(10000000000000000000);

    // Tokens
    uint256 public constant YES_TOKEN = 1;
    uint256 public constant NO_TOKEN = 2;

    // Market state variables
    UD60x18 public qYes = ud(0); // YES token quantity
    UD60x18 public qNo = ud(0);  // NO token quantity

    event LiquidityAdded(address indexed provider, uint256 amount);
    event TokensPurchased(address indexed buyer, uint256 tokenType, uint256 amount);

    constructor(address _priceToken) ERC1155("") Ownable(0xe5CaA785FEe2154E5cddc15aC37eEDf0274ad5A2) {
        priceToken = IERC20(_priceToken);
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
        UD60x18 cost = getCost(isYesToken, amount);

        require(priceToken.transferFrom(msg.sender, address(this), cost.unwrap()), "Payment failed");

        if (isYesToken) {
            _mint(msg.sender, YES_TOKEN, amount.unwrap(), "");
            qYes = qYes.add(amount);
        } else {
            _mint(msg.sender, NO_TOKEN, amount.unwrap(), "");
            qNo = qNo.add(amount);
        }

        emit TokensPurchased(msg.sender, isYesToken ? YES_TOKEN : NO_TOKEN, amount.unwrap());
    }

    /**
     * @notice Gets the price of a given token (YES or NO) based on the market state.
     * @param tokenType The type of token (1 for YES, 2 for NO).
     * @return price The price of the token in fixed-point format.
     */
    function getTokenPrice(uint256 tokenType) public view returns (UD60x18 price) {
        require(tokenType == YES_TOKEN || tokenType == NO_TOKEN, "Invalid token type");

        UD60x18 numerator;
        UD60x18 denominator = qYes.div(LIQUIDITY_PARAMETER).exp().add(qNo.div(LIQUIDITY_PARAMETER).exp());

        if (tokenType == YES_TOKEN) {
            numerator = qYes.div(LIQUIDITY_PARAMETER).exp();
        } else {
            numerator = qNo.div(LIQUIDITY_PARAMETER).exp();
        }

        price = numerator.div(denominator);
    }
}
