export const validate = (envName: string): string => {
  const envVariable = process.env[envName];
  if (!envVariable) {
    throw new Error(`Environment variable ${envName} is not set.`);
  }
  return envVariable;
};
