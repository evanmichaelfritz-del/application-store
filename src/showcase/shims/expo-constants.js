/** Web orb colour does not read the execution environment. Keep the import local. */
export const ExecutionEnvironment = {
  Bare: 'bare',
  Standalone: 'standalone',
  StoreClient: 'storeClient',
};

const Constants = {
  executionEnvironment: 'bare',
  expoConfig: null,
};

export default Constants;
