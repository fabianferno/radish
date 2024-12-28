// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./PredictionMarket.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./YesToken.sol";
import "./NoToken.sol";

contract RadishCore is Ownable {
    uint256 public marketCount;

    address public priceToken;
    address public yesToken;
    address public noToken;
    YesToken public yesTokenContract;
    NoToken public noTokenContract;

    event MarketCreated(
        uint256 id,
        string question,
        uint256 endTime,
        address marketContract
    );

    constructor(
        address _priceToken
    ) Ownable(msg.sender) {
        marketCount = 0;
        priceToken = _priceToken;
    }

    function setPriceToken(address _priceToken) public onlyOwner {
        priceToken = _priceToken;
    }

    function getPriceToken() public view returns (address) {
        return priceToken;
    }

    function setYesToken(address _yesToken) public onlyOwner {
        yesToken = _yesToken;
        yesTokenContract = YesToken(_yesToken);
    }

    function getYesToken() public view returns (address) {
        return yesToken;
    }

    function setNoToken(address _noToken) public onlyOwner {
        noToken = _noToken;
        noTokenContract = NoToken(_noToken);
    }

    function getNoToken() public view returns (address) {
        return noToken;
    }

    function createMarket(string memory _question, uint256 _endtime) public {
        // Create the market first
        PredictionMarket market = new PredictionMarket(
            priceToken,
            yesToken,
            noToken,
            marketCount,
            _question,
            _endtime
        );

        // Register the market with the token contracts
        yesTokenContract.addPredictionMarket(marketCount, address(market));
        noTokenContract.addPredictionMarket(marketCount, address(market));

        // Initialize the market after registration
        market.initializeLiquidity();

        marketCount++;

        emit MarketCreated(marketCount, _question, _endtime, address(market));
    }
}
