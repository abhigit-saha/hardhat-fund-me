import { ethers, getNamedAccounts, deployments } from "hardhat";

async function main() {
  const fundMe = await deployments.get("FundMe");
  const { deployer } = await getNamedAccounts();
  //ig it is by default setting the deployer as the account that is funding the contract
  const fundMeContract = await ethers.getContractAt("FundMe", fundMe.address);

  console.log("Funding contract...");
  const transactionResponse = await fundMeContract.fund({
    value: ethers.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Contract funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
  });
