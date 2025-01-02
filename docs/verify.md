### 验证合约


#### 1、安装hardhat-verify
```
npm install --save-dev @nomicfoundation/hardhat-verify

```

#### 2、获取etherscan apiKey.
```
https://etherscan.io/myapikey
```

#### 3、在hardhat.config.ts中配置verify
```
import "@nomicfoundation/hardhat-verify";

etherscan: {
    apiKey: ETHERSCAN_API_KEY,
},
sourcify: {
    enabled: true,
},
```

#### 4、验证合约 【需要部署合约获取到合约地址之后】
```
// 合约地址(0xf391BF421732c09D2478a6691CCD8C6951703bC6) 合约参数(zachary)
npx hardhat verify --network sepolia 0xf391BF421732c09D2478a6691CCD8C6951703bC6 "zachary"
<!-- npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1" -->
```

#### 5、验证合约 - 使用编程的方式 【需要部署合约获取到合约地址之后】

```
await hre.run("verify:verify", {
  address: contractAddress,
  constructorArguments: [
    50,
    "a string argument",
    {
      x: 10,
      y: 5,
    },
    "0xabcdef",
  ],
});
```


