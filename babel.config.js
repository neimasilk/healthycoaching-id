const isJest = process.env.JEST_WORKER_ID !== undefined;

const plugins = [
  [
    'module-resolver',
    {
      root: ['./src'],
      alias: {
        '@': './src',
        '@/core': './src/core',
        '@/features': './src/features',
        '@/shared': './src/shared',
        '@/assets': './src/assets',
        '@/types': './src/types',
      },
    },
  ],
];

if (!isJest) {
  plugins.push('react-native-reanimated/plugin');
}

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins,
};
