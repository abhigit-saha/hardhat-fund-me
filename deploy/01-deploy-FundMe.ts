// import { network } from "hardhat";
// import {
//   networkConfig,
//   developmentChains,
//   INITIAL_ANSWER,
//   DECIMALS,
// } from "../helper-hardhat-config";

// import { verify } from "../utils/verify";
// import "dotenv/config";
// import hre from "hardhat";
// module.exports = async ({ getNamedAccounts, deployments }) => {
//   //deploy: function to deploy the contract
//   //log: function to log the deployment
//   //deployer: the address that is going to deploy the contract
//   //getNamedAccounts: in hardhat.config we can specify a name account as an index that we are going to access
//   const { deploy, log } = deployments;
//   const { deployer } = await getNamedAccounts();
//   const chainId = hre.network.config.chainId;

//   //since our default network is hardhat, we cannot use it and get the latest price data
//   //so we either can use forked testnet or mock the price feed.

//   let ethUsdPriceFeedAddress;
//   if (developmentChains.includes(network.name)) {
//     //if we have already deployed the mock price feed, we can get the address from the network

//     const ethAggregator = await deployments.get("MockV3Aggregator");
//     ethUsdPriceFeedAddress = ethAggregator.address;
//   } else {
//     //if we are not in a development chain, we can get the address from the network config
//     ethUsdPriceFeedAddress = networkConfig[chainId as number].ethUsdPriceFeed;
//     // console.log(chainId);
//   }

//   //this is going to deploy
//   const fundMe = await deploy("FundMe", {
//     from: deployer,
//     args: [ethUsdPriceFeedAddress],
//     log: true,
//     waitConfirmations: networkConfig[chainId as number].blockConfirmations,
//     //   //this is to wait for a certain number of block confirmations before etherscan verifies the contract
//     //   //google: to prevent against reorg attack.
//   });

//   if (
//     !developmentChains.includes(network.name) &&
//     process.env.ETHERSCAN_API_KEY
//   ) {
//     await verify(fundMe.address, [ethUsdPriceFeedAddress]);
//   }

//   log("-----------------------------------------------");
// };

// module.exports.tags = ["all", "fundme"];

// //note: very helpful feature: when we create our own node, hardhat will deploy our contracts
// //using our deploy scripts and add them to our node
import { network } from "hardhat";
import {
  networkConfig,
  developmentChains,
  INITIAL_ANSWER,
  DECIMALS,
} from "../helper-hardhat-config";
import { verify } from "../utils/verify";
import "dotenv/config";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId === undefined) {
    throw new Error(
      "ChainId is undefined. Please check your network configuration."
    );
  }

  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethAggregator.address;
  } else {
    ethUsdPriceFeedAddress =
      chainId in networkConfig ? networkConfig[chainId].ethUsdPriceFeed : null;

    if (!ethUsdPriceFeedAddress) {
      throw new Error(
        `No ethUsdPriceFeed address defined for chainId ${chainId}`
      );
    }
  }

  const waitConfirmations =
    chainId in networkConfig
      ? networkConfig[chainId].blockConfirmations || 1
      : 1;

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: waitConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }

  log("-----------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
