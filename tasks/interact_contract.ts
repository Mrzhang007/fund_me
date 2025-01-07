import { task } from "hardhat/config";
import { Addressable } from "ethers";
import { FundMe } from "../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FUND_ME_LOCK_TIME } from "../helper.hardhat.config";

interface Args {
  address: string | Addressable;
  locktime?: string;
}

const InteractContract = task<Args>(
  "interact_contract",
  "check interact contract"
)
  .addParam<string>("address", "contract address")
  .addParam<string>("locktime", "contract lock time", FUND_ME_LOCK_TIME)
  .setAction(async (taskArgs: Args, hre: HardhatRuntimeEnvironment) => {
    console.log("interact_contract tasks params: ", taskArgs);
    const contractAddress = taskArgs.address;

    const factory = await hre.ethers.getContractFactory("FundMe");
    const fundMe = factory.attach(contractAddress) as FundMe;

    // 验证与合约交互、
    // 1、使用第一个钱包账户fund。
    // 获取signer
    const [firstSigner, secondSigner] = await hre.ethers.getSigners();
    // eth价格3620 usd 0.04 eth = 144.8 usd
    const firstFundTx = await fundMe.connect(firstSigner).fund({
      value: hre.ethers.parseEther("0.1"),
    });
    //fund只能保证发送交易成功 还需等待交易完成、交易上链
    await firstFundTx.wait();
    // 2、检查contact balance。
    const balance = await hre.ethers.provider.getBalance(contractAddress);
    console.log(`contact balance is: ${balance}`);
    // 3、使用第二个钱包账户fund。
    const secondFundTx = await fundMe.connect(secondSigner).fund({
      value: hre.ethers.parseEther("0.15"),
    });
    await secondFundTx.wait();
    // 4、检查contact balance。
    const balanceAfterSecondAccountFund = await hre.ethers.provider.getBalance(
      contractAddress
    );
    console.log(
      `contact balance is: ${balanceAfterSecondAccountFund} after second account fund`
    );
    // 5、检查mapping fundAddressToAmount。
    const firstAccountBalance = await fundMe.fundAddressToAmount(
      firstSigner.address
    );
    console.log(
      `first account ${firstSigner.address} balance is: ${firstAccountBalance}`
    );
    const secondAccountBalance = await fundMe.fundAddressToAmount(
      secondSigner.address
    );
    console.log(
      `first account ${secondSigner.address} balance is: ${secondAccountBalance}`
    );
    const owner = await fundMe.owner();
    console.log("owner----->", owner);
  });

export default InteractContract;
