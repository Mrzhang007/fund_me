import { ethers } from "hardhat";
import hre from "hardhat";
import { Addressable } from "ethers";

async function main() {
  // create factory
  const fundMeFactory = await ethers.getContractFactory("HelloWeb3");
  console.log("deploying contract");
  // deploy contract from factory
  const fundMe = await fundMeFactory.deploy("zachary");
  await fundMe.waitForDeployment();
  console.log(
    `contract has been deployed successfully, contract address is ${fundMe.target}`,
  );

  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // 因为verify是在etherscan上，所以部署成功后，还需要等待etherscan获取到合约之后再进行验证
    console.log("waiting for etherscan to get the contract");
    await fundMe.deploymentTransaction()?.wait(3);
    // verify contract
    await verify(fundMe.target, ["zachary"]);
  } else {
    console.log("network is hardhat, skipped verification");
  }
}

async function verify(address: string | Addressable, args: any[]) {
  console.log("verifying contract");
  await hre.run("verify:verify", {
    address,
    constructorArguments: args,
  });
}

main()
  .then(() => {
    console.log("deployed successfully");
  })
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });
