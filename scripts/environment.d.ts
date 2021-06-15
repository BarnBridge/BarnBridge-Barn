declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHAIN: string;
      CHAINID: string;
      PROVIDER: string;
      ETHERSCAN: string;
      MNEMONIC: string;
      OWNER: string;
      BOND: string;
      CV: string;
      STARTTS: string;
      ENDTS: string;
      REWARDSAMOUNT: string;
    }
  }
}

// convert file into a module by adding an empty export statement.
export {}
