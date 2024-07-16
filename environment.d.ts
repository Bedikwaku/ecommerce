declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COGNITO_CLIENT_ID: string;
      COGNITO_CLIENT_SECRET: string;
      COGNITO_ISSUER: string;
      TABLE_ACCESS_KEY_ID: string;
      TABLE_SECRET_ACCESS_KEY: string;
      NEXTAUTH_SECRET: string;
    }
  }
}

export {};
