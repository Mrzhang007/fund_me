declare namespace NodeJS {
  interface ProcessEnv {
    /** sepolia url  【从alchemy获得】*/
    SEPOLIA_URL: string;
    /** 第一个账户地址 */
    FIRST_ACCOUNT: string;
    /** 第二个账户地址 */
    SECOND_ACCOUNT: string;
    /** etherscan apiKey */
    ETHERSCAN_API_KEY: string;
  }
}
