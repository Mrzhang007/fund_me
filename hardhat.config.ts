import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as envEnc from "@chainlink/env-enc";
envEnc.config();
import "@nomicfoundation/hardhat-verify";
import "./tasks/index";
import "hardhat-deploy";

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const FIRST_ACCOUNT = process.env.FIRST_ACCOUNT;
const SECOND_ACCOUNT = process.env.SECOND_ACCOUNT;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [FIRST_ACCOUNT, SECOND_ACCOUNT],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
