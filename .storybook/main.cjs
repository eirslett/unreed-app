module.exports = {
  core: {
    builder: '@storybook/builder-vite',
    disableTelemetry: true,
  },
  features: {
    storyStoreV7: true,
  },
  stories: ['../frontend/**/*.stories.tsx'],
  reactOptions: {
    fastRefresh: true,
  },
};
