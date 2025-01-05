import { ethers } from "hardhat";
import hre from "hardhat";
import { Addressable } from "ethers";

async function main() {
  // create factory
  const factory = await ethers.getContractFactory("FundMe");
  console.log("deploying contract");
  // deploy contract from factory
  const lockTime: number = 300;
  const fundMe = await factory.deploy(lockTime);
  await fundMe.waitForDeployment();
  const contractAddress = fundMe.target;
  console.log(
    `contract has been deployed successfully, contract address is ${contractAddress}`
  );

  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // 因为verify是在etherscan上，所以部署成功后，还需要等待etherscan获取到合约之后再进行验证
    console.log("waiting for etherscan to get the contract");
    await fundMe.deploymentTransaction()?.wait(3);
    // verify contract
    await verify(fundMe.target, [lockTime]);
  } else {
    console.log("network is hardhat, skipped verification");
  }

  // 验证与合约交互、
  // 1、使用第一个钱包账户fund。
  // const owner = await fundMe.owner();
  // 获取signer
  const [firstSigner, secondSigner] = await ethers.getSigners();
  // eth价格3620 usd 0.04 eth = 144.8 usd
  const firstFundTx = await fundMe.connect(firstSigner).fund({
    value: ethers.parseEther("0.1"),
  });
  //fund只能保证发送交易成功 还需等待交易完成、交易上链
  await firstFundTx.wait();
  // 2、检查contact balance。
  const balance = await ethers.provider.getBalance(contractAddress);
  console.log(`contact balance is: ${balance}`);
  // 3、使用第二个钱包账户fund。
  const secondFundTx = await fundMe.connect(secondSigner).fund({
    value: ethers.parseEther("0.15"),
  });
  await secondFundTx.wait();
  // 4、检查contact balance。
  const balanceAfterSecondAccountFund = await ethers.provider.getBalance(
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
