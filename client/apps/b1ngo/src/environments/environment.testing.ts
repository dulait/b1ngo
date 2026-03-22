import packageJson from '../../package.json';

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5141',
  version: packageJson.version,
};
