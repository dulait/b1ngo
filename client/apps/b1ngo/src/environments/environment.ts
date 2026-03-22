import packageJson from '../../package.json';

export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7249',
  version: packageJson.version,
};
