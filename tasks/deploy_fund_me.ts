import { task } from "hardhat/config";
import { Addressable } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/** params must be lowerCase */
interface FundMeDeployArgs {
  locktime: string;
}

const DEFAULT_LOCK_TIME: string = "180";
const DeployTask = task<FundMeDeployArgs>(
  "deploy_fund_me",
  "this is task to deploy FundMe contract"
)
  .addParam<string>("locktime", "contract lock time", DEFAULT_LOCK_TIME)
  .setAction(
    async (taskArgs: FundMeDeployArgs, hre: HardhatRuntimeEnvironment) => {
      console.log(`deploy fund me tasks args: `, taskArgs);
      // create factory
      const factory = await hre.ethers.getContractFactory("FundMe");
      console.log("deploying contract");
      // deploy contract from factory
      const lockTime = taskArgs.locktime;
      const fundMe = await factory.deploy(lockTime);
      await fundMe.waitForDeployment();
      const ownerAddress = fundMe.target;
      console.log(
        `contract has been deployed successfully, contract address is ${ownerAddress}`
      );

      if (
        hre.network.config.chainId === 11155111 &&
        process.env.ETHERSCAN_API_KEY
      ) {
        // 因为verify是在etherscan上，所以部署成功后，还需要等待etherscan获取到合约之后再进行验证
        console.log("waiting for etherscan to get the contract");
        await fundMe.deploymentTransaction()?.wait(3);
        // verify contract
        await verify(hre, fundMe.target, [lockTime]);
      } else {
        console.log("network is hardhat, skipped verification");
      }
    }
  );

export default DeployTask;

async function verify(
  hre: HardhatRuntimeEnvironment,
  address: string | Addressable,
  args: any[]
) {
  console.log("verifying contract");
  await hre.run("verify:verify", {
    address,
    constructorArguments: args,
  });
}
