import { ethers, getNamedAccounts, deployments } from "hardhat";

async function main() {
  const fundMe = await deployments.get("FundMe");
  const fundMeContract = await ethers.getContractAt("FundMe", fundMe.address);
  const { deployer } = await getNamedAccounts();
  console.log("Withdrawing...");
  const transactionResponse = await fundMeContract.withdraw();
  await transactionResponse.wait(1);
  console.log("Withdrawn!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
