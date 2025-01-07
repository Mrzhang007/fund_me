const FUND_ME_LOCK_TIME: string = "180";
const ETH2USD_PRECISION = 8;
const ETH_MOCK_PRICE = 360000000000; // 因为是八位精度、所以需要在后面加8个0
// 本地开发环境
const deployEnv = ["hardhat"];
// waitConfirmations
const WAIT_CONFIRMATIONS = 3;

interface Config {
  [chainId: number]: {
    priceFeedAddress: string;
  };
}

const testNetworkConfig: Config = {
  11155111: {
    priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

export {
  FUND_ME_LOCK_TIME,
  ETH2USD_PRECISION,
  ETH_MOCK_PRICE,
  deployEnv,
  testNetworkConfig,
  WAIT_CONFIRMATIONS,
};
