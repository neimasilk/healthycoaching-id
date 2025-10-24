const { getDefaultConfig } = require('metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(projectRoot);

  return {
    projectRoot,
    watchFolders: [workspaceRoot],

    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      experimentalImportSupport: false,
      inlineRequires: true,
    },

    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      alias: {
        '@': path.resolve(projectRoot, 'src'),
        '@/core': path.resolve(projectRoot, 'src/core'),
        '@/features': path.resolve(projectRoot, 'src/features'),
        '@/shared': path.resolve(projectRoot, 'src/shared'),
        '@/assets': path.resolve(projectRoot, 'src/assets'),
        '@/types': path.resolve(projectRoot, 'src/types'),
      },
    },

    maxWorkers: 2,

    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
      compress: {
        drop_console: __DEV__ ? false : true,
        drop_debugger: __DEV__ ? false : true,
        pure_funcs: __DEV__ ? [] : ['console.log', 'console.info'],
      },
      output: {
        comments: false,
      },
    },
  };
})();