module.exports = {
  core: {
    disableTelemetry: true,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../frontend/**/*.stories.tsx'],
  reactOptions: {
    fastRefresh: true,
  },
  typescript: {
    checkOptions: {},
    reactDocgen: false,
  },
};
