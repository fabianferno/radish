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
        address marketContract,
        address priceToken,
        address yesToken,
        address noToken
    );

    constructor(
        address _priceToken,
        address _yesToken,
        address _noToken
    ) Ownable(msg.sender) {
        marketCount = 0;
        priceToken = _priceToken;
        yesToken = _yesToken;
        noToken = _noToken;
        yesTokenContract = YesToken(_yesToken);
        noTokenContract = NoToken(_noToken);
    }

    function setPriceToken(address _priceToken) public onlyOwner {
        priceToken = _priceToken;
    }

    function setYesToken(address _yesToken) public onlyOwner {
        yesToken = _yesToken;
    }

    function setNoToken(address _noToken) public onlyOwner {
        noToken = _noToken;
    }

    function createMarket(string memory _question, uint256 _endtime) public {
        // Create the market first
        PredictionMarket market = new PredictionMarket(
            priceToken,
            yesToken,
            noToken,
            marketCount,
            _question,
            _endtime,
            msg.sender
        );

        // Register the market with the token contracts
        yesTokenContract.addPredictionMarket(marketCount, address(market));
        noTokenContract.addPredictionMarket(marketCount, address(market));

        // Initialize the market after registration
        market.initializeLiquidity();


        emit MarketCreated(marketCount, _question, _endtime, address(market) , priceToken, yesToken, noToken);
        marketCount++;
    }
}
