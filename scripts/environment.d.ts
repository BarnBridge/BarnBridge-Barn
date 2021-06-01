declare global {
  namespace NodeJS {
    interface ProcessEnv {
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
