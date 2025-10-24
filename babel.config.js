module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
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
    'react-native-reanimated/plugin',
  ],
};