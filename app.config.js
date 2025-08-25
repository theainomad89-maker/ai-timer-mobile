// Use JavaScript config so we can read environment variables
export default ({ config }) => ({
  ...config,
  extra: {
    ...(config.extra || {}),
    API_BASE_URL: process.env.API_BASE_URL || "",
  },
});
