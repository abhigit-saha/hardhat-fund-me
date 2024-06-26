//get funds from users
//withdraw funds
//set a minimum funding value in usd

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
//note: contracts and wallets both can hold funds

import "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256; //this is a library
    uint256 public constant MINIMUM_USD = 50 * 1e18; //constant for variables that remain const. saves gas

    //storage variables take up a lot of gas when being stored or loaded
    //so we prefix them by s_
    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;
    address public immutable i_owner; //for variables that remain constant after being initialized in a function
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        if (i_owner != msg.sender) revert FundMe__NotOwner();
        _; // this refers to the actual function being executed.
        //we can also define an error notOwner() at the top of the file
        //and use an if statement to revert to the error
    }

    constructor(address _priceFeedAddress) {
        //just like classes' constructor, called right when the contract is deployed.
        i_owner = msg.sender; //msg.sender is whoever deploys this contract.
        s_priceFeed = AggregatorV3Interface(_priceFeedAddress); //this is done to modularize the priceFeed
        //so if we want to change the priceFeedAddress, we don't have to hardcode it, we can just pass it
        //as a parameter to the constructor.
    }

    //receive and fallback used for when sent money but fund is not called.

    //receive: called when ether is sent to the contract without any data
    //fallback: called when ether is sent to the contract with data but no function to call.
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
    function fund() public payable {
        //some operation before (the operation would be executed but would be undo'ed if reverted.
        //but gas would still be charged.
        require(
            msg.value.getConversionRate(s_priceFeed) > MINIMUM_USD,
            "Not enough wei sent"
        );
        //note: we can write .getConversionRate() because we have imported PriceConvertor for uint256
        //and basically we can access all of the libraries functions as methods of uint256.
        //getConversionRate(msg.value, sthing) => msg.value.getConversionRate(sthing)
        //reverts: undos the previous acton and sends back the remaining gas

        //some operation after (here the gas would be returned)
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        //clearing the funded amount
        for (uint256 i = 0; i < s_funders.length; i++) {
            s_addressToAmountFunded[s_funders[i]] = 0;
        }

        s_funders = new address[](0); //resetting the funders array as a new address array of 0 objects

        //there are three different ways to withdraw/exchange money-> transfer, call, send
        //transfer
        //payable: payable address. transferring this contract's balance.
        // payable(msg.sender).transfer(address(this).balance);

        //send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "send failed"); //send returns sendSuccess

        //call
        (bool callSuccess /*bytes memory dataReturned*/, ) = payable(msg.sender)
            .call{value: address(this).balance}(""); //it calls a function inside parenthesis
        //if we don't have any function to call leave it blank.
        require(callSuccess, "call failed"); //call returns callSuccess, and data after executing a function
        //note: most of the time call is the recommended way
    }

    function getPriceFeedAddress() public view returns (address) {
        return address(s_priceFeed);
    }

    //note be sure to check these out
    //enums
    //events
    //try catch
    //function selectors
    //abi.encode decode
    //hashing
    //yul assembly
}
