//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // to get the price of ethereum in usd
    function getPrice(
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        //since this is a function that gets access to stuff outside our contract
        //we need to have its: ABI and address
        //so we imported this from github

        (
            ,
            /* uint80 roundID */ int answer /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = _priceFeed.latestRoundData();

        return uint256(answer * 1e10); //conversion to have 10 decimal places and be uint256 for the require
        //comparision to work.
    }
    function getConversionRate(
        uint256 _ethAmount,
        AggregatorV3Interface _priceFeed
    ) internal view returns (uint256) {
        uint256 ethRate = getPrice(_priceFeed);
        uint256 ethInUSD = (ethRate * _ethAmount) / 1e18; //since solidity doesn't handle decimals
        //both ethrate and _ethamount have 18 zeros at their end, so multiplying has 36 zeros.
        //so we divide.
        return ethInUSD;
    }
}
