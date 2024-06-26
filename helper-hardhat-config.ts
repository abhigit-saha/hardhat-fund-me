const networkConfig: {
  [key: number]: {
    name: string;
    ethUsdPriceFeed: string;
    blockConfirmations: number;
  };
} = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    blockConfirmations: 3,
  },
};

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;
//this is the initial price that we set our mock price feed to

const developmentChains = ["hardhat", "localhost"];
export { DECIMALS, INITIAL_ANSWER, developmentChains, networkConfig };
