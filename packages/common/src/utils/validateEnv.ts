export const validate = (envName: string, allowedValues?: string[]): string => {
  const envVariable = process.env[envName];
  if (!envVariable) {
    throw new Error(`Environment variable ${envName} is not set.`);
  }
  if (allowedValues && !allowedValues.includes(envVariable)) {
    throw new Error(
      `Environment variable ${envName} does not have a valid value. Must be one of the following: ${allowedValues.toString()}`,
    );
  }
  return envVariable;
};
