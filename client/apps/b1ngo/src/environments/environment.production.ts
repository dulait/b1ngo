import packageJson from '../../package.json';

export const environment = {
  production: true,
  apiBaseUrl: 'https://b1ngo-api-prod.up.railway.app',
  version: packageJson.version,
};
