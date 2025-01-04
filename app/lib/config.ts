const validateEnvVar = (value: string | undefined, defaultValue: string): string => {
  if (!value) {
    console.warn(`Environment variable not set, using default: ${defaultValue}`);
    return defaultValue;
  }
  return value;
};

export const config = {
  timezone: validateEnvVar(process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE, 'UTC'),
  defaultUnit: validateEnvVar(
    process.env.NEXT_PUBLIC_DEFAULT_VOLUME_UNIT, 
    'oz'
  ) as 'oz' | 'ml',
  isDevelopment: process.env.NODE_ENV === 'development',
}; 