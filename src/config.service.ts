/**
 * Module that wraps environment variables available on Lambda and makes them
 * accessible to the various lambda functions.
 *
 * @author swallace
 */

// The values of the constants need to match the variable names assigned to
// environment variables in the serverless.yml file.
const AWS_REGION = 'awsRegion';
const PAGE_LIMIT_DEFAULT = 'pageLimitDefault';
const PAGE_LIMIT_MAX = 'pageLimitMax';

// gets the full enviroment variable object
function getConfiguration(): any {
  return process.env;
}

// returns a named config value if it is found in the process.env variables
function getConfigValue(property: string): string {
  const config = getConfiguration();

  if (config && config[property]) {
    return config[property];
  } else {
    return undefined;
  }
}

export function getAwsRegion(): string {
  return getConfigValue(AWS_REGION);
}

export function getPageLimitDefault(): number {
  return Number(getConfigValue(PAGE_LIMIT_DEFAULT));
}

export function getPageLimitMax(): number {
  return Number(getConfigValue(PAGE_LIMIT_MAX));
}
