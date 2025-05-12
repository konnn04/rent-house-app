module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@screens': './components/pages',
            '@contexts': './contexts',
            '@utils': './utils',
            '@styles': './styles'
          }
        }
      ]
    ],
    
  };
};