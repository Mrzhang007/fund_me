// mocha chai
import { deployments, ethers } from "hardhat";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FundMe } from "../../typechain-types";

describe("test fundMe contract", async () => {
  let firstAccount: HardhatEthersSigner;
  let fundMe: FundMe;

  beforeEach(async () => {
    await deployments.fixture("all");
    const accounts = await ethers.getSigners();
    firstAccount = accounts[0];
    const fundMeDeployment = await deployments.get("FundMe");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
  });

  it("test constructor owner is msg.sender", async () => {
    await fundMe.waitForDeployment();
    const owner = await fundMe.owner();
    expect(owner).to.equal(firstAccount.address);
  });

  it("test fund when fund closed", async () => {
    // fundMe is closed
    // 增加时间
    await ethers.provider.send("evm_increaseTime", [200]);
    // 挖出新区块
    await ethers.provider.send("evm_mine", []);
    // // 模拟时间流逝
    // await helpers.time.increase(200);
    // // 模拟挖矿
    // await helpers.mine();
    // 最少100 usd  1eth = 3600 usd 那么必须要0.0278 eth
    await expect(
      fundMe.fund({
        value: ethers.parseEther("0.05"),
      })
    ).to.be.revertedWith(`fund is closed, you can't call this function`);
  });

  it("test fund when value less then 100USD", async () => {
    expect(
      fundMe.fund({ value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("you should fund 100USD at least");
  });

  it("test fund success, when fund open and value large then 100USD ", async () => {
    // 获取fund之前的余额
    const fundBeforeBalance = await fundMe.fundAddressToAmount(
      firstAccount.address
    );
    await fundMe.fund({
      value: ethers.parseEther("0.05"),
    });
    // 1、solidity 的 public mapping 会自动生成一个 getter 函数
    // 2、getter 函数会返回 mapping 的值
    // 3、ethers.js 将这个方法暴露为一个函数，而不是一个对象属性
    // 4、所以需要使用 fundMe.fundAddressToAmount(firstAccount.address) 来访问。而不是使用js的对象属性访问
    const amount = await fundMe.fundAddressToAmount(firstAccount.address);
    // 更建议使用 to.equal 来比较两个值
    expect(amount).to.equal(ethers.parseEther("0.05") + fundBeforeBalance);
  });

  // test refund
  it("test refund failed when fund open", async () => {
    expect(fundMe.refund()).to.be.revertedWith(
      `fund is open, you can't call this function`
    );
  });

  it("test refund failed when fund closed but target is reached", async () => {
    // 先fund 500USD to reached target; 500/3600 = 0.1388888888888889
    await fundMe.fund({
      value: ethers.parseEther("0.2"),
    });
    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    expect(fundMe.refund()).to.be.revertedWith(
      `The target value was reached, you can't refund`
    );
  });
});
