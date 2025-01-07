import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  ETH2USD_PRECISION,
  ETH_MOCK_PRICE,
  deployEnv,
} from "../helper.hardhat.config";

const DeployMock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const networkName = hre.network.name;
  if (deployEnv.includes(networkName)) {
    // 开发环境 需要部署MockV3Aggregator合约
    const [firstAccount] = await hre.ethers.getSigners();
    await hre.deployments.deploy("MockV3Aggregator", {
      from: firstAccount.address,
      args: [ETH2USD_PRECISION, ETH_MOCK_PRICE],
      log: true,
    });
  } else {
    console.log("skipped deploy MockV3Aggregator");
  }
};

DeployMock.tags = ["all", "mock"];

export default DeployMock;
