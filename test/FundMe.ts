// mocha chai
import hre, { ethers } from "hardhat";
import { expect } from "chai";

describe("test fundMe contract", async () => {
  it("test constructor owner is msg.sender", async () => {
    const [firstAccount] = await hre.ethers.getSigners();
    const factory = await ethers.getContractFactory("FundMe");
    const fundMe = await factory.connect(firstAccount).deploy(180);
    await fundMe.waitForDeployment();
    const owner = await fundMe.owner();
    expect(owner).equal(firstAccount.address);
  });
});
