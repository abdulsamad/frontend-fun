declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URI: string;
    }
  }
}

// convert it into a module by adding an empty export statement.
export {};
