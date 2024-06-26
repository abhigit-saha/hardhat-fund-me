import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";
import { contracts } from "../../typechain-types/@chainlink";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { Address } from "hardhat-deploy/dist/types";
import { AddressLike, GasCostPlugin } from "ethers";
import { GasData } from "hardhat-gas-reporter/dist/lib/gasData";
describe("FundMe", () => {
  let fundMe: FundMe;
  let deployer: AddressLike;
  let mockV3Aggregator: MockV3Aggregator;
  const sendAmount = ethers.parseEther("1");
  beforeEach(async () => {
    await deployments.fixture(["all"]);
    deployer = (await getNamedAccounts()).deployer;
    const fundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);

    const mockV3AggregatorDeployment = await deployments.get(
      "MockV3Aggregator"
    );
    mockV3Aggregator = await ethers.getContractAt(
      "MockV3Aggregator",
      mockV3AggregatorDeployment.address
    );
  });
  describe("constructor", () => {
    it("should set the address of the price feed", async () => {
      const priceFeedAddress = await fundMe.getPriceFeedAddress();
      const mockAggregatorAddress = await mockV3Aggregator.getAddress();
      assert.equal(priceFeedAddress, mockAggregatorAddress);
    });
  });
  describe("fund", () => {
    it("Fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.reverted;
    });

    it("updates the amount funded data structure", async () => {
      await fundMe.fund({ value: sendAmount });
      const amountFunded = await fundMe.s_addressToAmountFunded(deployer);
      assert.equal(amountFunded.toString(), sendAmount.toString());
    });

    it("should update the s_funders array correctly", async () => {
      await fundMe.fund({ value: sendAmount });
      const funder = await fundMe.s_funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendAmount });
    });
    it("Withdraw ETH from a single funder", async () => {
      //arrange
      const initialDeployerBalance = await ethers.provider.getBalance(deployer);
      const address = await fundMe.getAddress();
      const initialFundMeBalance = await ethers.provider.getBalance(address);

      //act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      const gasUsed = transactionReceipt?.gasUsed;
      const gasPrice = transactionReceipt?.gasPrice;

      if (gasPrice === undefined || gasUsed === undefined) {
        throw new Error("Gas price or gas used is undefined");
      }

      const gasCost = BigInt(gasUsed) * BigInt(gasPrice);

      const finalDeployerBalance = await ethers.provider.getBalance(deployer);
      const finalFundMeBalance = await ethers.provider.getBalance(address);

      //assert
      assert.equal(finalFundMeBalance, 0n);
      assert.equal(
        (initialDeployerBalance + initialFundMeBalance).toString(),
        (finalDeployerBalance + gasCost).toString()
      );
    });

    it("Allows us to withdraw ETH from multiple s_funders", async () => {
      //Arrange
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 3; i++) {
        const account = accounts[i];
        await fundMe.connect(account).fund({ value: sendAmount });
      }

      //Act
      const initialDeployerBalance = await ethers.provider.getBalance(deployer);
      const address = await fundMe.getAddress();
      const initialFundMeBalance = await ethers.provider.getBalance(address);

      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      const gasUsed = transactionReceipt?.gasUsed;
      const gasPrice = transactionReceipt?.gasPrice;

      if (gasPrice === undefined || gasUsed === undefined) {
        throw new Error("Gas price or gas used is undefined");
      }

      const gasCost = BigInt(gasUsed) * BigInt(gasPrice);

      const finalDeployerBalance = await ethers.provider.getBalance(deployer);
      const finalFundMeBalance = await ethers.provider.getBalance(address);

      //assert
      assert.equal(finalFundMeBalance, 0n);
      assert.equal(
        (initialDeployerBalance + initialFundMeBalance).toString(),
        (finalDeployerBalance + gasCost).toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      //asserting that for each account that funded, after withdrawal funded array has
      //0 eth.
      for (let i = 1; i < 3; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(await accounts[i].getAddress()),
          0n
        );
      }
    });

    it("Should only allow the deployer to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });
  });
});
