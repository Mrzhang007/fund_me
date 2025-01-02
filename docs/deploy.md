### 部署合约

#### 1、新建scripts文件夹、新建deploy_fund_me.ts部署脚本。

#### 2、在hardhat.config.ts中配置sepolia网络
```
networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [FIRST_ACCOUNT],
    },
},
```

#### 3、安装dotenv 新建.dev 统一管理变量。
```
npm install dotenv --save-dev

使用：
在.env文件中设置变量,这里的字符串不用带双引号
在hardhat.config.ts中通过process.env.XXX使用
```

#### 4、创建类型声明文件：跟目录新建env.d.ts文件，内容如下：
```
declare namespace NodeJS {
  interface ProcessEnv {
    /** sepolia url  【从alchemy获得】*/
    SEPOLIA_URL: string;
    /** 第一个账户地址 */
    FIRST_ACCOUNT: string;
    /** etherscan apiKey */
    ETHERSCAN_API_KEY: string;
  }
}

```

#### 5、.env文件是明文，安装@chainlink/env-enc 加密
```
npm install @chainlink/env-enc

设置密码： npx env-enc set-pw
加密变量： npx env-enc set
查看： npx env-enc view

设置完成后会自动生成.env.enc文件 在.gitignore中忽略
```

#### 6、在hardhat.config.ts中使用
```
import * as envEnc from "@chainlink/env-enc";
envEnc.config();
```

#### 7、部署脚本
```
// sepolia网络
npx hardhat run scripts/deploy_fund_me.ts --network sepolia

// 本地网络
npx hardhat run scripts/deploy_fund_me.ts --network hardhat
npx hardhat run scripts/deploy_fund_me.ts // 默认本地网络
```

// 随便写了个hello web3合约部署到sepolia上，但是通过address找不到transactions[fundMe.target]
