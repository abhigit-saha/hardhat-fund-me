import { network } from "hardhat";
import {
  networkConfig,
  developmentChains,
  INITIAL_ANSWER,
  DECIMALS,
} from "../helper-hardhat-config";

import hre from "hardhat";
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = hre.network.config.chainId;
  if (developmentChains.includes(network.name)) {
    log("This is a development chain, using mocks");
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });

    log("Deployed MockV3Aggregator on chain ", chainId);
    log("-----------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
//optionally deploy only mocks using a tag.
