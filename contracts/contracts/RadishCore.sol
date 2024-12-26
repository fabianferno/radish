// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./PredictionMarket.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RadishCore is Ownable{
    uint256 public marketCount;

    address public priceToken; 
    address public yesToken;
    address public noToken;

    event MarketCreated(uint256 id, string question, uint256 endTime , address marketContract);


    constructor( address _priceToken , address _yesToken , address _noToken) Ownable(msg.sender) {
        marketCount = 0;
        priceToken = _priceToken;
        yesToken = _yesToken;
        noToken = _noToken;
    }

    function setPriceToken(address _priceToken) public onlyOwner {
        priceToken = _priceToken;
    }

    function getPriceToken() public view returns (address) {
        return priceToken;
    }

    function setYesToken(address _yesToken) public onlyOwner {
        yesToken = _yesToken;
    }

    function getYesToken() public view returns (address) {
        return yesToken;
    }

    function setNoToken(address _noToken) public onlyOwner {
        noToken = _noToken;
    }

    function getNoToken() public view returns (address) {
        return noToken;
    }

    function createMarket(
        string memory _question,
        uint256 _endtime
    ) public {
        PredictionMarket market = new PredictionMarket(priceToken, yesToken, noToken, marketCount, _question, _endtime);
        marketCount++;
        emit MarketCreated(marketCount, _question, _endtime, address(market));
    }
}