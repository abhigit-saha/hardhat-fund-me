import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@nomicfoundation/hardhat-verify";
import { network } from "hardhat";
// import "./tasks/block-number";
import "hardhat-gas-reporter";
// import "solidity-coverage";
import "hardhat-deploy";

const SEPOLIA_PRIVATE_KEY = process.env?.SEPOLIA_PRIVATE_KEY?.toString();
const SEPOLIA_RPC_URL = process.env?.SEPOLIA_RPC_URL?.toString();
const COINMARKETCAP_API_KEY = process.env?.COINMARKETCAP_API_KEY?.toString();
const ETHERSCAN_API_KEY = process.env?.ETHERSCAN_API_KEY?.toString();
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  //we can specify multiple versions using
  //solidity: compilers: [{version: "0.8.24"}, {version: "0.6.6"]
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY as string],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report",
    noColors: true,
  },
};

export default config;
