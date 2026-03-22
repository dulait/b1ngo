import packageJson from '../../package.json';

export const environment = {
  production: false,
  apiBaseUrl: 'https://b1ngo-api-staging-production.up.railway.app',
  version: packageJson.version,
};
