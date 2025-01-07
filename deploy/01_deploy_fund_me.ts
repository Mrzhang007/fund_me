import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  FUND_ME_LOCK_TIME,
  WAIT_CONFIRMATIONS,
  deployEnv,
  testNetworkConfig,
} from "../helper.hardhat.config";

const DeployFundMe: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const networkName = hre.network.name;

  let priceFeedAddress = "";
  let waitConfirmations = 0;
  if (deployEnv.includes(networkName)) {
    // 得到Mock合约的address
    // 1、获取已部署的mock合约；
    const mockV3Aggregator = await hre.deployments.get("MockV3Aggregator");
    priceFeedAddress = mockV3Aggregator.address;
  } else {
    const chainId = hre.network.config.chainId || 11155111;
    console.log("当前部署的ChainId: ", chainId);
    // 从配置里获取address
    priceFeedAddress = testNetworkConfig[chainId].priceFeedAddress;
    waitConfirmations = WAIT_CONFIRMATIONS;
  }
  console.log("priceFeedAddress: ", priceFeedAddress);

  const [firstAccount] = await hre.ethers.getSigners();
  const fundMeArgs = [FUND_ME_LOCK_TIME, priceFeedAddress];
  const fundMe = await hre.deployments.deploy("FundMe", {
    from: firstAccount.address,
    args: fundMeArgs,
    log: true,
    // 等待合约上链
    waitConfirmations,
  });
  // --reset重新部署、或者删除./deployments文件夹  npx hardhat deploy --network sepolia --reset
  // Verify and Publish
  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("verifying contract", fundMe.address);
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: fundMeArgs,
    });
  } else {
    console.log("network is hardhat, skipped verification");
  }
};

DeployFundMe.tags = ["all", "fundme"];

export default DeployFundMe;
